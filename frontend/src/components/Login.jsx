import React, { useState } from 'react'
import { login, register, saveToken } from '../services/auth.js'

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 'var(--radius-default)',
  border: '1px solid var(--color-slate-border)',
  background: 'var(--color-dots-black)',
  color: 'var(--color-canvas-white)',
  fontFamily: 'var(--font-matter)',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
}

const labelStyle = {
  display: 'block',
  fontFamily: 'var(--font-matter)',
  fontSize: '13px',
  fontWeight: 500,
  color: 'var(--color-paper-grey)',
  marginBottom: '6px',
}

export default function AuthForm({ onLogin, onBack }) {
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

  const switchMode = () => {
    setIsLogin(!isLogin)
    setError('')
  }

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-deep-space)',
      padding: '24px',
      boxSizing: 'border-box',
    }}>

      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="11" height="11" rx="2" fill="#4586da"/>
          <rect x="13" width="11" height="11" rx="2" stroke="#f8f4f1" strokeWidth="1.5"/>
          <rect y="13" width="11" height="11" rx="2" stroke="#f8f4f1" strokeWidth="1.5"/>
          <rect x="13" y="13" width="11" height="11" rx="2" stroke="#3c3c3e" strokeWidth="1.5"/>
        </svg>
        <span style={{
          fontFamily: 'var(--font-tomboy)',
          fontWeight: 900,
          fontSize: '22px',
          letterSpacing: '-0.02em',
          color: 'var(--color-canvas-white)',
        }}>AMEDIDA</span>
      </div>

      <div style={{
        width: '100%',
        maxWidth: '400px',
        padding: '32px',
        background: 'var(--color-dark-card)',
        borderRadius: 'var(--radius-cards)',
        border: '1px solid var(--color-slate-border)',
      }}>
        <h2 style={{
          textAlign: 'center',
          fontFamily: 'var(--font-tomboy)',
          fontWeight: 700,
          fontSize: '20px',
          letterSpacing: '-0.01em',
          color: 'var(--color-canvas-white)',
          marginBottom: '28px',
          marginTop: 0,
        }}>
          {isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
        </h2>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Nombre</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                style={inputStyle}
              />
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Contraseña</label>
            <input
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          {error && (
            <p style={{
              color: 'var(--color-brick-red)',
              fontFamily: 'var(--font-matter)',
              fontSize: '13px',
              marginBottom: '16px',
              marginTop: 0,
            }}>{error}</p>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '11px',
              background: 'var(--color-ideation-blue)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-buttons)',
              cursor: 'pointer',
              fontFamily: 'var(--font-matter)',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            {isLogin ? 'Entrar' : 'Crear cuenta'}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: '20px',
          marginBottom: 0,
          fontFamily: 'var(--font-matter)',
          color: 'var(--color-faded-grey)',
          fontSize: '13px',
        }}>
          {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
          <button
            onClick={switchMode}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-ideation-blue)',
              cursor: 'pointer',
              fontFamily: 'var(--font-matter)',
              fontSize: '13px',
              padding: 0,
              textDecoration: 'underline',
            }}
          >
            {isLogin ? 'Regístrate' : 'Inicia sesión'}
          </button>
        </p>
      </div>

      {onBack && (
        <button
          onClick={onBack}
          style={{
            marginTop: '20px',
            background: 'none',
            border: 'none',
            color: 'var(--color-faded-grey)',
            cursor: 'pointer',
            fontFamily: 'var(--font-matter)',
            fontSize: '13px',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          ← Volver al inicio
        </button>
      )}
    </div>
  )
}
