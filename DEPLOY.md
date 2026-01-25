# 🚀 Guía de Deployment - Agent Avenue

## Resumen de Mejoras Implementadas

### ✅ UX/UI y Responsive

- **Diseño completamente responsive** optimizado para móviles
- **Scroll horizontal** en mano de cartas para pantallas pequeñas
- **Tablero adaptativo** con tamaños escalables
- **Animaciones fluidas**: movimiento de peones, aparición de cartas, efectos visuales
- **Feedback visual mejorado**: estados activos, errores con shake, victorias con glow
- **Optimización táctil** para dispositivos móviles

### ✅ Funcionalidades del Manual

- **Sistema de descarte**: 4 descartes por partida implementado
- **Mercado Negro completo**:
  - Detección automática al caer en casillas
  - Efectos instantáneos y permanentes
  - Sistema de efectos aplicados (Supercomputer, Distraction Device, etc.)
  - Condiciones especiales de victoria (Masterplan, Leader of the Pack, Security System)
- **Condición de agotamiento**: Victoria por proximidad cuando se acaban las cartas
- **Efectos permanentes**: Modificadores de movimiento aplicados correctamente

### ✅ Mejoras de Código

- Estados de context actualizados con soporte para nuevas funcionalidades
- Lógica del servidor completa para todas las reglas
- Verificaciones de victoria/derrota según manual
- Soporte completo para bot con nuevas mecánicas

---

## 📋 Pre-requisitos

### Cliente (Netlify)

- Cuenta en [Netlify](https://netlify.com)
- Repositorio de GitHub (opcional pero recomendado)

### Servidor (Render)

- Cuenta en [Render](https://render.com)
- Base de datos MongoDB (MongoDB Atlas recomendado)

---

## 🎯 Deploy del Cliente en Netlify

### Opción 1: Deploy Manual

1. **Preparar el build:**

   ```bash
   cd client
   npm install
   npm run build
   ```

2. **Deploy en Netlify:**
   - Ir a https://app.netlify.com
   - Click en "Add new site" → "Deploy manually"
   - Arrastrar la carpeta `client/dist`
   - ✅ Listo!

### Opción 2: Deploy desde GitHub (Recomendado)

1. **Configuración en Netlify:**
   - Conectar repositorio de GitHub
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Base directory:** `client`

2. **Variables de entorno:**

   ```
   VITE_SOCKET_URL=https://tu-servidor-render.onrender.com
   ```

3. **Archivo netlify.toml ya configurado** ✅

---

## 🖥️ Deploy del Servidor en Render

### 1. Configurar MongoDB Atlas

1. Crear cluster en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Obtener connection string:
   ```
   mongodb+srv://usuario:password@cluster.mongodb.net/agent-avenue
   ```

### 2. Deploy en Render

1. **Crear Web Service en Render:**
   - Conectar repositorio
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node

2. **Variables de entorno en Render:**

   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://...tu-connection-string...
   CLIENT_URL=https://tu-app.netlify.app
   ```

3. **Configuración adicional:**
   - **Node Version:** 18.x
   - **Auto-deploy:** Habilitado (opcional)

---

## 🔧 Variables de Entorno

### Cliente (.env en desarrollo)

```env
VITE_SOCKET_URL=http://localhost:3000
```

### Servidor (.env en desarrollo)

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/agent-avenue
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

---

## ✅ Checklist de Deployment

### Antes de hacer deploy:

- [ ] Todas las dependencias instaladas
- [ ] Build del cliente funciona localmente (`npm run build`)
- [ ] Servidor funciona localmente (`npm run dev`)
- [ ] MongoDB Atlas configurado y accesible
- [ ] Variables de entorno configuradas
- [ ] Archivos `.env` NO subidos a GitHub (están en .gitignore)

### Después del deploy:

- [ ] Cliente carga correctamente en Netlify
- [ ] Servidor responde en Render
- [ ] Conexión Socket.IO funciona (ver consola del navegador)
- [ ] MongoDB conectado (ver logs de Render)
- [ ] Juego funciona end-to-end
- [ ] Prueba en móvil funciona correctamente
- [ ] Modo avanzado y Mercado Negro funcionan
- [ ] Sistema de descarte funciona

---

## 🐛 Troubleshooting

### Error: "Connection failed"

**Solución:** Verificar VITE_SOCKET_URL apunta al servidor correcto

### Error: "MongoDB connection failed"

**Solución:**

1. Verificar MongoDB Atlas permite conexiones desde cualquier IP (0.0.0.0/0)
2. Verificar MONGODB_URI es correcto
3. Revisar logs en Render

### Error: "CORS policy"

**Solución:** Verificar CLIENT_URL en servidor está configurado correctamente

### Lag o desconexiones en móvil

**Solución:**

1. Render free tier puede entrar en "sleep" - usar ping service
2. Considerar upgrade a plan pagado

---

## 📱 Pruebas en Móvil

### Recomendaciones:

1. **Chrome DevTools**: Usar device toolbar para simular móviles
2. **Responsive breakpoints probados:**
   - Mobile: 320px - 640px ✅
   - Tablet: 641px - 1024px ✅
   - Desktop: 1025px+ ✅

3. **Características móviles:**
   - Scroll horizontal en mano de cartas ✅
   - Botones táctiles optimizados ✅
   - Tablero escalable ✅
   - Animaciones suaves en dispositivos de gama baja ✅

---

## 🎮 Funcionalidades Completas

### Modo Simple

- ✅ Juego básico completo
- ✅ 3 tipos de agentes (Double Agent, Enforcer, Codebreaker)
- ✅ Condiciones de victoria/derrota
- ✅ Sistema de descarte (4 por partida)
- ✅ Condición de agotamiento de cartas

### Modo Avanzado

- ✅ Todos los agentes (+ Saboteur, Daredevil, Sentinel)
- ✅ Mercado Negro completo (15 cartas)
- ✅ Efectos instantáneos funcionando
- ✅ Efectos permanentes aplicados
- ✅ Condiciones especiales de victoria
- ✅ Detección automática de casillas

### Modo Bot

- ✅ Juego contra IA
- ✅ IA toma decisiones inteligentes
- ✅ Funciona con descarte y Mercado Negro

---

## 🔒 Seguridad

- No exponer variables sensibles en el cliente
- MongoDB Atlas: configurar IP whitelist en producción
- CORS configurado correctamente
- Rate limiting (considerar agregar)

---

## 📊 Monitoreo

### Render:

- Ver logs en tiempo real
- Métricas de uso
- Uptime monitoring

### Netlify:

- Analytics
- Deploy logs
- Function logs

---

## 🚀 URLs de Ejemplo

```
Cliente: https://agent-avenue.netlify.app
Servidor: https://agent-avenue-api.onrender.com
```

**¡Todo listo para jugar!** 🎉
