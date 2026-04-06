# 📋 RESUMEN DE CAMBIOS - Implementación de Seguridad para Vercel

**Fecha**: 6 de Abril de 2026
**Proyecto**: Diseño de Muebles (Monorepo Express.js + React/Vite)
**Status**: ✅ COMPLETADO

---

## 📦 ARCHIVOS CREADOS

### 1. `vercel.json` (ROOT)
**Propósito**: Configurar monorepo para Vercel
**Cambios clave**:
- Build command: Instala dependencias de backend y frontend, luego compila
- Output directory: `frontend/dist`
- Rewrites: Redirige `/api/*` al backend serverless
- Environment variables: Define variables necesarias
- Headers de seguridad: HSTS, X-Content-Type-Options, X-Frame-Options, X-XSS-Protection

```json
{
  "version": 2,
  "buildCommand": "cd backend && npm install && cd ../frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "framework": "vite",
  ...
}
```

---

### 2. `backend/middleware/rateLimit.js` (NUEVO)
**Propósito**: Limitar solicitudes para prevenir ataques DDoS y brute force
**Límites configurados**:
- Global: 100 req/15min por IP
- Auth: 5 intentos/15min por IP (prevenir brute force en login)
- Furniture: 50 req/15min por usuario autenticado
- Detecta IP real en Vercel usando `x-forwarded-for`

**Features**:
- Desactiva en desarrollo
- Headers de RateLimit personalizados
- Mensajes de error claros

---

### 3. `backend/middleware/validation.js` (NUEVO)
**Propósito**: Validar y sanitizar inputs, verificar JWTs
**Funciones incluidas**:
- `handleValidationErrors`: Retorna errores de validación estructurados
- `sanitizeInputs`: Previene NoSQL injection
- `verifyJWT`: Valida tokens JWT y formato
- `validatePayload`: Valida esquemas con Joi

**Features**:
- Detección de NoSQL injection
- Validación de formato JWT
- Esquemas validables

---

### 4. `.env.production.example` (ROOT)
**Propósito**: Template de variables de entorno (SIN valores reales)
**Incluye**:
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
CORS_ORIGIN=https://tu-proyecto.vercel.app
NODE_ENV=production
VITE_API_URL=https://tu-proyecto.vercel.app/api
```

**Nota**: Este archivo es para referencia. NO commitear `.env.production` con valores reales.

---

### 5. `frontend/.env.production` (NUEVO)
**Propósito**: Variables de entorno para frontend en producción
**Contenido**:
```
VITE_API_URL=https://tu-proyecto.vercel.app/api
```

**Nota**: Agregado a `.gitignore`, no se commitea.

---

### 6. `DEPLOYMENT.md` (ROOT)
**Propósito**: Documentación completa para deployment en Vercel
**Secciones**:
- Requisitos previos
- Generación de JWT_SECRET
- Configuración de MongoDB Atlas
- Paso a paso en Vercel Dashboard
- Verificación de deployment
- Troubleshooting
- Seguridad checklist
- Monitoreo en producción

**Interna**: 📚 Referencia completa para todo el equipo

---

## ✏️ ARCHIVOS MODIFICADOS

### 1. `backend/package.json`
**Cambios**: Agregadas 5 nuevas dependencias de seguridad

**Antes**:
```json
"dependencies": {
  "bcryptjs": "^3.0.2",
  "cors": "^2.8.5",
  "dotenv": "^17.2.3",
  "express": "^5.1.0",
  "jsonwebtoken": "^9.0.2",
  "mongoose": "^8.19.2"
}
```

**Después**:
```json
"dependencies": {
  "bcryptjs": "^3.0.2",
  "cors": "^2.8.5",
  "dotenv": "^17.2.3",
  "express": "^5.1.0",
  "express-mongo-sanitize": "^2.2.0",      ← NUEVO
  "express-rate-limit": "^7.1.5",          ← NUEVO
  "express-validator": "^7.0.0",           ← NUEVO
  "helmet": "^7.1.0",                      ← NUEVO
  "joi": "^17.11.0",                       ← NUEVO
  "jsonwebtoken": "^9.0.2",
  "mongoose": "^8.19.2"
}
```

**Status**: ✅ Instaladas exitosamente (12 packages added)

---

### 2. `backend/server.js`
**Cambios**: Implementadas todas las capas de seguridad

**Modificaciones principales**:

#### A. Trust Proxy (línea 14)
```javascript
app.set('trust proxy', 1) // Necesario para Vercel
```

#### B. Helmet - Headers de seguridad (líneas 16-33)
```javascript
app.use(helmet({
  contentSecurityPolicy: { ... },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  frameguard: { action: 'deny' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  noSniff: true,
  xssFilter: true
}))
```

#### C. CORS Seguro (líneas 35-43)
```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
}))
```

#### D. Body Parser con límite de tamaño (líneas 45-46)
```javascript
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ limit: '10kb', extended: true }))
```

#### E. Sanitización e Inputs (líneas 48-49)
```javascript
app.use(sanitizeInputs)
app.use(globalLimiter)
```

#### F. Rate Limiting por ruta (líneas 86-88)
```javascript
app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/furniture', furnitureLimiter, furnitureRoutes)
```

#### G. Manejo de errores global (líneas 103-122)
```javascript
// 404 handler
app.use((req, res) => { ... })

