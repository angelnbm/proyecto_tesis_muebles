import { getToken } from './auth.js'

function resolveApiBaseUrl() {
  const configured = (import.meta.env.VITE_API_URL || '/api').trim().replace(/\/+$/, '')
  if (!configured) return '/api'
  if (/\/api$/i.test(configured)) return configured
  if (/^https?:\/\//i.test(configured)) return `${configured}/api`
  if (!configured.startsWith('/')) return `/${configured}`
  return configured
}

const BASE_URL = `${resolveApiBaseUrl()}/cotizaciones`

async function request(url, options = {}) {
  const token = getToken()
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  })

  const text = await res.text()
  let parsed = null
  try { parsed = JSON.parse(text) } catch {}

  if (!res.ok) {
    const msg = parsed?.message || parsed?.error || `Error ${res.status}`
    throw new Error(msg)
  }

  return parsed?.data ?? parsed ?? null
}

export const listCotizaciones = () => request(BASE_URL)

export const getCotizacion = (id) => request(`${BASE_URL}/${id}`)

export const createCotizacion = ({ mueble_id, precio_total, lista_cortes, materiales_resumen }) =>
  request(BASE_URL, {
    method: 'POST',
    body: JSON.stringify({ mueble_id, precio_total, lista_cortes, materiales_resumen }),
  })

export const updateEstado = (id, estado) =>
  request(`${BASE_URL}/${id}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ estado }),
  })

export const deleteCotizacion = (id) =>
  request(`${BASE_URL}/${id}`, { method: 'DELETE' })
