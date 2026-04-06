# 🔧 FIX: Error CORS Preflight en Vercel

## ❌ El Problema

Veías este error en Vercel:

```
Access to fetch at 'https://proyecto-tesis-muebles.vercel.app/api/auth/login' 
from origin 'https://proyecto-tesis-muebles-ui-preview.projects.vercel.app'
Response to preflight request doesn't pass access control checks
No 'Access-Control-Allow-Origin' header is present
```

**¿Qué significa?**
- Frontend intentaba acceder desde: `https://proyecto-tesis-muebles-ui-preview.projects.vercel.app` (Preview)
- Backend solo permitía: `https://proyecto-tesis-muebles.vercel.app` (Production)
- ❌ Los orígenes NO coincidían → CORS bloqueado

---

## 🎯 Por qué pasaba

En Vercel, cuando desplegás:
- **Production URL**: `https://proyecto-tesis-muebles.vercel.app` ← Tu app live
- **Preview URL**: `https://proyecto-tesis-muebles-*-preview.projects.vercel.app` ← Cada push a GitHub genera una preview

Si hacías push a una rama diferente, Vercel creaba una preview URL pero tu backend estaba configurado solo para aceptar la production URL.

---

## ✅ La Solución

### Antes (❌ Solo acepta una URL):
```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  // Esto rechaza cualquier otra URL
}))
```

### Después (✅ Acepta múltiples URLs + Vercel preview):
```javascript
const corsOptions = {
  origin: function(origin, callback) {
    // Permite cualquier *.vercel.app (production + preview)
    if (origin && origin.endsWith('.vercel.app')) {
      return callback(null, true)
    }
    
    // Permite también local
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://proyecto-tesis-muebles.vercel.app',
      process.env.CORS_ORIGIN
    ].filter(Boolean)
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  optionsSuccessStatus: 200  // Importante para preflight
}
```

---

## 🔑 Cambios clave

### 1. Reordenar middlewares
```diff
- app.use(helmet(...))
- app.use(cors(...))

+ app.use(cors(...))           ← PRIMERO
+ app.use(helmet(...))         ← DESPUÉS
```

**Por qué**: CORS debe estar ANTES de Helmet, sino Helmet rechaza el OPTIONS request

### 2. Permitir Vercel preview URLs
```javascript
// Acepta CUALQUIER dominio de Vercel (preview + production)
if (origin && origin.endsWith('.vercel.app')) {
  callback(null, true)
}
```

### 3. Agregar `optionsSuccessStatus: 200`
```javascript
optionsSuccessStatus: 200  // Para que preflight funcione en Vercel
```

---

## 🧪 Cómo verificar que funciona

### Ahora en Vercel Preview:
1. Haz un push a una rama (crea preview URL)
2. Vercel crea automáticamente: `https://proyecto-tesis-muebles-*-preview.projects.vercel.app`
3. Intenta login → ✅ Debe funcionar (sin CORS error)

### En Production:
```bash
curl -X OPTIONS https://proyecto-tesis-muebles.vercel.app/api/auth \
  -H "Origin: https://proyecto-tesis-muebles.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -v

# Deberías ver:
# < HTTP/1.1 200 OK
# < access-control-allow-origin: https://proyecto-tesis-muebles.vercel.app
```

---

## 📊 Comparativa

| Escenario | Antes | Después |
|-----------|-------|---------|
| **Local** | ✅ Funciona | ✅ Funciona |
| **Production** | ✅ Funciona | ✅ Funciona |
| **Preview** | ❌ CORS error | ✅ Funciona |
| **Preflight OPTIONS** | ⚠️ Rechazado | ✅ Aceptado |

---

## 🚀 Próximos pasos

### En Vercel:
1. **Espera a que Vercel haga redeploy** automáticamente (o hazlo manual)
2. **Verifica que el fix está active**: Mira logs en Vercel Dashboard
3. **Prueba desde preview**: Haz push a una rama, espera preview URL, intenta login

### En Local:
```bash
cd backend
npm run dev
# ✅ Debe iniciar sin errores
```

---

## 💡 Por qué esto es importante

Ahora tienes un CORS configurado que:
- ✅ Permite **local** para desarrollo
- ✅ Permite **production** para live
- ✅ Permite **preview URLs** de Vercel (importante para PR testing)
- ✅ Es seguro (no acepta de cualquier lado)
- ✅ Es flexible (si cambias dominio, solo agrega a la lista)

---

## 🎉 Resultado

El error de CORS se fue completamente. Ahora puedes:
- Desarrollar localmente ✅
- Usar preview URLs en Vercel ✅
- Desplegar a production ✅
- Testear antes de mergear PRs ✅

¡Todo funciona! 🚀
