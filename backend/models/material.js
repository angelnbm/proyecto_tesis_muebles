const mongoose = require('mongoose')

const materialSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  precio: { type: Number, required: true },
  dimensiones: { type: String, required: true }, // ej: "244x122cm"
  grosor: { type: Number, required: true },
  tipo: { type: String, required: true }, // ej: "MDF"
}, { timestamps: true })

module.exports = mongoose.model('Material', materialSchema)