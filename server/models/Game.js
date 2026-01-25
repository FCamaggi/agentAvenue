import mongoose from 'mongoose'

const playerSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    color: {
        type: String,
        enum: ['green', 'blue', 'red', 'yellow'],
        required: true,
    },
    position: {
        type: Number,
        default: 0, // 0 = casa inicial
    },
    hand: [{
        name: String,
        movement: [Number], // [1st, 2nd, 3rd symbol]
    }],
    recruitedAgents: {
        type: Map,
        of: [{
            name: String,
            movement: [Number],
        }],
        default: {},
    },
    isHost: {
        type: Boolean,
        default: false,
    },
    ready: {
        type: Boolean,
        default: false,
    },
    isBot: {
        type: Boolean,
        default: false,
    },
    disconnected: {
        type: Boolean,
        default: false,
    },
    discardsRemaining: {
        type: Number,
        default: 4,
    },
    blackMarketCards: [{
        name: String,
        type: String,
        effect: String,
    }],
})

const gameSchema = new mongoose.Schema({
    lobbyCode: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
    },
    gameMode: {
        type: String,
        enum: ['simple', 'advanced', 'team'],
        default: 'simple',
    },
    status: {
        type: String,
        enum: ['waiting', 'active', 'finished', 'abandoned'],
        default: 'waiting',
    },
    players: [playerSchema],
    currentPlayer: {
        type: String, // player.id
    },
    turnNumber: {
        type: Number,
        default: 1,
    },
    phase: {
        type: String,
        enum: ['playing', 'recruiting', 'finished'],
        default: 'playing',
    },
    deck: [{
        name: String,
        movement: [Number],
    }],
    discardPile: [{
        name: String,
        movement: [Number],
    }],
    playedCards: {
        faceUp: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
        faceDown: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
    },
    blackMarketDeck: [{
        name: String,
        type: String,
        effect: String,
    }],
    blackMarketSupply: [{
        name: String,
        type: String,
        effect: String,
    }],
    winner: {
        type: String, // player.id
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
})

// Índices
gameSchema.index({ lobbyCode: 1 })
gameSchema.index({ status: 1 })
gameSchema.index({ createdAt: 1 })

// Middleware para actualizar updatedAt
gameSchema.pre('save', function (next) {
    this.updatedAt = Date.now()
    next()
})

// Limpiar juegos antiguos (más de 24 horas)
gameSchema.statics.cleanOldGames = async function () {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    return this.deleteMany({
        status: { $in: ['finished', 'abandoned'] },
        updatedAt: { $lt: oneDayAgo },
    })
}

const Game = mongoose.model('Game', gameSchema)

export default Game
