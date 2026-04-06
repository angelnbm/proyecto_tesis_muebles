# 🧪 Testing de Seguridad - Local vs Producción

## 🏠 Testing Local

### 1. Iniciar backend en desarrollo

```bash
cd backend
npm run dev
```

Deberías ver:
```
🚀 Servidor corriendo en puerto 5000
📡 Escuchando en todas las interfaces (0.0.0.0:5000)
🔒 Seguridad habilitada: CORS, Helmet, Rate Limiting, Sanitización
```

### 2. Verificar que rate limiting NO está activo en dev

```bash
for i in {1..20}; do curl http://localhost:5000/api/furniture; done
```

Deberías recibir 20 respuestas (sin rate limiting en desarrollo).

### 3. Verificar headers de seguridad

```bash
curl -i http://localhost:5000/api
```

Deberías VER estos headers:
```
strict-transport-security: max-age=31536000; includeSubDomains
x-content-type-Options: nosniff
x-frame-options: DENY
x-xss-protection: 1; mode=block
content-security-policy: ...
```

### 4. Verificar CORS - Permitido (localhost)

```bash
curl -X OPTIONS http://localhost:5000/api \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

Deberías ver:
```
access-control-allow-origin: http://localhost:5173
```

### 5. Verificar CORS - Bloqueado (origen no permitido)

```bash
curl -X OPTIONS http://localhost:5000/api \
  -H "Origin: https://evil.com" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

Deberías VER que NO hay `access-control-allow-origin` (bloqueado).

### 6. Verificar sanitización

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test123", "data.$where": "malicious"}'
```

La clave `$where` debe ser sanitizada a `data_where` o eliminada.

---

## 🌍 Testing en Vercel (Producción)

### 1. Health Check

```bash
curl https://tu-proyecto.vercel.app
```

Respuesta esperada:
```json
{
  "message": "API de diseño de muebles",
  "environment": "production",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. Verificar que rate limiting SÍ está activo

```bash
for i in {1..120}; do 
  curl https://tu-proyecto.vercel.app/api/furniture \
    -H "Authorization: Bearer test" 2>/dev/null
  echo "Request $i"
done
```

Alrededor de la solicitud 101 deberías ver:
```json
{
  "success": false,
  "message": "Demasiadas solicitudes desde esta IP, intenta más tarde."
}
```

### 3. Verificar headers de seguridad en producción

```bash
curl -i https://tu-proyecto.vercel.app/api
```

Deberías ver:
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self' ...
```

### 4. Verificar JWT validation

```bash
curl https://tu-proyecto.vercel.app/api/furniture \
  -H "Authorization: Bearer invalid"
```

Respuesta esperada:
```json
{
  "success": false,
  "message": "Token inválido"
}
```

### 5. Verificar que CORS es seguro

Desde el frontend en `https://tu-proyecto.vercel.app`, intenta:

```javascript
fetch('https://tu-proyecto.vercel.app/api/furniture')
  .then(r => r.json())
  .catch(e => console.error('CORS Error:', e))
```

Deberías recibir respuesta (o error de autenticación, pero NO error de CORS).

---

## 📊 Métricas de Seguridad

### Local (Desarrollo)
| Métrica | Valor | Nota |
|---------|-------|------|
| Rate Limiting | ❌ DESACTIVO | Para desarrollo sin fricción |
| CORS | ✅ Abierto | Para localhost:5173 |
| Headers de seguridad | ✅ Activos | Siempre presente |
| JWT Validation | ✅ Activo | Siempre presente |
| Sanitización | ✅ Activa | Siempre presente |

### Vercel (Producción)
| Métrica | Valor | Nota |
|---------|-------|------|
| Rate Limiting | ✅ ACTIVO | 100 req/15min global, 5 para auth |
| CORS | ✅ Restringido | Solo `process.env.CORS_ORIGIN` |
| Headers de seguridad | ✅ Activos | HSTS, CSP, X-Frame-Options, etc |
| JWT Validation | ✅ Activo | Verificación de firma y expiración |
| Sanitización | ✅ Activa | Previene NoSQL injection |

---

## 🔍 Checklist de Testing

### Antes de ir a producción:

- [ ] Health check retorna JSON válido
- [ ] CORS funciona desde el frontend
- [ ] JWT validation funciona (rechaza tokens inválidos)
- [ ] Rate limiting está DESACTIVO en dev
- [ ] Headers de seguridad presentes en ambos entornos
- [ ] Sanitización funciona (prueba con `$where`, `$ne`, etc)
- [ ] Body size limit funciona (prueba con >10KB)
- [ ] Error handling no expone stack traces en producción
- [ ] MongoDB está conectado en Atlas
- [ ] JWT_SECRET es diferente en dev y prod
- [ ] CORS_ORIGIN es URL correcta (sin trailing slash)

### En producción:

- [ ] Rate limiting activo (100 req/15min)
- [ ] Auth rate limiting activo (5 intentos/15min)
- [ ] Headers de seguridad en todas las respuestas
- [ ] Logs accesibles en Vercel Dashboard
- [ ] Errores sanitizados (sin stack traces)
- [ ] CORS bloqueando origins incorrectos
- [ ] Certificado SSL válido (HTTPS)

---

## 🆘 Troubleshooting

### Rate limiting disparándose en desarrollo

**Problema**: Ves "Límite de solicitudes alcanzado" en local

**Solución**: 
- Verifica que `NODE_ENV=development` en `.env`
- Rate limiting tiene `skip: (req) => process.env.NODE_ENV !== 'production'`
- Si está activo, es que `NODE_ENV` no está seteado correctamente

### CORS error en producción

**Problema**: "Access to XMLHttpRequest has been blocked by CORS policy"

**Soluciones**:
- Verifica `CORS_ORIGIN=https://tu-proyecto.vercel.app` (exacto, sin trailing slash)
- Verifica que frontend está en `https://tu-proyecto.vercel.app` (no en preview URL)
- Revisa que Header `Origin` es correcto en solicitud del browser

### JWT inválido en producción

**Problema**: Token se ve válido en dev pero no en prod

**Soluciones**:
- Verifica que `JWT_SECRET` es diferente en dev/prod
- JWT_SECRET en dev: usa `dev-secret` en `.env`
- JWT_SECRET en prod: usa generado en Vercel
- Los tokens generados con una secret no funcionan con otra

---

## 📚 Referencias

- **Helmet Security Headers**: https://helmetjs.github.io/
- **Express Rate Limit**: https://github.com/nfriedly/express-rate-limit
- **Express Mongo Sanitize**: https://github.com/express-community/express-mongo-sanitize
- **OWASP Security Testing**: https://owasp.org/www-project-web-security-testing-guide/
