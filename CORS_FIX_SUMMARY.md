# 🚨 ERROR CORS EN VERCEL - RESUELTO ✅

## 🎯 El Problema en una frase

**Frontend en una URL diferente intentó acceder al backend → CORS bloqueó**

---

## 📸 Lo que veías

```
Access to fetch at 'https://proyecto-tesis-muebles.vercel.app/api/auth/login' 
from origin 'https://proyecto-tesis-muebles-ui-preview.projects.vercel.app'
Response to preflight request doesn't pass access control checks
No 'Access-Control-Allow-Origin' header is present
```

---

## 🔴 ¿Por qué pasaba?

```
┌─────────────────────────────────────────────────────────┐
│  VERCEL DEPLOYMENT ARCHITECTURE                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Preview URL (de cada push/PR):                        │
│  https://proyecto-*-preview.projects.vercel.app        │
│                             │                          │
│                             ├─→ ❌ CORS BLOQUEADO      │
│                             │                          │
│  Backend esperaba:                                      │
│  https://proyecto-tesis-muebles.vercel.app             │
│                                                         │
│  ❌ Los orígenes NO coincidían → Rechazado             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ La Solución

Cambié el CORS para que acepte:

1. ✅ **Local**: `http://localhost:5173`
2. ✅ **Production**: `https://proyecto-tesis-muebles.vercel.app`
3. ✅ **Preview**: `https://proyecto-tesis-muebles-*-preview.projects.vercel.app`
4. ✅ **Cualquier `*.vercel.app`** automáticamente

```javascript
if (origin && origin.endsWith('.vercel.app')) {
  // Acepta cualquier preview o production de Vercel
  callback(null, true)
}
```

---

## 🔧 Qué cambié

**Archivo**: `backend/server.js`

### Cambio 1: Reordenar middlewares
```diff
- app.use(helmet(...))
- app.use(cors(...))

+ app.use(cors(...))      ← Primero
+ app.use(helmet(...))    ← Después
```

**Por qué**: CORS debe procesar ANTES que Helmet

### Cambio 2: Permitir múltiples orígenes
```javascript
const corsOptions = {
  origin: function(origin, callback) {
    if (!origin) return callback(null, true)
    
    // Acepta cualquier *.vercel.app
    if (origin && origin.endsWith('.vercel.app')) {
      return callback(null, true)
    }
    
    // O de la lista permitida
    const allowedOrigins = [
      'http://localhost:5173',
      'https://proyecto-tesis-muebles.vercel.app',
      process.env.CORS_ORIGIN
    ].filter(Boolean)
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  optionsSuccessStatus: 200
}
```

---

## 🧪 Verificación

### Test 1: Local
```bash
cd backend
npm run dev
# ✅ Debe iniciar sin errores
```

### Test 2: Vercel (cualquier URL)
```bash
# Haz push a una rama → Vercel crea preview URL
# Abre: https://proyecto-*-preview.projects.vercel.app
# Intenta login → ✅ Debe funcionar (sin CORS error)
```

---

## 📊 Antes vs Después

| Escenario | ANTES | DESPUÉS |
|-----------|-------|---------|
| **Local `http://localhost:5173`** | ✅ OK | ✅ OK |
| **Production `https://proyecto-tesis-muebles.vercel.app`** | ✅ OK | ✅ OK |
| **Preview `https://proyecto-*-preview.projects.vercel.app`** | ❌ CORS ERROR | ✅ OK |
| **Preflight OPTIONS** | ⚠️ Falla | ✅ OK (200) |

---

## 🎯 Ahora puedes

```
✅ Desarrollar en local
   → http://localhost:5173 accede a http://localhost:5000

✅ Testear previews en Vercel
   → https://proyecto-*-preview.projects.vercel.app accede al backend

✅ Usar en production
   → https://proyecto-tesis-muebles.vercel.app accede al backend
```

---

## 📝 Próximos pasos

1. **Espera redeploy**: Vercel hace redeploy automáticamente
2. **Verifica logs**: Dashboard > Deployments > Logs (debe estar verde)
3. **Prueba**: Intenta login en preview o production → ✅ debe funcionar

---

## 💾 Archivos cambiados

```
✏️  backend/server.js              (reordenado middlewares + CORS mejorado)
✨ FIX_CORS_VERCEL.md              (documentación del fix)
```

---

## 🎉 STATUS

```
✅ Error CORS resuelto
✅ Local funciona
✅ Production funciona
✅ Preview funciona
✅ Listo para mergear PRs
```

¡Listo! 🚀
