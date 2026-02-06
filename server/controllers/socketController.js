import { nanoid } from 'nanoid'
import Game from '../models/Game.js'
import {
    createAgentDeck,
    createBlackMarketDeck,
    assignPlayerColor,
    dealInitialHands,
    refillHand,
    calculateMovement,
    movePawn,
    checkWinConditions,
    getNextPlayer,
    areCardsDifferent,
    isBlackMarketTile,
    applyBlackMarketEffect,
    checkPermanentEffects,
    checkBlackMarketWinConditions,
    applyMindControl,
    applySecretRecruit,
    applyDoubleTrouble,
    applyOutpost,
    applySpycation,
} from '../utils/gameLogic.js'
import { START_POSITIONS } from '../utils/gameConstants.js'
import BotPlayer from '../utils/botPlayer.js'

export function setupSocketHandlers(io) {
    io.on('connection', (socket) => {
        console.log(`✅ Cliente conectado: ${socket.id}`)

        // Crear lobby (con o sin bot)
        socket.on('create-lobby', async ({ playerName, gameMode, withBot = false }, callback) => {
            try {
                // Generar código único de 6 caracteres
                const lobbyCode = nanoid(6).toUpperCase()
                const playerId = nanoid()
                const playerColor = assignPlayerColor([])

                // Crear nueva partida en la base de datos
                // Si se solicita bot, agregarlo inmediatamente
                const players = [{
                    id: playerId,
                    name: playerName,
                    color: playerColor,
                    position: START_POSITIONS[playerColor],
                    hand: [],
                    recruitedAgents: new Map(),
                    isHost: true,
                    ready: true,
                    discardsRemaining: 4,
                    blackMarketCards: [],
                }]

                // Agregar bot si se solicita
                if (withBot) {
                    const botId = `bot-${nanoid()}`
                    const botColor = assignPlayerColor(players)
                    players.push({
                        id: botId,
                        name: BotPlayer.generateBotName(),
                        color: botColor,
                        position: START_POSITIONS[botColor],
                        hand: [],
                        recruitedAgents: new Map(),
                        isHost: false,
                        ready: true,
                        isBot: true,
                        discardsRemaining: 4,
                        blackMarketCards: [],
                    })
                }

                const game = new Game({
                    lobbyCode,
                    gameMode,
                    status: withBot ? 'waiting' : 'waiting', // Si es con bot, listo para iniciar
                    players,
                })

                await game.save()

                // Unir socket a la sala
                socket.join(lobbyCode)
                socket.playerId = playerId
                socket.lobbyCode = lobbyCode

                console.log(`🎮 Lobby creado: ${lobbyCode} por ${playerName} (${playerId})`)
                console.log(`📊 Jugadores iniciales: ${game.players.length}`)

                callback({
                    success: true,
                    lobbyCode,
                    playerId,
                    playerColor,
                    gameMode,
                    withBot,
                })

                // Pequeño delay para asegurar que el cliente esté listo
                setTimeout(() => {
                    // Notificar actualización del lobby
                    console.log(`📢 Emitiendo lobby-updated inicial a ${lobbyCode} con ${game.players.length} jugadores`)
                    io.to(lobbyCode).emit('lobby-updated', {
                        players: game.players,
                        hostId: game.players[0].id,
                    })
                }, 100)
            } catch (error) {
                console.error('Error al crear lobby:', error)
                callback({ error: 'Error al crear la sala' })
            }
        })

        // Obtener estado actual del lobby
        socket.on('get-lobby-state', async ({ lobbyCode }) => {
            try {
                const game = await Game.findOne({ lobbyCode })
                if (game) {
                    console.log(`📋 Enviando estado del lobby ${lobbyCode} a cliente: ${game.players.length} jugadores`)
                    socket.emit('lobby-updated', {
                        players: game.players,
                        hostId: game.players.find(p => p.isHost)?.id,
                    })
                }
            } catch (error) {
                console.error('Error al obtener estado del lobby:', error)
            }
        })

        // Unirse a lobby
        socket.on('join-lobby', async ({ playerName, lobbyCode }, callback) => {
            try {
                const game = await Game.findOne({ lobbyCode, status: 'waiting' })

                if (!game) {
                    return callback({ error: 'Sala no encontrada o ya iniciada' })
                }

                const maxPlayers = game.gameMode === 'team' ? 4 : 2
                if (game.players.length >= maxPlayers) {
                    return callback({ error: 'La sala está llena' })
                }

                const playerId = nanoid()
                const playerColor = assignPlayerColor(game.players)

                game.players.push({
                    id: playerId,
                    name: playerName,
                    color: playerColor,
                    position: START_POSITIONS[playerColor],
                    hand: [],
                    recruitedAgents: new Map(),
                    isHost: false,
                    ready: true,
                    discardsRemaining: 4,
                    blackMarketCards: [],
                })

                await game.save()

                socket.join(lobbyCode)
                socket.playerId = playerId
                socket.lobbyCode = lobbyCode

                console.log(`👤 Jugador ${playerName} (${playerId}) se unió al lobby ${lobbyCode}`)
                console.log(`📊 Total de jugadores en lobby ${lobbyCode}: ${game.players.length}`)

                callback({
                    success: true,
                    lobbyCode,
                    playerId,
                    playerColor,
                    gameMode: game.gameMode,
                })

                // Pequeño delay para asegurar que el cliente esté listo
                setTimeout(() => {
                    // Notificar a todos los jugadores
                    console.log(`📢 Emitiendo lobby-updated a ${lobbyCode} con ${game.players.length} jugadores`)
                    io.to(lobbyCode).emit('lobby-updated', {
                        players: game.players,
                        hostId: game.players.find(p => p.isHost).id,
                    })
                }, 100)
            } catch (error) {
                console.error('Error al unirse al lobby:', error)
                callback({ error: 'Error al unirse a la sala' })
            }
        })

        // Iniciar juego
        socket.on('start-game', async ({ lobbyCode }) => {
            try {
                const game = await Game.findOne({ lobbyCode })

                if (!game || game.status !== 'waiting') {
                    return socket.emit('error', { message: 'No se puede iniciar el juego' })
                }

                const minPlayers = game.gameMode === 'team' ? 3 : 2
                if (game.players.length < minPlayers) {
                    return socket.emit('error', { message: 'No hay suficientes jugadores' })
                }

                // Crear mazo y repartir cartas
                const deck = createAgentDeck(game.gameMode)
                const hands = dealInitialHands(deck, game.players.length)

                game.players.forEach((player, index) => {
                    player.hand = hands[index]
                })

                game.deck = deck
                game.status = 'active'
                // Seleccionar jugador inicial aleatoriamente
                const randomIndex = Math.floor(Math.random() * game.players.length)
                game.currentPlayer = game.players[randomIndex].id
                game.phase = 'playing'

                console.log('🎲 INICIO DE JUEGO:')
                console.log('  Total jugadores:', game.players.length)
                console.log('  Índice aleatorio seleccionado:', randomIndex)
                console.log('  Jugador inicial:', game.currentPlayer)
                console.log('  Nombre:', game.players[randomIndex].name)
                console.log('  Es host?:', game.players[randomIndex].isHost)
                console.log('  Lista de jugadores:')
                game.players.forEach((p, i) => {
                    console.log(`    ${i}: ${p.name} (${p.id}) - Host: ${p.isHost}`)
                })

                // Si es modo avanzado, crear mazo de Mercado Negro
                if (game.gameMode === 'advanced') {
                    const blackMarketDeck = createBlackMarketDeck()
                    game.blackMarketSupply = blackMarketDeck.splice(0, 3)
                    game.blackMarketDeck = blackMarketDeck
                }

                await game.save()

                // Notificar inicio del juego
                io.to(lobbyCode).emit('game-started', {
                    gameId: game._id.toString(),
                })

                // Enviar estado inicial
                io.to(lobbyCode).emit('game-state-updated', {
                    gameState: game,
                })

                // Si el jugador seleccionado aleatoriamente es un bot, que juegue automáticamente
                const currentPlayer = game.players.find(p => p.id === game.currentPlayer)
                if (currentPlayer && currentPlayer.isBot) {
                    handleBotTurn(game, io)
                }
            } catch (error) {
                console.error('Error al iniciar juego:', error)
                socket.emit('error', { message: 'Error al iniciar el juego' })
            }
        })

        // Obtener estado del juego
        socket.on('get-game-state', async ({ gameId }) => {
            try {
                const game = await Game.findById(gameId)
                if (game) {
                    socket.emit('game-state-updated', { gameState: game })
                }
            } catch (error) {
                console.error('Error al obtener estado:', error)
            }
        })

        // Jugar cartas
        socket.on('play-cards', async ({ gameId, faceUpIndex, faceDownIndex }) => {
            try {
                const game = await Game.findById(gameId)

                if (!game || game.status !== 'active') {
                    return socket.emit('error', { message: 'Juego no válido' })
                }

                const player = game.players.find(p => p.id === socket.playerId)
                
                // Debug logs
                console.log('🎮 PLAY-CARDS VALIDATION:')
                console.log('  Player ID:', socket.playerId)
                console.log('  Current Player:', game.currentPlayer)
                console.log('  Phase:', game.phase)
                console.log('  Is Right Player?', game.currentPlayer === socket.playerId)
                console.log('  Is Right Phase?', game.phase === 'playing')
                
                if (!player || game.currentPlayer !== socket.playerId) {
                    return socket.emit('error', { message: 'No es tu turno' })
                }

                if (game.phase !== 'playing') {
                    return socket.emit('error', { message: 'Fase incorrecta' })
                }

                // Verificar agotamiento del mazo
                if (game.deck.length === 0 && player.hand.length < 2) {
                    // Condición especial: el jugador no puede jugar
                    // Determinar ganador por proximidad
                    const opponent = game.players.find(p => p.id !== socket.playerId)
                    const playerDistance = (opponent.position - player.position + 14) % 14
                    const opponentDistance = (player.position - opponent.position + 14) % 14

                    if (playerDistance < opponentDistance) {
                        game.winner = player.id
                        game.status = 'finished'
                        game.phase = 'finished'
                        await game.save()

                        io.to(game.lobbyCode).emit('game-over', {
                            winner: player.id,
                            reason: 'deck_exhausted',
                        })
                        return
                    } else if (opponentDistance < playerDistance) {
                        game.winner = opponent.id
                        game.status = 'finished'
                        game.phase = 'finished'
                        await game.save()

                        io.to(game.lobbyCode).emit('game-over', {
                            winner: opponent.id,
                            reason: 'deck_exhausted',
                        })
                        return
                    } else {
                        // Empate: gana el jugador activo
                        game.winner = player.id
                        game.status = 'finished'
                        game.phase = 'finished'
                        await game.save()

                        io.to(game.lobbyCode).emit('game-over', {
                            winner: player.id,
                            reason: 'deck_exhausted_tie',
                        })
                        return
                    }
                }

                // Validar índices
                if (!player.hand[faceUpIndex] || !player.hand[faceDownIndex]) {
                    return socket.emit('error', { message: 'Índices de cartas inválidos' })
                }

                const faceUpCard = player.hand[faceUpIndex]
                const faceDownCard = player.hand[faceDownIndex]

                // Verificar que sean diferentes
                if (!areCardsDifferent(faceUpCard, faceDownCard)) {
                    return socket.emit('error', { message: 'Debes jugar cartas diferentes' })
                }

                // Remover cartas de la mano
                const playedCards = [
                    player.hand.splice(Math.max(faceUpIndex, faceDownIndex), 1)[0],
                    player.hand.splice(Math.min(faceUpIndex, faceDownIndex), 1)[0],
                ]

                // Determinar cuál va boca arriba y cuál boca abajo
                game.playedCards = {
                    faceUp: faceUpIndex < faceDownIndex ? playedCards[1] : playedCards[0],
                    faceDown: faceUpIndex < faceDownIndex ? playedCards[0] : playedCards[1],
                }

                // Rellenar mano
                refillHand(player.hand, game.deck)

                game.phase = 'recruiting'
                
                console.log('📤 CARDS PLAYED - EMITTING:')
                console.log('  Current Player (still):', game.currentPlayer)
                console.log('  New Phase:', game.phase)
                console.log('  Opponent must recruit now')
                
                await game.save()

                // Notificar cartas jugadas INMEDIATAMENTE
                io.to(game.lobbyCode).emit('cards-played', {
                    faceUp: game.playedCards.faceUp,
                    faceDown: game.playedCards.faceDown,
                })

                io.to(game.lobbyCode).emit('game-state-updated', { gameState: game })

                // Si el oponente es un bot, que reclute automáticamente
                const opponent = game.players.find(p => p.id !== game.currentPlayer)
                if (opponent && opponent.isBot) {
                    handleBotRecruit(game, io)
                }
            } catch (error) {
                console.error('Error al jugar cartas:', error)
                socket.emit('error', { message: 'Error al jugar cartas' })
            }
        })

        // Reclutar agente
        socket.on('recruit-agent', async ({ gameId, choice }) => {
            try {
                const game = await Game.findById(gameId)

                console.log('🎯 RECRUIT-AGENT REQUEST:')
                console.log('  Player ID:', socket.playerId)
                console.log('  Current Player:', game?.currentPlayer)
                console.log('  Phase:', game?.phase)
                console.log('  Choice:', choice)

                if (!game || game.status !== 'active') {
                    return socket.emit('error', { message: 'Juego no válido' })
                }

                if (game.phase !== 'recruiting') {
                    return socket.emit('error', { message: 'No es fase de reclutamiento' })
                }

                // El oponente (no el jugador actual) elige
                const opponent = game.players.find(p => p.id === socket.playerId)
                const currentPlayer = game.players.find(p => p.id === game.currentPlayer)

                console.log('  Opponent (recruiter):', opponent?.name)
                console.log('  Current Player:', currentPlayer?.name)
                console.log('  Can recruit?:', opponent?.id !== game.currentPlayer)

                if (!opponent || opponent.id === game.currentPlayer) {
                    return socket.emit('error', { message: 'No puedes reclutar en tu turno' })
                }

                // Asignar cartas
                const opponentCard = choice === 'faceUp' ? game.playedCards.faceUp : game.playedCards.faceDown
                const playerCard = choice === 'faceUp' ? game.playedCards.faceDown : game.playedCards.faceUp

                // Reclutar para el oponente
                if (!opponent.recruitedAgents) opponent.recruitedAgents = new Map()
                const opponentAgentList = opponent.recruitedAgents.get(opponentCard.name) || []
                opponentAgentList.push(opponentCard)
                opponent.recruitedAgents.set(opponentCard.name, opponentAgentList)

                // Reclutar para el jugador actual
                if (!currentPlayer.recruitedAgents) currentPlayer.recruitedAgents = new Map()
                const playerAgentList = currentPlayer.recruitedAgents.get(playerCard.name) || []
                playerAgentList.push(playerCard)
                currentPlayer.recruitedAgents.set(playerCard.name, playerAgentList)

                // Mover peones (aplicar efectos permanentes de Mercado Negro)
                let opponentMovement = calculateMovement(opponentCard, opponentAgentList.length)
                opponentMovement = checkPermanentEffects(opponent, opponentCard.name, opponentMovement)
                const oldOpponentPos = opponent.position
                opponent.position = movePawn(opponent.position, opponentMovement)

                let playerMovement = calculateMovement(playerCard, playerAgentList.length)
                playerMovement = checkPermanentEffects(currentPlayer, playerCard.name, playerMovement)
                const oldPlayerPos = currentPlayer.position
                currentPlayer.position = movePawn(currentPlayer.position, playerMovement)

                // Verificar si cayeron en Mercado Negro (solo modo avanzado)
                if (game.gameMode === 'advanced') {
                    // Oponente cae en Mercado Negro
                    if (isBlackMarketTile(opponent.position) && opponent.position !== oldOpponentPos) {
                        if (game.blackMarketSupply && game.blackMarketSupply.length > 0) {
                            const bmCard = game.blackMarketSupply.shift()

                            // Si es permanente, agregar a cartas del jugador
                            if (bmCard.type === 'permanent') {
                                if (!opponent.blackMarketCards) opponent.blackMarketCards = []
                                opponent.blackMarketCards.push(bmCard)
                                
                                // Aplicar efecto automático
                                const effect = applyBlackMarketEffect(bmCard, opponent, currentPlayer, game)
                                console.log('Efecto aplicado:', effect)
                            } else {
                                // Si es instantánea, verificar si necesita interacción
                                const effect = applyBlackMarketEffect(bmCard, opponent, currentPlayer, game)
                                
                                if (effect.needsInteraction) {
                                    // Guardar estado pendiente para interacción futura
                                    game.pendingBlackMarketEffect = {
                                        card: bmCard,
                                        playerId: opponent.id,
                                        interactionType: effect.interactionType,
                                    }
                                    
                                    // Emitir evento solicitando interacción
                                    io.to(game.lobbyCode).emit('black-market-interaction-required', {
                                        playerId: opponent.id,
                                        card: bmCard,
                                        interactionType: effect.interactionType,
                                        message: effect.message,
                                    })
                                } else {
                                    console.log('Efecto aplicado:', effect)
                                }
                            }

                            // Reponer desde el mazo
                            if (game.blackMarketDeck && game.blackMarketDeck.length > 0) {
                                game.blackMarketSupply.push(game.blackMarketDeck.shift())
                            }

                            io.to(game.lobbyCode).emit('black-market-taken', {
                                playerId: opponent.id,
                                card: bmCard,
                            })
                        }
                    }

                    // Jugador actual cae en Mercado Negro
                    if (isBlackMarketTile(currentPlayer.position) && currentPlayer.position !== oldPlayerPos) {
                        if (game.blackMarketSupply && game.blackMarketSupply.length > 0) {
                            const bmCard = game.blackMarketSupply.shift()

                            if (bmCard.type === 'permanent') {
                                if (!currentPlayer.blackMarketCards) currentPlayer.blackMarketCards = []
                                currentPlayer.blackMarketCards.push(bmCard)
                                
                                const effect = applyBlackMarketEffect(bmCard, currentPlayer, opponent, game)
                                console.log('Efecto aplicado:', effect)
                            } else {
                                const effect = applyBlackMarketEffect(bmCard, currentPlayer, opponent, game)
                                
                                if (effect.needsInteraction) {
                                    game.pendingBlackMarketEffect = {
                                        card: bmCard,
                                        playerId: currentPlayer.id,
                                        interactionType: effect.interactionType,
                                    }
                                    
                                    io.to(game.lobbyCode).emit('black-market-interaction-required', {
                                        playerId: currentPlayer.id,
                                        card: bmCard,
                                        interactionType: effect.interactionType,
                                        message: effect.message,
                                    })
                                } else {
                                    console.log('Efecto aplicado:', effect)
                                }
                            }

                            if (game.blackMarketDeck && game.blackMarketDeck.length > 0) {
                                game.blackMarketSupply.push(game.blackMarketDeck.shift())
                            }

                            io.to(game.lobbyCode).emit('black-market-taken', {
                                playerId: currentPlayer.id,
                                card: bmCard,
                            })
                        }
                    }
                }

                // Limpiar cartas jugadas
                game.playedCards = { faceUp: null, faceDown: null }

                // Verificar condiciones de victoria (incluyendo Mercado Negro)
                // IMPORTANTE: Ambos jugadores se movieron, así que ambos pueden capturar
                // Verificamos a ambos con isPlayerTurn=true para permitir la captura
                let opponentWin = checkWinConditions(opponent, currentPlayer, true)
                let playerWin = checkWinConditions(currentPlayer, opponent, true)

                console.log('🏆 WIN CONDITIONS CHECK:')
                console.log('  CurrentPlayer:', currentPlayer.name, '- Won:', playerWin.won, 'Lost:', playerWin.lost, 'Reason:', playerWin.reason)
                console.log('  Opponent:', opponent.name, '- Won:', opponentWin.won, 'Lost:', opponentWin.lost, 'Reason:', opponentWin.reason)

                // Verificar condiciones especiales de Mercado Negro
                if (game.gameMode === 'advanced') {
                    const opponentBMWin = checkBlackMarketWinConditions(opponent, currentPlayer)
                    const playerBMWin = checkBlackMarketWinConditions(currentPlayer, opponent)

                    if (opponentBMWin.won) opponentWin = opponentBMWin
                    if (playerBMWin.won) playerWin = playerBMWin
                }

                if (opponentWin.won || playerWin.won || opponentWin.lost || playerWin.lost) {
                    // Determinar ganador - lógica simplificada
                    // Solo uno puede haber capturado al otro (matemáticamente imposible que ambos capturen)
                    let winnerId = null
                    let winReason = null
                    
                    if (playerWin.won) {
                        // CurrentPlayer capturó o ganó de otra forma
                        winnerId = currentPlayer.id
                        winReason = playerWin.reason
                        console.log('  ✅ Winner:', currentPlayer.name, '(currentPlayer ganó)')
                    } else if (opponentWin.won) {
                        // Opponent capturó o ganó de otra forma
                        winnerId = opponent.id
                        winReason = opponentWin.reason
                        console.log('  ✅ Winner:', opponent.name, '(opponent ganó)')
                    } else if (opponentWin.lost) {
                        // Opponent perdió (3 Daredevils)
                        winnerId = currentPlayer.id
                        winReason = opponentWin.reason
                        console.log('  ✅ Winner:', currentPlayer.name, '(opponent perdió)')
                    } else if (playerWin.lost) {
                        // CurrentPlayer perdió (3 Daredevils)
                        winnerId = opponent.id
                        winReason = playerWin.reason
                        console.log('  ✅ Winner:', opponent.name, '(currentPlayer perdió)')
                    }

                    game.winner = winnerId
                    game.status = 'finished'
                    game.phase = 'finished'

                    await game.save()

                    io.to(game.lobbyCode).emit('game-over', {
                        winner: game.winner,
                        reason: winReason,
                    })
                } else {
                    // Continuar juego
                    game.currentPlayer = getNextPlayer(game.players, game.currentPlayer)
                    game.turnNumber += 1
                    game.phase = 'playing'

                    console.log('🔄 AFTER RECRUIT - TURN CHANGE:')
                    console.log('  New Current Player:', game.currentPlayer)
                    console.log('  New Phase:', game.phase)
                    console.log('  Turn Number:', game.turnNumber)

                    await game.save()

                    // Primero emitir el estado actualizado
                    io.to(game.lobbyCode).emit('game-state-updated', { gameState: game })

                    // Luego notificar el reclutamiento
                    io.to(game.lobbyCode).emit('agent-recruited', {
                        opponentAgent: opponentCard.name,
                        playerAgent: playerCard.name,
                    })

                    // Si el siguiente jugador es un bot, que juegue
                    const nextPlayer = game.players.find(p => p.id === game.currentPlayer)
                    if (nextPlayer && nextPlayer.isBot) {
                        handleBotTurn(game, io)
                    }
                }
            } catch (error) {
                console.error('Error al reclutar agente:', error)
                socket.emit('error', { message: 'Error al reclutar agente' })
            }
        })

        // Descartar carta
        socket.on('discard-card', async ({ gameId, cardIndex }) => {
            try {
                const game = await Game.findById(gameId)

                if (!game || game.status !== 'active') {
                    return socket.emit('error', { message: 'Juego no válido' })
                }

                const player = game.players.find(p => p.id === socket.playerId)
                if (!player || game.currentPlayer !== socket.playerId) {
                    return socket.emit('error', { message: 'No es tu turno' })
                }

                if (game.phase !== 'playing') {
                    return socket.emit('error', { message: 'Solo puedes descartar durante tu turno de juego' })
                }

                if (player.discardsRemaining <= 0) {
                    return socket.emit('error', { message: 'No te quedan descartes disponibles' })
                }

                if (!player.hand[cardIndex]) {
                    return socket.emit('error', { message: 'Índice de carta inválido' })
                }

                if (game.deck.length === 0) {
                    return socket.emit('error', { message: 'No hay cartas en el mazo para robar' })
                }

                // Descartar la carta
                const discardedCard = player.hand.splice(cardIndex, 1)[0]
                game.discardPile.push(discardedCard)

                // Robar una nueva carta
                const newCard = game.deck.shift()
                player.hand.push(newCard)

                // Reducir descartes restantes
                player.discardsRemaining -= 1

                await game.save()

                // Notificar al jugador
                socket.emit('card-discarded', {
                    discardsRemaining: player.discardsRemaining,
                })

                // Actualizar estado del juego
                io.to(game.lobbyCode).emit('game-state-updated', { gameState: game })
            } catch (error) {
                console.error('Error al descartar carta:', error)
                socket.emit('error', { message: 'Error al descartar carta' })
            }
        })

        // Salir del lobby
        socket.on('leave-lobby', async ({ lobbyCode }) => {
            try {
                const game = await Game.findOne({ lobbyCode })
                if (game && game.status === 'waiting') {
                    game.players = game.players.filter(p => p.id !== socket.playerId)

                    if (game.players.length === 0) {
                        await Game.deleteOne({ lobbyCode })
                    } else {
                        // Si el host se va, asignar nuevo host
                        if (!game.players.find(p => p.isHost)) {
                            game.players[0].isHost = true
                        }
                        await game.save()

                        io.to(lobbyCode).emit('lobby-updated', {
                            players: game.players,
                            hostId: game.players.find(p => p.isHost).id,
                        })
                    }
                }

                socket.leave(lobbyCode)
            } catch (error) {
                console.error('Error al salir del lobby:', error)
            }
        })

        // Salir del juego
        socket.on('leave-game', async ({ gameId }) => {
            try {
                const game = await Game.findById(gameId)
                if (game && game.status === 'active') {
                    const player = game.players.find(p => p.id === socket.playerId)
                    if (player) {
                        player.disconnected = true
                    }

                    game.status = 'abandoned'
                    await game.save()

                    io.to(game.lobbyCode).emit('player-disconnected', {
                        playerId: socket.playerId,
                    })
                }
            } catch (error) {
                console.error('Error al salir del juego:', error)
            }
        })

        // Completar efecto de Mercado Negro que requiere interacción
        socket.on('complete-black-market-effect', async ({ gameId, selection }) => {
            try {
                const game = await Game.findById(gameId)
                if (!game || !game.pendingBlackMarketEffect) {
                    socket.emit('error', { message: 'No hay efecto pendiente' })
                    return
                }

                const pending = game.pendingBlackMarketEffect
                const player = game.players.find(p => p.id === pending.playerId)
                const opponent = game.players.find(p => p.id !== pending.playerId)

                if (!player) {
                    socket.emit('error', { message: 'Jugador no encontrado' })
                    return
                }

                let result = {}
                
                // Aplicar el efecto según el tipo de interacción
                switch (pending.interactionType) {
                    case 'steal-agent':
                        // Mind Control
                        result = applyMindControl(player, opponent, selection.agentName)
                        break
                        
                    case 'recruit-different':
                        // Secret Recruit
                        result = applySecretRecruit(player, selection.card)
                        break
                        
                    case 'recruit-from-hand':
                        // Double Trouble
                        result = applyDoubleTrouble(player, selection.card)
                        break
                        
                    case 'recruit-sentinel':
                        // Outpost
                        result = applyOutpost(player)
                        break
                        
                    case 'return-and-recruit':
                        // Spycation
                        result = applySpycation(player, selection.agentName)
                        break
                        
                    default:
                        result = { success: false, message: 'Tipo de interacción desconocido' }
                }

                if (!result.success) {
                    socket.emit('error', { message: result.message })
                    return
                }

                // Rellenar mano después del efecto
                refillHand(player, game.agentDeck)

                // Limpiar efecto pendiente
                game.pendingBlackMarketEffect = undefined

                await game.save()

                // Emitir estado actualizado
                io.to(game.lobbyCode).emit('game-state-updated', {
                    gameState: {
                        players: game.players.map(p => ({
                            id: p.id,
                            name: p.name,
                            color: p.color,
                            position: p.position,
                            handCount: p.hand.length,
                            recruitedAgents: Object.fromEntries(p.recruitedAgents),
                            blackMarketCards: p.blackMarketCards || [],
                            discardsRemaining: p.discardsRemaining,
                        })),
                        currentPlayer: game.currentPlayer,
                        playedCards: game.playedCards,
                        deckCount: game.agentDeck.length,
                        blackMarketSupply: game.blackMarketSupply,
                    },
                })

                // Notificar que el efecto se completó
                io.to(game.lobbyCode).emit('black-market-effect-completed', {
                    playerId: player.id,
                    card: pending.card,
                    result: result.message,
                })

            } catch (error) {
                console.error('Error al completar efecto de Mercado Negro:', error)
                socket.emit('error', { message: 'Error al aplicar el efecto' })
            }
        })

        // Desconexión
        socket.on('disconnect', () => {
            console.log(`❌ Cliente desconectado: ${socket.id}`)
        })
    })

    // Limpiar juegos antiguos cada hora
    setInterval(async () => {
        try {
            const result = await Game.cleanOldGames()
            if (result.deletedCount > 0) {
                console.log(`🧹 Limpiados ${result.deletedCount} juegos antiguos`)
            }
        } catch (error) {
            console.error('Error al limpiar juegos:', error)
        }
    }, 60 * 60 * 1000) // 1 hora
}

