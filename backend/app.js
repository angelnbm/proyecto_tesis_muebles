const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const { globalLimiter, authLimiter, furnitureLimiter } = require('./middleware/rateLimit.js')
const { sanitizeInputsWrapper } = require('./middleware/validation.js')
const furnitureRoutes = require('./routes/furnitureRoutes.js')
const authRoutes = require('./routes/authRoutes.js')
const materialRoutes = require('./routes/materialRoutes.js')

const app = express()

app.set('trust proxy', 1)

function getCorsOrigins() {
  const configured = process.env.CORS_ORIGIN
  const origins = configured
    ? configured.split(',')
      .map((value) => normalizeOrigin(value))
      .filter(Boolean)
    : []

  if (process.env.VERCEL_URL) {
    origins.push(normalizeOrigin(`https://${process.env.VERCEL_URL}`))
  }

  if ((process.env.NODE_ENV || 'development') === 'development') {
    origins.push(normalizeOrigin('http://localhost:5173'))
  }

  return Array.from(new Set(origins.filter(Boolean)))
}

function normalizeOrigin(value) {
  if (!value || typeof value !== 'string') {
    return ''
  }

  const trimmed = value.trim().replace(/\/+$/, '')

  if (!trimmed) {
    return ''
  }

  try {
    return new URL(trimmed).origin
  } catch {
    return trimmed
  }
}

function getRequestOrigin(req) {
  const host = req.headers.host

  if (!host) {
    return ''
  }

  const forwardedProto = req.headers['x-forwarded-proto']
  const proto = Array.isArray(forwardedProto)
    ? forwardedProto[0]
    : (forwardedProto || req.protocol || 'https')

  return normalizeOrigin(`${proto}://${host}`)
}

const allowedOrigins = getCorsOrigins()

app.use(cors((req, callback) => {
  const requestOrigin = getRequestOrigin(req)
  const dynamicAllowedOrigins = new Set(allowedOrigins)

  if (requestOrigin) {
    dynamicAllowedOrigins.add(requestOrigin)
  }

  callback(null, {
    origin(origin, originCallback) {
      if (!origin) {
        return originCallback(null, true)
      }

      const normalizedOrigin = normalizeOrigin(origin)

      if (normalizedOrigin && dynamicAllowedOrigins.has(normalizedOrigin)) {
        return originCallback(null, true)
      }

      return originCallback(new Error('Origen no permitido por CORS'))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
}))

app.use(helmet())
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ limit: '10kb', extended: true }))
app.use(sanitizeInputsWrapper)
app.use(globalLimiter)

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API operativa',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  })
})

app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/furniture', furnitureLimiter, furnitureRoutes)
app.use('/api/materials', materialRoutes)

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.path,
  })
})

app.use((err, req, res, next) => {
  console.error('Error global:', err)

  if (res.headersSent) {
    return next(err)
  }

  if (err.message === 'Origen no permitido por CORS') {
    return res.status(403).json({
      success: false,
      message: err.message,
      error: 'CORS_FORBIDDEN',
    })
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'JSON invalido en el body de la solicitud',
      error: 'INVALID_JSON_BODY',
    })
  }

  return res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Error interno del servidor'
      : err.message,
    error: err.code || 'INTERNAL_SERVER_ERROR',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  })
})

module.exports = app
