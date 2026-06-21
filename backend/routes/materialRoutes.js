const express = require('express')
const router = express.Router()
const Material = require('../models/material')
const authMiddleware = require('../middleware/auth')

function sendError(res, status, message, error, details) {
  return res.status(status).json({
    success: false,
    message,
    error,
    ...(details ? { details } : {}),
  })
}

const devError = (err) => process.env.NODE_ENV !== 'production' ? err.message : undefined

function validateMaterialPayload(body) {
  const payload = body || {}
  const categoria = (payload.categoria || '').toLowerCase().trim()

  if (!payload.nombre || !payload.nombre.trim()) {
    return 'El nombre es obligatorio'
  }

  if (!categoria || !['material', 'accesorio', 'tapa-canto', 'cubierta'].includes(categoria)) {
    return 'La categoria debe ser material, accesorio, tapa-canto o cubierta'
  }

  if (payload.precio === undefined || payload.precio === null || Number.isNaN(Number(payload.precio))) {
    return 'El precio es obligatorio'
  }

  if (Number(payload.precio) < 0) {
    return 'El precio debe ser mayor o igual a 0'
  }

  if (categoria === 'material') {
    if (!payload.tipo || !payload.tipo.trim()) {
      return 'El tipo de material es obligatorio'
    }
    if (!payload.dimensiones || !payload.dimensiones.trim()) {
      return 'Las dimensiones son obligatorias'
    }
  }

  if (categoria === 'accesorio') {
    if (!payload.accesorio_tipo || !payload.accesorio_tipo.trim()) {
      return 'El tipo de accesorio es obligatorio'
    }
  }

  return null
}

function normalizePayload(body) {
  const categoria = (body.categoria || '').toLowerCase().trim()

  return {
    nombre: body.nombre.trim(),
    categoria,
    precio: Number(body.precio),
    unidad: body.unidad?.trim() || 'unidad',
    dimensiones: body.dimensiones?.trim() || undefined,
    grosor: body.grosor !== undefined && body.grosor !== null ? Number(body.grosor) : undefined,
    tipo: body.tipo?.trim() || undefined,
    color: body.color?.trim() || undefined,
    accesorio_tipo: body.accesorio_tipo?.trim() || undefined,
    descripcion: body.descripcion?.trim() || undefined,
  }
}

const VALID_CATEGORIAS = ['material', 'accesorio', 'tapa-canto', 'cubierta']

// Listado con filtros
router.get('/', authMiddleware, async (req, res) => {
  try {
    const filters = { userId: req.userId }

    if (req.query.categoria && VALID_CATEGORIAS.includes(req.query.categoria)) {
      filters.categoria = req.query.categoria
    }
    if (req.query.accesorio_tipo && typeof req.query.accesorio_tipo === 'string') {
      filters.accesorio_tipo = String(req.query.accesorio_tipo).slice(0, 50)
    }
    if (req.query.tipo && typeof req.query.tipo === 'string') {
      filters.tipo = String(req.query.tipo).slice(0, 50)
    }

    const materials = await Material.find(filters).sort({ createdAt: -1 })
    return res.json({ success: true, data: materials })
  } catch (error) {
    console.error('Error al listar materiales:', error)
    return sendError(res, 500, 'Error al listar materiales', 'MATERIALS_LIST_ERROR', devError(error))
  }
})

// Crear
router.post('/', authMiddleware, async (req, res) => {
  try {
    const validationError = validateMaterialPayload(req.body)
    if (validationError) {
      return sendError(res, 400, validationError, 'INVALID_MATERIAL_PAYLOAD')
    }

    const material = new Material({ ...normalizePayload(req.body), userId: req.userId })
    await material.save()

    return res.status(201).json({ success: true, data: material })
  } catch (error) {
    console.error('Error al crear material:', error)
    return sendError(res, 500, 'Error al crear material', 'MATERIAL_CREATE_ERROR', devError(error))
  }
})

// Actualizar
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const validationError = validateMaterialPayload(req.body)
    if (validationError) {
      return sendError(res, 400, validationError, 'INVALID_MATERIAL_PAYLOAD')
    }

    const material = await Material.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      normalizePayload(req.body),
      { new: true }
    )

    if (!material) {
      return sendError(res, 404, 'Material no encontrado', 'MATERIAL_NOT_FOUND')
    }

    return res.json({ success: true, data: material })
  } catch (error) {
    console.error('Error al actualizar material:', error)
    return sendError(res, 500, 'Error al actualizar material', 'MATERIAL_UPDATE_ERROR', devError(error))
  }
})

// Eliminar
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const material = await Material.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    if (!material) {
      return sendError(res, 404, 'Material no encontrado', 'MATERIAL_NOT_FOUND')
    }

    return res.json({ success: true, message: 'Material eliminado correctamente' })
  } catch (error) {
    console.error('Error al eliminar material:', error)
    return sendError(res, 500, 'Error al eliminar material', 'MATERIAL_DELETE_ERROR', devError(error))
  }
})

module.exports = router
