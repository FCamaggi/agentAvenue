import { AGENT_CARDS, BLACK_MARKET_CARDS, PLAYER_COLORS, START_POSITIONS, TOTAL_TILES, BOARD_POSITIONS } from './gameConstants.js'

// Crear y barajar el mazo de agentes
// Todas las cartas están disponibles en cualquier modo
// El modo solo afecta al Mercado Negro, no a las cartas de agentes
export function createAgentDeck(gameMode) {
    const deck = []

    // Agregar todas las cartas de agentes (mismo mazo para todos los modos)
    AGENT_CARDS.forEach(card => {
        for (let i = 0; i < card.count; i++) {
            deck.push({
                name: card.name,
                movement: card.movement,
            })
        }
    })

    return shuffleDeck(deck)
}

// Crear y barajar el mazo del Mercado Negro
export function createBlackMarketDeck() {
    return shuffleDeck([...BLACK_MARKET_CARDS])
}

// Barajar array
export function shuffleDeck(array) {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
            ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}

// Asignar color a jugador
export function assignPlayerColor(existingPlayers) {
    const usedColors = existingPlayers.map(p => p.color)
    const availableColors = PLAYER_COLORS.filter(c => !usedColors.includes(c))
    return availableColors[0] || 'green'
}

// Calcular movimiento del peón
export function calculateMovement(agent, count) {
    // count: número de agentes del mismo tipo que tiene el jugador
    const index = Math.min(count, 3) - 1 // 0, 1, o 2
    const movement = agent.movement[index]
    
    // Si el movimiento es 'win' o 'lose', retornar 0 (no se mueve, solo se verifica condición)
    if (movement === 'win' || movement === 'lose') {
        return 0
    }
    
    return movement
}

// Mover peón en el tablero
export function movePawn(currentPosition, movement) {
    let newPosition = currentPosition + movement

    // Wrap around el tablero
    if (newPosition < 1) {
        newPosition = TOTAL_TILES + newPosition
    } else if (newPosition > TOTAL_TILES) {
        newPosition = newPosition - TOTAL_TILES
    }

    return newPosition
}

// Verificar si un jugador capturó al oponente
export function checkCapture(playerPos, opponentPos, isPlayerTurn) {
    // Solo el jugador activo (en su turno) puede capturar
    // Según el manual: "Si tu peón supera la posición de su peón, cuenta como captura"
    
    if (!isPlayerTurn) {
        return false // Solo el jugador activo puede capturar en su turno
    }

    // Caso 1: Están en la misma posición = captura
    if (playerPos === opponentPos) {
        return true
    }

    // Caso 2: Calcular si el jugador pasó al oponente en sentido horario
    // Distancia en sentido horario desde player hasta opponent
    let distanceToOpponent = opponentPos - playerPos
    if (distanceToOpponent < 0) {
        distanceToOpponent += TOTAL_TILES
    }

    // Si la distancia es mayor a la mitad del tablero, significa que el jugador
    // pasó al oponente (está "detrás" en términos de persecución circular)
    // Ejemplo: Green en 7, Blue en 6 → distancia = 6-7 = -1, normalizado = 13 > 7 = captura
    return distanceToOpponent > TOTAL_TILES / 2
}

// Verificar condiciones de victoria/derrota
export function checkWinConditions(player, opponent, isPlayerTurn) {
    const conditions = {
        won: false,
        lost: false,
        reason: null,
    }

    // Contar agentes reclutados
    const playerAgents = player.recruitedAgents || {}
    const codebreakerCount = (playerAgents.get('Codebreaker') || []).length
    const daredevilCount = (playerAgents.get('Daredevil') || []).length

    // Victoria: 3 Codebreakers (movimiento = 'win')
    if (codebreakerCount >= 3) {
        conditions.won = true
        conditions.reason = 'three_codebreakers'
        return conditions
    }

    // Derrota: 3 Daredevils (movimiento = 'lose')
    if (daredevilCount >= 3) {
        conditions.lost = true
        conditions.reason = 'three_daredevils'
        return conditions
    }

    // Victoria: Captura del oponente
    if (checkCapture(player.position, opponent.position, isPlayerTurn)) {
        conditions.won = true
        conditions.reason = 'captured_opponent'
        return conditions
    }

    return conditions
}

// Repartir cartas iniciales
export function dealInitialHands(deck, numPlayers) {
    const hands = []
    const cardsPerPlayer = 4

    for (let i = 0; i < numPlayers; i++) {
        hands.push(deck.splice(0, cardsPerPlayer))
    }

    return hands
}

// Rellenar mano hasta 4 cartas
export function refillHand(hand, deck) {
    while (hand.length < 4 && deck.length > 0) {
        hand.push(deck.shift())
    }
    return hand
}

// Verificar si es casilla de Mercado Negro
export function isBlackMarketTile(position) {
    return BOARD_POSITIONS[position]?.type === 'black_market'
}

