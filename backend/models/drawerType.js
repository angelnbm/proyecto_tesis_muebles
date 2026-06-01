const mongoose = require('mongoose')

const drawerTypeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  nombre: { type: String, required: true },
  laterales: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true },
  frenteInterno: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true },
  trasera: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true },
  fondo: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true },
  refuerzo: { type: mongoose.Schema.Types.ObjectId, ref: 'Material' },
  hasRefuerzo: { type: Boolean, default: false },
  heightDiscountPct: { type: Number, default: 0 },
}, { timestamps: true })

module.exports = mongoose.model('DrawerType', drawerTypeSchema)
