# Guía de Deploy - Agent Avenue

## 📋 Pre-requisitos

1. Cuenta en [Netlify](https://www.netlify.com/)
2. Cuenta en [Render](https://render.com/)
3. Cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
4. Repositorio en GitHub: `git@github.com:FCamaggi/agentAvenue.git`

## 🚀 Paso 1: Deploy del Backend en Render

### 1.1 Configuración Inicial

1. Ve a [Render Dashboard](https://dashboard.render.com/)
2. Click en **"New +"** → **"Web Service"**
3. Conecta tu repositorio de GitHub: `FCamaggi/agentAvenue`
4. Configura el servicio:
   - **Name**: `agent-avenue-server`
   - **Region**: Oregon (o el más cercano)
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

### 1.2 Variables de Entorno

En la sección **Environment**, agrega estas variables:

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://tu-usuario:tu-password@cluster.mongodb.net/agent-avenue?retryWrites=true&w=majority
CLIENT_URL=https://tu-app.netlify.app
```

**Importante**: Reemplaza los valores:

- `MONGODB_URI`: Tu conexión de MongoDB Atlas
- `CLIENT_URL`: La URL que obtendrás de Netlify (puedes actualizarla después)

### 1.3 Deploy

1. Click en **"Create Web Service"**
2. Espera a que termine el deploy (5-10 minutos)
3. Copia la URL del servidor (ejemplo: `https://agent-avenue-server.onrender.com`)

### 1.4 Verificación

Visita: `https://tu-servidor.onrender.com/health`

Deberías ver:

```json
{
  "status": "ok",
  "timestamp": "2026-01-25T..."
}
```

## 🌐 Paso 2: Deploy del Frontend en Netlify

### 2.1 Configuración Inicial

1. Ve a [Netlify Dashboard](https://app.netlify.com/)
2. Click en **"Add new site"** → **"Import an existing project"**
3. Conecta tu repositorio de GitHub: `FCamaggi/agentAvenue`
4. Configura el build:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/dist`

### 2.2 Variables de Entorno

En **Site settings** → **Environment variables**, agrega:

```env
VITE_SOCKET_URL=https://agent-avenue-server.onrender.com
```

**Importante**: Usa la URL de Render del paso 1.3

### 2.3 Deploy

1. Click en **"Deploy site"**
2. Espera a que termine el deploy (3-5 minutos)
3. Copia la URL del sitio (ejemplo: `https://agent-avenue-xyz.netlify.app`)

### 2.4 Actualizar CORS en Render

Vuelve a Render y actualiza la variable `CLIENT_URL`:

```env
CLIENT_URL=https://agent-avenue-xyz.netlify.app
```

Esto habilitará CORS para tu dominio de Netlify.

## ✅ Paso 3: Verificación Final

### 3.1 Prueba la Aplicación

1. Visita tu sitio en Netlify
2. Crea una nueva partida
3. Verifica que puedas:
   - Crear lobby
   - Unirte con un segundo jugador (otra pestaña/dispositivo)
   - Jugar cartas
   - Reclutar agentes
   - Ver actualizaciones en tiempo real

### 3.2 Checklist de Funcionalidad

- [ ] Conexión Socket.IO establecida
- [ ] Creación de lobby funciona
- [ ] Unirse al lobby funciona
- [ ] Iniciar partida funciona
- [ ] Jugar cartas funciona
- [ ] Sistema de descarte funciona (4 descartes)
- [ ] Mercado Negro funciona (modo avanzado)
- [ ] Condiciones de victoria funcionan
- [ ] Bot funciona correctamente
- [ ] Responsive en móvil
- [ ] Animaciones funcionan

## 🔧 Troubleshooting

### Error: "Socket connection failed"

**Causa**: El servidor no está corriendo o CORS mal configurado

**Solución**:

1. Verifica que el servidor esté activo en Render
2. Confirma que `VITE_SOCKET_URL` apunta al servidor correcto
3. Verifica que `CLIENT_URL` en Render coincida con tu URL de Netlify

### Error: "MongoDB connection failed"

**Causa**: MONGODB_URI incorrecta o IP no whitelisted

**Solución**:

1. Ve a MongoDB Atlas → Network Access
2. Agrega `0.0.0.0/0` a la lista de IPs permitidas
3. Verifica que tu string de conexión sea correcta

### El bot se queda pegado

**Causa**: Error en el código del bot (ya corregido)

**Solución**: Ya implementado en último commit

### Render se duerme (plan Free)

**Problema**: En el plan Free, Render "duerme" el servicio tras 15 minutos de inactividad

**Solución temporal**:

- El servidor tarda ~30 segundos en despertar al recibir la primera petición
- Considera usar un servicio de "ping" para mantenerlo activo

**Solución permanente**:

- Upgrade a plan pagado ($7/mes)

## 📱 Configuración de Dominio Personalizado (Opcional)

### En Netlify:

1. **Site settings** → **Domain management**
2. Click en **"Add custom domain"**
3. Sigue las instrucciones para configurar tu DNS

### En Render:

1. **Settings** → **Custom Domains**
2. Agrega tu dominio personalizado
3. Configura los registros DNS según las instrucciones

## 🔐 Seguridad en Producción

### Recomendaciones:

1. **MongoDB**:
   - Usar usuario/contraseña seguros
   - Limitar IPs permitidas (si es posible)
   - Habilitar audit logs

2. **Variables de Entorno**:
   - Nunca commitear `.env` al repositorio
   - Rotar credenciales periódicamente

3. **Rate Limiting** (futuro):
   - Implementar límites de peticiones
   - Proteger contra DDoS

## 📊 Monitoreo

### Render:

- Ve a tu servicio → **Logs** para ver logs en tiempo real
- Configura alertas en **Settings** → **Notifications**

### Netlify:

- **Site overview** muestra estadísticas de uso
- **Deploy log** muestra errores de build

## 🎉 ¡Listo!

Tu aplicación está desplegada y lista para jugar en:

- **Frontend**: https://tu-sitio.netlify.app
- **Backend**: https://tu-servidor.onrender.com

## 📞 Soporte

Si hay problemas:

1. Revisa los logs en Render y Netlify
2. Verifica las variables de entorno
3. Comprueba la conexión a MongoDB
4. Asegúrate de que CORS está configurado correctamente
