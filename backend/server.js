const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()
const furnitureRoutes = require('./routes/furnitureRoutes.js')
const authRoutes = require('./routes/authRoutes.js')

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => console.error('❌ Error MongoDB:', err))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/furniture', furnitureRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'API de diseño de muebles' })
})

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
})