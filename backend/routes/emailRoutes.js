const express = require('express')
const nodemailer = require('nodemailer')
const authMiddleware = require('../middleware/auth')

const router = express.Router()

function sendError(res, status, message, error) {
  return res.status(status).json({ success: false, message, error })
}

// Crea el transporter según variables de entorno.
// Si EMAIL_MODE=ethereal genera una cuenta de prueba automática (no requiere config).
// Si EMAIL_MODE=mailtrap usa las credenciales de Mailtrap.
// Por defecto usa SMTP genérico (Gmail, etc.).
async function createTransporter() {
  const mode = (process.env.EMAIL_MODE || '').toLowerCase()

  if (mode === 'ethereal') {
    const testAccount = await nodemailer.createTestAccount()
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    })
    transporter._ethereal = true
    return transporter
  }

  const host = process.env.EMAIL_HOST
  const port = Number(process.env.EMAIL_PORT) || 587
  const user = process.env.EMAIL_USER
  const pass = process.env.EMAIL_PASS

  if (!host || !user || !pass) {
    throw new Error(
      'Falta configuración de email. Opciones:\n' +
      '  1) EMAIL_MODE=ethereal  → cuenta de prueba automática (sin registrarse)\n' +
      '  2) EMAIL_MODE=mailtrap + EMAIL_USER + EMAIL_PASS → bandeja de prueba\n' +
      '  3) EMAIL_HOST + EMAIL_USER + EMAIL_PASS → SMTP real (Gmail, etc.)'
    )
  }

  if (mode === 'mailtrap') {
    return nodemailer.createTransport({
      host: 'sandbox.smtp.mailtrap.io',
      port: 587,
      auth: { user, pass },
    })
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })
}

function buildHtml({ nombre_cliente, nombre_mueblista, email_mueblista, nombre_proyecto, precio_total, planchas_resumen, extras_resumen }) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cotización</title>
  <style>
    body { margin: 0; padding: 0; background: #f4f4f7; font-family: Arial, Helvetica, sans-serif; color: #222; }
    .wrapper { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: #111; padding: 28px 32px; display: flex; align-items: center; gap: 14px; }
    .header-logo { display: flex; gap: 5px; flex-wrap: wrap; width: 22px; }
    .sq { width: 10px; height: 10px; border-radius: 2px; }
    .sq-blue { background: #4586da; }
    .sq-border { border: 1.5px solid #555; }
    .header-title { color: #fff; font-size: 22px; font-weight: 700; margin: 0; }
    .header-sub { color: #aaa; font-size: 13px; margin: 3px 0 0; }
    .body { padding: 32px; }
    .greeting { font-size: 15px; color: #333; margin-bottom: 20px; }
    .section-title { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; color: #888; text-transform: uppercase; margin: 24px 0 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
    .price-block { background: #f8f8f8; border-radius: 6px; padding: 16px 20px; margin: 16px 0; display: flex; justify-content: space-between; align-items: center; }
    .price-label { font-size: 12px; color: #666; }
    .price-value { font-size: 24px; font-weight: 700; color: #4586da; }
    .summary-text { font-size: 13px; color: #444; white-space: pre-line; line-height: 1.6; }
    .footer { background: #f4f4f7; padding: 18px 32px; font-size: 11px; color: #999; text-align: center; border-top: 1px solid #eee; }
    .footer a { color: #4586da; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="header-logo">
        <div class="sq sq-blue"></div>
        <div class="sq sq-border"></div>
        <div class="sq sq-border"></div>
        <div class="sq sq-border" style="border-color:#ccc"></div>
      </div>
      <div>
        <p class="header-title">Amedida</p>
        <p class="header-sub">${nombre_mueblista || 'Mueblista'}${email_mueblista ? ` · ${email_mueblista}` : ''}</p>
      </div>
    </div>

    <div class="body">
      <p class="greeting">
        Hola <strong>${nombre_cliente || 'cliente'}</strong>, adjuntamos la cotización del proyecto
        <strong>${nombre_proyecto || 'sin nombre'}</strong>.
      </p>

      <div class="price-block">
        <span class="price-label">TOTAL ESTIMADO</span>
        <span class="price-value">${precio_total || '—'}</span>
      </div>

      ${planchas_resumen ? `
      <p class="section-title">Planchas</p>
      <p class="summary-text">${planchas_resumen}</p>
      ` : ''}

      ${extras_resumen ? `
      <p class="section-title">Accesorios y enchape</p>
      <p class="summary-text">${extras_resumen}</p>
      ` : ''}

      <p style="font-size:13px;color:#666;margin-top:24px;">
        Encontrás el detalle completo en el PDF adjunto. Ante cualquier consulta, respondé este correo.
      </p>
    </div>

    <div class="footer">
      Cotización generada con <strong>Amedida</strong> · precisión artesanal, velocidad digital
    </div>
  </div>
</body>
</html>
`.trim()
}

// POST /api/email/cotizacion
router.post('/cotizacion', authMiddleware, async (req, res) => {
  const {
    to_email,
    nombre_cliente,
    nombre_proyecto,
    precio_total,
    planchas_resumen,
    extras_resumen,
    pdf_base64,
    pdf_filename,
  } = req.body || {}

  if (!to_email || typeof to_email !== 'string' || !to_email.trim()) {
    return sendError(res, 400, 'El campo to_email es obligatorio', 'MISSING_TO_EMAIL')
  }
  if (!pdf_base64) {
    return sendError(res, 400, 'Se requiere el PDF en base64 (pdf_base64)', 'MISSING_PDF')
  }

  try {
    const transporter = await createTransporter()

    const isEthereal = !!transporter._ethereal
    const fromName = process.env.EMAIL_FROM_NAME || 'Amedida'
    const fromAddr = isEthereal
      ? transporter.options.auth.user
      : (process.env.EMAIL_USER || 'noreply@amedida.app')

    const mailOptions = {
      from: `"${fromName}" <${fromAddr}>`,
      to: to_email.trim(),
      subject: `Cotización${nombre_proyecto ? ` — ${nombre_proyecto}` : ''}`,
      html: buildHtml({
        nombre_cliente,
        nombre_mueblista: req.userName || '',
        email_mueblista: fromAddr,
        nombre_proyecto,
        precio_total,
        planchas_resumen,
        extras_resumen,
      }),
      attachments: [
        {
          filename: pdf_filename || 'cotizacion.pdf',
          content: Buffer.from(pdf_base64, 'base64'),
          contentType: 'application/pdf',
        },
      ],
    }

    const info = await transporter.sendMail(mailOptions)

    const previewUrl = isEthereal ? nodemailer.getTestMessageUrl(info) : null
    if (previewUrl) {
      console.log('📧 Email de prueba (Ethereal) — ver en:', previewUrl)
    }

    return res.json({
      success: true,
      message: isEthereal
        ? `Email de prueba generado. Abrí este link para verlo: ${previewUrl}`
        : 'Correo enviado correctamente',
      preview_url: previewUrl,
    })
  } catch (err) {
    console.error('Error enviando email:', err.message)
    return sendError(res, 500, `Error al enviar el correo: ${err.message}`, 'EMAIL_SEND_ERROR')
  }
})

module.exports = router
