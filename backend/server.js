const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()
const furnitureRoutes = require('./routes/furnitureRoutes.js')
const authRoutes = require('./routes/authRoutes.js')

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

// Conexión a MongoDB con reintentos y mejor configuración
const MONGODB_URI = process.env.MONGODB_URI
const LOCAL_FALLBACK = 'mongodb://localhost:27017/furniture_db'

async function connectDB(uri = MONGODB_URI, attempt = 1) {
  try {
    console.log(`Intento de conexión ${attempt}...`)
    
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000, 
      socketTimeoutMS: 45000,
    })
    
    console.log(`MongoDB conectado: ${uri.startsWith('mongodb+srv') ? 'Atlas (SRV)' : 'Directo'}`)
    
  } catch (err) {
    console.error(`Error MongoDB (intento ${attempt}):`, err.message)
    
    if (attempt < 3) {
      console.log(`Reintentando en 5 segundos...`)
      await new Promise(resolve => setTimeout(resolve, 5000))
      return connectDB(uri, attempt + 1)
    } else if (uri !== LOCAL_FALLBACK) {
      console.log('No se pudo conectar a Atlas. Intentando MongoDB local...')
      return connectDB(LOCAL_FALLBACK, 1)
    } else {
      console.error('No se pudo conectar a ninguna base de datos. Saliendo...')
      process.exit(1)
    }
  }
}

// Iniciar conexión
connectDB()

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/furniture', furnitureRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'API de diseño de muebles' })
})

// Cambiar la llamada a listen para aceptar conexiones externas
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
  console.log(`Escuchando en todas las interfaces (0.0.0.0:${PORT})`)
})