// Obtener siguiente jugador
export function getNextPlayer(players, currentPlayerId) {
    const currentIndex = players.findIndex(p => p.id === currentPlayerId)
    const nextIndex = (currentIndex + 1) % players.length
    return players[nextIndex].id
}

// Verificar si dos cartas son diferentes
export function areCardsDifferent(card1, card2) {
    return card1.name !== card2.name
}
// Aplicar efecto de carta del Mercado Negro
export function applyBlackMarketEffect(card, player, opponent, game) {
    const effects = {
        'Ceasefire': () => {
            // Devolver todos los agentes a la caja
            player.recruitedAgents = new Map()
            opponent.recruitedAgents = new Map()
            return { message: 'Todos los agentes han sido devueltos', log: 'Ceasefire activado' }
        },
        'Distraction Device': () => {
            // Permanente: Saboteur avanza en lugar de retroceder
            return { message: 'Distraction Device activo', log: 'Saboteurs ahora avanzan' }
        },
        'Getaway Car': () => {
            // Permanente: Al caer en casa, avanzas 3
            return { message: 'Getaway Car activo', log: 'Avance +3 al caer en casa' }
        },
        'Surveillance Truck': () => {
            // Instantáneo: Avanzar 1 casilla
            player.position = movePawn(player.position, 1)
            return { message: 'Avanzaste 1 casilla', log: 'Surveillance Truck usado' }
        },
        'Supercomputer': () => {
            // Permanente: Codebreaker avanza 3 adicionales
            return { message: 'Supercomputer activo', log: 'Codebreakers avanzan +3' }
        },
        'Security System': () => {
            // Permanente: Si oponente cae en tu casa, ganas
            return { message: 'Security System activo', log: 'Casa protegida' }
        },
        'Masterplan': () => {
            // Permanente: 7 agentes diferentes = victoria
            return { message: 'Masterplan activo', log: '7 agentes diferentes = victoria' }
        },
        'Leader of the Pack': () => {
            // Permanente: 3 Saboteurs = victoria en lugar de derrota
            return { message: 'Leader of the Pack activo', log: '3 Saboteurs = victoria' }
        },
        'Sinister Twin': () => {
            // Permanente: Double Agent se mueve el doble
            return { message: 'Sinister Twin activo', log: 'Double Agents x2' }
        },
        'Watchtower Two': () => {
            // Permanente: Enforcer avanza 2 adicionales
            return { message: 'Watchtower Two activo', log: 'Enforcers +2' }
        },
        // Cartas que requieren interacción del usuario
        'Mind Control': () => {
            return { needsInteraction: true, interactionType: 'steal-agent', message: 'Selecciona un agente del oponente para robar' }
        },
        'Secret Recruit': () => {
            return { needsInteraction: true, interactionType: 'recruit-different', message: 'Selecciona un agente diferente de tu mano' }
        },
        'Double Trouble': () => {
            return { needsInteraction: true, interactionType: 'recruit-from-hand', message: 'Revela 2 agentes idénticos de tu mano' }
        },
        'Outpost': () => {
            return { needsInteraction: true, interactionType: 'recruit-sentinel', message: 'Recluta un Sentinel de tu mano' }
        },
        'Smoke Screen': () => {
            // Recluta carta del tope del mazo (automático)
            if (game.agentDeck.length > 0) {
                const topCard = game.agentDeck.shift()
                const agents = player.recruitedAgents.get(topCard.name) || []
                agents.push(topCard)
                player.recruitedAgents.set(topCard.name, agents)
                return { message: `Reclutaste ${topCard.name} del mazo`, log: 'Smoke Screen usado', recruited: topCard }
            }
            return { message: 'Mazo vacío', log: 'Smoke Screen sin efecto' }
        },
        'Spycation': () => {
            return { needsInteraction: true, interactionType: 'return-and-recruit', message: 'Devuelve un agente a tu mano para reclutarlo de nuevo' }
        },
    }

    const effectFn = effects[card.name]
    if (effectFn) {
        return effectFn()
    }

    return { message: `Carta ${card.name} obtenida`, log: `${card.name} en juego` }
}

// Funciones para completar efectos interactivos del Mercado Negro

// Mind Control: Robar un agente del oponente
export function applyMindControl(player, opponent, agentName) {
    const opponentAgents = opponent.recruitedAgents.get(agentName) || []
    if (opponentAgents.length === 0) {
        return { success: false, message: 'El oponente no tiene ese agente' }
    }

    // Remover uno del oponente
    const stolenCard = opponentAgents.pop()
    if (opponentAgents.length === 0) {
        opponent.recruitedAgents.delete(agentName)
    } else {
        opponent.recruitedAgents.set(agentName, opponentAgents)
    }

    // Agregar a la mano del jugador
    player.hand.push(stolenCard)

    return { success: true, message: `Robaste ${agentName} del oponente`, stolenAgent: agentName }
}

