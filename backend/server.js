const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
require('dotenv').config()
const furnitureRoutes = require('./routes/furnitureRoutes.js')
const authRoutes = require('./routes/authRoutes.js')
const { globalLimiter, authLimiter, furnitureLimiter } = require('./middleware/rateLimit.js')
const { sanitizeInputsWrapper } = require('./middleware/validation.js')

const app = express()
const PORT = process.env.PORT || 5000

// ==================== CONFIGURACIÓN DE SEGURIDAD ====================

// 1. Trust Proxy - Necesario para Vercel y obtener IP real
app.set('trust proxy', 1)

// 2. Helmet - Headers de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", process.env.CORS_ORIGIN || 'https://tu-app.vercel.app']
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

// 3. CORS seguro
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 horas
}))

// 4. Body parser con límite de tamaño
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ limit: '10kb', extended: true }))

// 5. Sanitización de inputs
app.use(sanitizeInputsWrapper)

// 6. Rate Limiting Global
app.use(globalLimiter)

// ==================== CONEXIÓN A MONGODB ====================

const MONGODB_URI = process.env.MONGODB_URI
const LOCAL_FALLBACK = 'mongodb://localhost:27017/furniture_db'

async function connectDB(uri = MONGODB_URI, attempt = 1) {
  try {
    console.log(`Intento de conexión ${attempt}...`)
    
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000, 
      socketTimeoutMS: 45000,
    })
    
    console.log(`✅ MongoDB conectado: ${uri.startsWith('mongodb+srv') ? 'Atlas (SRV)' : 'Directo'}`)
    
  } catch (err) {
    console.error(`❌ Error MongoDB (intento ${attempt}):`, err.message)
    
    if (attempt < 3) {
      console.log(`Reintentando en 5 segundos...`)
      await new Promise(resolve => setTimeout(resolve, 5000))
      return connectDB(uri, attempt + 1)
    } else if (uri !== LOCAL_FALLBACK) {
      console.log('No se pudo conectar a Atlas. Intentando MongoDB local...')
      return connectDB(LOCAL_FALLBACK, 1)
    } else {
      console.error('❌ No se pudo conectar a ninguna base de datos. Saliendo...')
      process.exit(1)
    }
  }
}

// Iniciar conexión
connectDB()

// ==================== RUTAS ====================

// Rutas de autenticación con rate limiting específico
app.use('/api/auth', authLimiter, authRoutes)

// Rutas de muebles con rate limiting específico
app.use('/api/furniture', furnitureLimiter, furnitureRoutes)

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'API de diseño de muebles',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  })
})

// ==================== MANEJO DE ERRORES ====================

// 404 - Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.path
  })
})

// Error global handler
app.use((err, req, res, next) => {
  console.error('❌ Error global:', err)
  
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Error interno del servidor' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  })
})

// ==================== INICIAR SERVIDOR ====================

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`)
  console.log(`📡 Escuchando en todas las interfaces (0.0.0.0:${PORT})`)
  console.log(`🔒 Seguridad habilitada: CORS, Helmet, Rate Limiting, Sanitización`)
  console.log(`🌍 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`)
})