// Función helper para manejar efectos interactivos del Mercado Negro para el bot
function handleBotBlackMarketEffect(bmCard, botPlayer, opponent, game) {
    const effect  = applyBlackMarketEffect(bmCard, botPlayer, opponent, game)
    
    if (!effect.needsInteraction) {
        return effect
    }

    // Bot hace selección automática según el tipo de interacción
    let result = {}
    
    switch (effect.interactionType) {
        case 'steal-agent':
            // Mind Control - robar agente aleatorio del oponente
            const opponentAgents = Array.from(opponent.recruitedAgents.keys())
            if (opponentAgents.length > 0) {
                const randomAgent = opponentAgents[Math.floor(Math.random() * opponentAgents.length)]
                result = applyMindControl(botPlayer, opponent, randomAgent)
            }
            break
            
        case 'recruit-different':
            // Secret Recruit - seleccionar carta diferente de mano
            const differentCards = botPlayer.hand.filter(card => 
                !botPlayer.recruitedAgents.has(card.name)
            )
            if (differentCards.length > 0) {
                const randomCard = differentCards[Math.floor(Math.random() * differentCards.length)]
                result = applySecretRecruit(botPlayer, randomCard)
            }
            break
            
        case 'recruit-from-hand':
            // Double Trouble - usar carta con duplicados
            const cardCounts = {}
            botPlayer.hand.forEach(card => {
                cardCounts[card.name] = (cardCounts[card.name] || 0) + 1
            })
            const duplicates = botPlayer.hand.filter(card => cardCounts[card.name] >= 2)
            if (duplicates.length > 0) {
                const randomDup = duplicates[Math.floor(Math.random() * duplicates.length)]
                result = applyDoubleTrouble(botPlayer, randomDup)
            }
            break
            
        case 'recruit-sentinel':
            // Outpost - reclutar Sentinel
            result = applyOutpost(botPlayer)
            break
            
        case 'return-and-recruit':
            // Spycation - devolver agente aleatorio
            const myAgents = Array.from(botPlayer.recruitedAgents.keys())
            if (myAgents.length > 0) {
                const randomMyAgent = myAgents[Math.floor(Math.random() * myAgents.length)]
                result = applySpycation(botPlayer, randomMyAgent)
            }
            break
            
        default:
            console.log('Tipo de interacción desconocido para bot')
    }
    
    // Rellenar mano después del efecto
    if (result.success) {
        refillHand(botPlayer, game.agentDeck)
    }
    
    return result
}

