// Lógica del bot para jugar contra el usuario
import {
    calculateMovement,
    movePawn,
    checkWinConditions,
    refillHand,
    areCardsDifferent,
} from './gameLogic.js'

// Estrategia simple del bot
class BotPlayer {
    constructor(difficulty = 'medium') {
        this.difficulty = difficulty
        this.thinkingTime = { min: 1000, max: 3000 } // Simular pensamiento
    }

    // Esperar un tiempo aleatorio para simular pensamiento
    async think() {
        const delay = Math.random() * (this.thinkingTime.max - this.thinkingTime.min) + this.thinkingTime.min
        return new Promise(resolve => setTimeout(resolve, delay))
    }

    // Elegir 2 cartas para jugar
    async chooseCardsToPlay(hand) {
        await this.think()

        if (hand.length < 2) {
            return null
        }

        // Estrategia: Intentar jugar cartas diferentes
        let card1Index = 0
        let card2Index = 1

        // Buscar dos cartas diferentes
        for (let i = 0; i < hand.length; i++) {
            for (let j = i + 1; j < hand.length; j++) {
                if (hand[i].name !== hand[j].name) {
                    card1Index = i
                    card2Index = j
                    break
                }
            }
        }

        // Estrategia básica según dificultad
        if (this.difficulty === 'easy') {
            // Random simple
            card1Index = 0
            card2Index = Math.min(1, hand.length - 1)
        } else if (this.difficulty === 'medium') {
            // Intentar evitar jugar Daredevils si es posible
            const nonDaredevils = hand
                .map((card, idx) => ({ card, idx }))
                .filter(item => item.card.name !== 'Daredevil')

            if (nonDaredevils.length >= 2) {
                card1Index = nonDaredevils[0].idx
                card2Index = nonDaredevils[1].idx
            }
        }

        return {
            faceUpIndex: card1Index,
            faceDownIndex: card2Index,
        }
    }

    // Elegir qué carta reclutar
    async chooseCardToRecruit(faceUpCard, faceDownCard, myRecruitedAgents, opponentPosition, myPosition) {
        await this.think()

        // Estrategia básica
        let choice = 'faceUp'

        if (this.difficulty === 'easy') {
            // 50/50 random
            choice = Math.random() > 0.5 ? 'faceUp' : 'faceDown'
        } else if (this.difficulty === 'medium') {
            // Estrategia más inteligente
            const faceUpCount = (myRecruitedAgents.get(faceUpCard.name) || []).length
            const faceDownCount = (myRecruitedAgents.get(faceDownCard.name) || []).length

            // Prioridades:
            // 1. Evitar 3rd Daredevil
            if (faceUpCard.name === 'Daredevil' && faceUpCount >= 2) {
                choice = 'faceDown'
            } else if (faceDownCard.name === 'Daredevil' && faceDownCount >= 2) {
                choice = 'faceUp'
            }
            // 2. Intentar conseguir 3rd Codebreaker
            else if (faceUpCard.name === 'Codebreaker' && faceUpCount === 2) {
                choice = 'faceUp'
            } else if (faceDownCard.name === 'Codebreaker' && faceDownCount === 2) {
                choice = 'faceDown'
            }
            // 3. Elegir la que más avance
            else {
                const faceUpMovement = calculateMovement(faceUpCard, faceUpCount + 1)
                const faceDownMovement = calculateMovement(faceDownCard, faceDownCount + 1)

                // Preferir movimiento positivo
                if (faceUpMovement > faceDownMovement) {
                    choice = 'faceUp'
                } else {
                    choice = 'faceDown'
                }
            }
        }

        return choice
    }

    // Generar nombre aleatorio para el bot
    static generateBotName() {
        const botNames = [
            'Agent Smith',
            'Espía 007',
            'Black Widow',
            'Agente K',
            'Nick Fury',
            'Natasha',
            'Jason Bourne',
            'Ethan Hunt',
            'Jack Ryan',
            'Spyro',
        ]
        return botNames[Math.floor(Math.random() * botNames.length)]
    }
}

export default BotPlayer
