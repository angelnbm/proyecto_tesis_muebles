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

function validateMaterialPayload(body) {
  const payload = body || {}
  const categoria = (payload.categoria || '').toLowerCase().trim()

  if (!payload.nombre || !payload.nombre.trim()) {
    return 'El nombre es obligatorio'
  }

  if (!categoria || !['material', 'accesorio'].includes(categoria)) {
    return 'La categoria debe ser material o accesorio'
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

// Listado con filtros
router.get('/', authMiddleware, async (req, res) => {
  try {
    const filters = {}

    if (req.query.categoria) {
      filters.categoria = req.query.categoria
    }
    if (req.query.accesorio_tipo) {
      filters.accesorio_tipo = req.query.accesorio_tipo
    }
    if (req.query.tipo) {
      filters.tipo = req.query.tipo
    }

    const materials = await Material.find(filters).sort({ createdAt: -1 })
    return res.json({ success: true, data: materials })
  } catch (error) {
    console.error('Error al listar materiales:', error)
    return sendError(res, 500, 'Error al listar materiales', 'MATERIALS_LIST_ERROR', error.message)
  }
})

// Crear
router.post('/', authMiddleware, async (req, res) => {
  try {
    const validationError = validateMaterialPayload(req.body)
    if (validationError) {
      return sendError(res, 400, validationError, 'INVALID_MATERIAL_PAYLOAD')
    }

    const material = new Material(normalizePayload(req.body))
    await material.save()

    return res.status(201).json({ success: true, data: material })
  } catch (error) {
    console.error('Error al crear material:', error)
    return sendError(res, 500, 'Error al crear material', 'MATERIAL_CREATE_ERROR', error.message)
  }
})

// Actualizar
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const validationError = validateMaterialPayload(req.body)
    if (validationError) {
      return sendError(res, 400, validationError, 'INVALID_MATERIAL_PAYLOAD')
    }

    const material = await Material.findByIdAndUpdate(
      req.params.id,
      normalizePayload(req.body),
      { new: true }
    )

    if (!material) {
      return sendError(res, 404, 'Material no encontrado', 'MATERIAL_NOT_FOUND')
    }

    return res.json({ success: true, data: material })
  } catch (error) {
    console.error('Error al actualizar material:', error)
    return sendError(res, 500, 'Error al actualizar material', 'MATERIAL_UPDATE_ERROR', error.message)
  }
})

// Eliminar
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const material = await Material.findByIdAndDelete(req.params.id)
    if (!material) {
      return sendError(res, 404, 'Material no encontrado', 'MATERIAL_NOT_FOUND')
    }

    return res.json({ success: true, message: 'Material eliminado correctamente' })
  } catch (error) {
    console.error('Error al eliminar material:', error)
    return sendError(res, 500, 'Error al eliminar material', 'MATERIAL_DELETE_ERROR', error.message)
  }
})

module.exports = router
