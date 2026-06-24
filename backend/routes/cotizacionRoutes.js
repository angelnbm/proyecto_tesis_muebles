const express = require('express')
const router = express.Router()
const Cotizacion = require('../models/cotizacion')
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

const devError = (err) => process.env.NODE_ENV !== 'production' ? err.message : undefined

const ESTADOS_VALIDOS = ['Pendiente', 'En Proceso', 'Completado']

function validateCotizacionPayload(body) {
  const { mueble_id, precio_total, lista_cortes, materiales_resumen } = body || {}

  if (!mueble_id || typeof mueble_id !== 'string' || !mueble_id.trim()) {
    return 'El campo mueble_id es obligatorio'
  }

  if (precio_total === undefined || precio_total === null || isNaN(Number(precio_total))) {
    return 'El campo precio_total debe ser un número'
  }

  if (!Array.isArray(lista_cortes)) {
    return 'El campo lista_cortes debe ser un arreglo'
  }

  if (!Array.isArray(materiales_resumen)) {
    return 'El campo materiales_resumen debe ser un arreglo'
  }

  return null
}

// Listar cotizaciones del usuario autenticado
router.get('/', authMiddleware, async (req, res) => {
  try {
    const cotizaciones = await Cotizacion.find({ mueblista_id: req.userId })
      .populate('mueble_id', 'nombre')
      .sort({ createdAt: -1 })

    return res.json({ success: true, data: cotizaciones })
  } catch (error) {
    return sendError(res, 500, 'Error al cargar cotizaciones', 'COTIZACION_LOAD_ERROR', devError(error))
  }
})

// Obtener una cotización por ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const cotizacion = await Cotizacion.findOne({ _id: req.params.id, mueblista_id: req.userId })
      .populate('mueble_id', 'nombre')

    if (!cotizacion) {
      return sendError(res, 404, 'Cotización no encontrada', 'COTIZACION_NOT_FOUND')
    }

    return res.json({ success: true, data: cotizacion })
  } catch (error) {
    return sendError(res, 500, 'Error al obtener cotización', 'COTIZACION_GET_ERROR', devError(error))
  }
})

// Crear nueva cotización a partir de los datos calculados en el frontend
router.post('/', authMiddleware, async (req, res) => {
  try {
    const validationError = validateCotizacionPayload(req.body)
    if (validationError) {
      return sendError(res, 400, validationError, 'INVALID_COTIZACION_PAYLOAD')
    }

    const { mueble_id, precio_total, lista_cortes, materiales_resumen, nombre_cliente, email_cliente, imagen_diseno, accesorios_resumen, tapa_canto_resumen, cubiertas_resumen } = req.body

    // Verificar que el mueble pertenece al usuario
    const furniture = await Furniture.findOne({ _id: mueble_id, userId: req.userId })
    if (!furniture) {
      return sendError(res, 404, 'Diseño no encontrado o no te pertenece', 'FURNITURE_NOT_FOUND')
    }

    const cotizacion = new Cotizacion({
      mueblista_id: req.userId,
      mueble_id,
      nombre_cliente: typeof nombre_cliente === 'string' ? nombre_cliente.trim() : '',
      email_cliente: typeof email_cliente === 'string' ? email_cliente.trim() : '',
      precio_total: Number(precio_total),
      lista_cortes: lista_cortes.map(c => ({
        material: String(c.material || ''),
        dimension: String(c.dimension || ''),
        cantidad: Number(c.cantidad || 0),
      })),
      materiales_resumen: materiales_resumen.map(m => ({
        material_id: m.material_id || undefined,
        nombre: String(m.nombre || ''),
        cantidad_planchas: Number(m.cantidad_planchas || 0),
        subtotal: Number(m.subtotal || 0),
      })),
      imagen_diseno: typeof imagen_diseno === 'string' ? imagen_diseno : null,
      accesorios_resumen: Array.isArray(accesorios_resumen) ? accesorios_resumen.map(a => ({
        nombre: String(a.nombre || ''),
        accesorio_tipo: String(a.accesorio_tipo || ''),
        cantidad: Number(a.cantidad || 0),
        precio_unitario: Number(a.precio_unitario || 0),
        subtotal: Number(a.subtotal || 0),
      })) : [],
      tapa_canto_resumen: Array.isArray(tapa_canto_resumen) ? tapa_canto_resumen.map(t => ({
        nombre: String(t.nombre || ''),
        metros: Number(t.metros || 0),
        precio_metro: Number(t.precio_metro || 0),
        subtotal: Number(t.subtotal || 0),
      })) : [],
      cubiertas_resumen: Array.isArray(cubiertas_resumen) ? cubiertas_resumen.map(c => ({
        nombre: String(c.nombre || ''),
        metros: Number(c.metros || 0),
        precio_metro: Number(c.precio_metro || 0),
        subtotal: Number(c.subtotal || 0),
      })) : [],
    })

    await cotizacion.save()
    await cotizacion.populate('mueble_id', 'nombre')

    return res.status(201).json({ success: true, data: cotizacion })
  } catch (error) {
    return sendError(res, 500, 'Error al guardar cotización', 'COTIZACION_SAVE_ERROR', devError(error))
  }
})

// Actualizar estado de una cotización
router.patch('/:id/estado', authMiddleware, async (req, res) => {
  try {
    const { estado } = req.body || {}

    if (!estado || !ESTADOS_VALIDOS.includes(estado)) {
      return sendError(res, 400, `Estado inválido. Valores permitidos: ${ESTADOS_VALIDOS.join(', ')}`, 'INVALID_ESTADO')
    }

    const updates = { estado }
    if (estado === 'Completado') {
      updates.fecha_termino = new Date()
    }

    const cotizacion = await Cotizacion.findOneAndUpdate(
      { _id: req.params.id, mueblista_id: req.userId },
      updates,
      { new: true }
    ).populate('mueble_id', 'nombre')

    if (!cotizacion) {
      return sendError(res, 404, 'Cotización no encontrada', 'COTIZACION_NOT_FOUND')
    }

    return res.json({ success: true, data: cotizacion })
  } catch (error) {
    return sendError(res, 500, 'Error al actualizar estado', 'COTIZACION_UPDATE_ERROR', devError(error))
  }
})

// Eliminar cotización
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const cotizacion = await Cotizacion.findOneAndDelete({ _id: req.params.id, mueblista_id: req.userId })

    if (!cotizacion) {
      return sendError(res, 404, 'Cotización no encontrada', 'COTIZACION_NOT_FOUND')
    }

    return res.json({ success: true, message: 'Cotización eliminada' })
  } catch (error) {
    return sendError(res, 500, 'Error al eliminar cotización', 'COTIZACION_DELETE_ERROR', devError(error))
  }
})

module.exports = router
