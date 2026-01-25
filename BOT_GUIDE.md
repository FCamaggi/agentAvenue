# 🤖 Guía: Jugar contra el Bot

## ✨ Nueva Característica

Ahora puedes jugar contra un oponente controlado por IA para probar el juego sin necesidad de otro jugador humano.

## 🎮 Cómo Jugar

### Paso 1: Inicio

1. Abre la aplicación en http://localhost:3001
2. Ingresa tu nombre
3. Click en **"🤖 Jugar contra Bot"** (botón morado)

### Paso 2: Configuración

1. Selecciona el modo de juego (Simple o Avanzado)
2. Click en **"Iniciar Partida con Bot"**
3. Serás redirigido a la sala de espera
4. El juego iniciará automáticamente en 1 segundo

### Paso 3: ¡A Jugar!

- El bot jugará automáticamente cuando sea su turno
- Verás sus decisiones con un pequeño delay (1-3 segundos) para simular pensamiento
- El bot aparece con un badge "BOT" en su nombre

## 🧠 Comportamiento del Bot

### Nivel de Dificultad: Medio

El bot tiene estrategias básicas:

**Al jugar cartas:**

- Evita jugar Daredevils si puede
- Intenta jugar cartas diferentes siempre

**Al reclutar:**

- ❌ Evita el 3er Daredevil (derrota)
- ✅ Busca el 3er Codebreaker (victoria)
- 📈 Prefiere cartas con movimiento positivo
- 🎯 Considera su posición vs la tuya

## 🎨 Características Visuales

- **Badge "BOT"**: Indica que el jugador es controlado por IA
- **Icono 🤖**: En el botón de inicio y en la sala
- **Indicador en Lobby**: Muestra "🤖 vs Bot" bajo el modo de juego
- **Inicio automático**: La partida inicia sola cuando el bot está listo

## 🚀 Ventajas

✅ **Testing rápido**: No necesitas dos navegadores/dispositivos  
✅ **Aprender el juego**: Practica antes de jugar contra humanos  
✅ **Desarrollo**: Prueba nuevas características fácilmente  
✅ **Disponibilidad 24/7**: Juega cuando quieras

## 🛠️ Técnicamente

### Backend

- **BotPlayer class** en `server/utils/botPlayer.js`
- Toma decisiones con delays aleatorios (1-3 seg)
- Integrado con el sistema de Socket.IO
- Funciones: `chooseCardsToPlay()` y `chooseCardToRecruit()`

### Frontend

- Nuevo botón en HomePage
- Detección automática de bot en LobbyPage
- Badge visual para identificar al bot
- Inicio automático de partida

## 📝 Notas

- El bot solo funciona en partidas 1vs1 (no equipos)
- Compatible con modo Simple y Avanzado
- El bot toma decisiones instantáneas pero espera 1-3 seg para parecer humano
- Las decisiones del bot se registran en la base de datos igual que un jugador real

## 🎯 Próximas Mejoras (Futuro)

- [ ] Niveles de dificultad seleccionables (Fácil/Medio/Difícil)
- [ ] Bot más inteligente en modo avanzado
- [ ] Diferentes personalidades de bot
- [ ] Estadísticas contra el bot

---

**¡Disfruta jugando contra el bot!** 🎮🤖