// Secret Recruit: Reclutar agente diferente de la mano
export function applySecretRecruit(player, selectedCard) {
    const cardIndex = player.hand.findIndex(c => c.name === selectedCard.name)
    if (cardIndex === -1) {
        return { success: false, message: 'Carta no encontrada en la mano' }
    }

    // Verificar que sea diferente a los agentes en juego
    if (player.recruitedAgents.has(selectedCard.name)) {
        return { success: false, message: 'Ya tienes ese agente en juego' }
    }

    // Remover de la mano y reclutar
    const card = player.hand.splice(cardIndex, 1)[0]
    const agents = player.recruitedAgents.get(card.name) || []
    agents.push(card)
    player.recruitedAgents.set(card.name, agents)

    return { success: true, message: `Reclutaste ${card.name} secretamente`, recruited: card }
}

// Double Trouble: Reclutar una carta idéntica de la mano
export function applyDoubleTrouble(player, selectedCard) {
    // Buscar 2 cartas con el mismo nombre en la mano
    const matchingCards = player.hand.filter(c => c.name === selectedCard.name)
    if (matchingCards.length < 2) {
        return { success: false, message: 'Necesitas 2 cartas idénticas en la mano' }
    }

    // Remover una de la mano y reclutar
    const cardIndex = player.hand.findIndex(c => c.name === selectedCard.name)
    const card = player.hand.splice(cardIndex, 1)[0]
    const agents = player.recruitedAgents.get(card.name) || []
    agents.push(card)
    player.recruitedAgents.set(card.name, agents)

    return { success: true, message: `Reclutaste ${card.name} con Double Trouble`, recruited: card }
}

// Outpost: Reclutar Sentinel de la mano
export function applyOutpost(player) {
    const sentinelIndex = player.hand.findIndex(c => c.name === 'Sentinel')
    if (sentinelIndex === -1) {
        return { success: false, message: 'No tienes Sentinel en tu mano' }
    }

    const card = player.hand.splice(sentinelIndex, 1)[0]
    const agents = player.recruitedAgents.get('Sentinel') || []
    agents.push(card)
    player.recruitedAgents.set('Sentinel', agents)

    return { success: true, message: 'Reclutaste Sentinel con Outpost', recruited: card }
}

// Spycation: Devolver agente a la mano y reclutarlo de nuevo
export function applySpycation(player, agentName) {
    const agents = player.recruitedAgents.get(agentName) || []
    if (agents.length === 0) {
        return { success: false, message: 'No tienes ese agente en juego' }
    }

    // Remover el último agente de ese tipo
    const returnedCard = agents.pop()
    if (agents.length === 0) {
        player.recruitedAgents.delete(agentName)
    } else {
        player.recruitedAgents.set(agentName, agents)
    }

    // Agregarlo a la mano
    player.hand.push(returnedCard)

    // Reclutarlo inmediatamente
    const newAgents = player.recruitedAgents.get(agentName) || []
    newAgents.push(returnedCard)
    player.recruitedAgents.set(agentName, newAgents)

    return { success: true, message: `Usaste Spycation en ${agentName}`, recruited: returnedCard }
}

// Verificar efectos permanentes activos
export function checkPermanentEffects(player, agentName, baseMovement) {
    let movement = baseMovement
    const permanentCards = player.blackMarketCards || []

    permanentCards.forEach(card => {
        switch (card.name) {
            case 'Distraction Device':
                if (agentName === 'Saboteur') {
                    movement = Math.abs(movement) // Convierte negativo en positivo
                }
                break
            case 'Supercomputer':
                if (agentName === 'Codebreaker') {
                    movement += 3
                }
                break
            case 'Sinister Twin':
                if (agentName === 'Double Agent') {
                    movement *= 2
                }
                break
            case 'Watchtower Two':
                if (agentName === 'Enforcer') {
                    movement += 2
                }
                break
        }
    })

    return movement
}

// Verificar condiciones especiales de victoria por Mercado Negro
export function checkBlackMarketWinConditions(player, opponent) {
    const permanentCards = player.blackMarketCards || []

    for (const card of permanentCards) {
        // Security System: Si oponente está en tu casa, ganas
        if (card.name === 'Security System') {
            const playerHouse = Object.entries(START_POSITIONS).find(
                ([color, pos]) => color === player.color
            )?.[1]
            if (opponent.position === playerHouse) {
                return { won: true, reason: 'security_system' }
            }
        }

        // Masterplan: 7 agentes diferentes = victoria
        if (card.name === 'Masterplan') {
            const uniqueAgents = new Set()
            for (const [agentName, agents] of player.recruitedAgents.entries()) {
                if (agents.length > 0) uniqueAgents.add(agentName)
            }
            if (uniqueAgents.size >= 7) {
                return { won: true, reason: 'masterplan' }
            }
        }

        // Leader of the Pack: 3 Saboteurs = victoria
        if (card.name === 'Leader of the Pack') {
            const saboteurs = player.recruitedAgents.get('Saboteur') || []
            if (saboteurs.length >= 3) {
                return { won: true, reason: 'leader_of_pack' }
            }
        }
    }

    return { won: false }
}