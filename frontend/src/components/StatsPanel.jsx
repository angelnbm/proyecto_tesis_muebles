import React, { useEffect, useMemo, useState } from 'react'
import { listCotizaciones } from '../services/cotizaciones.js'

const MODULE_LABELS = {
  cajonera: 'Cajonera',
  modular:  'Modular',
  estante:  'Estante',
  base:     'Base',
  divisor:  'Divisor',
  cubierta: 'Cubierta',
  puerta:   'Puerta',
}

const MODULE_COLORS = {
  cajonera: '#4586da',
  modular:  '#5aa87a',
  estante:  '#c97b3a',
  base:     '#8b6bb1',
  divisor:  '#c95a5a',
  cubierta: '#5a9ec9',
  puerta:   '#b5a63a',
}

const ESTADO_COLORS = {
  'Pendiente':   '#f5c842',
  'En Proceso':  '#6faaff',
  'Completado':  '#3cd278',
}

const PERIODOS = [
  { key: 'todo',        label: 'Todo' },
  { key: 'mes',         label: 'Este mes' },
  { key: '3m',          label: '3 meses' },
  { key: '6m',          label: '6 meses' },
  { key: 'anio',        label: 'Este año' },
  { key: 'anio_custom', label: 'Por año' },
]

const clp = (n) => `$ ${Math.round(n).toLocaleString('es-CL')}`

