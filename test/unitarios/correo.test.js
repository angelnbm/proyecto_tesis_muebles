/**
 * Pruebas unitarias — Módulo de envío de correo (emailRoutes.js)
 *
 * Verifica la lógica pura de validación de payload, construcción del
 * asunto, resolución de dirección de origen y generación del HTML.
 * No requiere Nodemailer ni conexión SMTP.
 */

// ─── Lógica extraída de emailRoutes.js ───────────────────────────────────────

function validateEmailPayload({ to_email, pdf_base64 } = {}) {
  if (!to_email || typeof to_email !== 'string' || !to_email.trim())
    return { ok: false, error: 'MISSING_TO_EMAIL' }
  if (!pdf_base64)
    return { ok: false, error: 'MISSING_PDF' }
  return { ok: true }
}

function buildSubject(nombre_proyecto) {
  return `Cotización${nombre_proyecto ? ` — ${nombre_proyecto}` : ''}`
}

function resolveFromAddress({ isEthereal, etherealUser, emailUser }) {
  return isEthereal ? etherealUser : (emailUser || 'noreply@amedida.app')
}

function resolveSecure(port) {
  return port === 465
}

function buildHtml({ nombre_cliente, nombre_proyecto, precio_total, planchas_resumen, extras_resumen }) {
  return `
<p>Hola <strong>${nombre_cliente || 'cliente'}</strong>, adjuntamos la cotización del proyecto <strong>${nombre_proyecto || 'sin nombre'}</strong>.</p>
<span class="price-value">${precio_total || '—'}</span>
${planchas_resumen ? `<p>${planchas_resumen}</p>` : ''}
${extras_resumen ? `<p>${extras_resumen}</p>` : ''}`.trim()
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Validación de payload — POST /api/email/cotizacion', () => {
  test('payload completo y válido pasa validación', () => {
    expect(validateEmailPayload({ to_email: 'cliente@test.com', pdf_base64: 'abc123' }).ok).toBe(true)
  })

  test('to_email ausente retorna MISSING_TO_EMAIL', () => {
    const r = validateEmailPayload({ pdf_base64: 'abc123' })
    expect(r.ok).toBe(false)
    expect(r.error).toBe('MISSING_TO_EMAIL')
  })

  test('to_email vacío retorna MISSING_TO_EMAIL', () => {
    expect(validateEmailPayload({ to_email: '   ', pdf_base64: 'abc' }).error).toBe('MISSING_TO_EMAIL')
  })

  test('pdf_base64 ausente retorna MISSING_PDF', () => {
    expect(validateEmailPayload({ to_email: 'a@b.com' }).error).toBe('MISSING_PDF')
  })
})

describe('Construcción del asunto del correo', () => {
  test('con nombre_proyecto incluye el nombre en el asunto', () => {
    expect(buildSubject('Cocina')).toBe('Cotización — Cocina')
  })

  test('sin nombre_proyecto retorna solo "Cotización"', () => {
    expect(buildSubject(undefined)).toBe('Cotización')
  })
})

describe('Resolución de dirección de origen (from)', () => {
  test('modo ethereal usa la cuenta de prueba automática', () => {
    expect(resolveFromAddress({ isEthereal: true, etherealUser: 'test@ethereal.email', emailUser: 'real@gmail.com' }))
      .toBe('test@ethereal.email')
  })

  test('sin EMAIL_USER configurado usa dirección por defecto', () => {
    expect(resolveFromAddress({ isEthereal: false, emailUser: undefined })).toBe('noreply@amedida.app')
  })
})

describe('Generación del HTML del correo', () => {
  test('incluye el nombre del cliente en el saludo', () => {
    expect(buildHtml({ nombre_cliente: 'María', precio_total: '$100' })).toContain('María')
  })

  test('sin precio_total muestra "—"', () => {
    expect(buildHtml({ nombre_cliente: 'Juan' })).toContain('—')
  })
})
