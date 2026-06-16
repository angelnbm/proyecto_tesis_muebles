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

const ICON_SUCCESS = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
const ICON_ERROR = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    <circle cx="12" cy="12" r="10" />
  </svg>
)

function AlertDialog({ message, alertType, onClose }) {
  const isSuccess = alertType === 'success'
  const accentColor  = isSuccess ? '#3cd278' : '#ff6b6b'
  const accentBg     = isSuccess ? 'rgba(60,210,120,0.12)' : 'rgba(255,80,80,0.12)'

  useEffect(() => {
    if (isSuccess) {
      const t = setTimeout(onClose, 2200)
      return () => clearTimeout(t)
    }
    const handleKey = (e) => { if (e.key === 'Escape' || e.key === 'Enter') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  const boxStyle = {
    ...BOX,
    borderLeft: `3px solid ${accentColor}`,
    padding: '20px 22px',
  }

  return (
    <div style={OVERLAY} onClick={onClose}>
      <div style={boxStyle} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: isSuccess ? '14px' : '20px' }}>
          <span style={{
            width: 32, height: 32, borderRadius: '8px', flexShrink: 0,
            background: accentBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: accentColor,
          }}>
            {isSuccess ? ICON_SUCCESS : ICON_ERROR}
          </span>
          <p style={{ ...MSG_STYLE, marginBottom: 0, color: 'var(--color-canvas-white)', paddingTop: '6px' }}>
            {message}
          </p>
        </div>
        {!isSuccess && (
          <div style={ROW}>
            <button style={BTN_OK} onClick={onClose}>Aceptar</button>
          </div>
        )}
        {isSuccess && (
          <div style={{ height: '3px', borderRadius: '2px', background: 'rgba(60,210,120,0.15)', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: accentColor, animation: 'dialog-progress 2.2s linear forwards' }} />
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
