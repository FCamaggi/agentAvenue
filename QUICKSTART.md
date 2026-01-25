# 🚀 Guía Rápida de Inicio - Agent Avenue

## ⚡ Inicio Rápido (5 minutos)

### 1️⃣ Instalar dependencias

```bash
# En una terminal - Backend
cd server
npm install

# En otra terminal - Frontend
cd client
npm install
```

### 2️⃣ Configurar variables de entorno

**Backend** (`server/.env`):

```env
PORT=5000
MONGODB_URI=tu_mongodb_uri_aqui
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

**Frontend** (`client/.env`):

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### 3️⃣ Ejecutar

**Terminal 1 - Backend:**

```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd client
npm run dev
```

**Abre:** http://localhost:3000

---

## 📦 MongoDB Atlas (Gratis)

1. Ir a https://www.mongodb.com/cloud/atlas/register
2. Crear cuenta gratuita
3. Crear cluster (Free tier M0)
4. Database Access → Add New Database User
5. Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)
6. Connect → Connect your application → Copiar connection string
7. Reemplazar `<password>` con tu contraseña
8. Pegar en `server/.env` como `MONGODB_URI`

---

## ☁️ Deploy Rápido

### Netlify (Frontend)

1. Push tu código a GitHub
2. https://app.netlify.com → New site from Git
3. Seleccionar repositorio
4. Base directory: `client`
5. Build command: `npm run build`
6. Publish directory: `client/dist`
7. Environment variables:
   - `VITE_API_URL` = URL de tu backend en Render
   - `VITE_SOCKET_URL` = URL de tu backend en Render

### Render (Backend)

1. https://dashboard.render.com → New Web Service
2. Conectar repositorio
3. Root directory: `server`
4. Build command: `npm install`
5. Start command: `npm start`
6. Environment variables:
   - `MONGODB_URI` = Tu MongoDB Atlas URI
   - `NODE_ENV` = production
   - `CORS_ORIGIN` = URL de tu frontend en Netlify
   - `PORT` = 5000

---

## 🎮 Probar el Juego

### Opción A: Contra Bot (Más Rápido) 🤖

1. **Jugador:**
   - Ingresa tu nombre
   - Click en "🤖 Jugar contra Bot"
   - Selecciona modo de juego
   - ¡Listo! El bot jugará automáticamente

> 💡 Perfecto para testing sin necesidad de otro jugador

### Opción B: Multijugador

1. **Jugador 1:**
   - Crear Nueva Partida
   - Copiar código (ej: ABC123)

2. **Jugador 2:**
   - Unirse a Partida
   - Pegar código

3. **Jugador 1:**
   - Click en "Comenzar Juego"

¡A jugar! 🎉

---

## 🐛 Problemas Comunes

### "No se puede conectar al servidor"

- ✅ Verifica que el backend esté corriendo (`npm run dev` en `/server`)
- ✅ Revisa que `VITE_API_URL` en client/.env sea correcto

### "MongoDB connection failed"

- ✅ Verifica el `MONGODB_URI` en server/.env
- ✅ Asegúrate de que 0.0.0.0/0 esté en Network Access de MongoDB Atlas
- ✅ Verifica que el usuario de DB tenga permisos correctos

### "CORS error"

- ✅ En producción: `CORS_ORIGIN` en backend debe coincidir con URL de Netlify
- ✅ En desarrollo: debe ser `http://localhost:3000`

### Las cartas no se ven

- ✅ Verifica que `/client/public/tarjetas/` tenga las imágenes
- ✅ Verifica que `/client/public/fondo_tableros/` tenga los fondos

---

## 📁 Estructura Importante

```
Agent_Avenue/
├── client/
│   ├── public/
│   │   ├── tarjetas/          ← Imágenes de cartas
│   │   └── fondo_tableros/    ← Fondos del tablero
│   ├── src/
│   ├── .env                   ← Variables de entorno
│   └── package.json
│
└── server/
    ├── .env                   ← Variables de entorno
    ├── server.js              ← Punto de entrada
    └── package.json
```

---

## 🎯 Próximos Pasos

1. ✅ Instalar y probar localmente
2. ✅ Configurar MongoDB Atlas
3. ✅ Deploy en Netlify + Render
4. 🎮 ¡Jugar!

---

**¿Necesitas ayuda?** Revisa el README.md completo o los logs de la consola.
