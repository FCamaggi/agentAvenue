# TODO - Mejoras y Correcciones Agent Avenue

## ✅ COMPLETADO - Bugs críticos resueltos

### ✅ 1. Sistema de turnos
- **ARREGLADO**: Emit game-state-updated ANTES de agent-recruited
- El sistema de turnos ahora funciona correctamente después de cada reclutamiento

### ✅ 2. Visibilidad de cartas jugadas
- **ARREGLADO**: Lógica cambiada a `faceUp={state.isMyTurn || finished}`
- Jugador activo ve ambas cartas (las eligió él)
- Oponente solo ve la carta face-up

### ✅ 3. Tablero según modo
- **ARREGLADO**: Esquinas condicionales según `isAdvancedMode`
- Modo Simple: Sin tiendas en esquinas
- Modo Avanzado: 4 tiendas de Mercado Negro

### ✅ 4. Cartas del mazo corregidas
- **ARREGLADO**: Todos los valores actualizados según manual real
- Codebreaker: [0, 0, win]
- Daredevil: [2, 3, lose]
- Double Agent: [-1, 6, -1]
- Enforcer: [1, 2, 3]
- Saboteur: [-1, -1, -2]
- Sentinel: [0, 2, 6]

### ✅ 5. Composición del mazo
- **ARREGLADO**: 36 cartas totales (6 de cada tipo)
- Ambos modos tienen las mismas cartas
- Solo el Mercado Negro diferencia Simple de Avanzado

## ✅ COMPLETADO - UX/UI Mejoras

### ✅ 6. Sistema de notificaciones
- **IMPLEMENTADO**: react-hot-toast para eventos del juego
- Notificaciones para: cartas jugadas, turnos, reclutamiento, victoria/derrota
- Iconos y colores diferenciados por tipo de evento

### ✅ 7. Animaciones mejoradas
- **IMPLEMENTADO**: Nuevas animaciones CSS
- `pawn-moving`: Animación extendida para movimiento de fichas (1.5s)
- `card-flip`: Flip de carta al revelar (0.6s)
- `highlight-pulse`: Pulso amarillo para eventos importantes

### ✅ 8. Indicador de turno visual
- **IMPLEMENTADO**: Barra de estado con color y animación
- Verde/Teal cuando es tu turno (con pulse)
- Naranja cuando es turno del oponente
- Emojis para mejor comprensión (🎴 🎯 ⏳)

### ✅ 9. Proporciones del tablero
- **AJUSTADO**: Aspect ratio cambiado de 3/4 a 4/3
- Reducción de gaps y borders para mejor compresión vertical
- Tablero más horizontal y menos alto

### ✅ 10. Delays en acciones
- **IMPLEMENTADO**: 300ms delay después de jugar cartas
- Permite que los jugadores vean los eventos antes del siguiente


## 📋 Pendiente (Opcional/Futuro)

### ✅ Efectos de Mercado Negro con UI especial - IMPLEMENTADO
- ✅ Mind Control: Modal con selector de agente del oponente para robar
- ✅ Secret Recruit: Modal con selector de agente diferente de tu mano
- ✅ Double Trouble: Modal con selector de cartas idénticas de tu mano
- ✅ Smoke Screen: Automático - recluta del tope del mazo
- ✅ Spycation: Modal con selector de agente propio para devolver y reclutar
- ✅ Outpost: Modal con selector de Sentinel de tu mano

**Componentes creados:**
- `AgentSelectionModal.jsx`: Modal reutilizable para seleccionar agentes, cartas de mano, o agentes del oponente
- Nuevas funciones en `gameLogic.js`: `applyMindControl`, `applySecretRecruit`, `applyDoubleTrouble`, `applyOutpost`, `applySpycation`
- Event handler en servidor: `complete-black-market-effect` para procesar selecciones
- Lógica automática para bot: `handleBotBlackMarketEffect` hace selecciones aleatorias para el bot

**Eventos Socket.IO agregados:**
- `black-market-interaction-required`: Servidor solicita interacción del jugador
- `complete-black-market-effect`: Cliente envía selección del jugador
- `black-market-effect-completed`: Servidor confirma que el efecto se aplicó

### Mejoras adicionales (low priority)
- [ ] Sonidos para eventos (opcional)
- [ ] Tutorial interactivo para nuevos jugadores
- [ ] Historial de movimientos/acciones
- [ ] Animación de trayectoria para movimiento de fichas
- [ ] Partículas visuales en eventos importantes
- [ ] Modo oscuro/claro
- [ ] Estadísticas post-partida

---

## 🎉 Estado Final

**Juego completamente funcional y listo para jugar** ✅

- ✅ Todas las reglas del manual implementadas
- ✅ Sistema multijugador en tiempo real funcionando
- ✅ UX/UI pulida con animaciones y feedback visual
- ✅ Responsive design (móvil → desktop)
- ✅ Notificaciones claras de eventos
- ✅ Deploy en Netlify + Render

## 🟡 IMPORTANTE - Lógica del juego

### 4. Movimiento de fichas según cartas reclutadas
**Prioridad: ALTA**
- **Requiere Info**: Necesito confirmación de la tabla de movimiento
- **Pregunta**: ¿Cómo se calcula el movimiento según el número de cartas reclutadas?
- **Ejemplo esperado**:
  - 1ra carta de tipo X = ¿? casillas
  - 2da carta de tipo X = ¿? casillas
  - 3ra carta de tipo X = ¿? casillas
