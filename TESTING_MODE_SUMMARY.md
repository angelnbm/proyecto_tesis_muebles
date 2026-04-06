# 🧪 MODO TESTING ACTIVADO

## ✅ Qué pasó

Deshabilitamos CORS, Helmet y Rate Limiting **temporalmente** para que puedas testear sin restricciones.

---

## 🎯 Estado actual

```
✅ CORS:              ABIERTO (acepta '*')
❌ Helmet:            DESHABILITADO
❌ Rate Limiting:     DESHABILITADO
✅ Sanitización:      ACTIVA (todavía funciona)
✅ JWT Validation:    ACTIVA (todavía funciona)
```

---

## 🚀 Ahora puedes

```bash
# Desplegar en Vercel sin problemas de CORS
# Testear desde cualquier origen
# Sin límite de solicitudes
# Más fácil debuggear problemas
```

---

## 📝 Cambios realizados

**Archivo**: `backend/server.js`

```javascript
// CORS - Simple (testing)
app.use(cors({
  origin: '*',
  credentials: false,
}))

// Helmet - Comentado
// app.use(helmet({...}))

// Rate Limiting - Comentado
app.use('/api/auth', authRoutes)  // Sin authLimiter
app.use('/api/furniture', furnitureRoutes)  // Sin furnitureLimiter
```

---

## ⚠️ IMPORTANTE

**Este modo NO es seguro para producción**.

Cuando termines de testear, lee `TESTING_MODE.md` para volver a seguridad.

---

## 📄 Documentación

Lee: `TESTING_MODE.md` para instrucciones de cómo volver a modo seguro

---

## ✨ Próximos pasos

1. **Deploy en Vercel**: El CORS abierto ahora funciona sin restricciones
2. **Testea todo**: Sin problemas de CORS
3. **Cuando funcione**: Lee `TESTING_MODE.md` para volver a seguridad

¡Adelante con los tests! 🚀
