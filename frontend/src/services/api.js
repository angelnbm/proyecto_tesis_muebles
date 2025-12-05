import { getToken } from './auth.js'

//const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const API_URL = import.meta.env.VITE_API_URL || 'https://zlls9tpr-5000.brs.devtunnels.ms/api'

export const saveFurniture = async (nombre, shapes) => {
  const token = getToken()
  
  console.log('Enviando al servidor:', { nombre, shapes })
  
  const res = await fetch(`${API_URL}/furniture`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ nombre, shapes })
  })
  
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || 'Error al guardar')
  }
  
  const data = await res.json()
  console.log('Respuesta del servidor:', data)
  return data
}

export const updateFurniture = async (id, { nombre, shapes }) => {
  const token = getToken()
  
  console.log('Actualizando en servidor:', { id, nombre, shapes })
  
  const res = await fetch(`${API_URL}/furniture/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ nombre, shapes })
  })
  
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || 'Error al actualizar')
  }
  
  const data = await res.json()
  console.log('Respuesta del servidor:', data)
  return data
}

export const loadFurniture = async () => {
  const token = getToken()
  const res = await fetch(`${API_URL}/furniture`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  
  if (!res.ok) throw new Error('Error al cargar diseños')
  
  const data = await res.json()
  console.log('Diseños cargados del servidor:', data)
  return data
}

export const deleteFurniture = async (id) => {
  const token = getToken()
  const res = await fetch(`${API_URL}/furniture/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  
  if (!res.ok) throw new Error('Error al eliminar')
  
  return await res.json()
}