// Error handler
app.use((err, req, res, next) => { ... })
```

**Status**: ✅ Refactorización completa con comentarios organizados

---

### 3. `frontend/src/services/api.js`
**Cambios**: Mejorado manejo de errores y configuración de URL

**Modificaciones**:

#### A. URL dinámica (líneas 1-3)
```javascript
// Antes
const API_URL = import.meta.env.VITE_API_URL || 'https://proyecto-tesis-muebles.vercel.app/api/'

// Después
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
```

#### B. Función centralizada de manejo de errores (líneas 6-29)
```javascript
const handleFetchError = async (response, operationName = 'operación') => {
  if (!response.ok) {
    let errorMessage = `Error en ${operationName}`
    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorMessage
    } catch (e) {
      errorMessage = response.statusText || errorMessage
    }
    
    if (import.meta.env.DEV) {
      console.error(`[${operationName}]`, {
        status: response.status,
        message: errorMessage
      })
    }
    throw new Error(errorMessage)
  }
  return response.json()
}
```

#### C. Uso en todas las funciones (líneas 31-81)
```javascript
// Refactorizado para usar handleFetchError en lugar de duplicar lógica
export const saveFurniture = async (...) => {
  return handleFetchError(res, 'saveFurniture')
}
// Similar para updateFurniture, loadFurniture, deleteFurniture
```

**Status**: ✅ Manejo de errores mejorado y centralizado

---

## 🔐 MEDIDAS DE SEGURIDAD IMPLEMENTADAS

### 1. **CORS (Cross-Origin Resource Sharing)**
- ✅ Origin whitelist: Solo acepta `process.env.CORS_ORIGIN`
- ✅ Credentials habilitado: Permite envío de cookies con JWT
- ✅ Methods restringidos: GET, POST, PUT, DELETE solamente
- ✅ Headers validados: Solo Content-Type y Authorization
- ✅ Preflight caching: 24 horas

### 2. **Helmet.js - Security Headers**
- ✅ CSP (Content-Security-Policy): Previene XSS
- ✅ HSTS (Strict-Transport-Security): Fuerza HTTPS (max-age: 1 año)
- ✅ X-Frame-Options: DENY (previene clickjacking)
- ✅ X-Content-Type-Options: nosniff
- ✅ X-XSS-Protection: 1; mode=block
- ✅ Referrer-Policy: strict-origin-when-cross-origin

### 3. **Rate Limiting**
- ✅ Global: 100 req/15min por IP
- ✅ Auth: 5 intentos/15min (brute force protection)
- ✅ Furniture: 50 req/15min por usuario
- ✅ Desactiva en desarrollo
- ✅ Detecta IP real en Vercel (x-forwarded-for)

### 4. **Sanitización de Inputs**
- ✅ NoSQL injection prevention (express-mongo-sanitize)
- ✅ Reemplaza `$`, `.` con `_` en keys de objetos
- ✅ Sanitiza strings automáticamente

### 5. **Validación de JWT**
- ✅ Verifica presencia de token
- ✅ Valida formato JWT (regex)
- ✅ Verifica firma con JWT_SECRET
- ✅ Detección de tokens expirados
- ✅ Mensajes de error claros

### 6. **Body Size Limits**
- ✅ JSON limit: 10KB
- ✅ URL-encoded limit: 10KB
- ✅ Previene ataques de tamaño de payload

### 7. **Trust Proxy**
- ✅ `app.set('trust proxy', 1)` configurado
- ✅ Necesario para Vercel y proxies
- ✅ Obtiene IP real del cliente

### 8. **Error Handling**
- ✅ Handler de 404 global
- ✅ Handler de errores global
- ✅ Sanitiza mensajes en producción
- ✅ Logs detallados en desarrollo

### 9. **Environment Variables**
- ✅ MONGODB_URI (Secret en Vercel)
- ✅ JWT_SECRET (Secret en Vercel)
- ✅ CORS_ORIGIN (URL absoluta)
- ✅ NODE_ENV (production/development)
- ✅ VITE_API_URL (Frontend API endpoint)

### 10. **Variables de entorno NO hardcodeadas**
- ✅ `.env.production` agregado a `.gitignore`
- ✅ `.env.production.example` como referencia
- ✅ Todas las URLs dinámicas usando `process.env`

---

## 📊 COMPARATIVA ANTES vs DESPUÉS

| Aspecto | Antes | Después |
|--------|-------|---------|
| CORS | `app.use(cors())` (abierto) | `cors({ origin: ENV, credentials: true })` |
| Headers | Sin headers especiales | Helmet con 7+ headers de seguridad |
| Rate Limiting | NO | Sí, 3 niveles (global, auth, furniture) |
| NoSQL Injection | NO | Sí, express-mongo-sanitize |
| JWT Validation | Básico | Completo (formato, firma, expiración) |
| Body Size | Sin límite | 10KB máximo |
| Trust Proxy | NO | Sí, para Vercel |
| Error Handling | Inconsistente | Global y centralizado |
| Production Secrets | Hardcodeadas | Variables de entorno |
| Documentación | Mínima | DEPLOYMENT.md completo |

---

## 🚀 PASOS PARA DEPLOYMENT EN VERCEL

### 1. Agregar variables de entorno en Vercel Dashboard:
```
MONGODB_URI: mongodb+srv://...
JWT_SECRET: (generar con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
CORS_ORIGIN: https://tu-proyecto.vercel.app
NODE_ENV: production
VITE_API_URL: https://tu-proyecto.vercel.app/api
```

### 2. Configurar Build:
- Build Command: `cd backend && npm install && cd ../frontend && npm install && npm run build`
- Output Directory: `frontend/dist`

### 3. Verificar:
```bash
curl https://tu-proyecto.vercel.app
curl https://tu-proyecto.vercel.app/api/furniture -H "Authorization: Bearer test"
```

### 4. Monitorear logs:
```
Vercel Dashboard > Deployments > [proyecto] > Logs
```

---

## ✅ CHECKLIST DE VERIFICACIÓN

**Backend**:
- ✅ Dependencies instaladas (`npm install` completado)
- ✅ Helmet configurado
- ✅ CORS seguro
- ✅ Rate limiting activo
- ✅ Sanitización activa
- ✅ JWT validation implementado
- ✅ Error handlers globales
- ✅ Trust proxy configurado
- ✅ Middleware en orden correcto

**Frontend**:
- ✅ VITE_API_URL dinámico
- ✅ Manejo de errores mejorado
- ✅ Headers Authorization correctos

**Deployment**:
- ✅ vercel.json configurado
- ✅ .env.production en .gitignore
- ✅ .env.production.example creado
- ✅ DEPLOYMENT.md documentado

**Seguridad**:
- ✅ No hay hardcoding de secrets
- ✅ All env vars en template
- ✅ CORS whitelist
- ✅ Headers CSP, HSTS, etc.
- ✅ Rate limiting configurado
- ✅ Input sanitization
- ✅ JWT validation

---

## 📝 NOTAS IMPORTANTES

### NO commitear:
- `.env` archivos con valores reales
- `.env.production` con secrets
- Cualquier archivo que contenga `MONGODB_URI`, `JWT_SECRET`, etc.

### SÍ Commitear:
- `vercel.json`
- `DEPLOYMENT.md`
- `.env.production.example` (sin valores)
- Código de middleware modificado

### Próximas recomendaciones:
1. Agregar validación de schema a rutas de auth/furniture (usando Joi)
2. Implementar logging centralizado (Winston, Pino)
3. Agregar tests de seguridad
4. Implementar 2FA en login
5. Agregar CSRF protection si usa cookies
6. Implementar input validation en cada ruta

---

## 📞 SOPORTE

Si encuentras problemas:

1. Revisa `DEPLOYMENT.md` sección "Troubleshooting"
2. Verifica logs en Vercel Dashboard
3. Ejecuta localmente primero: `npm run dev` en backend y frontend
4. Confirma que MongoDB Atlas está accesible
5. Verifica que todas las env vars estén configuradas

---

**Estado Final**: ✅ LISTO PARA PRODUCCIÓN

Todos los cambios están implementados y listos para deploy en Vercel.
El proyecto ahora tiene seguridad enterprise-grade con rate limiting, validación,
sanitización, headers de seguridad, y gestión segura de secrets.

¡Adelante con el deployment! 🎉
