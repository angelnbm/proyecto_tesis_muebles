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

const NETWORK_ERROR_HINT = 'No se pudo conectar con el servidor. Revisa tu conexion, CORS o que la API este disponible.'

/**
 * Manejo centralizado de errores de fetch
 */
function buildHttpErrorMessage(operationName, response, rawBody, parsedBody) {
  const detailedMessage = [
    parsedBody?.message,
    parsedBody?.details,
    parsedBody?.error,
    parsedBody?.data?.message,
    parsedBody?.data?.details,
  ].find((value) => typeof value === 'string' && value.trim())

  if (detailedMessage) {
    return `${detailedMessage.trim()} (${response.status})`
  }

  if (typeof rawBody === 'string' && rawBody.trim()) {
    return `${rawBody.trim()} (${response.status})`
  }

  if (response.statusText) {
    return `${response.statusText} (${response.status})`
  }

  return `Error en ${operationName} (${response.status})`
}

async function parseResponseBody(response) {
  const rawBody = await response.text()

  if (!rawBody || !rawBody.trim()) {
    return { rawBody: '', parsedBody: null }
  }

  const contentType = (response.headers.get('content-type') || '').toLowerCase()

  if (contentType.includes('application/json')) {
    try {
      return { rawBody, parsedBody: JSON.parse(rawBody) }
    } catch {
      return { rawBody, parsedBody: null }
    }
  }

  try {
    return { rawBody, parsedBody: JSON.parse(rawBody) }
  } catch {
    return { rawBody, parsedBody: null }
  }
}

const handleFetchError = async (response, operationName = 'operacion') => {
  if (!response.ok) {
    const { rawBody, parsedBody } = await parseResponseBody(response)
    const errorMessage = buildHttpErrorMessage(operationName, response, rawBody, parsedBody)

    if (import.meta.env.DEV) {
      console.error(`[${operationName}]`, {
        status: response.status,
        message: errorMessage,
        body: parsedBody || rawBody || null,
      })
    }

    throw new Error(errorMessage)
  }

  if (response.status === 204) {
    return null
  }

  const { rawBody, parsedBody } = await parseResponseBody(response)

  if (!rawBody) {
    return null
  }

  return parsedBody || rawBody
}

function serializeUnexpectedError(error, operationName) {
  if (error instanceof Error) {
    const message = error.message || `Error inesperado en ${operationName}`
    return error.name && error.name !== 'Error'
      ? `${error.name}: ${message}`
      : message
  }

  if (typeof error === 'string' && error.trim()) {
    return error.trim()
  }

  try {
    return JSON.stringify(error)
  } catch {
    return `Error inesperado en ${operationName}`
  }
}

async function apiRequest(url, options, operationName) {
  try {
    const response = await fetch(url, options)
    return await handleFetchError(response, operationName)
  } catch (error) {
    const isNetworkError = error instanceof TypeError
      && /fetch|network|failed|load|cors/i.test(error.message || '')

    const message = isNetworkError
      ? `${NETWORK_ERROR_HINT} (${operationName})`
      : serializeUnexpectedError(error, operationName)

    if (import.meta.env.DEV) {
      console.error(`[${operationName}]`, {
        error: message,
        original: error,
      })
    }

    throw new Error(message)
  }
}

function unwrapData(payload) {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data
  }

  return payload
}

function unwrapCollection(payload) {
  const unwrapped = unwrapData(payload)

  if (Array.isArray(unwrapped)) {
    return unwrapped
  }

  if (unwrapped && typeof unwrapped === 'object') {
    if (Array.isArray(unwrapped.designs)) return unwrapped.designs
    if (Array.isArray(unwrapped.items)) return unwrapped.items
    if (Array.isArray(unwrapped.results)) return unwrapped.results
  }

  return []
}

export const saveFurniture = async (nombre, shapes) => {
  const token = getToken()

  const payload = await apiRequest(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ nombre, shapes })
  }, 'saveFurniture')

  return unwrapData(payload)
}

export const updateFurniture = async (id, { nombre, shapes }) => {
  const token = getToken()

  const payload = await apiRequest(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ nombre, shapes })
  }, 'updateFurniture')

  return unwrapData(payload)
}

export const loadFurniture = async () => {
  const token = getToken()
  const payload = await apiRequest(API_URL, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }, 'loadFurniture')

  return unwrapCollection(payload)
}

export const deleteFurniture = async (id) => {
  const token = getToken()
  const payload = await apiRequest(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }, 'deleteFurniture')

  return unwrapData(payload)
}

