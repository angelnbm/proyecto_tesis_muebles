/**
 * Pruebas de rutas — Materiales (Iteración 5)
 * Testea las rutas reales de materialRoutes.js usando supertest.
 * Mockea authMiddleware y el modelo Material.
 */

process.env.JWT_SECRET = 'test-jwt-secret-at-least-32-chars-long!!'

const request = require('supertest')
const express = require('express')

jest.mock('../../backend/middleware/auth', () => (req, res, next) => {
  req.userId = 'testUserId123'
  next()
})

jest.mock('../../backend/models/material', () => {
  function MockMaterial(data) { Object.assign(this, data); this._id = 'mockMatId' }
  MockMaterial.prototype.save = jest.fn().mockResolvedValue(true)
  MockMaterial.find = jest.fn().mockReturnValue({ sort: jest.fn().mockResolvedValue([]) })
  MockMaterial.findOneAndUpdate = jest.fn()
  MockMaterial.findOneAndDelete = jest.fn()
  return MockMaterial
})

const materialRoutes = require('../../backend/routes/materialRoutes')
const app = express()
app.use(express.json())
app.use('/api/materiales', materialRoutes)

describe('POST /api/materiales — validaciones', () => {
  test('sin nombre retorna 400', async () => {
    const res = await request(app).post('/api/materiales')
      .send({ categoria: 'material', precio: 1000, tipo: 'MDF', dimensiones: '250x183' })
    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  test('categoría inválida retorna 400', async () => {
    const res = await request(app).post('/api/materiales')
      .send({ nombre: 'Melamina', categoria: 'otro', precio: 1000 })
    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  test('accesorio sin tipo retorna 400', async () => {
    const res = await request(app).post('/api/materiales')
      .send({ nombre: 'Riel', categoria: 'accesorio', precio: 5000 })
    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })
})

describe('GET /api/materiales — lista materiales', () => {
  test('retorna 200 con lista de materiales', async () => {
    const res = await request(app).get('/api/materiales')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })
})
