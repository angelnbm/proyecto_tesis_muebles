const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const { globalLimiter, authLimiter, furnitureLimiter } = require('./middleware/rateLimit.js')
const { sanitizeInputsWrapper } = require('./middleware/validation.js')
const furnitureRoutes = require('./routes/furnitureRoutes.js')
const authRoutes = require('./routes/authRoutes.js')

const app = express()

app.set('trust proxy', 1)

function getCorsOrigins() {
  const configured = process.env.CORS_ORIGIN
  const origins = configured
    ? configured.split(',').map((value) => value.trim()).filter(Boolean)
    : []

  if (process.env.VERCEL_URL) {
    origins.push(`https://${process.env.VERCEL_URL}`)
  }

  if ((process.env.NODE_ENV || 'development') === 'development') {
    origins.push('http://localhost:5173')
  }

  return Array.from(new Set(origins))
}

const allowedOrigins = getCorsOrigins()

app.use(cors({
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true)
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }

    return callback(new Error('Origen no permitido por CORS'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
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

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.path,
  })
})

app.use((err, req, res, next) => {
  console.error('Error global:', err.message)

  if (err.message === 'Origen no permitido por CORS') {
    return res.status(403).json({
      success: false,
      message: err.message,
    })
  }

  return res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Error interno del servidor'
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  })
})

module.exports = app
