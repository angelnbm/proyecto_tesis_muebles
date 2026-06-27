/**
 * Pruebas de rutas — Autenticación (Iteración 1)
 * Testea las rutas reales de authRoutes.js usando supertest.
 * Mockea el modelo Mueblista para no requerir MongoDB.
 */

process.env.JWT_SECRET = 'test-jwt-secret-at-least-32-chars-long!!'

const request = require('supertest')
const express = require('express')

jest.mock('../../backend/models/mueblista', () => {
  function MockMueblista(data) { Object.assign(this, data); this._id = 'mockId' }
  MockMueblista.prototype.save = jest.fn().mockResolvedValue(true)
  MockMueblista.findOne = jest.fn().mockResolvedValue(null)
  MockMueblista.findById = jest.fn()
  return MockMueblista
})

const authRoutes = require('../../backend/routes/authRoutes')
const app = express()
app.use(express.json())
app.use('/api/auth', authRoutes)

describe('POST /api/auth/register — validaciones', () => {
  test('campos vacíos retorna 400 MISSING_FIELDS', async () => {
    const res = await request(app).post('/api/auth/register').send({})
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('MISSING_FIELDS')
  })

  test('email sin dominio retorna 400 INVALID_EMAIL', async () => {
    const res = await request(app).post('/api/auth/register')
      .send({ nombre: 'Juan', email: 'juantest.com', contrasena: 'secret123' })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('INVALID_EMAIL')
  })

  test('contraseña menor a 6 caracteres retorna 400 PASSWORD_TOO_SHORT', async () => {
    const res = await request(app).post('/api/auth/register')
      .send({ nombre: 'Juan', email: 'juan@test.com', contrasena: '123' })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('PASSWORD_TOO_SHORT')
  })
})

describe('POST /api/auth/login — validaciones', () => {
  test('sin contraseña retorna 400 MISSING_FIELDS', async () => {
    const res = await request(app).post('/api/auth/login')
      .send({ email: 'juan@test.com' })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('MISSING_FIELDS')
  })
})

describe('GET /api/auth/verify — sin token', () => {
  test('petición sin header Authorization retorna 401', async () => {
    const res = await request(app).get('/api/auth/verify')
    expect(res.status).toBe(401)
  })
})
