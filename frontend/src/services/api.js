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

const API_URL = `${resolveApiBaseUrl()}/furniture`

/**
 * Manejo centralizado de errores de fetch
 */
const handleFetchError = async (response, operationName = 'operacion') => {
  if (!response.ok) {
    let errorMessage = `Error en ${operationName}`

    try {
      const rawBody = await response.text()
      const contentType = response.headers.get('content-type') || ''

      if (rawBody && contentType.includes('application/json')) {
        const errorData = JSON.parse(rawBody)
        errorMessage = errorData.message || errorData.error || errorMessage
      } else if (rawBody) {
        errorMessage = `${errorMessage} (${response.status})`
      }
    } catch (e) {
      // Si no se puede parsear JSON, usar status text
      errorMessage = response.statusText || errorMessage
    }
    
    // Log en desarrollo
    if (import.meta.env.DEV) {
      console.error(`[${operationName}]`, {
        status: response.status,
        message: errorMessage
      })
    }
    
    throw new Error(errorMessage)
  }
  
  return response.json()
}

function unwrapData(payload) {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data
  }

  return payload
}

export const saveFurniture = async (nombre, shapes) => {
  const token = getToken()

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ nombre, shapes })
  })
  
  const payload = await handleFetchError(res, 'saveFurniture')
  return unwrapData(payload)
}

export const updateFurniture = async (id, { nombre, shapes }) => {
  const token = getToken()

  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ nombre, shapes })
  })
  
  const payload = await handleFetchError(res, 'updateFurniture')
  return unwrapData(payload)
}

export const loadFurniture = async () => {
  const token = getToken()
  const res = await fetch(API_URL, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  
  const payload = await handleFetchError(res, 'loadFurniture')
  return unwrapData(payload)
}

export const deleteFurniture = async (id) => {
  const token = getToken()
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  
  const payload = await handleFetchError(res, 'deleteFurniture')
  return unwrapData(payload)
}

