# 🛠️ Comandos de Desarrollo - Agent Avenue

## 🚀 Comandos Principales

### Inicio Rápido (Desarrollo Local)

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

### Setup Automático

```bash
# Desde la raíz del proyecto
./setup.sh
```

## 📦 Instalación

### Instalar Dependencias

```bash
# Todo el proyecto
npm install --prefix server && npm install --prefix client

# Solo backend
cd server && npm install

# Solo frontend
cd client && npm install
```

### Actualizar Dependencias

```bash
# Backend
cd server && npm update

# Frontend
cd client && npm update
```

## 🏗️ Build

### Producción

```bash
# Frontend
cd client
npm run build

# Preview del build
npm run preview
```

### Desarrollo

```bash
# Frontend con hot reload
cd client
npm run dev

# Backend con nodemon
cd server
npm run dev
```

## 🧪 Testing y Debugging

### Ver Logs

```bash
# Backend logs
cd server
npm run dev | tee server.log

# Ver solo errores
npm run dev 2>&1 | grep -i error
```

### Verificar Conexiones

```bash
# Puerto del servidor
lsof -i :5000
# o
netstat -an | grep 5000

# Puerto del cliente
lsof -i :3000
# o
netstat -an | grep 3000
```

### Testing de MongoDB

```bash
# Desde server/
node -e "
require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => { console.log('✅ MongoDB conectado'); process.exit(0); })
  .catch(err => { console.error('❌ Error:', err); process.exit(1); });
"
```

### Testing de Socket.IO

```bash
# Instalar wscat globalmente
npm install -g wscat

# Conectar al servidor
wscat -c ws://localhost:5000/socket.io/?EIO=4&transport=websocket
```

## 🔧 Mantenimiento

### Limpiar node_modules

```bash
# Todo el proyecto
rm -rf server/node_modules client/node_modules

# Solo backend
rm -rf server/node_modules

# Solo frontend
rm -rf client/node_modules
```

### Limpiar builds

```bash
# Frontend
rm -rf client/dist

# Limpiar cache
rm -rf client/.vite
```

### Reset completo

```bash
# Desde la raíz
rm -rf server/node_modules client/node_modules
rm -rf client/dist client/.vite
npm install --prefix server
npm install --prefix client
```

## 📊 Monitoreo

### Ver Procesos

```bash
# Ver procesos de Node
ps aux | grep node

# Ver específicamente nuestros procesos
ps aux | grep -E "(vite|nodemon|agent-avenue)"
```

### Memoria y CPU

```bash
# Uso de recursos
top -p $(pgrep -d',' node)

# O con htop (más visual)
htop -p $(pgrep -d',' node)
```

## 🗄️ Base de Datos

### MongoDB Shell

```bash
# Conectar a MongoDB Atlas
mongosh "mongodb+srv://cluster.mongodb.net/agent-avenue" --username tu_usuario

# Comandos útiles en el shell:
use agent-avenue
show collections
db.games.find().pretty()
db.games.countDocuments()
```

### Limpiar Datos de Testing

```bash
# Desde server/, crear script temporal
node -e "
require('dotenv').config();
const mongoose = require('mongoose');
const Game = require('./models/Game.js').default;

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  await Game.deleteMany({});
  console.log('✅ Base de datos limpiada');
  process.exit(0);
});
"
```

## 🌐 Deploy

### Render (Backend)

```bash
# Verificar que funciona antes de deploy
cd server
NODE_ENV=production npm start

# Ver logs en Render (desde la web o CLI)
render logs --service agent-avenue-server
```

### Netlify (Frontend)

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy manual (testing)
cd client
npm run build
netlify deploy --dir=dist

# Deploy a producción
netlify deploy --prod --dir=dist
```

## 🐛 Debugging

### Variables de Entorno

```bash
# Ver variables (backend)
cd server
cat .env
grep -v '^#' .env | grep -v '^$'

# Ver variables (frontend)
cd client
cat .env
```

### Verificar Puertos Disponibles

```bash
# Ver qué está usando el puerto 5000
lsof -i :5000

# Matar proceso en puerto
kill -9 $(lsof -t -i:5000)

# Ver todos los puertos en uso
lsof -i -P -n | grep LISTEN
```

### Errores Comunes

```bash
# "Port already in use"
kill -9 $(lsof -t -i:5000)
kill -9 $(lsof -t -i:3000)

# "Module not found"
cd server && npm install
cd client && npm install

# "MongoDB connection failed"
# Verificar MONGODB_URI en server/.env

# "CORS error"
# Verificar CORS_ORIGIN en server/.env y que coincida con la URL del cliente
```

## 📝 Logs y Debugging

### Logs Detallados

```bash
# Backend con logs detallados
cd server
DEBUG=* npm run dev

# Frontend con logs de Vite
cd client
npm run dev -- --debug
```

### Guardar Logs

```bash
# Backend
cd server
npm run dev > ../logs/server.log 2>&1 &

# Frontend
cd client
npm run dev > ../logs/client.log 2>&1 &

# Ver logs en tiempo real
tail -f logs/server.log
tail -f logs/client.log
```

## 🔄 Git

### Comandos Útiles

```bash
# Estado
git status

# Ver cambios
git diff

# Commit
git add .
git commit -m "feat: implementar [feature]"

# Push
git push origin main

# Ver historial
git log --oneline --graph --all
```

### Branches

```bash
# Crear branch para feature
git checkout -b feature/mercado-negro

# Cambiar entre branches
git checkout main
git checkout feature/mercado-negro

# Merge
git checkout main
git merge feature/mercado-negro
```

## 🎨 Desarrollo Frontend

### Tailwind

```bash
# Regenerar CSS
cd client
npx tailwindcss -o src/index.css --watch
```

### Linting

```bash
cd client
npm run lint

# Fix automático
npm run lint -- --fix
```

## 📦 Actualización de Dependencias

```bash
# Ver dependencias desactualizadas
cd server && npm outdated
cd client && npm outdated

# Actualizar con cuidado
npm update

# O actualizar una específica
npm install socket.io@latest
```

## 🚀 Scripts Personalizados

Puedes agregar estos scripts a los `package.json`:

### Backend (server/package.json)

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js",
  "test": "echo \"No tests yet\"",
  "clean": "rm -rf node_modules",
  "logs": "tail -f server.log"
}
```

### Frontend (client/package.json)

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "lint": "eslint . --ext js,jsx",
  "lint:fix": "eslint . --ext js,jsx --fix",
  "clean": "rm -rf node_modules dist .vite"
}
```

---

## 💡 Tips

1. **Desarrollo paralelo:** Usa `tmux` o `screen` para mantener ambos servidores corriendo
2. **Hot reload:** Ambos servidores tienen hot reload, no necesitas reiniciar
3. **Logs:** Siempre revisa los logs cuando algo no funcione
4. **MongoDB:** Usa MongoDB Compass para ver/editar datos visualmente
5. **Git:** Haz commits pequeños y frecuentes

## 🆘 Ayuda Rápida

```bash
# ¿Backend corriendo?
curl http://localhost:5000/health

# ¿Frontend corriendo?
curl http://localhost:3000

# ¿MongoDB conectado?
cd server && node -e "require('dotenv').config(); console.log(process.env.MONGODB_URI)"
```
