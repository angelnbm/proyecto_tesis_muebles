import React, { useMemo } from 'react'

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

export default function StatsPanel({ designs }) {
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

    // Totales para KPIs
    const totalDesigns = designs.length
    const totalShapes  = totalModules

    return { byMonth, byType, avgModules, totalDesigns, totalShapes }
  }, [designs])

  if (!designs || designs.length === 0) {
    return (
      <div className="stats-panel">
        <div className="stats-empty-state">
          <p>Guarda al menos un diseño para ver estadísticas.</p>
        </div>
      </div>
    )
  }

  const maxMonth = Math.max(...stats.byMonth.map(r => r.value), 1)
  const maxType  = Math.max(...stats.byType.map(r => r.value), 1)

  return (
    <div className="stats-panel">

      {/* KPIs */}
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
      </div>

      {/* Diseños por mes */}
      <section className="stats-section">
        <h3 className="stats-section-title">Diseños creados por mes</h3>
        {stats.byMonth.length === 0 ? (
          <p className="stats-empty">Sin datos de los últimos 6 meses</p>
        ) : (
          <BarChart
            data={stats.byMonth}
            maxValue={maxMonth}
            labelKey="label"
            valueKey="value"
          />
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

    </div>
  )
}
