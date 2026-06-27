/**
 * Pruebas de rutas — Diseños de muebles (Iteraciones 2 y 3)
 * Testea las rutas reales de furnitureRoutes.js usando supertest.
 * Mockea authMiddleware y el modelo Furniture.
 */

process.env.JWT_SECRET = 'test-jwt-secret-at-least-32-chars-long!!'

const request = require('supertest')
const express = require('express')

jest.mock('../../backend/middleware/auth', () => (req, res, next) => {
  req.userId = 'testUserId123'
  next()
})

jest.mock('../../backend/models/Furniture', () => {
  function MockFurniture(data) { Object.assign(this, data); this._id = 'mockId' }
  MockFurniture.prototype.save = jest.fn().mockResolvedValue(true)
  MockFurniture.find = jest.fn().mockReturnValue({ sort: jest.fn().mockResolvedValue([]) })
  MockFurniture.findOneAndUpdate = jest.fn()
  MockFurniture.findOneAndDelete = jest.fn()
  return MockFurniture
})

const furnitureRoutes = require('../../backend/routes/furnitureRoutes')
const app = express()
app.use(express.json())
app.use('/api/furniture', furnitureRoutes)

const validShape = { id: '1', type: 'cajonera', x: 0, y: 0, width: 60, height: 80, depth: 50 }

describe('POST /api/furniture — validaciones', () => {
  test('sin nombre retorna 400 INVALID_FURNITURE_PAYLOAD', async () => {
    const res = await request(app).post('/api/furniture')
      .send({ shapes: [validShape] })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('INVALID_FURNITURE_PAYLOAD')
  })

  test('shapes vacío retorna 400 INVALID_FURNITURE_PAYLOAD', async () => {
    const res = await request(app).post('/api/furniture')
      .send({ nombre: 'Cocina', shapes: [] })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('INVALID_FURNITURE_PAYLOAD')
  })
})

describe('GET /api/furniture — lista diseños', () => {
  test('retorna 200 con lista de diseños (vacía si no hay)', async () => {
    const res = await request(app).get('/api/furniture')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
  })
})

describe('DELETE /api/furniture/:id — diseño no encontrado', () => {
  test('id inexistente retorna 404 FURNITURE_NOT_FOUND', async () => {
    const { findOneAndDelete } = require('../../backend/models/Furniture')
    findOneAndDelete.mockResolvedValue(null)
    const res = await request(app).delete('/api/furniture/nonexistent')
    expect(res.status).toBe(404)
    expect(res.body.error).toBe('FURNITURE_NOT_FOUND')
  })
})