- **Archivo actual**: `server/utils/gameLogic.js` - función `calculateMovement()`
- **Verificar**: Que la lógica actual coincida con el manual

### 5. Distribución de cartas en el mazo
**Prioridad: MEDIA**
- **Problema**: Aparecen muchas cartas del mismo tipo, parece desbalanceado
- **Requiere Info**: ¿Cuántas cartas de cada agente debería haber?
- **Archivo**: `server/utils/gameLogic.js` - función `createAgentDeck()`
- **Verificar**: Cantidad correcta por tipo de agente en el manual

### 6. Visibilidad de agentes reclutados del oponente
**Prioridad: MEDIA**
- **Estado actual**: No claramente visible
- **Acción**: Revisar manual para confirmar si deberían ser visibles
- **Si son visibles**: Mejorar el componente `RecruitedAgents` para mostrar ambos jugadores
- **Archivo**: `client/src/components/RecruitedAgents.jsx`

## 🟢 UX/UI - Mejoras de experiencia

### 7. Falta feedback visual y animaciones
**Prioridad: ALTA**
- **Problema**: Las acciones suceden muy rápido sin avisos
- **Mejoras necesarias**:
  - [ ] Animación al jugar cartas (flip/aparecer)
  - [ ] Animación al mover fichas (transición suave con path)
  - [ ] Notificación toast cuando suceden eventos:
    - "Jugador X jugó cartas"
    - "Es tu turno para reclutar"
    - "Jugador X reclutó [Agente]"
    - "Es tu turno para jugar"
  - [ ] Delay entre acciones (~1-2 segundos) para que se vean
  - [ ] Highlight temporal en cartas recién jugadas
  - [ ] Highlight en ficha cuando se mueve
- **Tecnologías sugeridas**:
  - `react-hot-toast` para notificaciones
  - CSS transitions/animations para movimientos
  - Delays programáticos en eventos de socket

### 8. Diseño del tablero - proporciones verticales
**Prioridad: MEDIA**
- **Problema**: La ilustración del tablero es más pequeña verticalmente que el contenedor
- **Solución**: Comprimir todo verticalmente para mejor ajuste
- **Archivo**: `client/src/components/GameBoard.jsx`
- **Cambios sugeridos**:
  - Ajustar grid gaps (reducir `gap-0.5 sm:gap-1`)
  - Ajustar altura de tiles
  - Revisar aspect ratio del contenedor

### 9. Mejoras generales de diseño UX/UI
**Prioridad: MEDIA**
- **Objetivo**: Hacer que se parezca más al juego real
- **Áreas de mejora**:
  - [ ] Mejores transiciones entre fases
  - [ ] Indicadores más claros de turno actual
  - [ ] Panel de información del juego más visible
  - [ ] Mejor contraste en cartas
  - [ ] Estados hover más evidentes
  - [ ] Feedback al seleccionar cartas
  - [ ] Mostrar fase actual del juego de forma prominente
  - [ ] Animación de cuenta regresiva al iniciar partida
  - [ ] Sonidos (opcional)

## 📋 Checklist de Verificación

### Antes de implementar:
- [ ] Solicitar info sobre movimiento de cartas (punto 4)
- [ ] Solicitar info sobre cantidad de cartas en mazo (punto 5)
- [ ] Verificar en manual: visibilidad de agentes oponente (punto 6)

### Prioridad de implementación:
1. **Primero** (Crítico):
   - [ ] Fix sistema de turnos (punto 1)
   - [ ] Fix visibilidad de cartas (punto 2)
   - [ ] Fix tablero según modo (punto 3)

2. **Segundo** (Lógica):
   - [ ] Verificar movimiento de fichas (punto 4)
   - [ ] Verificar distribución del mazo (punto 5)
   - [ ] Visibilidad agentes oponente (punto 6)

3. **Tercero** (UX/UI):
   - [ ] Agregar animaciones y feedback (punto 7)
   - [ ] Ajustar proporciones tablero (punto 8)
   - [ ] Mejoras de diseño general (punto 9)

---

## 📝 Notas del Testing

**Fecha**: 6 de Febrero, 2026
**Modo testeado**: Multijugador
**Problemas encontrados**: 9 puntos críticos/importantes

### Próximos pasos:
1. Obtener info faltante del manual (movimiento, distribución mazo, visibilidad)
2. Crear issues en GitHub para tracking
3. Implementar fixes críticos primero
4. Testing iterativo después de cada fix
5. Deploy incremental a production

---

## 🔧 Archivos clave a modificar

### Backend:
- `server/controllers/socketController.js` - Lógica de turnos
- `server/utils/gameLogic.js` - Movimiento, mazo, win conditions

### Frontend:
- `client/src/pages/GamePage.jsx` - UI principal del juego, visibilidad cartas
- `client/src/components/GameBoard.jsx` - Tablero, proporciones, modo
- `client/src/components/Card.jsx` - Visibilidad face-up/down
- `client/src/components/RecruitedAgents.jsx` - Mostrar agentes oponente
- `client/src/index.css` - Animaciones adicionales

### Nuevos componentes necesarios:
- `client/src/components/TurnIndicator.jsx` - Indicador de turno claro
- `client/src/components/GameNotifications.jsx` - Sistema de notificaciones
- `client/src/hooks/useGameAnimations.js` - Hook para manejar animaciones
