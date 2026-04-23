require('dotenv').config()
const app = require('./app')
const { connectToDatabase } = require('./config/db')

const PORT = process.env.PORT || 5000

async function startServer() {
  try {
    await connectToDatabase()
    console.log('MongoDB conectado')
  } catch (error) {
    console.error('Error de conexion MongoDB:', error.message)
    process.exit(1)
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en puerto ${PORT}`)
  })
}

startServer()
