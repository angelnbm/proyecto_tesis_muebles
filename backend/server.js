const mongoose = require('mongoose')
require('dotenv').config()
const app = require('./app')

const PORT = process.env.PORT || 5000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/furniture_db'

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    })

    console.log('MongoDB conectado')
  } catch (error) {
    console.error('Error de conexion MongoDB:', error.message)
    process.exit(1)
  }
}

async function startServer() {
  await connectDB()

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en puerto ${PORT}`)
  })
}

startServer()
