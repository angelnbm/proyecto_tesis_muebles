const mongoose = require('mongoose')

const DrawerOverrideSchema = new mongoose.Schema({
  index: { type: Number, required: true },
  drawerTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'DrawerType' },
}, { _id: false })

const ShapeSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  type: { type: String, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  depth: { type: Number, default: 20 },
  rotation: { type: Number, default: 0 },
  numCajones: { type: Number, default: null },
  numEstantes: { type: Number, default: null },
  numDivisores: { type: Number, default: null },
  numPuertas: { type: Number, default: null },
  drawerTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'DrawerType' },
  drawers: { type: [DrawerOverrideSchema], default: undefined },
  tapaCantoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Material' },
}, { _id: false }) 

const FurnitureSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  nombre: {
    type: String,
    required: true
  },
  shapes: [ShapeSchema]
}, {
  timestamps: true
})

module.exports = mongoose.model('Furniture', FurnitureSchema)
