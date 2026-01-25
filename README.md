# Agent Avenue - Juego de Mesa Digital

Digitalización del juego de mesa **Agent Avenue** con multijugador en tiempo real.

## 🎮 Características

- 🎯 Juego multijugador en tiempo real con WebSockets
- 🤖 **Modo Bot: Juega contra IA para testing rápido**
- 🔐 Sistema de lobby con códigos únicos de 6 caracteres
- 🎨 Interfaz moderna con React y TailwindCSS
- 📱 Responsive design
- 🎲 3 modos de juego: Simple, Avanzado y por Equipos
- 🗄️ Persistencia de datos con MongoDB Atlas
- ☁️ Deploy automático en Netlify (frontend) y Render (backend)

## 🏗️ Estructura del Proyecto

```
Agent_Avenue/
├── client/              # Frontend React
│   ├── src/
│   │   ├── components/  # Componentes del juego
│   │   ├── contexts/    # Contextos de React
│   │   ├── pages/       # Páginas principales
│   │   ├── utils/       # Utilidades
│   │   └── App.jsx
│   ├── public/          # Imágenes y assets
│   └── package.json
│
├── server/              # Backend Node.js
│   ├── controllers/     # Lógica de Socket.IO
│   ├── models/          # Modelos de MongoDB
│   ├── services/        # Servicios del juego
│   ├── utils/           # Utilidades y constantes
│   └── server.js
│
└── docs/                # Documentación del juego
```

## 🚀 Instalación Local

### Requisitos Previos

- Node.js 18+
- npm o yarn
- MongoDB Atlas cuenta (gratis)

### 1. Clonar el repositorio

```bash
cd Agent_Avenue
```

### 2. Configurar el Backend

```bash
cd server
npm install

# Crear archivo .env
cp .env.example .env
```

Editar `.env` con tus credenciales:

```env
PORT=5000
MONGODB_URI=mongodb+srv://tu_usuario:tu_password@cluster.mongodb.net/agent-avenue
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### 3. Configurar el Frontend

```bash
cd ../client
npm install

# Crear archivo .env
cp .env.example .env
```

Editar `.env`:

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### 4. Iniciar en Modo Desarrollo

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

Abre tu navegador en `http://localhost:3000`

## ☁️ Deploy en Producción

### MongoDB Atlas

1. Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea un cluster (Free tier es suficiente)
3. Configura las IP permitidas (0.0.0.0/0 para acceso desde cualquier lugar)
4. Crea un usuario de base de datos
5. Obtén tu connection string

### Backend en Render

1. Ve a [Render](https://render.com) y crea una cuenta
2. Crea un nuevo **Web Service**
3. Conecta tu repositorio de GitHub
4. Configuración:
   - **Name:** agent-avenue-server
   - **Root Directory:** `server`
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Variables de entorno:

   ```
   MONGODB_URI=tu_connection_string_de_mongodb
   NODE_ENV=production
   CORS_ORIGIN=https://tu-app.netlify.app
   PORT=5000
   ```

6. Click en **Create Web Service**

### Frontend en Netlify

1. Ve a [Netlify](https://netlify.com) y crea una cuenta
2. Click en **Add new site** → **Import an existing project**
3. Conecta tu repositorio de GitHub
4. Configuración:
   - **Base directory:** `client`
   - **Build command:** `npm run build`
   - **Publish directory:** `client/dist`
5. Variables de entorno:

   ```
   VITE_API_URL=https://tu-servidor.onrender.com
   VITE_SOCKET_URL=https://tu-servidor.onrender.com
   ```

6. Click en **Deploy site**

## 🎯 Cómo Jugar

### Jugar contra Bot (Testing Rápido) 🤖

1. Ingresa tu nombre
2. Click en "🤖 Jugar contra Bot"
3. Selecciona modo de juego
4. ¡El juego inicia automáticamente!

> Ver [BOT_GUIDE.md](BOT_GUIDE.md) para más detalles

### Crear una Partida

1. Ingresa tu nombre
2. Elige "Crear Nueva Partida"
3. Selecciona el modo de juego
4. Comparte el código de 6 caracteres con tu oponente

### Unirse a una Partida

1. Ingresa tu nombre
2. Elige "Unirse a Partida"
3. Ingresa el código compartido

### Jugabilidad

1. **Fase de Juego:** Selecciona 2 cartas diferentes de tu mano
2. **Fase de Reclutamiento:** Tu oponente elige una carta, tú obtienes la otra
3. **Movimiento:** Ambos peones se mueven según las cartas reclutadas
4. **Victoria:** Captura el peón del oponente o cumple condiciones especiales

## 🛠️ Tecnologías

### Frontend

- React 18
- Vite
- TailwindCSS
- Socket.IO Client
- React Router DOM
- Zustand (estado)
- Lucide React (iconos)

### Backend

- Node.js
- Express
- Socket.IO
- MongoDB + Mongoose
- nanoid (generación de IDs)
- dotenv

### Infraestructura

- Netlify (Frontend hosting)
- Render (Backend hosting)
- MongoDB Atlas (Base de datos)

## 📝 Scripts Disponibles

### Client

```bash
npm run dev      # Desarrollo
npm run build    # Build para producción
npm run preview  # Preview del build
```

### Server

```bash
npm start        # Producción
npm run dev      # Desarrollo con nodemon
```

## 🐛 Solución de Problemas

### Error de conexión a MongoDB

- Verifica que tu IP esté en la whitelist de MongoDB Atlas
- Revisa que el connection string sea correcto
- Asegúrate de que el usuario tenga permisos

### Error de CORS

- Verifica que `CORS_ORIGIN` en el backend coincida con tu URL de frontend
- En desarrollo local debe ser `http://localhost:3000`
- En producción debe ser tu URL de Netlify

### Problemas con Socket.IO

- Verifica que las URLs en el frontend apunten al backend correcto
- Revisa los logs del servidor para ver errores de conexión
- Asegúrate de que Render no esté en sleep mode (plan gratuito se duerme después de 15 min de inactividad)

## 📄 Licencia

Este proyecto está basado en el juego de mesa Agent Avenue y es solo para uso educativo.

## 👥 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 🎮 Créditos del Juego Original

- **Diseño:** Christian Kudahl, Laura Kudahl
- **Arte:** Dominik Lorenz
- **Ilustraciones:** Fanny Pastor-Berlie

---

¡Disfruta jugando Agent Avenue! 🕵️‍♂️🕵️‍♀️