// Funciones auxiliares para el bot
async function handleBotTurn(game, io) {
    const bot = new BotPlayer('medium')
    const currentPlayer = game.players.find(p => p.id === game.currentPlayer)

    if (!currentPlayer || !currentPlayer.isBot) return

    if (game.phase === 'playing') {
        // Bot juega 2 cartas
        setTimeout(async () => {
            try {
                const cardIndices = await bot.chooseCardsToPlay(currentPlayer.hand)

                if (!cardIndices) return

                const faceUpCard = currentPlayer.hand[cardIndices.faceUpIndex]
                const faceDownCard = currentPlayer.hand[cardIndices.faceDownIndex]

                // Remover cartas de la mano
                const playedCards = [
                    currentPlayer.hand.splice(Math.max(cardIndices.faceUpIndex, cardIndices.faceDownIndex), 1)[0],
                    currentPlayer.hand.splice(Math.min(cardIndices.faceUpIndex, cardIndices.faceDownIndex), 1)[0],
                ]

                game.playedCards = {
                    faceUp: cardIndices.faceUpIndex < cardIndices.faceDownIndex ? playedCards[1] : playedCards[0],
                    faceDown: cardIndices.faceUpIndex < cardIndices.faceDownIndex ? playedCards[0] : playedCards[1],
                }

                refillHand(currentPlayer.hand, game.deck)
                game.phase = 'recruiting'
                await game.save()

                io.to(game.lobbyCode).emit('cards-played', {
                    faceUp: game.playedCards.faceUp,
                    faceDown: game.playedCards.faceDown,
                })

                io.to(game.lobbyCode).emit('game-state-updated', { gameState: game })

                // Si el oponente (quien recluta) es bot, continuar automáticamente
                const opponent = game.players.find(p => p.id !== game.currentPlayer)
                if (opponent && opponent.isBot) {
                    handleBotRecruit(game, io)
                }
            } catch (error) {
                console.error('Error en turno del bot:', error)
            }
        }, 1500) // Esperar un poco antes de jugar
    }
}

