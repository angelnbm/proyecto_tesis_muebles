function resolveApiBaseUrl() {
  const configured = (import.meta.env.VITE_API_URL || '/api').trim().replace(/\/+$/, '')

  if (!configured) {
    return '/api'
  }

  if (/\/api$/i.test(configured)) {
    return configured
  }

  if (/^https?:\/\//i.test(configured)) {
    return `${configured}/api`
  }

  return configured
}

const baseApiUrl = resolveApiBaseUrl()
const API_URL = `${baseApiUrl}/auth`

function safeParseJson(text) {
  if (!text || !text.trim()) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

async function parseApiResponse(res, fallbackError) {
  const rawBody = await res.text()
  const contentType = res.headers.get('content-type') || ''
  const data = safeParseJson(rawBody)
  const isJson = contentType.includes('application/json')

  if (!res.ok) {
    if (data && typeof data === 'object') {
      throw new Error(data.error || data.message || fallbackError)
    }

    if (rawBody && !isJson) {
      throw new Error(`${fallbackError}: respuesta no JSON del servidor (${res.status})`)
    }

    throw new Error(`${fallbackError} (${res.status})`)
  }

  if (!data) {
    if (!rawBody) {
      throw new Error('Respuesta vacia del servidor')
    }

    throw new Error(`Respuesta invalida del servidor (content-type: ${contentType || 'desconocido'})`)
  }

  return data
}
export async function register(nombre, email, contrasena) {
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, email, contrasena }),
  })
  return parseApiResponse(res, 'Error en registro')
}

export async function login(email, contrasena) {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, contrasena }),
  })
  return parseApiResponse(res, 'Error en login')
}

export async function verifyToken(token) {
  const res = await fetch(`${API_URL}/verify`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Token inválido')
  return res.json()
}

export function saveToken(token) {
  localStorage.setItem('authToken', token)
}

export function getToken() {
  return localStorage.getItem('authToken')
}

export function removeToken() {
  localStorage.removeItem('authToken')
}
