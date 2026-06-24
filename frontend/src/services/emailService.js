import { getToken } from './auth.js'

function resolveApiBaseUrl() {
  const configured = (import.meta.env.VITE_API_URL || '/api').trim().replace(/\/+$/, '')
  if (!configured) return '/api'
  if (/\/api$/i.test(configured)) return configured
  if (/^https?:\/\//i.test(configured)) return `${configured}/api`
  if (!configured.startsWith('/')) return `/${configured}`
  return configured
}

const BASE_URL = `${resolveApiBaseUrl()}/email`

export async function enviarCotizacionPorEmail({ to_email, nombre_cliente, nombre_proyecto, precio_total, planchas_resumen, extras_resumen, pdf_base64, pdf_filename }) {
  const token = getToken()
  const res = await fetch(`${BASE_URL}/cotizacion`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ to_email, nombre_cliente, nombre_proyecto, precio_total, planchas_resumen, extras_resumen, pdf_base64, pdf_filename }),
  })

  const text = await res.text()
  let parsed = null
  try { parsed = JSON.parse(text) } catch {}

  if (!res.ok) {
    const msg = parsed?.message || parsed?.error || `Error ${res.status}`
    throw new Error(msg)
  }

  return parsed
}