async function handleBotRecruit(game, io) {
    const bot = new BotPlayer('medium')

    // Encontrar quién debe reclutar (el oponente del jugador actual)
    const recruiter = game.players.find(p => p.id !== game.currentPlayer)

    if (!recruiter || !recruiter.isBot) return

    setTimeout(async () => {
        try {
            const currentPlayer = game.players.find(p => p.id === game.currentPlayer)

            const choice = await bot.chooseCardToRecruit(
                game.playedCards.faceUp,
                game.playedCards.faceDown,
                recruiter.recruitedAgents,
                currentPlayer.position,
                recruiter.position
            )

            // Asignar cartas
            const recruiterCard = choice === 'faceUp' ? game.playedCards.faceUp : game.playedCards.faceDown
            const playerCard = choice === 'faceUp' ? game.playedCards.faceDown : game.playedCards.faceUp

            // Reclutar para el bot
            if (!recruiter.recruitedAgents) recruiter.recruitedAgents = new Map()
            const recruiterAgentList = recruiter.recruitedAgents.get(recruiterCard.name) || []
            recruiterAgentList.push(recruiterCard)
            recruiter.recruitedAgents.set(recruiterCard.name, recruiterAgentList)

            // Reclutar para el jugador actual
            if (!currentPlayer.recruitedAgents) currentPlayer.recruitedAgents = new Map()
            const playerAgentList = currentPlayer.recruitedAgents.get(playerCard.name) || []
            playerAgentList.push(playerCard)
            currentPlayer.recruitedAgents.set(playerCard.name, playerAgentList)

            // Mover peones (aplicar efectos permanentes)
            let recruiterMovement = calculateMovement(recruiterCard, recruiterAgentList.length)
            recruiterMovement = checkPermanentEffects(recruiter, recruiterCard.name, recruiterMovement)
            const oldRecruiterPos = recruiter.position
            recruiter.position = movePawn(recruiter.position, recruiterMovement)

            let playerMovement = calculateMovement(playerCard, playerAgentList.length)
            playerMovement = checkPermanentEffects(currentPlayer, playerCard.name, playerMovement)
            const oldPlayerPos = currentPlayer.position
            currentPlayer.position = movePawn(currentPlayer.position, playerMovement)

            // Verificar Mercado Negro
            if (game.gameMode === 'advanced') {
                if (isBlackMarketTile(recruiter.position) && recruiter.position !== oldRecruiterPos) {
                    if (game.blackMarketSupply && game.blackMarketSupply.length > 0) {
                        const bmCard = game.blackMarketSupply.shift()
                        if (bmCard.type === 'permanent') {
                            if (!recruiter.blackMarketCards) recruiter.blackMarketCards = []
                            recruiter.blackMarketCards.push(bmCard)
                            
                            // Aplicar efecto automático de permanente
                            const effect = applyBlackMarketEffect(bmCard, recruiter, currentPlayer, game)
                            console.log('Bot - Efecto permanente:', effect)
                        } else {
                            // Si es bot, manejar interacciones automáticamente
                            if (recruiter.isBot) {
                                handleBotBlackMarketEffect(bmCard, recruiter, currentPlayer, game)
                            } else {
                                applyBlackMarketEffect(bmCard, recruiter, currentPlayer, game)
                            }
                        }
                        if (game.blackMarketDeck && game.blackMarketDeck.length > 0) {
                            game.blackMarketSupply.push(game.blackMarketDeck.shift())
                        }
                        io.to(game.lobbyCode).emit('black-market-taken', {
                            playerId: recruiter.id,
                            card: bmCard,
                        })
                    }
                }

                if (isBlackMarketTile(currentPlayer.position) && currentPlayer.position !== oldPlayerPos) {
                    if (game.blackMarketSupply && game.blackMarketSupply.length > 0) {
                        const bmCard = game.blackMarketSupply.shift()
                        if (bmCard.type === 'permanent') {
                            if (!currentPlayer.blackMarketCards) currentPlayer.blackMarketCards = []
                            currentPlayer.blackMarketCards.push(bmCard)
                            
                            const effect = applyBlackMarketEffect(bmCard, currentPlayer, recruiter, game)
                            console.log('Bot - Efecto permanente:', effect)
                        } else {
                            // Si es bot, manejar interacciones automáticamente
                            if (currentPlayer.isBot) {
                                handleBotBlackMarketEffect(bmCard, currentPlayer, recruiter, game)
                            } else {
                                applyBlackMarketEffect(bmCard, currentPlayer, recruiter, game)
                            }
                        }
                        if (game.blackMarketDeck && game.blackMarketDeck.length > 0) {
                            game.blackMarketSupply.push(game.blackMarketDeck.shift())
                        }
                        io.to(game.lobbyCode).emit('black-market-taken', {
                            playerId: currentPlayer.id,
                            card: bmCard,
                        })
                    }
                }
            }

            // Limpiar cartas jugadas
            game.playedCards = { faceUp: null, faceDown: null }

            // Verificar condiciones de victoria
            let recruiterWin = checkWinConditions(recruiter, currentPlayer, false)
            let playerWin = checkWinConditions(currentPlayer, recruiter, true)

            if (game.gameMode === 'advanced') {
                const recruiterBMWin = checkBlackMarketWinConditions(recruiter, currentPlayer)
                const playerBMWin = checkBlackMarketWinConditions(currentPlayer, recruiter)
                if (recruiterBMWin.won) recruiterWin = recruiterBMWin
                if (playerBMWin.won) playerWin = playerBMWin
            }

            if (recruiterWin.won || playerWin.won || recruiterWin.lost || playerWin.lost) {
                if (playerWin.won || recruiterWin.lost) {
                    game.winner = currentPlayer.id
                } else if (recruiterWin.won || playerWin.lost) {
                    game.winner = recruiter.id
                }

                game.status = 'finished'
                game.phase = 'finished'

                await game.save()

                io.to(game.lobbyCode).emit('game-over', {
                    winner: game.winner,
                    reason: playerWin.reason || recruiterWin.reason,
                })
            } else {
                game.currentPlayer = getNextPlayer(game.players, game.currentPlayer)
                game.turnNumber += 1
                game.phase = 'playing'

                await game.save()

                io.to(game.lobbyCode).emit('agent-recruited', {
                    recruiterAgent: recruiterCard.name,
                    playerAgent: playerCard.name,
                })

                io.to(game.lobbyCode).emit('game-state-updated', { gameState: game })

                // Si el siguiente jugador es un bot, que juegue
                const nextPlayer = game.players.find(p => p.id === game.currentPlayer)
                if (nextPlayer && nextPlayer.isBot) {
                    handleBotTurn(game, io)
                }
            }
        } catch (error) {
            console.error('Error en reclutamiento del bot:', error)
        }
    }, 2000) // Esperar antes de reclutar
}

