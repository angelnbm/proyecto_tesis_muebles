const mongoose = require('mongoose')

const muebistaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  contrasena: { type: String, required: true },
}, { timestamps: true })

module.exports = mongoose.model('Mueblista', muebistaSchema)