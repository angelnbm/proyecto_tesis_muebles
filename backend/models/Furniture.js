const mongoose = require('mongoose')

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
  numPuertas: { type: Number, default: null }
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