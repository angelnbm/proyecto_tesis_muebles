import React, { useEffect, useRef, useState } from 'react'

const OVERLAY = {
  position: 'fixed', inset: 0, zIndex: 1000,
  background: 'rgba(0,0,0,0.6)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: '20px',
}

const BOX = {
  background: 'var(--color-dark-surface)',
  border: '1px solid var(--color-slate-border)',
  borderRadius: '10px',
  padding: '24px',
  width: '100%',
  maxWidth: '380px',
  boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
}

const TITLE_STYLE = {
  fontSize: '14px',
  fontWeight: 600,
  color: 'var(--color-canvas-white)',
  marginBottom: '6px',
}

const MSG_STYLE = {
  fontSize: '13px',
  color: 'var(--color-paper-grey)',
  marginBottom: '20px',
  lineHeight: 1.5,
  whiteSpace: 'pre-wrap',
}

const INPUT_STYLE = {
  width: '100%',
  background: 'var(--color-ink-black)',
  color: 'var(--color-canvas-white)',
  border: '1px solid var(--color-slate-border)',
  borderRadius: '6px',
  padding: '8px 10px',
  fontSize: '13px',
  marginBottom: '6px',
  boxSizing: 'border-box',
  outline: 'none',
}

const ROW = { display: 'flex', gap: '8px', justifyContent: 'flex-end' }

const btnBase = {
  padding: '7px 16px',
  borderRadius: '6px',
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer',
  border: 'none',
}

const BTN_CANCEL = { ...btnBase, background: 'transparent', color: 'var(--color-faded-grey)', border: '1px solid var(--color-slate-border)' }
const BTN_PRIMARY = { ...btnBase, background: 'var(--color-ideation-blue)', color: 'white' }
const BTN_DANGER  = { ...btnBase, background: '#c0392b', color: 'white' }
const BTN_OK      = { ...btnBase, background: 'var(--color-ideation-blue)', color: 'white' }

function PromptDialog({ title, message, defaultValue, onConfirm, onCancel }) {
  const [value, setValue] = useState(defaultValue || '')
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus(); inputRef.current?.select() }, [])

  const handleConfirm = () => {
    if (!value.trim()) { setError('El nombre no puede estar vacío'); return }
    onConfirm(value.trim())
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') handleConfirm()
    if (e.key === 'Escape') onCancel()
  }

  return (
    <div style={OVERLAY} onClick={onCancel}>
      <div style={BOX} onClick={e => e.stopPropagation()}>
        {title && <p style={TITLE_STYLE}>{title}</p>}
        {message && <p style={{ ...MSG_STYLE, marginBottom: '12px' }}>{message}</p>}
        <input
          ref={inputRef}
          style={{ ...INPUT_STYLE, borderColor: error ? '#c0392b' : 'var(--color-slate-border)' }}
          value={value}
          onChange={e => { setValue(e.target.value); setError('') }}
          onKeyDown={handleKey}
        />
        {error && <p style={{ fontSize: '11px', color: '#ff6b6b', marginBottom: '12px' }}>{error}</p>}
        {!error && <div style={{ height: '12px' }} />}
        <div style={ROW}>
          <button style={BTN_CANCEL} onClick={onCancel}>Cancelar</button>
          <button style={BTN_PRIMARY} onClick={handleConfirm}>Confirmar</button>
        </div>
      </div>
    </div>
  )
}

function ConfirmDialog({ title, message, variant, confirmLabel, cancelLabel, onConfirm, onCancel }) {
  const btnConfirm = variant === 'danger' ? BTN_DANGER : BTN_PRIMARY
  useEffect(() => { document.addEventListener('keydown', handleKey); return () => document.removeEventListener('keydown', handleKey) })
  const handleKey = (e) => { if (e.key === 'Escape') onCancel() }
  return (
    <div style={OVERLAY} onClick={onCancel}>
      <div style={BOX} onClick={e => e.stopPropagation()}>
        {title && <p style={TITLE_STYLE}>{title}</p>}
        <p style={MSG_STYLE}>{message}</p>
        <div style={ROW}>
          <button style={BTN_CANCEL} onClick={onCancel}>{cancelLabel || 'Cancelar'}</button>
          <button style={btnConfirm} onClick={onConfirm}>{confirmLabel || 'Confirmar'}</button>
        </div>
      </div>
    </div>
  )
}

function AlertDialog({ message, alertType, onClose }) {
  const iconColor = alertType === 'success' ? '#3cd278' : '#ff6b6b'
  const icon = alertType === 'success' ? '✓' : '!'

  useEffect(() => {
    if (alertType === 'success') {
      const t = setTimeout(onClose, 2200)
      return () => clearTimeout(t)
    }
    const handleKey = (e) => { if (e.key === 'Escape' || e.key === 'Enter') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <div style={OVERLAY} onClick={onClose}>
      <div style={BOX} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '20px' }}>
          <span style={{
            width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
            background: alertType === 'success' ? 'rgba(60,210,120,0.15)' : 'rgba(255,80,80,0.15)',
            border: `1px solid ${iconColor}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: 700, color: iconColor,
          }}>{icon}</span>
          <p style={{ ...MSG_STYLE, marginBottom: 0 }}>{message}</p>
        </div>
        {alertType !== 'success' && (
          <div style={ROW}>
            <button style={BTN_OK} onClick={onClose}>Aceptar</button>
          </div>
        )}
        {alertType === 'success' && (
          <div style={{ height: '3px', borderRadius: '2px', background: 'rgba(60,210,120,0.2)', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: '#3cd278', animation: 'dialog-progress 2.2s linear forwards' }} />
          </div>
        )}
      </div>
    </div>
  )
}

export default function Dialog({ state }) {
  if (!state || !state.type) return null
  if (state.type === 'prompt')  return <PromptDialog  {...state} />
  if (state.type === 'confirm') return <ConfirmDialog {...state} />
  if (state.type === 'alert')   return <AlertDialog   {...state} />
  return null
}
