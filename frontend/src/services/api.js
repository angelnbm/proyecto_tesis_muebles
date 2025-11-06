import { getToken } from './auth.js'

const API_URL = 'http://localhost:5000/api/furniture'

function getHeaders() {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

export async function saveFurniture(name, shapes) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ nombre: name, shapes }),
  })
  if (!res.ok) throw new Error('Error al guardar')
  return res.json()
}

export async function loadFurniture() {
  const res = await fetch(API_URL, { headers: getHeaders() })
  if (!res.ok) throw new Error('Error al cargar')
  return res.json()
}

export async function updateFurniture(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Error al actualizar')
  return res.json()
}

export async function deleteFurniture(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE', headers: getHeaders() })
  if (!res.ok) throw new Error('Error al eliminar')
  return res.json()
}

