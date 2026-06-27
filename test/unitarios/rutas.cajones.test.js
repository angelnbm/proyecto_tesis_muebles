/**
 * Pruebas de rutas — Tipos de cajón (Iteración 6)
 * Testea las rutas reales de drawerTypeRoutes.js usando supertest.
 * Mockea authMiddleware y el modelo DrawerType.
 */

process.env.JWT_SECRET = 'test-jwt-secret-at-least-32-chars-long!!'

const request = require('supertest')
const express = require('express')

jest.mock('../../backend/middleware/auth', () => (req, res, next) => {
  req.userId = 'testUserId123'
  next()
})

jest.mock('../../backend/models/drawerType', () => {
  function MockDrawerType(data) { Object.assign(this, data); this._id = 'mockDrawerId' }
  MockDrawerType.prototype.save = jest.fn().mockResolvedValue(true)
  MockDrawerType.find = jest.fn().mockReturnValue({ sort: jest.fn().mockResolvedValue([]) })
  MockDrawerType.findOne = jest.fn()
  MockDrawerType.findOneAndUpdate = jest.fn()
  MockDrawerType.findOneAndDelete = jest.fn()
  return MockDrawerType
})

const drawerTypeRoutes = require('../../backend/routes/drawerTypeRoutes')
const app = express()
app.use(express.json())
app.use('/api/cajones', drawerTypeRoutes)

const validPayload = {
  nombre: 'Cajón normal',
  laterales: 'matId1',
  frenteInterno: 'matId2',
  trasera: 'matId3',
  fondo: 'matId4',
}

describe('POST /api/cajones — validaciones', () => {
  test('sin nombre retorna 400 INVALID_DRAWER_TYPE_PAYLOAD', async () => {
    const res = await request(app).post('/api/cajones')
      .send({ laterales: 'id1', frenteInterno: 'id2', trasera: 'id3', fondo: 'id4' })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('INVALID_DRAWER_TYPE_PAYLOAD')
  })

  test('nombre solo espacios retorna 400 INVALID_DRAWER_TYPE_PAYLOAD', async () => {
    const res = await request(app).post('/api/cajones')
      .send({ nombre: '   ', laterales: 'id1', frenteInterno: 'id2', trasera: 'id3', fondo: 'id4' })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('INVALID_DRAWER_TYPE_PAYLOAD')
  })

  test('falta material obligatorio retorna 400 INVALID_DRAWER_TYPE_PAYLOAD', async () => {
    const res = await request(app).post('/api/cajones')
      .send({ nombre: 'Cajón', laterales: 'id1', frenteInterno: 'id2', trasera: 'id3' })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('INVALID_DRAWER_TYPE_PAYLOAD')
  })

  test('heightDiscountPct no numérico retorna 400 INVALID_DRAWER_TYPE_PAYLOAD', async () => {
    const res = await request(app).post('/api/cajones')
      .send({ ...validPayload, heightDiscountPct: 'abc' })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('INVALID_DRAWER_TYPE_PAYLOAD')
  })

  test('payload válido retorna 201', async () => {
    const res = await request(app).post('/api/cajones').send(validPayload)
    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
  })
})

describe('GET /api/cajones — lista tipos de cajón', () => {
  test('retorna 200 con lista', async () => {
    const res = await request(app).get('/api/cajones')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })
})

describe('GET /api/cajones/:id — obtener por id', () => {
  test('id inexistente retorna 404 DRAWER_TYPE_NOT_FOUND', async () => {
    const { findOne } = require('../../backend/models/drawerType')
    findOne.mockResolvedValue(null)
    const res = await request(app).get('/api/cajones/nonexistent')
    expect(res.status).toBe(404)
    expect(res.body.error).toBe('DRAWER_TYPE_NOT_FOUND')
  })

  test('id existente retorna 200 con datos', async () => {
    const { findOne } = require('../../backend/models/drawerType')
    findOne.mockResolvedValue({ _id: 'mockDrawerId', nombre: 'Cajón normal' })
    const res = await request(app).get('/api/cajones/mockDrawerId')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })
})

describe('PUT /api/cajones/:id — actualizar', () => {
  test('payload inválido retorna 400 INVALID_DRAWER_TYPE_PAYLOAD', async () => {
    const res = await request(app).put('/api/cajones/mockDrawerId')
      .send({ nombre: '' })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('INVALID_DRAWER_TYPE_PAYLOAD')
  })

  test('id inexistente retorna 404 DRAWER_TYPE_NOT_FOUND', async () => {
    const { findOneAndUpdate } = require('../../backend/models/drawerType')
    findOneAndUpdate.mockResolvedValue(null)
    const res = await request(app).put('/api/cajones/nonexistent').send(validPayload)
    expect(res.status).toBe(404)
    expect(res.body.error).toBe('DRAWER_TYPE_NOT_FOUND')
  })

  test('actualización exitosa retorna 200', async () => {
    const { findOneAndUpdate } = require('../../backend/models/drawerType')
    findOneAndUpdate.mockResolvedValue({ _id: 'mockDrawerId', ...validPayload })
    const res = await request(app).put('/api/cajones/mockDrawerId').send(validPayload)
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })
})

describe('DELETE /api/cajones/:id — eliminar', () => {
  test('id inexistente retorna 404 DRAWER_TYPE_NOT_FOUND', async () => {
    const { findOneAndDelete } = require('../../backend/models/drawerType')
    findOneAndDelete.mockResolvedValue(null)
    const res = await request(app).delete('/api/cajones/nonexistent')
    expect(res.status).toBe(404)
    expect(res.body.error).toBe('DRAWER_TYPE_NOT_FOUND')
  })

  test('eliminación exitosa retorna 200', async () => {
    const { findOneAndDelete } = require('../../backend/models/drawerType')
    findOneAndDelete.mockResolvedValue({ _id: 'mockDrawerId' })
    const res = await request(app).delete('/api/cajones/mockDrawerId')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })
})
