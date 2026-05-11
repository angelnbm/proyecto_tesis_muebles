import { getToken } from './auth.js'

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

const API_URL = `${resolveApiBaseUrl()}/materials`

async function parseResponse(response, operationName) {
  const rawBody = await response.text()
  const contentType = (response.headers.get('content-type') || '').toLowerCase()
  const parsed = rawBody && contentType.includes('application/json') ? JSON.parse(rawBody) : null

  if (!response.ok) {
    const message = parsed?.message || parsed?.error || `${operationName} (${response.status})`
    throw new Error(message)
  }

  return parsed?.data ?? parsed ?? null
}

function authHeaders() {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

export async function listMaterials(filters = {}) {
  const query = new URLSearchParams(filters).toString()
  const res = await fetch(`${API_URL}${query ? `?${query}` : ''}`, {
    headers: authHeaders(),
  })

  return parseResponse(res, 'loadMaterials')
}

export async function createMaterial(payload) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })

  return parseResponse(res, 'createMaterial')
}

export async function updateMaterial(id, payload) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })

  return parseResponse(res, 'updateMaterial')
}

export async function deleteMaterial(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })

  return parseResponse(res, 'deleteMaterial')
}
