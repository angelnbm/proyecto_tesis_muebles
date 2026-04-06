# ⚠️ MODO TESTING - Instrucciones para volver a SEGURIDAD

## 🚨 Estado actual

**CORS**: ✅ Abierto (acepta `origin: '*'`)  
**Helmet**: ❌ Deshabilitado  
**Rate Limiting**: ❌ Deshabilitado  

Este es un **modo temporal para debugging**. NO es seguro para producción.

---

## 🧪 Qué puedes hacer ahora

- ✅ Testear desde cualquier origen
- ✅ Sin restricciones de CORS
- ✅ Sin límite de solicitudes
- ✅ Más fácil para debuggear problemas

---

## ✅ Cuando esté debugueado, vuelve a SEGURIDAD

### Opción 1: Revertir el commit (más fácil)

```bash
git revert HEAD
# O
git checkout HEAD~1 backend/server.js
```

### Opción 2: Editar manualmente

**En `backend/server.js`, línea ~20**, reemplaza:

```javascript
// ❌ TESTING (actual)
app.use(cors({
  origin: '*',
  credentials: false,
  ...
}))

// ✅ SEGURIDAD (producción)
const corsOptions = {
  origin: function(origin, callback) {
    if (!origin) return callback(null, true)
    
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://proyecto-tesis-muebles.vercel.app',
      'https://proyecto-tesis-muebles-ui-preview.projects.vercel.app',
      process.env.CORS_ORIGIN
    ].filter(Boolean)
    
    if (allowedOrigins.includes(origin) || origin?.endsWith('.vercel.app')) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions))
```

**Vuelve a habilitar Helmet** (línea ~30):

```javascript
// ❌ TESTING (actual)
// app.use(helmet({...}))

// ✅ SEGURIDAD (producción)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", process.env.CORS_ORIGIN || 'http://localhost:5173']
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  frameguard: { action: 'deny' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  noSniff: true,
  xssFilter: true
}))
```

**Vuelve a habilitar Rate Limiting** (línea ~80):

```javascript
// ❌ TESTING (actual)
app.use('/api/auth', authRoutes)
app.use('/api/furniture', furnitureRoutes)

// ✅ SEGURIDAD (producción)
app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/furniture', furnitureLimiter, furnitureRoutes)
```

**Actualiza los logs** (línea ~120):

```javascript
// ❌ TESTING (actual)
console.log(`⚠️  MODO TESTING: CORS abierto, Helmet deshabilitado, Sin rate limiting`)

// ✅ SEGURIDAD (producción)
console.log(`🔒 Seguridad habilitada: CORS, Helmet, Rate Limiting, Sanitización`)
console.log(`🌍 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`)
```

---

## 🎯 Checklist para volver a producción

- [ ] CORS vuelto a whitelist (no `'*'`)
- [ ] Helmet habilitado
- [ ] Rate limiting habilitado
- [ ] authLimiter en `/api/auth`
- [ ] furnitureLimiter en `/api/furniture`
- [ ] Logs actualizados
- [ ] Testeado localmente
- [ ] Commiteado cambios
- [ ] Deploya a Vercel

---

## 🔐 Protecciones que se pierden en TESTING

| Protección | Status | Risk |
|-----------|--------|------|
| **CORS Whitelist** | ❌ Off | 🔴 Alto |
| **Helmet Headers** | ❌ Off | 🔴 Alto |
| **Rate Limiting** | ❌ Off | 🔴 Alto |
| **CSP** | ❌ Off | 🟠 Medio |
| **HSTS** | ❌ Off | 🟠 Medio |

**NO uses este modo en producción**.

---

## ⏰ Recordatorio

```
TODO: Volver a seguridad cuando esté debugueado
Búsqueda en código: app.listen, line ~120
```

---

¡Cuando termines de testear, vuelve a habilitar seguridad! 🔒

