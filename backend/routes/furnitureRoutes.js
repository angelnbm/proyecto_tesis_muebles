const express = require('express')
const router = express.Router()
const Furniture = require('../models/Furniture')
const authMiddleware = require('../middleware/auth')

// Crear nuevo diseño
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { nombre, shapes } = req.body
    
    console.log('Guardando diseño:', { nombre, shapesCount: shapes.length })
    console.log('Shapes recibidos:', JSON.stringify(shapes, null, 2))
    console.log('User ID:', req.userId)
    
    if (!req.userId) {
      return res.status(401).json({ message: 'Usuario no autenticado' })
    }
    
    const furniture = new Furniture({
      userId: req.userId,
      nombre,
      shapes: shapes.map(shape => ({
        id: shape.id,
        type: shape.type,
        x: shape.x,
        y: shape.y,
        width: shape.width,
        height: shape.height,
        depth: shape.depth || 20,
        rotation: shape.rotation || 0,
        numCajones: shape.numCajones !== undefined ? shape.numCajones : null,
        numEstantes: shape.numEstantes !== undefined ? shape.numEstantes : null,
        numDivisores: shape.numDivisores !== undefined ? shape.numDivisores : null,
        numPuertas: shape.numPuertas !== undefined ? shape.numPuertas : null
      }))
    })
    
    await furniture.save()
    console.log('Diseño guardado exitosamente')
    
    res.status(201).json(furniture)
  } catch (error) {
    console.error('Error al guardar:', error)
    res.status(500).json({ message: 'Error al guardar el diseño', error: error.message })
  }
})

// Actualizar diseño existente
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { nombre, shapes } = req.body
    
    console.log('Actualizando diseño:', req.params.id)
    console.log('Shapes recibidos:', JSON.stringify(shapes, null, 2))
    console.log('User ID:', req.userId)
    
    const furniture = await Furniture.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      {
        nombre,
        shapes: shapes.map(shape => ({
          id: shape.id,
          type: shape.type,
          x: shape.x,
          y: shape.y,
          width: shape.width,
          height: shape.height,
          depth: shape.depth || 70,
          rotation: shape.rotation || 0,
          numCajones: shape.numCajones !== undefined ? shape.numCajones : null,
          numEstantes: shape.numEstantes !== undefined ? shape.numEstantes : null,
          numDivisores: shape.numDivisores !== undefined ? shape.numDivisores : null,
          numPuertas: shape.numPuertas !== undefined ? shape.numPuertas : null
        }))
      },
      { new: true }
    )
    
    if (!furniture) {
      return res.status(404).json({ message: 'Diseño no encontrado' })
    }
    
    console.log('Diseño actualizado exitosamente')
    res.json(furniture)
  } catch (error) {
    console.error('Error al actualizar:', error)
    res.status(500).json({ message: 'Error al actualizar el diseño', error: error.message })
  }
})

// Obtener todos los diseños del usuario
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('User ID:', req.userId)
    const designs = await Furniture.find({ userId: req.userId }).sort({ createdAt: -1 })
    console.log('Diseños cargados:', designs.length)
    res.json(designs)
  } catch (error) {
    console.error('Error al cargar diseños:', error)
    res.status(500).json({ message: 'Error al cargar diseños', error: error.message })
  }
})

// Eliminar diseño
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    console.log('User ID:', req.userId)
    const furniture = await Furniture.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    })
    
    if (!furniture) {
      return res.status(404).json({ message: 'Diseño no encontrado' })
    }
    
    console.log('Diseño eliminado:', req.params.id)
    res.json({ message: 'Diseño eliminado correctamente' })
  } catch (error) {
    console.error('Error al eliminar:', error)
    res.status(500).json({ message: 'Error al eliminar el diseño', error: error.message })
  }
})

module.exports = router