function BarChart({ data, maxValue, colorFn, labelKey, valueKey, unit = '' }) {
  if (!data.length) return <p className="stats-empty">Sin datos</p>
  return (
    <div className="stats-barchart">
      {data.map((row, i) => {
        const pct = maxValue > 0 ? (row[valueKey] / maxValue) * 100 : 0
        return (
          <div key={i} className="stats-bar-row">
            <span className="stats-bar-label">{row[labelKey]}</span>
            <div className="stats-bar-track">
              <div
                className="stats-bar-fill"
                style={{ width: `${pct}%`, background: colorFn ? colorFn(row) : 'var(--color-ideation-blue)' }}
              />
            </div>
            <span className="stats-bar-value">{row[valueKey]}{unit}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function StatsPanel({ designs, materials = [] }) {
  const [cotizaciones, setCotizaciones] = useState([])
  const [cotLoading, setCotLoading] = useState(true)
  const [periodo, setPeriodo] = useState('todo')
  const [anioFiltro, setAnioFiltro] = useState(() => new Date().getFullYear())

  useEffect(() => {
    listCotizaciones()
      .then(data => setCotizaciones(Array.isArray(data) ? data : []))
      .catch(() => setCotizaciones([]))
      .finally(() => setCotLoading(false))
  }, [])

  const materialMap = useMemo(() => {
    return materials.reduce((acc, m) => { acc[m._id] = m; return acc }, {})
  }, [materials])

  const availableYears = useMemo(() => {
    const years = new Set()
    designs.forEach(d => { if (d.createdAt) years.add(new Date(d.createdAt).getFullYear()) })
    cotizaciones.forEach(c => { if (c.createdAt) years.add(new Date(c.createdAt).getFullYear()) })
    const arr = Array.from(years).sort((a, b) => b - a)
    return arr.length ? arr : [new Date().getFullYear()]
  }, [designs, cotizaciones])

  const { filteredDesigns, filteredCotizaciones } = useMemo(() => {
    const now = new Date()
    const thisYear = now.getFullYear()
    const thisMonth = now.getMonth()

    const passes = (dateStr) => {
      if (!dateStr) return false
      const d = new Date(dateStr)
      switch (periodo) {
        case 'mes':
          return d.getFullYear() === thisYear && d.getMonth() === thisMonth
        case '3m': {
          const cutoff = new Date(thisYear, thisMonth - 2, 1)
          return d >= cutoff
        }
        case '6m': {
          const cutoff = new Date(thisYear, thisMonth - 5, 1)
          return d >= cutoff
        }
        case 'anio':
          return d.getFullYear() === thisYear
        case 'anio_custom':
          return d.getFullYear() === anioFiltro
        default:
          return true
      }
    }

    return {
      filteredDesigns: designs.filter(d => passes(d.createdAt)),
      filteredCotizaciones: cotizaciones.filter(c => passes(c.createdAt)),
    }
  }, [periodo, anioFiltro, designs, cotizaciones])

  const stats = useMemo(() => {
    if (!filteredDesigns.length) return null

    const now = new Date()
    const thisYear = now.getFullYear()
    const thisMonth = now.getMonth()

    // Diseños por mes
    const monthMap = {}
    filteredDesigns.forEach(d => {
      const date = new Date(d.createdAt)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      monthMap[key] = (monthMap[key] || 0) + 1
    })

    let byMonth = []
    if (periodo === 'anio' || periodo === 'anio_custom') {
      const year = periodo === 'anio' ? thisYear : anioFiltro
      byMonth = Array.from({ length: 12 }, (_, i) => {
        const key = `${year}-${String(i + 1).padStart(2, '0')}`
        const label = new Date(year, i, 1).toLocaleDateString('es-ES', { month: 'short' })
        return { label, value: monthMap[key] || 0, key }
      })
    } else if (periodo === 'mes') {
      const key = `${thisYear}-${String(thisMonth + 1).padStart(2, '0')}`
      const label = new Date(thisYear, thisMonth, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
      byMonth = [{ label, value: monthMap[key] || 0, key }]
    } else {
      const months = periodo === '3m' ? 3 : periodo === '6m' ? 6 : 12
      byMonth = Array.from({ length: months }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        const label = d.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' })
        return { label, value: monthMap[key] || 0, key }
      })
    }

    // Tipos de módulos
    const typeCount = {}
    filteredDesigns.forEach(d => {
      ;(d.shapes || []).forEach(s => {
        typeCount[s.type] = (typeCount[s.type] || 0) + 1
      })
    })
    const byType = Object.entries(typeCount)
      .map(([type, count]) => ({ label: MODULE_LABELS[type] || type, type, value: count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7)

    // Módulos
    const totalModules = filteredDesigns.reduce((sum, d) => sum + (d.shapes?.length || 0), 0)
    const avgModules = filteredDesigns.length > 0 ? (totalModules / filteredDesigns.length).toFixed(1) : 0

    // Materiales
    const matCount = {}
    filteredDesigns.forEach(d => {
      ;(d.shapes || []).forEach(s => {
        if (s.materialId) matCount[s.materialId] = (matCount[s.materialId] || 0) + 1
      })
    })
    const byMaterial = Object.entries(matCount)
      .map(([id, count]) => ({ label: materialMap[id]?.nombre || 'Sin nombre', value: count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)

    // Accesorios estimados
    let totalCajones = 0
    let totalPuertas = 0
    filteredDesigns.forEach(d => {
      ;(d.shapes || []).forEach(s => {
        if (s.type === 'cajonera') totalCajones += s.numCajones || 3
        if (s.type === 'puerta')   totalPuertas++
        if (s.type === 'modular')  totalPuertas += s.numPuertas || 0
      })
    })
    const accesorios = [
      { label: 'Correderas', value: totalCajones * 2 },
      { label: 'Tiradores',  value: totalCajones + totalPuertas },
      { label: 'Visagras',   value: totalPuertas * 2 },
    ]

    return { byMonth, byType, avgModules, totalDesigns: filteredDesigns.length, totalShapes: totalModules, byMaterial, accesorios, totalCajones, totalPuertas }
  }, [filteredDesigns, materialMap, periodo, anioFiltro])

  const cotStats = useMemo(() => {
    if (!filteredCotizaciones.length) return null
    const total = filteredCotizaciones.length
    const montoTotal = filteredCotizaciones.reduce((sum, c) => sum + (c.precio_total || 0), 0)
    const promedio = total > 0 ? montoTotal / total : 0
    const estadoCount = { 'Pendiente': 0, 'En Proceso': 0, 'Completado': 0 }
    filteredCotizaciones.forEach(c => {
      if (estadoCount[c.estado] !== undefined) estadoCount[c.estado]++
    })
    const byEstado = Object.entries(estadoCount).map(([estado, value]) => ({ label: estado, estado, value }))
    return { total, montoTotal, promedio, byEstado }
  }, [filteredCotizaciones])

  if (!designs || designs.length === 0) {
    return (
      <div className="stats-panel">
        <div className="stats-empty-state">
          <p>Guarda al menos un diseño para ver estadísticas.</p>
        </div>
      </div>
    )
  }

  const periodoLabel = (() => {
    if (periodo === 'mes') return 'en este mes'
    if (periodo === '3m') return 'en los últimos 3 meses'
    if (periodo === '6m') return 'en los últimos 6 meses'
    if (periodo === 'anio') return `en ${new Date().getFullYear()}`
    if (periodo === 'anio_custom') return `en ${anioFiltro}`
    return ''
  })()

  const noData = filteredDesigns.length === 0

  return (
    <div className="stats-panel">

      {/* Filtro de período */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--color-slate-border)' }}>
        <span style={{ fontSize: '11px', color: 'var(--color-faded-grey)', marginRight: '4px', flexShrink: 0 }}>Período:</span>
        {PERIODOS.map(p => (
          <button
            key={p.key}
            onClick={() => setPeriodo(p.key)}
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              borderRadius: '20px',
              border: periodo === p.key ? '1px solid var(--color-ideation-blue)' : '1px solid var(--color-slate-border)',
              background: periodo === p.key ? 'rgba(78,140,255,0.15)' : 'transparent',
              color: periodo === p.key ? '#6faaff' : 'var(--color-faded-grey)',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {p.label}
          </button>
        ))}
        {periodo === 'anio_custom' && (
          <select
            value={anioFiltro}
            onChange={e => setAnioFiltro(Number(e.target.value))}
            style={{
              background: 'var(--color-ink-black)',
              color: 'var(--color-paper-grey)',
              border: '1px solid var(--color-slate-border)',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            {availableYears.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        )}
      </div>

      {noData ? (
        <div className="stats-empty-state" style={{ paddingTop: '20px' }}>
          <p>Sin datos {periodoLabel}.</p>
          <p style={{ fontSize: '12px', marginTop: '6px', color: 'var(--color-faded-grey)' }}>
            Cambia el período o crea nuevos diseños.
          </p>
        </div>
      ) : (
        <>
          {/* KPIs — diseños */}
          <section className="stats-section">
            <h3 className="stats-section-title">Diseños{periodoLabel ? ` — ${periodoLabel}` : ''}</h3>
            <div className="stats-kpis">
              <div className="stats-kpi">
                <span className="stats-kpi-value">{stats.totalDesigns}</span>
                <span className="stats-kpi-label">Diseños</span>
              </div>
              <div className="stats-kpi">
                <span className="stats-kpi-value">{stats.totalShapes}</span>
                <span className="stats-kpi-label">Módulos totales</span>
              </div>
              <div className="stats-kpi">
                <span className="stats-kpi-value">{stats.avgModules}</span>
                <span className="stats-kpi-label">Módulos por diseño</span>
              </div>
              <div className="stats-kpi">
                <span className="stats-kpi-value">{stats.totalCajones}</span>
                <span className="stats-kpi-label">Cajones</span>
              </div>
              <div className="stats-kpi">
                <span className="stats-kpi-value">{stats.totalPuertas}</span>
                <span className="stats-kpi-label">Puertas</span>
              </div>
            </div>
          </section>

          {/* KPIs — cotizaciones */}
          <section className="stats-section">
            <h3 className="stats-section-title">Cotizaciones{periodoLabel ? ` — ${periodoLabel}` : ''}</h3>
            {cotLoading ? (
              <p className="stats-empty">Cargando…</p>
            ) : cotStats ? (
              <div className="stats-kpis">
                <div className="stats-kpi">
                  <span className="stats-kpi-value">{cotStats.total}</span>
                  <span className="stats-kpi-label">Cotizaciones</span>
                </div>
                <div className="stats-kpi" style={{ gridColumn: 'span 2' }}>
                  <span className="stats-kpi-value" style={{ fontSize: '20px' }}>{clp(cotStats.montoTotal)}</span>
                  <span className="stats-kpi-label">Monto acumulado</span>
                </div>
                <div className="stats-kpi" style={{ gridColumn: 'span 3' }}>
                  <span className="stats-kpi-value" style={{ fontSize: '20px' }}>{clp(cotStats.promedio)}</span>
                  <span className="stats-kpi-label">Precio promedio</span>
                </div>
              </div>
            ) : (
              <p className="stats-empty">Sin cotizaciones {periodoLabel || 'guardadas'}.</p>
            )}
          </section>

          {/* Diseños por mes */}
          <section className="stats-section">
            <h3 className="stats-section-title">Diseños por mes</h3>
            {stats.byMonth.length === 0 || stats.byMonth.every(r => r.value === 0) ? (
              <p className="stats-empty">Sin actividad en el período</p>
            ) : (
              <BarChart data={stats.byMonth} maxValue={Math.max(...stats.byMonth.map(r => r.value), 1)} labelKey="label" valueKey="value" />
            )}
          </section>

          {/* Tipos de módulos */}
          {stats.byType.length > 0 && (
            <section className="stats-section">
              <h3 className="stats-section-title">Tipos de módulos más usados</h3>
              <BarChart
                data={stats.byType}
                maxValue={Math.max(...stats.byType.map(r => r.value), 1)}
                colorFn={row => MODULE_COLORS[row.type] || 'var(--color-ideation-blue)'}
                labelKey="label"
                valueKey="value"
              />
            </section>
          )}

          {/* Cotizaciones por estado */}
          {cotStats && (
            <section className="stats-section">
              <h3 className="stats-section-title">Cotizaciones por estado</h3>
              <BarChart
                data={cotStats.byEstado}
                maxValue={Math.max(...cotStats.byEstado.map(r => r.value), 1)}
                colorFn={row => ESTADO_COLORS[row.estado] || 'var(--color-ideation-blue)'}
                labelKey="label"
                valueKey="value"
              />
            </section>
          )}

          {/* Materiales más usados */}
          {stats.byMaterial.length > 0 && (
            <section className="stats-section">
              <h3 className="stats-section-title">Materiales más utilizados</h3>
              <BarChart data={stats.byMaterial} maxValue={Math.max(...stats.byMaterial.map(r => r.value), 1)} labelKey="label" valueKey="value" unit=" módulos" />
            </section>
          )}

          {/* Estimación accesorios */}
          <section className="stats-section">
            <h3 className="stats-section-title">Estimación de accesorios</h3>
            <BarChart data={stats.accesorios} maxValue={Math.max(...stats.accesorios.map(r => r.value), 1)} labelKey="label" valueKey="value" unit=" uds" />
          </section>
        </>
      )}
    </div>
  )
}
