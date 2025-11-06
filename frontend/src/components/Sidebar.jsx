import React from 'react'

function computeCutList(shape) {
  if (!shape) return []
  // ejemplo simple: corta en paneles frontales y laterales según tipo
  const cuts = []
  const w = Math.round(shape.width)
  const h = Math.round(shape.height)
  const d = Math.round(shape.depth || 20)
  switch (shape.type) {
    case 'cajonera':
      cuts.push(`Frente cajón: ${w} x ${Math.round(h / 3)} CM`)
      cuts.push(`Laterales: ${d} x ${h} CM (2 unidades)`)
      cuts.push(`Fondo: ${w} x ${d} CM`)
      break
    case 'estante':
      cuts.push(`Estante: ${w} x ${d} CM`)
      break
    case 'cubierta':
      cuts.push(`Cubierta: ${w} x ${d} CM`)
      break
    case 'puerta':
      cuts.push(`Puerta: ${w} x ${h} CM`)
      break
    default:
      cuts.push(`${shape.type}: ${w} x ${h} x ${d} CM`)
  }
  return cuts
}

export default function Sidebar({ shapes, setShapes, selectedId, setSelectedId, selectedModule }) {
  const selected = shapes.find(s => s.id === selectedId) || null
  const cuts = computeCutList(selected)

  const updateProp = (k, v) => {
    if (!selected) return
    setShapes(prev => prev.map(s => (s.id === selected.id ? { ...s, [k]: Number(v) } : s)))
  }

  const removeSelected = () => {
    if (!selected) return
    setShapes(prev => prev.filter(s => s.id !== selected.id))
    setSelectedId(null)
  }

  return (
    <div className="sidebar">
      <div className="panel">
        <h3>Módulo seleccionado:</h3>
        <div className="small">Tipo: {selected ? selected.type : '—'}</div>
        <div className="props">
          <label>Ancho:
            <input type="number" value={selected ? selected.width : ''} onChange={e => updateProp('width', e.target.value)} placeholder="CM" />
          </label>
          <label>Alto:
            <input type="number" value={selected ? selected.height : ''} onChange={e => updateProp('height', e.target.value)} placeholder="CM" />
          </label>
          <label>Profundidad:
            <input type="number" value={selected ? selected.depth : ''} onChange={e => updateProp('depth', e.target.value)} placeholder="CM" />
          </label>
        </div>

        <div className="actions">
          <button onClick={removeSelected} disabled={!selected}>Eliminar módulo</button>
        </div>
      </div>

      <div className="panel">
        <h3>Listado de cortes:</h3>
        <div className="cut-list">
          {cuts.length === 0 ? <div className="small">Selecciona un módulo</div> : cuts.map((c, i) => <div key={i}>- {c}</div>)}
        </div>
      </div>

      <div className="panel">
        <button className="wide">Muebles</button>
        <button className="wide">Estadísticas</button>
        <button className="wide">Perfil</button>
      </div>

      <div className="panel small">
        Módulo a añadir: <strong>{selectedModule || 'Ninguno'}</strong>
      </div>
    </div>
  )
}