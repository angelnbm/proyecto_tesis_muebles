const API_URL = 'http://localhost:5000/api/auth'
//const API_URL = 'https://zlls9tpr-5000.brs.devtunnels.ms/api/auth'

export async function register(nombre, email, contrasena) {
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, email, contrasena }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Error en registro')
  }
  return res.json()
}

export async function login(email, contrasena) {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, contrasena }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Error en login')
  }
  return res.json()
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