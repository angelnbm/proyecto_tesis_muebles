/**
 * Pruebas de rutas — Cotizaciones (Iteración 4)
 * Testea las rutas reales de cotizacionRoutes.js usando supertest.
 * Mockea authMiddleware y los modelos Cotizacion y Furniture.
 */

process.env.JWT_SECRET = 'test-jwt-secret-at-least-32-chars-long!!'

const request = require('supertest')
const express = require('express')

jest.mock('../../backend/middleware/auth', () => (req, res, next) => {
  req.userId = 'testUserId123'
  next()
})

jest.mock('../../backend/models/cotizacion', () => {
  function MockCotizacion(data) { Object.assign(this, data); this._id = 'mockCotId' }
  MockCotizacion.prototype.save = jest.fn().mockResolvedValue(true)
  MockCotizacion.prototype.populate = jest.fn().mockResolvedValue(true)
  MockCotizacion.find = jest.fn().mockReturnValue({ populate: jest.fn().mockReturnValue({ sort: jest.fn().mockResolvedValue([]) }) })
  MockCotizacion.findOne = jest.fn()
  MockCotizacion.findOneAndUpdate = jest.fn()
  MockCotizacion.findOneAndDelete = jest.fn()
  return MockCotizacion
})

jest.mock('../../backend/models/Furniture', () => ({
  findOne: jest.fn(),
}))

const cotizacionRoutes = require('../../backend/routes/cotizacionRoutes')
const app = express()
app.use(express.json())
app.use('/api/cotizaciones', cotizacionRoutes)

describe('POST /api/cotizaciones — validaciones', () => {
  test('sin mueble_id retorna 400 INVALID_COTIZACION_PAYLOAD', async () => {
    const res = await request(app).post('/api/cotizaciones')
      .send({ precio_total: 1000, lista_cortes: [], materiales_resumen: [] })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('INVALID_COTIZACION_PAYLOAD')
  })

  test('sin precio_total retorna 400 INVALID_COTIZACION_PAYLOAD', async () => {
    const res = await request(app).post('/api/cotizaciones')
      .send({ mueble_id: 'abc', lista_cortes: [], materiales_resumen: [] })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('INVALID_COTIZACION_PAYLOAD')
  })
})

describe('PATCH /api/cotizaciones/:id/estado — validaciones', () => {
  test('estado inválido retorna 400 INVALID_ESTADO', async () => {
    const res = await request(app).patch('/api/cotizaciones/mockId/estado')
      .send({ estado: 'Cancelado' })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('INVALID_ESTADO')
  })
})

describe('DELETE /api/cotizaciones/:id — no encontrada', () => {
  test('id inexistente retorna 404 COTIZACION_NOT_FOUND', async () => {
    const { findOneAndDelete } = require('../../backend/models/cotizacion')
    findOneAndDelete.mockResolvedValue(null)
    const res = await request(app).delete('/api/cotizaciones/nonexistent')
    expect(res.status).toBe(404)
    expect(res.body.error).toBe('COTIZACION_NOT_FOUND')
  })
})
