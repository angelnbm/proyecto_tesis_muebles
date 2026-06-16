import React, { useEffect, useState } from 'react'
import { listCotizaciones, updateEstado, deleteCotizacion } from '../services/cotizaciones.js'
import { generarPDFCotizacion } from '../services/pdfCotizacion.js'

const clp = (n) => `$ ${Math.round(n).toLocaleString('es-CL')}`

const ESTADOS = ['Pendiente', 'En Proceso', 'Completado']

const BADGE_STYLE = {
  Pendiente:   { background: 'rgba(255,180,0,0.15)',  color: '#f5c842', border: '1px solid rgba(255,180,0,0.4)' },
  'En Proceso': { background: 'rgba(78,140,255,0.15)', color: '#6faaff', border: '1px solid rgba(78,140,255,0.4)' },
  Completado:  { background: 'rgba(60,210,120,0.15)', color: '#3cd278', border: '1px solid rgba(60,210,120,0.4)' },
}

export default function MisCotizacionesPanel({ onIrACubicacion, userName, showConfirm, showAlert }) {
  const [cotizaciones, setCotizaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [filtroEstado, setFiltroEstado] = useState('Todos')

  useEffect(() => {
    setLoading(true)
    listCotizaciones()
      .then(data => {
        setCotizaciones(Array.isArray(data) ? data : [])
        setError(null)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleEstado = async (id, nuevoEstado) => {
    try {
      const updated = await updateEstado(id, nuevoEstado)
      setCotizaciones(prev => prev.map(c => c._id === id ? { ...c, ...updated } : c))
    } catch (err) {
      await showAlert('Error al actualizar estado: ' + err.message)
    }
  }

  const handleDelete = async (id) => {
    const ok = await showConfirm('¿Eliminar esta cotización? Esta acción no se puede deshacer.', {
      title: 'Eliminar cotización',
      variant: 'danger',
      confirmLabel: 'Eliminar',
    })
    if (!ok) return
    try {
      await deleteCotizacion(id)
      setCotizaciones(prev => prev.filter(c => c._id !== id))
      if (expandedId === id) setExpandedId(null)
    } catch (err) {
      await showAlert('Error al eliminar: ' + err.message)
    }
  }

  const filtradas = filtroEstado === 'Todos'
    ? cotizaciones
    : cotizaciones.filter(c => c.estado === filtroEstado)

  if (loading) {
    return (
      <div className="cotizaciones-panel" style={{ padding: '32px', textAlign: 'center', color: 'var(--color-faded-grey)' }}>
        Cargando cotizaciones...
      </div>
    )
  }

  return (
    <div className="cotizaciones-panel" style={{ padding: '20px', overflowY: 'auto', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ margin: 0, fontSize: '16px', color: 'var(--color-canvas-white)', fontWeight: 600 }}>
          Mis Cotizaciones
        </h2>
        <div style={{ display: 'flex', gap: '6px' }}>
          {['Todos', ...ESTADOS].map(e => (
            <button
              key={e}
              onClick={() => setFiltroEstado(e)}
              style={{
                padding: '4px 10px',
                fontSize: '11px',
                borderRadius: '20px',
                border: filtroEstado === e ? '1px solid var(--color-ideation-blue)' : '1px solid var(--color-slate-border)',
                background: filtroEstado === e ? 'rgba(78,140,255,0.15)' : 'transparent',
                color: filtroEstado === e ? '#6faaff' : 'var(--color-faded-grey)',
                cursor: 'pointer',
              }}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.4)', borderRadius: '6px', padding: '10px 14px', color: '#ff6b6b', marginBottom: '16px', fontSize: '13px' }}>
          {error}
        </div>
      )}

      {filtradas.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-faded-grey)' }}>
          <p style={{ marginBottom: '12px' }}>
            {filtroEstado === 'Todos' ? 'No hay cotizaciones guardadas.' : `No hay cotizaciones con estado "${filtroEstado}".`}
          </p>
          {filtroEstado === 'Todos' && (
            <p style={{ fontSize: '12px' }}>
              Ve a <strong style={{ color: 'var(--color-canvas-white)' }}>Cubicación</strong> y presiona <strong style={{ color: 'var(--color-canvas-white)' }}>Guardar cotización</strong>.
            </p>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtradas.map(cot => {
            const isExpanded = expandedId === cot._id
            const badge = BADGE_STYLE[cot.estado] || BADGE_STYLE['Pendiente']
            const nombreMueble = cot.mueble_id?.nombre || 'Diseño eliminado'
            const nombreCliente = cot.nombre_cliente || ''
            const fecha = new Date(cot.createdAt).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })

            return (
              <div
                key={cot._id}
                style={{
                  background: 'var(--color-dark-surface)',
                  border: '1px solid var(--color-slate-border)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}
              >
                {/* Header de la cotización */}
                <div
                  style={{ padding: '12px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                  onClick={() => setExpandedId(isExpanded ? null : cot._id)}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-canvas-white)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {nombreMueble}
                      </span>
                      {nombreCliente && (
                        <span style={{ fontSize: '12px', color: 'var(--color-paper-grey)' }}>— {nombreCliente}</span>
                      )}
                      <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '10px', ...badge }}>
                        {cot.estado}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '3px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--color-faded-grey)' }}>{fecha}</span>
                      {cot.email_cliente && (
                        <span style={{ fontSize: '11px', color: 'var(--color-faded-grey)' }}>{cot.email_cliente}</span>
                      )}
                      {cot.precio_total > 0 && (
                        <span style={{ fontSize: '11px', color: 'var(--color-paper-grey)' }}>{clp(cot.precio_total)}</span>
                      )}
                    </div>
                  </div>
                  <span style={{ color: 'var(--color-faded-grey)', fontSize: '12px', flexShrink: 0 }}>
                    {isExpanded ? '▲' : '▼'}
                  </span>
                </div>

                {/* Detalle expandible */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--color-slate-border)', padding: '14px' }}>

                    {/* Materiales resumen */}
                    {cot.materiales_resumen?.length > 0 && (
                      <div style={{ marginBottom: '14px' }}>
                        <p style={{ fontSize: '10px', color: 'var(--color-faded-grey)', letterSpacing: '0.05em', marginBottom: '6px' }}>MATERIALES</p>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                          <thead>
                            <tr style={{ color: 'var(--color-faded-grey)' }}>
                              <th style={{ textAlign: 'left', padding: '3px 0', fontWeight: 400 }}>Material</th>
                              <th style={{ textAlign: 'right', padding: '3px 0', fontWeight: 400 }}>Planchas</th>
                              <th style={{ textAlign: 'right', padding: '3px 0', fontWeight: 400 }}>Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cot.materiales_resumen.map((m, i) => (
                              <tr key={i} style={{ color: 'var(--color-paper-grey)', borderTop: '1px solid var(--color-slate-border)' }}>
                                <td style={{ padding: '4px 0' }}>{m.nombre}</td>
                                <td style={{ textAlign: 'right', padding: '4px 0' }}>{m.cantidad_planchas}</td>
                                <td style={{ textAlign: 'right', padding: '4px 0' }}>{clp(m.subtotal)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Lista de cortes */}
                    {cot.lista_cortes?.length > 0 && (
                      <div style={{ marginBottom: '14px' }}>
                        <p style={{ fontSize: '10px', color: 'var(--color-faded-grey)', letterSpacing: '0.05em', marginBottom: '6px' }}>LISTA DE CORTES ({cot.lista_cortes.length} piezas)</p>
                        <div style={{ maxHeight: '160px', overflowY: 'auto', border: '1px solid var(--color-slate-border)', borderRadius: '6px' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                            <thead style={{ position: 'sticky', top: 0, background: 'var(--color-dark-surface)' }}>
                              <tr style={{ color: 'var(--color-faded-grey)' }}>
                                <th style={{ textAlign: 'left', padding: '5px 8px', fontWeight: 400 }}>Material</th>
                                <th style={{ textAlign: 'left', padding: '5px 8px', fontWeight: 400 }}>Dimensión</th>
                                <th style={{ textAlign: 'right', padding: '5px 8px', fontWeight: 400 }}>Cant.</th>
                              </tr>
                            </thead>
                            <tbody>
                              {cot.lista_cortes.map((c, i) => (
                                <tr key={i} style={{ color: 'var(--color-paper-grey)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                  <td style={{ padding: '4px 8px' }}>{c.material}</td>
                                  <td style={{ padding: '4px 8px' }}>{c.dimension}</td>
                                  <td style={{ textAlign: 'right', padding: '4px 8px' }}>{c.cantidad}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Total */}
                    {cot.precio_total > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-canvas-white)' }}>
                          Total: {clp(cot.precio_total)}
                        </span>
                      </div>
                    )}

                    {/* Acciones */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <select
                        value={cot.estado}
                        onChange={e => handleEstado(cot._id, e.target.value)}
                        style={{
                          flex: 1,
                          minWidth: '120px',
                          background: 'var(--color-ink-black)',
                          color: 'var(--color-paper-grey)',
                          border: '1px solid var(--color-slate-border)',
                          borderRadius: '6px',
                          padding: '5px 8px',
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                      <button
                        onClick={() => generarPDFCotizacion(cot, userName)}
                        style={{
                          padding: '5px 12px',
                          background: 'transparent',
                          color: '#6faaff',
                          border: '1px solid rgba(78,140,255,0.4)',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="7 10 12 15 17 10"/>
                          <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        PDF
                      </button>
                      <button
                        onClick={() => handleDelete(cot._id)}
                        style={{
                          padding: '5px 12px',
                          background: 'transparent',
                          color: '#ff6b6b',
                          border: '1px solid rgba(255,80,80,0.4)',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
