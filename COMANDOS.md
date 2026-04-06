# 🎬 COMANDOS PARA USAR AHORA

## 🏠 LOCAL - Probar que funciona

```bash
# 1. Ir a backend
cd backend

# 2. Iniciar servidor
npm run dev

# Deberías ver:
# ✅ Servidor corriendo en puerto 5000
# ✅ Sin errores
```

## 🧪 VERIFICAR SEGURIDAD LOCAL

```bash
# En otra terminal, mientras el servidor está corriendo:

# Test 1: Health check
curl http://localhost:5000

# Test 2: Rate limiting (haz 120 solicitudes)
for i in {1..120}; do curl http://localhost:5000/api/furniture; done

# Test 3: CORS headers
curl -i http://localhost:5000/api

# Test 4: JWT validation
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@test.com", "password": "test123"}'
```

## 🚀 VERCEL - 5 Pasos rápidos

### Paso 1: Generar JWT_SECRET
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copia el resultado (algo como):
# a3f2e1d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2
```

### Paso 2: Abrir Vercel Dashboard
```
Abre: https://vercel.com/dashboard
```

### Paso 3: Ir a Settings > Environment Variables
```
Dashboard > [Tu Proyecto] > Settings > Environment Variables
```

### Paso 4: Agregar 5 Variables

| Nombre | Valor | 
|--------|-------|
| `MONGODB_URI` | `mongodb+srv://username:password@cluster.mongodb.net/furniture_db` |
| `JWT_SECRET` | (lo que generaste en paso 1) |
| `CORS_ORIGIN` | `https://tu-proyecto.vercel.app` |
| `NODE_ENV` | `production` |
| `VITE_API_URL` | `https://tu-proyecto.vercel.app/api` |

**Importante**: Reemplaza `tu-proyecto` con el nombre real de tu proyecto

### Paso 5: Deploy
```
Deployments > Redeploy > Wait > ✅ Ready
```

## ✅ VERIFICAR EN VERCEL

```bash
# Test 1: Health check
curl https://tu-proyecto.vercel.app

# Test 2: Ver headers de seguridad
curl -i https://tu-proyecto.vercel.app/api

# Deberías ver:
# strict-transport-security: max-age=31536000
# x-content-type-options: nosniff
# x-frame-options: DENY
```

## 📚 DOCUMENTACIÓN

```bash
# Para entender el fix rápido:
cat QUICK_FIX_SUMMARY.md

# Para entender el fix en detalle:
cat FIX_SANITIZATION_ERROR.md

# Para ir a Vercel (rápido):
cat VERCEL_QUICK_START.md

# Para ir a Vercel (detallado):
cat DEPLOYMENT.md

# Para entender TODO:
cat START_HERE.md
```

## 🔧 TROUBLESHOOTING

```bash
# Si ves error al iniciar servidor local:
cd backend
npm install    # Asegúrate que instaló las dependencias
npm run dev    # Intenta de nuevo

# Si algo no funciona:
git status                    # Ver qué cambió
git log --oneline -5          # Ver últimos commits
node -c backend/server.js     # Verificar sintaxis
```

## 💾 GIT

```bash
# Ver cambios realizados:
git status
git diff

# Ver commits:
git log --oneline -5

# Si quieres deshacer (no recomendado):
git reset --hard HEAD
```

## 🎯 PRÓXIMOS PASOS

1. **Prueba local**: `npm run dev` en backend
2. **Lee documentación**: `VERCEL_QUICK_START.md` (5 min)
3. **Deploy**: Sigue los 5 pasos en Vercel Dashboard
4. **Verifica**: `curl https://tu-proyecto.vercel.app`

---

¡Eso es todo! 🚀
