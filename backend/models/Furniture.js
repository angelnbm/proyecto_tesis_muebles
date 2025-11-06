const mongoose = require('mongoose')

const componenteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  dimensiones: { type: String, required: true },
  posicion: String,
  material_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Material' },
})

const shapeSchema = new mongoose.Schema({
  id: Number,
  type: String,
  x: Number,
  y: Number,
  width: Number,
  height: Number,
  depth: Number,
  rotation: { type: Number, default: 0 },
  numCajones: { type: Number, default: 3 }, // NUEVO: número de cajones
})

const furnitureSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    dimensiones_generales: String,
    mueblista_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Mueblista', required: true },
    shapes: [shapeSchema],
    componentes: [componenteSchema],
  },
  { timestamps: true }
)

module.exports = mongoose.model('Furniture', furnitureSchema)