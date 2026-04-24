const express = require('express')
const router = express.Router()
const Furniture = require('../models/Furniture')
const authMiddleware = require('../middleware/auth')

function sendError(res, status, message, error, details) {
  return res.status(status).json({
    success: false,
    message,
    error,
    ...(details ? { details } : {}),
  })
}

function normalizeShapes(shapes) {
  return shapes.map((shape) => ({
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
    numPuertas: shape.numPuertas !== undefined ? shape.numPuertas : null,
  }))
}

function validateFurniturePayload(body) {
  const { nombre, shapes } = body || {}

  if (!nombre || typeof nombre !== 'string' || !nombre.trim()) {
    return 'El campo nombre es obligatorio'
  }

  if (!Array.isArray(shapes) || shapes.length === 0) {
    return 'El campo shapes debe ser un arreglo no vacio'
  }

  return null
}

// Crear nuevo diseño
router.post('/', authMiddleware, async (req, res) => {
  try {
    const validationError = validateFurniturePayload(req.body)
    if (validationError) {
      return sendError(res, 400, validationError, 'INVALID_FURNITURE_PAYLOAD')
    }

    const { nombre, shapes } = req.body

    if (!req.userId) {
      return sendError(res, 401, 'Usuario no autenticado', 'UNAUTHENTICATED_USER')
    }

    const furniture = new Furniture({
      userId: req.userId,
      nombre: nombre.trim(),
      shapes: normalizeShapes(shapes),
    })

    await furniture.save()

    return res.status(201).json({
      success: true,
      data: furniture,
    })
  } catch (error) {
    console.error('Error al guardar:', error)
    return sendError(res, 500, 'Error al guardar el diseño', 'FURNITURE_SAVE_ERROR', error.message)
  }
})

// Actualizar diseño existente
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const validationError = validateFurniturePayload(req.body)
    if (validationError) {
      return sendError(res, 400, validationError, 'INVALID_FURNITURE_PAYLOAD')
    }

    const { nombre, shapes } = req.body

    const furniture = await Furniture.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      {
        nombre: nombre.trim(),
        shapes: normalizeShapes(shapes),
      },
      { new: true }
    )

    if (!furniture) {
      return sendError(res, 404, 'Diseno no encontrado', 'FURNITURE_NOT_FOUND')
    }

    return res.json({
      success: true,
      data: furniture,
    })
  } catch (error) {
    console.error('Error al actualizar:', error)
    return sendError(res, 500, 'Error al actualizar el diseno', 'FURNITURE_UPDATE_ERROR', error.message)
  }
})

// Obtener todos los diseños del usuario
router.get('/', authMiddleware, async (req, res) => {
  try {
    const designs = await Furniture.find({ userId: req.userId }).sort({ createdAt: -1 })
    return res.json({
      success: true,
      data: designs,
    })
  } catch (error) {
    console.error('Error al cargar diseños:', error)
    return sendError(res, 500, 'Error al cargar disenos', 'FURNITURE_LOAD_ERROR', error.message)
  }
})

// Eliminar diseño
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const furniture = await Furniture.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    })

    if (!furniture) {
      return sendError(res, 404, 'Diseno no encontrado', 'FURNITURE_NOT_FOUND')
    }

    return res.json({
      success: true,
      message: 'Diseno eliminado correctamente',
    })
  } catch (error) {
    console.error('Error al eliminar:', error)
    return sendError(res, 500, 'Error al eliminar el diseno', 'FURNITURE_DELETE_ERROR', error.message)
  }
})

module.exports = router
