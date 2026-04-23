const app = require('../backend/app')
const { connectToDatabase } = require('../backend/config/db')

module.exports = async (req, res) => {
  try {
    await connectToDatabase()
    return app(req, res)
  } catch (error) {
    console.error('Error inicializando handler serverless:', error)
    return res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production'
        ? 'Error interno del servidor'
        : (error && error.message) || 'No se pudo inicializar el backend',
      error: 'SERVER_INITIALIZATION_ERROR',
    })
  }
}
