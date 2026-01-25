import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { setupSocketHandlers } from './controllers/socketController.js'

dotenv.config()

const app = express()
const httpServer = createServer(app)

// Configuración de Socket.IO
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
    },
    transports: ['websocket', 'polling'],
})

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
}))
app.use(express.json())

// Rutas básicas
app.get('/', (req, res) => {
    res.json({ message: 'Agent Avenue Server Running' })
})

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Configurar Socket.IO handlers
setupSocketHandlers(io)

// Conectar a MongoDB
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI)
        console.log(`✅ MongoDB conectado: ${conn.connection.host}`)
    } catch (error) {
        console.error(`❌ Error de MongoDB: ${error.message}`)
        process.exit(1)
    }
}

// Iniciar servidor
const PORT = process.env.PORT || 5000

connectDB().then(() => {
    httpServer.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en puerto ${PORT}`)
        console.log(`🌍 Modo: ${process.env.NODE_ENV || 'development'}`)
    })
})

// Manejo de errores
process.on('unhandledRejection', (err) => {
    console.error('❌ Error no manejado:', err)
    process.exit(1)
})
