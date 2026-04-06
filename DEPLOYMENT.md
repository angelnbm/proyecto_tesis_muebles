# 🚀 Guía de Deployment en Vercel

Este documento describe cómo desplegar la aplicación de diseño de muebles en Vercel con seguridad completa.

---

## 📋 Requisitos previos

- Cuenta en [Vercel](https://vercel.com)
- Proyecto en GitHub conectado
- MongoDB Atlas account (o MongoDB local)
- Node.js 18+ instalado localmente

---

## 🔐 Secrets y Variables de Entorno

### Paso 1: Generar JWT_SECRET

Ejecuta en tu terminal:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copia el resultado y guárdalo de forma segura.

### Paso 2: Configurar MongoDB

Si usas MongoDB Atlas:

1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea un cluster
3. En "Database Access" → crea un usuario y contraseña
4. En "Network Access" → agrega IP `0.0.0.0/0` (permitir desde Vercel)
5. En "Clusters" → click en "Connect" → obtén el connection string

El connection string debe verse así:
```
mongodb+srv://username:password@cluster.mongodb.net/furniture_db
```

---

## 📝 Configurar en Vercel Dashboard

### Paso 1: Conectar repositorio

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Click en "Add New..." → "Project"
3. Selecciona tu repositorio de GitHub
4. Click en "Import"

### Paso 2: Agregar Environment Variables

En la sección **"Environment Variables"**, agrega:

| Variable | Valor | Scope |
|----------|-------|-------|
| `MONGODB_URI` | `mongodb+srv://username:password@cluster.mongodb.net/furniture_db` | Production, Preview, Development |
| `JWT_SECRET` | (resultado del comando anterior) | Production, Preview, Development |
| `CORS_ORIGIN` | `https://tu-proyecto.vercel.app` | Production |
| `NODE_ENV` | `production` | Production |
| `VITE_API_URL` | `https://tu-proyecto.vercel.app/api` | Production |

**IMPORTANTE:** Reemplaza `tu-proyecto` con el nombre real de tu proyecto en Vercel.

### Paso 3: Configurar Build

En la sección **"Build & Development Settings"**:

- **Framework**: Vite
- **Build Command**: `cd backend && npm install && cd ../frontend && npm install && npm run build`
- **Output Directory**: `frontend/dist`
- **Install Command**: `npm install`

### Paso 4: Deploy

Click en "Deploy" y espera a que finalice.

---

## ✅ Verificar Deployment

### 1. Health Check

```bash
curl https://tu-proyecto.vercel.app
```

Deberías ver:
```json
{
  "message": "API de diseño de muebles",
  "environment": "production",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. Verificar CORS

Intenta hacer login desde el frontend. Deberías:
- Ver la solicitud a `/api/auth/login`
- NO ver errores de CORS
- Recibir un token JWT

### 3. Verificar Rate Limiting

Haz múltiples solicitudes rápidamente:

```bash
for i in {1..10}; do curl https://tu-proyecto.vercel.app/api/furniture -H "Authorization: Bearer test"; done
```

En la solicitud 6+ deberías ver:
```json
{
  "success": false,
  "message": "Límite de solicitudes alcanzado. Intenta más tarde."
}
```

### 4. Verificar Headers de Seguridad

```bash
curl -i https://tu-proyecto.vercel.app/api
```

Deberías ver:
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
```

---

## 🔄 Variables de Entorno Locales

Para desarrollo local, crea archivos `.env`:

### `backend/.env`

```
MONGODB_URI=mongodb://localhost:27017/furniture_db
JWT_SECRET=dev-secret-key-no-production
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
PORT=5000
```

### `frontend/.env.development`

```
VITE_API_URL=http://localhost:5000/api
```

---

## 🐛 Troubleshooting

### Error: "Falló la conexión a MongoDB"

- ✅ Verifica que el connection string sea correcto
- ✅ En MongoDB Atlas, agrega IP `0.0.0.0/0` en Network Access
- ✅ Prueba la conexión localmente primero

### Error: "CORS error"

- ✅ Verifica que `CORS_ORIGIN` sea exacto (sin trailing slash)
- ✅ El frontend debe estar en el mismo dominio: `https://tu-proyecto.vercel.app`

### Error: "Token inválido"

- ✅ El `JWT_SECRET` debe ser igual en dev y producción
- ✅ Los tokens expiran después de cierto tiempo (generalmente 1 hora)

### Error: "Rate limit alcanzado"

- Es normal. Espera 15 minutos o usa una VPN diferente para resetear la IP

---

## 📊 Monitoreo en Producción

### Ver logs en Vercel

1. Ve a Vercel Dashboard
2. Selecciona tu proyecto
3. Click en "Deployments"
4. Selecciona el deployment más reciente
5. Click en "Logs"

### Métricas recomendadas

Monitorea:
- **Response time**: debe estar < 500ms
- **Error rate**: debe estar < 1%
- **Database connections**: debe estar < 100
- **Rate limit hits**: indica si hay ataques

---

## 🚨 Seguridad - Checklist final

Antes de ir a producción, verifica:

- ✅ `vercel.json` configurado correctamente
- ✅ `MONGODB_URI` es de MongoDB Atlas (no local)
- ✅ `JWT_SECRET` es aleatorio y seguro (32+ caracteres)
- ✅ `CORS_ORIGIN` usa HTTPS
- ✅ Helmet habilitado con headers CSP, HSTS, etc.
- ✅ Rate limiting activo
- ✅ Sanitización de inputs activa
- ✅ NO commitear `.env` con valores reales
- ✅ NO commitear `.env.production` con secrets

---

## 📚 Referencias

- [Vercel Docs](https://vercel.com/docs)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Express.js Security](https://expressjs.com/en/advanced/best-practice-security.html)
- [Helmet.js](https://helmetjs.github.io/)
- [express-rate-limit](https://github.com/nfriedly/express-rate-limit)

---

## 💬 Soporte

Si tienes problemas:

1. Revisa los logs en Vercel Dashboard
2. Verifica que todas las variables de entorno estén configuradas
3. Prueba localmente primero
4. Abre un issue en el repositorio

¡Éxito con el deployment! 🎉
