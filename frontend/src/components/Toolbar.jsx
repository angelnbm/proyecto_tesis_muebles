import React from 'react'

const ICONS = {
  estante: (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
      {/* Lado izquierdo */}
      <line x1="8" y1="8" x2="8" y2="32" />
      {/* Lado derecho */}
      <line x1="32" y1="8" x2="32" y2="32" />
      {/* Estante superior */}
      <line x1="8" y1="10" x2="32" y2="10" />
      {/* Estante medio alto */}
      <line x1="8" y1="18" x2="32" y2="18" />
      {/* Estante medio bajo */}
      <line x1="8" y1="26" x2="32" y2="26" />
      {/* Estante inferior */}
      <line x1="8" y1="32" x2="32" y2="32" />
    </svg>
  ),

  cajonera: (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
      {/* Cuerpo */}
      <rect x="8" y="8" width="24" height="24" rx="1" />
      {/* Cajón 1 */}
      <line x1="8" y1="15" x2="32" y2="15" />
      {/* Handle cajón 1 */}
      <line x1="17" y1="11.5" x2="23" y2="11.5" />
      {/* Cajón 2 */}
      <line x1="8" y1="22" x2="32" y2="22" />
      {/* Handle cajón 2 */}
      <line x1="17" y1="18.5" x2="23" y2="18.5" />
      {/* Handle cajón 3 */}
      <line x1="17" y1="27" x2="23" y2="27" />
    </svg>
  ),

  modular: (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
      {/* Cuerpo */}
      <rect x="8" y="8" width="24" height="24" rx="1" />
      {/* Divisor vertical central */}
      <line x1="20" y1="8" x2="20" y2="32" />
      {/* Estante lado izquierdo */}
      <line x1="8" y1="22" x2="20" y2="22" />
      {/* Puerta lado derecho - handle */}
      <circle cx="22.5" cy="20" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  ),

  base: (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
      {/* Base/zócalo - rectángulo bajo y ancho */}
      <rect x="6" y="25" width="28" height="7" rx="1" />
      {/* Panel superior decorativo */}
      <line x1="6" y1="23" x2="34" y2="23" />
      {/* Patas izquierda */}
      <line x1="10" y1="32" x2="10" y2="36" />
      {/* Patas derecha */}
      <line x1="30" y1="32" x2="30" y2="36" />
      {/* Superficie encimera */}
      <rect x="5" y="20" width="30" height="3" rx="0.5" />
    </svg>
  ),

  divisor: (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
      {/* Panel vertical delgado */}
      <rect x="16" y="6" width="8" height="28" rx="1" />
      {/* Indicador de grosor / línea interna */}
      <line x1="20" y1="9" x2="20" y2="31" strokeWidth="0.8" strokeDasharray="2 2" />
      {/* Flechas de ancho */}
      <line x1="6" y1="20" x2="14" y2="20" strokeDasharray="2 2" strokeWidth="1.2" />
      <line x1="26" y1="20" x2="34" y2="20" strokeDasharray="2 2" strokeWidth="1.2" />
    </svg>
  ),

  cubierta: (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
      {/* Tablero horizontal amplio */}
      <rect x="5" y="16" width="30" height="8" rx="1" />
      {/* Línea de borde frontal */}
      <line x1="5" y1="17.5" x2="35" y2="17.5" strokeWidth="0.8" />
      {/* Flechas indicando ancho */}
      <line x1="8" y1="10" x2="8" y2="14" />
      <line x1="32" y1="10" x2="32" y2="14" />
      <line x1="8" y1="12" x2="32" y2="12" />
      <line x1="8" y1="12" x2="11" y2="10" />
      <line x1="8" y1="12" x2="11" y2="14" />
      <line x1="32" y1="12" x2="29" y2="10" />
      <line x1="32" y1="12" x2="29" y2="14" />
    </svg>
  ),

  puerta: (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
      {/* Marco de puerta */}
      <rect x="10" y="7" width="20" height="26" rx="1" />
      {/* Panel interior decorativo */}
      <rect x="13" y="10" width="14" height="10" rx="0.5" strokeWidth="1.2" />
      <rect x="13" y="22" width="14" height="8" rx="0.5" strokeWidth="1.2" />
      {/* Handle / manija */}
      <circle cx="26" cy="20" r="1.8" fill="currentColor" stroke="none" />
    </svg>
  ),
}

const MODULES = [
  { key: 'estante', label: 'Estante' },
  { key: 'cajonera', label: 'Cajonera' },
  { key: 'modular', label: 'Modular' },
  { key: 'base', label: 'Base' },
  { key: 'divisor', label: 'Divisor' },
  { key: 'cubierta', label: 'Cubierta' },
  { key: 'puerta', label: 'Puerta' },
]

export default function Toolbar({ selectedModule, onSelect }) {
  return (
    <div className="toolbar" role="toolbar" aria-label="Módulos">
      {MODULES.map(m => (
        <button
          key={m.key}
          className={`tool-btn ${selectedModule === m.key ? 'active' : ''}`}
          onClick={() => onSelect(selectedModule === m.key ? null : m.key)}
          title={m.label}
          aria-pressed={selectedModule === m.key}
        >
          <div className="tool-icon" aria-hidden="true">
            {ICONS[m.key]}
          </div>
          <div className="tool-label">{m.label}</div>
        </button>
      ))}
    </div>
  )
}
