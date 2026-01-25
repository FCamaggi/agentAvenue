import { AGENT_CARDS, BLACK_MARKET_CARDS, PLAYER_COLORS, START_POSITIONS, TOTAL_TILES, BOARD_POSITIONS } from './gameConstants.js'

// Crear y barajar el mazo de agentes
export function createAgentDeck(gameMode) {
    const deck = []

    // Agregar cartas del modo simple
    AGENT_CARDS.simple.forEach(card => {
        for (let i = 0; i < card.count; i++) {
            deck.push({
                name: card.name,
                movement: card.movement,
            })
        }
    })

    // Agregar cartas del modo avanzado
    if (gameMode === 'advanced' || gameMode === 'team') {
        AGENT_CARDS.advanced.forEach(card => {
            for (let i = 0; i < card.count; i++) {
                deck.push({
                    name: card.name,
                    movement: card.movement,
                })
            }
        })
    }

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
    return agent.movement[index]
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
export function checkCapture(player1Pos, player2Pos, isPlayer1Active) {
    // El jugador activo captura si su posición alcanza o supera la del oponente
    // Considerando el movimiento en sentido horario

    if (isPlayer1Active) {
        // Calcular distancia en sentido horario desde player1 hasta player2
        let distance = player2Pos - player1Pos
        if (distance < 0) distance += TOTAL_TILES

        // Si la distancia es 0, están en la misma posición = captura
        return distance === 0
    } else {
        // Lo mismo pero desde player2 hasta player1
        let distance = player1Pos - player2Pos
        if (distance < 0) distance += TOTAL_TILES

        return distance === 0
    }
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

    // Victoria: 3 Codebreakers
    if (codebreakerCount >= 3) {
        conditions.won = true
        conditions.reason = 'three_codebreakers'
        return conditions
    }

    // Derrota: 3 Daredevils (a menos que tenga Leader of the Pack)
    if (daredevilCount >= 3) {
        // Verificar si tiene Leader of the Pack
        const hasLeaderOfPack = (player.blackMarketCards || []).some(
            card => card.name === 'Leader of the Pack'
        )

        if (hasLeaderOfPack) {
            // Con Leader of the Pack, 3 Saboteurs es victoria
            conditions.won = true
            conditions.reason = 'leader_of_pack'
        } else {
            conditions.lost = true
            conditions.reason = 'three_daredevils'
        }
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
    }

    const effectFn = effects[card.name]
    if (effectFn) {
        return effectFn()
    }

    return { message: `Carta ${card.name} obtenida`, log: `${card.name} en juego` }
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