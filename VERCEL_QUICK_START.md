# 🎯 GUÍA RÁPIDA - Configurar Vercel en 5 minutos

## ⚡ Pasos rápidos

### 1️⃣ Generar JWT_SECRET

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copia el resultado (algo como: `a3f2e1d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2`)

---

### 2️⃣ Ir a Vercel Dashboard

1. Abre https://vercel.com/dashboard
2. Selecciona tu proyecto
3. Haz clic en "Settings" (arriba a la derecha)

---

### 3️⃣ Agregar Environment Variables

Haz clic en **"Environment Variables"** (lado izquierdo)

Agrega estas 5 variables:

```
┌─────────────────────────────────────────────────────────────────┐
│ NAME                │ VALUE                                     │
├─────────────────────┼───────────────────────────────────────────┤
│ MONGODB_URI         │ mongodb+srv://user:pass@cluster...        │
│ JWT_SECRET          │ (el que generaste en paso 1)              │
│ CORS_ORIGIN         │ https://tu-proyecto.vercel.app            │
│ NODE_ENV            │ production                                │
│ VITE_API_URL        │ https://tu-proyecto.vercel.app/api        │
└─────────────────────┴───────────────────────────────────────────┘
```

**Importante**: 
- Para cada variable, selecciona **Scope: Production**
- Reemplaza `tu-proyecto` con el nombre real

---

### 4️⃣ Verificar Build Settings

Haz clic en **"Build & Development Settings"** (lado izquierdo)

Verifica que esté así:

```
Build Command:    cd backend && npm install && cd ../frontend && npm install && npm run build
Output Directory: frontend/dist
Framework:        Vite
```

Si no está así, ajusta manualmente.

---

### 5️⃣ Deploy

Haz clic en **"Deployments"** (arriba)

Selecciona el deployment más reciente y haz clic en **"Redeploy"**

Espera a que diga "Ready" (2-5 minutos)

---

## ✅ Verificar que funciona

### Test 1: Health Check

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

### Test 2: CORS y JWT

Intenta login desde el frontend. Deberías ver:
- ✅ La solicitud POST a `/api/auth/login` se completa
- ✅ Sin errores de CORS
- ✅ Recibes un JWT token

### Test 3: Rate Limiting

Haz 10+ solicitudes rápido:

```bash
for i in {1..10}; do 
  curl https://tu-proyecto.vercel.app/api/furniture \
    -H "Authorization: Bearer fake-token"
done
```

En las solicitudes 6-10 deberías ver:
```json
{
  "success": false,
  "message": "Límite de solicitudes alcanzado. Intenta más tarde."
}
```

---

## 🆘 Si algo no funciona

| Problema | Solución |
|----------|----------|
| "Error de conexión a MongoDB" | Verifica `MONGODB_URI` es correcto. En MongoDB Atlas, agrega IP `0.0.0.0/0` en Network Access |
| "CORS error en frontend" | Asegúrate que `CORS_ORIGIN` sea exactamente `https://tu-proyecto.vercel.app` (sin trailing slash) |
| "Token inválido" | Verifica que `JWT_SECRET` sea el mismo en dev y producción. Los tokens expiran después de 1 hora |
| "Build falla" | Revisa logs en Vercel: Dashboard > Deployments > [proyecto] > Logs |
| "Rate limit" | Es normal. Espera 15 minutos o usa otra IP (VPN) |

---

## 📚 Referencias

- **Vercel Dashboard**: https://vercel.com/dashboard
- **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas
- **Docs Completa**: Ver `DEPLOYMENT.md` en el repo

---

## 🎉 ¡Listo!

Si todo se ve verde en Vercel, ¡tu app está en producción con seguridad enterprise-grade!

**Características activas**:
- ✅ CORS whitelist
- ✅ Helmet security headers (HSTS, CSP, etc)
- ✅ Rate limiting (100 req/15min global, 5 para auth)
- ✅ NoSQL injection prevention
- ✅ JWT validation
- ✅ Input sanitization
- ✅ Body size limits
