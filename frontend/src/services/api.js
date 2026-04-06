import { getToken } from './auth.js'

// URL del API backend - usar variable de entorno o fallback
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

/**
 * Manejo centralizado de errores de fetch
 */
const handleFetchError = async (response, operationName = 'operación') => {
  if (!response.ok) {
    let errorMessage = `Error en ${operationName}`
    
    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorMessage
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

export const saveFurniture = async (nombre, shapes) => {
  const token = getToken()
  
  const res = await fetch(`${API_URL}/furniture`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ nombre, shapes })
  })
  
  return handleFetchError(res, 'saveFurniture')
}

export const updateFurniture = async (id, { nombre, shapes }) => {
  const token = getToken()
  
  const res = await fetch(`${API_URL}/furniture/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ nombre, shapes })
  })
  
  return handleFetchError(res, 'updateFurniture')
}

export const loadFurniture = async () => {
  const token = getToken()
  const res = await fetch(`${API_URL}/furniture`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  
  return handleFetchError(res, 'loadFurniture')
}

export const deleteFurniture = async (id) => {
  const token = getToken()
  const res = await fetch(`${API_URL}/furniture/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  
  return handleFetchError(res, 'deleteFurniture')
}

