import React, { useState } from 'react'
import { login, register, saveToken } from '../services/auth.js'

export default function AuthForm({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true)
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      let result
      if (isLogin) {
        result = await login(email, contrasena)
      } else {
        result = await register(nombre, email, contrasena)
      }

      saveToken(result.token)
      onLogin(result.user)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    
    try {
      const data = await login(email, contrasena)
      saveToken(data.token)
      
      // Verificar el token inmediatamente después de guardarlo
      const verified = await verifyToken(data.token)
      onLogin(verified.user) // ← Pasar el usuario verificado
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '24px', background: '#2e3239', borderRadius: '12px' }}>
      <h2 style={{ textAlign: 'center', color: '#e8eaed', marginBottom: '24px' }}>
        {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
      </h2>

      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#c4c7cc', marginBottom: '8px' }}>Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: 'none', background: '#3a3f47', color: '#e8eaed' }}
            />
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', color: '#c4c7cc', marginBottom: '8px' }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: 'none', background: '#3a3f47', color: '#e8eaed' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', color: '#c4c7cc', marginBottom: '8px' }}>Contraseña</label>
          <input
            type="password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: 'none', background: '#3a3f47', color: '#e8eaed' }}
          />
        </div>

        {error && <p style={{ color: '#ff6b6b', fontSize: '14px', marginBottom: '12px' }}>{error}</p>}

        <button
          type="submit"
          style={{ width: '100%', padding: '12px', background: '#4A90E2', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
        >
          {isLogin ? 'Entrar' : 'Crear Cuenta'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '16px', color: '#9aa0a6', fontSize: '14px' }}>
        {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
        <button
          onClick={() => setIsLogin(!isLogin)}
          style={{ background: 'none', border: 'none', color: '#4A90E2', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {isLogin ? 'Regístrate' : 'Inicia sesión'}
        </button>
      </p>
    </div>
  )
}