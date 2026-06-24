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

const accesorioResumenSchema = new mongoose.Schema({
  nombre: String,
  accesorio_tipo: String,
  cantidad: Number,
  precio_unitario: Number,
  subtotal: Number,
})

const lineaResumenSchema = new mongoose.Schema({
  nombre: String,
  metros: Number,
  precio_metro: Number,
  subtotal: Number,
})

const cotizacionSchema = new mongoose.Schema({
  mueblista_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Mueblista', required: true },
  mueble_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Furniture', required: true },
  nombre_cliente: { type: String, default: '' },
  email_cliente: { type: String, default: '' },
  estado: { type: String, default: 'Pendiente' },
  fecha_inicio: { type: Date, default: Date.now },
  fecha_termino: Date,
  precio_total: Number,
  lista_cortes: [corteSchema],
  materiales_resumen: [materialResumenSchema],
  imagen_diseno: { type: String, default: null },
  accesorios_resumen: [accesorioResumenSchema],
  tapa_canto_resumen: [lineaResumenSchema],
  cubiertas_resumen: [lineaResumenSchema],
}, { timestamps: true })

module.exports = mongoose.model('Cotizacion', cotizacionSchema)