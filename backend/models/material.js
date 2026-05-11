const mongoose = require('mongoose')

const materialSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  categoria: { type: String, required: true, enum: ['material', 'accesorio'] },
  precio: { type: Number, required: true, min: 0 },
  unidad: { type: String, default: 'unidad' },
  // Campos para materiales
  dimensiones: { type: String }, // ej: "250x183cm"
  grosor: { type: Number },
  tipo: { type: String }, // ej: "Melamina"
  color: { type: String },
  // Campos para accesorios
  accesorio_tipo: { type: String }, // visagra | corredera | tirador | otro
  descripcion: { type: String },
}, { timestamps: true })

module.exports = mongoose.model('Material', materialSchema)
