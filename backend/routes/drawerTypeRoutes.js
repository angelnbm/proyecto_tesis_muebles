const express = require('express')
const router = express.Router()
const DrawerType = require('../models/drawerType')
const authMiddleware = require('../middleware/auth')

function sendError(res, status, message, error, details) {
  return res.status(status).json({
    success: false,
    message,
    error,
    ...(details ? { details } : {}),
  })
}

function normalizePayload(body) {
  const payload = body || {}

  return {
    nombre: payload.nombre?.trim(),
    laterales: payload.laterales,
    frenteInterno: payload.frenteInterno,
    trasera: payload.trasera,
    fondo: payload.fondo,
    refuerzo: payload.refuerzo || undefined,
    hasRefuerzo: Boolean(payload.hasRefuerzo),
    heightDiscountPct: payload.heightDiscountPct !== undefined && payload.heightDiscountPct !== null
      ? Number(payload.heightDiscountPct)
      : 0,
  }
}

function validatePayload(body) {
  const payload = body || {}

  if (!payload.nombre || !payload.nombre.trim()) {
    return 'El nombre es obligatorio'
  }

  const requiredMaterials = ['laterales', 'frenteInterno', 'trasera', 'fondo']

  const missing = requiredMaterials.filter((field) => !payload[field])
  if (missing.length > 0) {
    return `Faltan materiales: ${missing.join(', ')}`
  }

  if (payload.heightDiscountPct !== undefined && payload.heightDiscountPct !== null) {
    const numeric = Number(payload.heightDiscountPct)
    if (Number.isNaN(numeric)) {
      return 'El descuento de altura debe ser un numero'
    }
  }

  return null
}

// Listar tipos de cajon
router.get('/', authMiddleware, async (req, res) => {
  try {
    const drawerTypes = await DrawerType.find({ userId: req.userId }).sort({ createdAt: -1 })
    return res.json({ success: true, data: drawerTypes })
  } catch (error) {
    console.error('Error al listar tipos de cajon:', error)
    return sendError(res, 500, 'Error al listar tipos de cajon', 'DRAWER_TYPES_LIST_ERROR', error.message)
  }
})

// Crear tipo de cajon
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (!req.userId) {
      return sendError(res, 401, 'Usuario no autenticado', 'UNAUTHENTICATED_USER')
    }

    const validationError = validatePayload(req.body)
    if (validationError) {
      return sendError(res, 400, validationError, 'INVALID_DRAWER_TYPE_PAYLOAD')
    }

    const drawerType = new DrawerType({
      userId: req.userId,
      ...normalizePayload(req.body),
    })

    await drawerType.save()

    return res.status(201).json({ success: true, data: drawerType })
  } catch (error) {
    console.error('Error al crear tipo de cajon:', error)
    return sendError(res, 500, 'Error al crear tipo de cajon', 'DRAWER_TYPE_CREATE_ERROR', error.message)
  }
})

// Obtener tipo de cajon
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const drawerType = await DrawerType.findOne({ _id: req.params.id, userId: req.userId })
    if (!drawerType) {
      return sendError(res, 404, 'Tipo de cajon no encontrado', 'DRAWER_TYPE_NOT_FOUND')
    }

    return res.json({ success: true, data: drawerType })
  } catch (error) {
    console.error('Error al obtener tipo de cajon:', error)
    return sendError(res, 500, 'Error al obtener tipo de cajon', 'DRAWER_TYPE_GET_ERROR', error.message)
  }
})

// Actualizar tipo de cajon
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const validationError = validatePayload(req.body)
    if (validationError) {
      return sendError(res, 400, validationError, 'INVALID_DRAWER_TYPE_PAYLOAD')
    }

    const drawerType = await DrawerType.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      normalizePayload(req.body),
      { new: true }
    )

    if (!drawerType) {
      return sendError(res, 404, 'Tipo de cajon no encontrado', 'DRAWER_TYPE_NOT_FOUND')
    }

    return res.json({ success: true, data: drawerType })
  } catch (error) {
    console.error('Error al actualizar tipo de cajon:', error)
    return sendError(res, 500, 'Error al actualizar tipo de cajon', 'DRAWER_TYPE_UPDATE_ERROR', error.message)
  }
})

// Eliminar tipo de cajon
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const drawerType = await DrawerType.findOneAndDelete({ _id: req.params.id, userId: req.userId })

    if (!drawerType) {
      return sendError(res, 404, 'Tipo de cajon no encontrado', 'DRAWER_TYPE_NOT_FOUND')
    }

    return res.json({ success: true, message: 'Tipo de cajon eliminado correctamente' })
  } catch (error) {
    console.error('Error al eliminar tipo de cajon:', error)
    return sendError(res, 500, 'Error al eliminar tipo de cajon', 'DRAWER_TYPE_DELETE_ERROR', error.message)
  }
})

module.exports = router
