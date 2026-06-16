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

  useEffect(() => {
    listCotizaciones()
      .then(data => setCotizaciones(Array.isArray(data) ? data : []))
      .catch(() => setCotizaciones([]))
      .finally(() => setCotLoading(false))
  }, [])

  const materialMap = useMemo(() => {
    return materials.reduce((acc, m) => { acc[m._id] = m; return acc }, {})
  }, [materials])

  const stats = useMemo(() => {
    if (!designs || designs.length === 0) return null

    // 1. Diseños por mes (últimos 6 meses)
    const monthMap = {}
    designs.forEach(d => {
      const date = new Date(d.createdAt)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      monthMap[key] = (monthMap[key] || 0) + 1
    })
    const sortedMonths = Object.keys(monthMap).sort()
    const last6 = sortedMonths.slice(-6)
    const byMonth = last6.map(key => {
      const [year, month] = key.split('-')
      const label = new Date(Number(year), Number(month) - 1, 1)
        .toLocaleDateString('es-ES', { month: 'short', year: '2-digit' })
      return { label, value: monthMap[key], key }
    })

    // 2. Tipos de módulos más usados
    const typeCount = {}
    designs.forEach(d => {
      (d.shapes || []).forEach(s => {
        typeCount[s.type] = (typeCount[s.type] || 0) + 1
      })
    })
    const byType = Object.entries(typeCount)
      .map(([type, count]) => ({ label: MODULE_LABELS[type] || type, type, value: count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7)

    // 3. Promedio de módulos por diseño
    const totalModules = designs.reduce((sum, d) => sum + (d.shapes?.length || 0), 0)
    const avgModules = designs.length > 0 ? (totalModules / designs.length).toFixed(1) : 0

    // 4. Materiales más utilizados
    const matCount = {}
    designs.forEach(d => {
      (d.shapes || []).forEach(s => {
        if (s.materialId) matCount[s.materialId] = (matCount[s.materialId] || 0) + 1
      })
    })
    const byMaterial = Object.entries(matCount)
      .map(([id, count]) => ({ label: materialMap[id]?.nombre || 'Sin nombre', value: count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)

    // 5. Estimación de accesorios
    let totalCajones = 0
    let totalPuertas = 0
    designs.forEach(d => {
      (d.shapes || []).forEach(s => {
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

    return { byMonth, byType, avgModules, totalDesigns: designs.length, totalShapes: totalModules, byMaterial, accesorios, totalCajones, totalPuertas }
  }, [designs, materialMap])

  const cotStats = useMemo(() => {
    if (!cotizaciones.length) return null

    const total = cotizaciones.length
    const montoTotal = cotizaciones.reduce((sum, c) => sum + (c.precio_total || 0), 0)
    const promedio = total > 0 ? montoTotal / total : 0

    const estadoCount = { 'Pendiente': 0, 'En Proceso': 0, 'Completado': 0 }
    cotizaciones.forEach(c => {
      if (estadoCount[c.estado] !== undefined) estadoCount[c.estado]++
    })
    const byEstado = Object.entries(estadoCount).map(([estado, value]) => ({ label: estado, estado, value }))

    return { total, montoTotal, promedio, byEstado }
  }, [cotizaciones])

  if (!designs || designs.length === 0) {
    return (
      <div className="stats-panel">
        <div className="stats-empty-state">
          <p>Guarda al menos un diseño para ver estadísticas.</p>
        </div>
      </div>
    )
  }

  const maxMonth    = Math.max(...stats.byMonth.map(r => r.value), 1)
  const maxType     = Math.max(...stats.byType.map(r => r.value), 1)
  const maxMaterial = Math.max(...stats.byMaterial.map(r => r.value), 1)
  const maxAcc      = Math.max(...stats.accesorios.map(r => r.value), 1)
  const maxEstado   = cotStats ? Math.max(...cotStats.byEstado.map(r => r.value), 1) : 1

  return (
    <div className="stats-panel">

      {/* KPIs — diseños */}
      <section className="stats-section">
        <h3 className="stats-section-title">Diseños</h3>
        <div className="stats-kpis">
          <div className="stats-kpi">
            <span className="stats-kpi-value">{stats.totalDesigns}</span>
            <span className="stats-kpi-label">Diseños totales</span>
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
            <span className="stats-kpi-label">Cajones totales</span>
          </div>
          <div className="stats-kpi">
            <span className="stats-kpi-value">{stats.totalPuertas}</span>
            <span className="stats-kpi-label">Puertas totales</span>
          </div>
        </div>
      </section>

      {/* KPIs — cotizaciones */}
      <section className="stats-section">
        <h3 className="stats-section-title">Cotizaciones</h3>
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
              <span className="stats-kpi-label">Precio promedio por cotización</span>
            </div>
          </div>
        ) : (
          <p className="stats-empty">Sin cotizaciones guardadas aún.</p>
        )}
      </section>

      {/* Diseños por mes */}
      <section className="stats-section">
        <h3 className="stats-section-title">Diseños creados por mes</h3>
        {stats.byMonth.length === 0 ? (
          <p className="stats-empty">Sin datos de los últimos 6 meses</p>
        ) : (
          <BarChart data={stats.byMonth} maxValue={maxMonth} labelKey="label" valueKey="value" />
        )}
      </section>

      {/* Tipos de módulos */}
      <section className="stats-section">
        <h3 className="stats-section-title">Tipos de módulos más usados</h3>
        <BarChart
          data={stats.byType}
          maxValue={maxType}
          colorFn={row => MODULE_COLORS[row.type] || 'var(--color-ideation-blue)'}
          labelKey="label"
          valueKey="value"
        />
      </section>

      {/* Cotizaciones por estado */}
      {cotStats && (
        <section className="stats-section">
          <h3 className="stats-section-title">Cotizaciones por estado</h3>
          <BarChart
            data={cotStats.byEstado}
            maxValue={maxEstado}
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
          <BarChart data={stats.byMaterial} maxValue={maxMaterial} labelKey="label" valueKey="value" unit=" módulos" />
        </section>
      )}

      {/* Estimación accesorios */}
      <section className="stats-section">
        <h3 className="stats-section-title">Estimación de accesorios (acumulado)</h3>
        <BarChart data={stats.accesorios} maxValue={maxAcc} labelKey="label" valueKey="value" unit=" uds" />
      </section>

    </div>
  )
}
