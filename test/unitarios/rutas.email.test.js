/**
 * Pruebas de rutas — Email (Iteración 7)
 * Testea la ruta real de emailRoutes.js usando supertest.
 * Mockea authMiddleware y nodemailer para no requerir SMTP.
 */

process.env.JWT_SECRET = 'test-jwt-secret-at-least-32-chars-long!!'

const request = require('supertest')
const express = require('express')

jest.mock('../../backend/middleware/auth', () => (req, res, next) => {
  req.userId = 'testUserId123'
  next()
})

jest.mock('nodemailer', () => ({
  createTestAccount: jest.fn().mockResolvedValue({
    user: 'test@ethereal.email',
    pass: 'testpass',
  }),
  createTransport: jest.fn().mockReturnValue({
    _ethereal: true,
    options: { auth: { user: 'test@ethereal.email' } },
    sendMail: jest.fn().mockResolvedValue({ messageId: 'mockId' }),
  }),
  getTestMessageUrl: jest.fn().mockReturnValue('https://ethereal.email/message/mockId'),
}), { virtual: true })

const emailRoutes = require('../../backend/routes/emailRoutes')
const app = express()
app.use(express.json())
app.use('/api/email', emailRoutes)

const validPayload = {
  to_email: 'cliente@test.com',
  pdf_base64: 'JVBERi0xLjQ=',
  nombre_proyecto: 'Cocina',
  precio_total: '$150.000',
}

describe('POST /api/email/cotizacion — validaciones', () => {
  test('sin to_email retorna 400 MISSING_TO_EMAIL', async () => {
    const res = await request(app).post('/api/email/cotizacion')
      .send({ pdf_base64: 'abc123' })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('MISSING_TO_EMAIL')
  })

  test('to_email vacío retorna 400 MISSING_TO_EMAIL', async () => {
    const res = await request(app).post('/api/email/cotizacion')
      .send({ to_email: '   ', pdf_base64: 'abc123' })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('MISSING_TO_EMAIL')
  })

  test('sin pdf_base64 retorna 400 MISSING_PDF', async () => {
    const res = await request(app).post('/api/email/cotizacion')
      .send({ to_email: 'cliente@test.com' })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('MISSING_PDF')
  })
})

describe('POST /api/email/cotizacion — envío exitoso', () => {
  test('payload válido retorna 200 con success', async () => {
    process.env.EMAIL_MODE = 'ethereal'
    const res = await request(app).post('/api/email/cotizacion').send(validPayload)
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })
})
