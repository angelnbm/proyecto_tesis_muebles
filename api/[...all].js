const mongoose = require('mongoose')
const app = require('../backend/app')

let isConnected = false

async function ensureDbConnection() {
  if (isConnected) {
    return
  }

  const uri = process.env.MONGODB_URI

  if (!uri) {
    throw new Error('Falta la variable MONGODB_URI')
  }

  await mongoose.connect(uri)
  isConnected = true
}

module.exports = async (req, res) => {
  try {
    await ensureDbConnection()
    return app(req, res)
  } catch (error) {
    console.error('Error inicializando handler serverless:', error.message)
    return res.status(500).json({
      success: false,
      message: 'No se pudo inicializar el backend',
    })
  }
}
