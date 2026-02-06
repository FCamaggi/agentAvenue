// Definición de las cartas de agente
// Todas las cartas están disponibles en ambos modos (simple y avanzado)
// Lo único que cambia en modo avanzado es el Mercado Negro
export const AGENT_CARDS = [
    { name: 'Codebreaker', movement: [0, 0, 'win'], count: 6 }, // 3ra carta = victoria
    { name: 'Daredevil', movement: [2, 3, 'lose'], count: 6 }, // 3ra carta = derrota
    { name: 'Double Agent', movement: [-1, 6, -1], count: 6 },
    { name: 'Enforcer', movement: [1, 2, 3], count: 6 },
    { name: 'Saboteur', movement: [-1, -1, -2], count: 6 },
    { name: 'Sentinel', movement: [0, 2, 6], count: 6 },
]

// Cartas del Mercado Negro
export const BLACK_MARKET_CARDS = [
    { name: 'Ceasefire', type: 'instant', effect: 'return_all_agents' },
    { name: 'Distraction Device', type: 'permanent', effect: 'saboteur_advance' },
    { name: 'Double Trouble', type: 'instant', effect: 'recruit_from_hand' },
    { name: 'Getaway Car', type: 'permanent', effect: 'advance_on_house' },
    { name: 'Leader of the Pack', type: 'permanent', effect: 'saboteur_win' },
    { name: 'Masterplan', type: 'permanent', effect: 'seven_agents_win' },
    { name: 'Mind Control', type: 'instant', effect: 'steal_agent' },
    { name: 'Outpost', type: 'instant', effect: 'recruit_sentinel' },
    { name: 'Security System', type: 'permanent', effect: 'opponent_on_house_win' },
    { name: 'Secret Recruit', type: 'instant', effect: 'recruit_different' },
    { name: 'Sinister Twin', type: 'permanent', effect: 'double_agent_double' },
    { name: 'Smoke Screen', type: 'instant', effect: 'recruit_from_deck' },
    { name: 'Supercomputer', type: 'permanent', effect: 'codebreaker_advance' },
    { name: 'Surveillance Truck', type: 'instant', effect: 'advance_one' },
    { name: 'Spycation', type: 'instant', effect: 'return_and_recruit' },
]

// Posiciones de las casillas en el tablero (14 casillas en total)
export const BOARD_POSITIONS = {
    1: { type: 'black_market', corner: 'top-left' },
    2: { type: 'path' },
    3: { type: 'path' },
    4: { type: 'black_market', corner: 'top-right' },
    5: { type: 'path' },
    6: { type: 'house', color: 'blue', startPosition: true },
    7: { type: 'path' },
    8: { type: 'black_market', corner: 'bottom-right' },
    9: { type: 'path' },
    10: { type: 'path' },
    11: { type: 'black_market', corner: 'bottom-left' },
    12: { type: 'path' },
    13: { type: 'house', color: 'green', startPosition: true },
    14: { type: 'path' },
}

export const TOTAL_TILES = 14

// Colores disponibles para jugadores
export const PLAYER_COLORS = ['green', 'blue', 'red', 'yellow']

// Posiciones iniciales de las casas
export const START_POSITIONS = {
    green: 13,
    blue: 6,
    red: 13, // Para modo equipos
    yellow: 6, // Para modo equipos
}
