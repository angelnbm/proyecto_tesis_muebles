const mongoose = require('mongoose')

const corteSchema = new mongoose.Schema({
  material: String,
  dimension: String,
  cantidad: Number,
})

const materialResumenSchema = new mongoose.Schema({
  material_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Material' },
  nombre: String,
  cantidad_planchas: Number,
  subtotal: Number,
})

const cotizacionSchema = new mongoose.Schema({
  mueblista_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Mueblista', required: true },
  mueble_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Furniture', required: true },
  estado: { type: String, default: 'Pendiente' }, // Pendiente, En Proceso, Completado
  fecha_inicio: { type: Date, default: Date.now },
  fecha_termino: Date,
  precio_total: Number,
  lista_cortes: [corteSchema],
  materiales_resumen: [materialResumenSchema],
}, { timestamps: true })

module.exports = mongoose.model('Cotizacion', cotizacionSchema)