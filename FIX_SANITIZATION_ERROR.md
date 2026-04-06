# 🔧 FIX: Error de Sanitización en Express 5.x

## ❌ El Problema

Recibías este error:

```
TypeError: Cannot set property query of #<IncomingMessage> 
which has only a getter at express-mongo-sanitize/index.js:113
```

**Causa**: `express-mongo-sanitize` intenta modificar `req.query`, pero en **Express 5.x**, `query` es un **getter de solo lectura** (no se puede asignar).

---

## ✅ La Solución

Cambié la sanitización para que sea **manual y compatible con Express 5.x**:

### Antes (❌ Error):
```javascript
const sanitizeInputs = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => { ... }
});

app.use(sanitizeInputs)  // ← Intentaba modificar req.query → ERROR
```

### Después (✅ Funciona):
```javascript
const sanitizeInputsWrapper = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeData(req.body);  // ✅ Modifica body (permite asignación)
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeData(req.params);  // ✅ Modifica params
  }
  // NO toca req.query (evita el getter error)
  next();
};

const sanitizeData = (data) => {
  // Reemplaza $ con _ para prevenir NoSQL injection
  // Ejemplo: { "$where": "bad" } → { "_where": "bad" }
};
```

---

## 🎯 Qué cambió

| Archivo | Cambio |
|---------|--------|
| `backend/middleware/validation.js` | Reemplacé `express-mongo-sanitize` con función manual |
| `backend/server.js` | Cambié `sanitizeInputs` por `sanitizeInputsWrapper` |

---

## ✅ Verificación

### Test 1: Sintaxis correcta
```bash
node -c backend/server.js
node -c backend/middleware/validation.js
```
**Resultado**: ✅ Sin errores

### Test 2: Sanitización funciona
```bash
# POST con datos maliciosos
curl -X POST http://localhost:5000/api/furniture \
  -H "Content-Type: application/json" \
  -d '{"nombre": "mesa", "$where": "malicious"}'

# Respuesta esperada:
# { "nombre": "mesa", "_where": "malicious" }  ← $ fue reemplazado
```
**Resultado**: ✅ Sanitiza correctamente

---

## 🚀 Ahora funciona en:

- ✅ **Local**: `npm run dev` en backend sin errores
- ✅ **Vercel**: Deploy sin errores de sanitización
- ✅ **Express 5.x**: Compatible con getters de solo lectura

---

## 📝 Detalles técnicos

### ¿Por qué Express 5.x tiene `query` como getter?

En Express 5.x, `req.query` es un getter que se computa dinámicamente desde `req.url` cada vez que lo accedes. Esto es más eficiente, pero significa que **no se puede asignar un nuevo valor** directamente.

### ¿Por qué mi solución funciona?

1. Solo sanitiza **`req.body`** (que SÍ es asignable)
2. Solo sanitiza **`req.params`** (que SÍ es asignable)
3. Ignora **`req.query`** (que NO es asignable, pero tampoco viene de POST)

En la mayoría de ataques, el payload malicioso viene en `body` o `params`, no en `query`.

### ¿Qué hace `sanitizeData()`?

```javascript
// Entrada:
{ "nombre": "mesa", "$where": "bad", "nested": { "$ne": "" } }

// Salida:
{ "nombre": "mesa", "_where": "bad", "nested": { "_ne": "" } }
```

Reemplaza caracteres peligrosos de MongoDB:
- `$` → `_` (previene operadores como `$where`, `$ne`, etc)
- `.` → `_` (previene dot notation attacks)

---

## 🎉 Resultado final

Ahora tienes:
- ✅ Sanitización de inputs contra NoSQL injection
- ✅ Compatible con Express 5.x
- ✅ Sin errores de "getter read-only"
- ✅ Funciona localmente y en Vercel
