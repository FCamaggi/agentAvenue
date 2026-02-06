# TODO - Mejoras y Correcciones Agent Avenue

## 🔴 CRÍTICO - Bugs que rompen el juego

### 1. Sistema de turnos roto después del primer turno
**Prioridad: CRÍTICA**
- **Problema**: Después de que cada jugador juega un turno, el sistema de turnos se rompe
- **Síntoma**: Al intentar jugar cartas sale "no es tu turno"
- **Investigar**: 
  - Verificar lógica de cambio de turno en `socketController.js`
  - Revisar actualización de `currentPlayer` después del reclutamiento
  - Comprobar sincronización de `isMyTurn` en el cliente

### 2. Visibilidad incorrecta de cartas jugadas
**Prioridad: CRÍTICA**
- **Problema Actual**: El oponente ve AMBAS cartas boca arriba
- **Comportamiento Correcto**: 
  - El jugador activo elige 2 cartas: una face-up (visible) y una face-down (oculta)
  - El oponente solo ve la carta face-up
  - El jugador activo ve ambas (porque las eligió)
- **Archivos afectados**: 
  - `client/src/pages/GamePage.jsx` - Componente de cartas jugadas
  - `client/src/components/Card.jsx` - Prop `faceUp`
- **Cambio necesario**: Condicionar la visibilidad según `playerId === currentPlayer`

### 3. Tablero incorrecto según modo de juego
**Prioridad: ALTA**
- **Problema**: En modo NORMAL aparecen iconos de tienda (Black Market) en las esquinas
- **Comportamiento Correcto**:
  - Modo Normal: Sin tiendas en las esquinas (casillas vacías)
  - Modo Avanzado: Tiendas en las 4 esquinas (tiles 1, 4, 8, 11)
- **Archivo**: `client/src/components/GameBoard.jsx`
- **Cambio**: Solo mostrar `BurglarIcon` si `isAdvancedMode === true`

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
