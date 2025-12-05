import React from 'react'

const MODULES = [
  { key: 'estante', label: 'Estante' },
  { key: 'cajonera', label: 'Cajonera' },
  { key: 'modular', label: 'Modular' }, // NUEVO
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
        >
          <div className="tool-icon" aria-hidden />
          <div className="tool-label">{m.label}</div>
        </button>
      ))}
    </div>
  )
}