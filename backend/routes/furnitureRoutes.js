const express = require('express')
const Furniture = require('../models/Furniture.js')
const authenticateToken = require('../middleware/auth.js')

const router = express.Router()

// GET all designs del usuario autenticado
router.get('/', authenticateToken, async (req, res) => {
  try {
    const furniture = await Furniture.find({ mueblista_id: req.user.id }).sort({ createdAt: -1 })
    res.json(furniture)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET one design
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const furniture = await Furniture.findOne({ _id: req.params.id, mueblista_id: req.user.id })
    if (!furniture) return res.status(404).json({ error: 'No encontrado' })
    res.json(furniture)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST new design
router.post('/', authenticateToken, async (req, res) => {
  try {
    const newFurniture = new Furniture({
      ...req.body,
      mueblista_id: req.user.id, // asigna el usuario autenticado
    })
    const saved = await newFurniture.save()
    res.status(201).json(saved)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// PUT update design
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const updated = await Furniture.findOneAndUpdate(
      { _id: req.params.id, mueblista_id: req.user.id },
      req.body,
      { new: true }
    )
    if (!updated) return res.status(404).json({ error: 'No encontrado' })
    res.json(updated)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// DELETE design
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const deleted = await Furniture.findOneAndDelete({ _id: req.params.id, mueblista_id: req.user.id })
    if (!deleted) return res.status(404).json({ error: 'No encontrado' })
    res.json({ message: 'Eliminado' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router