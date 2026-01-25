# ✅ Checklist de Implementación - Agent Avenue

## 🎯 Setup Inicial

- [ ] **MongoDB Atlas**
  - [ ] Crear cuenta en MongoDB Atlas
  - [ ] Crear cluster gratuito (M0)
  - [ ] Crear usuario de base de datos
  - [ ] Añadir 0.0.0.0/0 a Network Access
  - [ ] Obtener connection string
  - [ ] Configurar en `server/.env`

- [ ] **Instalación Local**
  - [ ] Ejecutar `./setup.sh` O manualmente:
  - [ ] `cd server && npm install`
  - [ ] `cd client && npm install`
  - [ ] Configurar `server/.env` con MongoDB URI
  - [ ] Configurar `client/.env` (usar valores por defecto)

- [ ] **Primera Ejecución**
  - [ ] Terminal 1: `cd server && npm run dev`
  - [ ] Terminal 2: `cd client && npm run dev`
  - [ ] Abrir http://localhost:3000
  - [ ] Verificar que muestre "Conectado" (indicador verde)

## 🎮 Testing Básico

- [ ] **Crear Partida**
  - [ ] Ingresar nombre de jugador
  - [ ] Seleccionar "Crear Nueva Partida"
  - [ ] Verificar que genera código de 6 caracteres
  - [ ] Verificar que redirige a la sala de espera

- [ ] **Unirse a Partida**
  - [ ] Abrir en otra ventana/navegador
  - [ ] Ingresar nombre diferente
  - [ ] Seleccionar "Unirse a Partida"
  - [ ] Ingresar código generado
  - [ ] Verificar que aparecen ambos jugadores

- [ ] **Iniciar Juego**
  - [ ] Como host, click en "Comenzar Juego"
  - [ ] Verificar que ambos jugadores ven el tablero
  - [ ] Verificar que cada jugador tiene 4 cartas
  - [ ] Verificar que los peones están en posiciones iniciales

- [ ] **Jugar Turno Completo**
  - [ ] Jugador 1 selecciona 2 cartas diferentes
  - [ ] Click en "Jugar Cartas Seleccionadas"
  - [ ] Jugador 2 ve las cartas jugadas (1 boca arriba, 1 boca abajo)
  - [ ] Jugador 2 elige una carta para reclutar
  - [ ] Verificar que ambos peones se mueven
  - [ ] Verificar que las cartas se agregan a "Agentes Reclutados"
  - [ ] Verificar que se reponen las cartas en mano

- [ ] **Condiciones de Victoria**
  - [ ] Probar captura de peón
  - [ ] Probar 3 Codebreakers = Victoria
  - [ ] Probar 3 Daredevils = Derrota

## 🚀 Deploy en Producción

- [ ] **Render (Backend)**
  - [ ] Crear cuenta en Render.com
  - [ ] Nuevo Web Service desde GitHub
  - [ ] Configurar:
    - Root directory: `server`
    - Build: `npm install`
    - Start: `npm start`
  - [ ] Variables de entorno:
    - `MONGODB_URI`
    - `NODE_ENV=production`
    - `CORS_ORIGIN` (URL de Netlify)
  - [ ] Deploy y copiar URL

- [ ] **Netlify (Frontend)**
  - [ ] Crear cuenta en Netlify.com
  - [ ] Nuevo site desde GitHub
  - [ ] Configurar:
    - Base directory: `client`
    - Build: `npm run build`
    - Publish: `client/dist`
  - [ ] Variables de entorno:
    - `VITE_API_URL` (URL de Render)
    - `VITE_SOCKET_URL` (URL de Render)
  - [ ] Deploy

- [ ] **Testing en Producción**
  - [ ] Abrir URL de Netlify
  - [ ] Crear partida
  - [ ] Unirse desde otro dispositivo
  - [ ] Jugar partida completa

## 🎨 Mejoras Opcionales (Futuro)

- [ ] **UI/UX**
  - [ ] Animaciones de cartas
  - [ ] Transiciones de peones
  - [ ] Efectos de hover mejorados
  - [ ] Sonidos

- [ ] **Funcionalidad**
  - [ ] Sistema de descarte (4 veces por partida)
  - [ ] Modo Avanzado con Mercado Negro
  - [ ] Modo por Equipos
  - [ ] Chat entre jugadores
  - [ ] Sistema de reconexión

- [ ] **Datos**
  - [ ] Historial de partidas
  - [ ] Estadísticas de jugadores
  - [ ] Tabla de clasificación
  - [ ] Sistema de logros

## 📊 Estado Actual

**Última actualización:** ${new Date().toLocaleDateString('es-ES')}

**Progreso General:** ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜ 0%

**Modo Simple:** ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜ 0%

**Deploy:** ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜ 0%

---

### 📝 Notas

- Marca cada casilla cuando completes el paso
- Si encuentras problemas, consulta QUICKSTART.md o README.md
- Los logs de la consola son tu mejor amigo para debugging

### 🆘 Ayuda Rápida

**Backend no inicia:**

```bash
cd server
cat .env  # Verificar MongoDB URI
npm run dev  # Ver errores
```

**Frontend no inicia:**

```bash
cd client
cat .env  # Verificar URLs
npm run dev  # Ver errores
```

**No se conectan:**

- Verificar que backend esté corriendo en puerto 5000
- Verificar CORS en backend
- Ver consola del navegador (F12)
