import React, { useMemo, useState } from 'react'
import {
  generateStructuredCuts,
  optimizePiecesInBoards,
  BOARD_CONFIGS,
} from '../services/cubicacion'

/**
 * CubicacionPanel - Complete cutting visualization
 * Shows:
 * 1. Grouped pieces table by module
 * 2. Visual board layout with packed pieces
 * 3. Statistics and summaries
 */
export default function CubicacionPanel({ shapes }) {
  const [selectedModule, setSelectedModule] = useState(null)

  // Process all data: group pieces and optimize board packing
  const cubicacionData = useMemo(() => {
    if (!shapes || shapes.length === 0) {
      return {
        byModule: new Map(),
        allPieces: [],
        boards: [],
        statistics: null,
      }
    }

    const { byModule, allPieces } = generateStructuredCuts(shapes)
    const { boards, statistics } = optimizePiecesInBoards(allPieces)

    return { byModule, allPieces, boards, statistics }
  }, [shapes])

  const { byModule, boards, statistics } = cubicacionData

  if (!shapes || shapes.length === 0) {
    return (
      <div className="cubicacion-panel">
        <p className="empty-message">No hay módulos añadidos. Ve a "Diseño" para crear.</p>
      </div>
    )
  }

  // Generate color for each module type based on hash
  const getModuleColor = (moduleType) => {
    const colors = {
      cajonera: '#FF6B6B',
      modular: '#4ECDC4',
      estante: '#45B7D1',
      base: '#96CEB4',
      divisor: '#FFEAA7',
      cubierta: '#DDA15E',
      puerta: '#BC6C25',
    }
    return colors[moduleType] || '#95A5A6'
  }

  return (
    <div className="cubicacion-panel">
      {/* SECTION 1: GROUPED PIECES TABLE */}
      <section className="cubicacion-section cubicacion-pieces">
        <h2>📋 Piezas Agrupadas por Módulo</h2>

        <div className="pieces-table-wrapper">
          <table className="pieces-table">
            <thead>
              <tr>
                <th>Módulo</th>
                <th>Descripción</th>
                <th>Ancho (cm)</th>
                <th>Alto (cm)</th>
                <th>Cantidad</th>
                <th>Área (cm²)</th>
                <th>Total Área</th>
              </tr>
            </thead>
            <tbody>
              {Array.from(byModule.entries()).map(([moduleId, module]) => {
                const isExpanded = selectedModule === moduleId
                const totalModuleArea = module.pieces.reduce(
                  (sum, piece) => sum + piece.area * piece.quantity,
                  0
                )

                return (
                  <React.Fragment key={moduleId}>
                    {/* Module Header Row - Clickable */}
                    <tr
                      className={`module-header ${isExpanded ? 'expanded' : ''}`}
                      onClick={() =>
                        setSelectedModule(isExpanded ? null : moduleId)
                      }
                    >
                      <td colSpan="7" className="module-name-cell">
                        <span
                          className="module-color-dot"
                          style={{ backgroundColor: getModuleColor(module.type) }}
                        />
                        <strong>{module.name}</strong>
                        <span className="module-type">({module.type})</span>
                        <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
                        <span className="module-total">
                          Área Total: <strong>{totalModuleArea.toLocaleString()}</strong> cm²
                        </span>
                      </td>
                    </tr>

                    {/* Piece Detail Rows - Show when expanded */}
                    {isExpanded &&
                      module.pieces.map((piece, idx) => (
                        <tr key={`${moduleId}-${idx}`} className="piece-detail">
                          <td />
                          <td className="piece-desc">{piece.description}</td>
                          <td className="number">{piece.width}</td>
                          <td className="number">{piece.height}</td>
                          <td className="number">{piece.quantity}</td>
                          <td className="number">{piece.area.toLocaleString()}</td>
                          <td className="number">
                            <strong>
                              {(piece.area * piece.quantity).toLocaleString()}
                            </strong>
                          </td>
                        </tr>
                      ))}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 2: BOARD VISUALIZATION */}
      <section className="cubicacion-section cubicacion-boards">
        <h2>📦 Visualización de Empaquetamiento en Planchas</h2>

        <div className="boards-container">
          {boards.map((board) => (
            <BoardVisualization
              key={board.id}
              board={board}
              boardConfig={BOARD_CONFIGS.melamina}
              getModuleColor={getModuleColor}
            />
          ))}
        </div>
      </section>

      {/* SECTION 3: STATISTICS */}
      <section className="cubicacion-section cubicacion-stats">
        <h2>📊 Resumen</h2>

        {statistics && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Planchas Necesarias</div>
              <div className="stat-value">{statistics.boardsNeeded}</div>
              <div className="stat-detail">de {BOARD_CONFIGS.melamina.width} x {BOARD_CONFIGS.melamina.height} cm</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Utilización Promedio</div>
              <div className="stat-value">{statistics.utilizationPercentage}%</div>
              <div className="stat-detail">
                {(statistics.totalUsedArea / 10000).toFixed(2)} m²
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Desperdicio Promedio</div>
              <div className="stat-value">{statistics.wastePercentage}%</div>
              <div className="stat-detail">
                {(statistics.wasteArea / 10000).toFixed(2)} m²
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Área Total Usada</div>
              <div className="stat-value">{(statistics.totalUsedArea / 10000).toFixed(2)}</div>
              <div className="stat-detail">m²</div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

/**
 * BoardVisualization - Renders a single board with packed pieces
 * Uses SVG for clean, scalable rendering
 *
 * Design Decision: SVG vs Canvas
 * - SVG: Scales perfectly, easier to debug with inspector, native text rendering
 * - Canvas: Faster for 100+ items, but harder to style
 * CHOSEN: SVG (typically <50 pieces per board, scaling is critical for responsiveness)
 */
function BoardVisualization({ board, boardConfig, getModuleColor }) {
  // Scale board to fit screen: max width 700px, maintain aspect ratio
  const maxWidth = 700
  const scaleX = maxWidth / boardConfig.width
  const scaleY = scaleX // Maintain aspect ratio

  const svgWidth = boardConfig.width * scaleX
  const svgHeight = boardConfig.height * scaleY

  // Flatten all pieces from shelves for rendering
  const allPieces = board.shelves.flatMap((shelf) => shelf.pieces)

  // Calculate board utilization for this specific board
  const boardArea = boardConfig.width * boardConfig.height
  const utilization = ((board.usedArea / boardArea) * 100).toFixed(1)
  const waste = (100 - utilization).toFixed(1)

  return (
    <div className="board-visualization">
      <div className="board-header">
        <h3>Plancha #{board.id}</h3>
        <div className="board-stats">
          <span className="board-stat">
            Utilización: <strong>{utilization}%</strong>
          </span>
          <span className="board-stat">
            Desperdicio: <strong>{waste}%</strong>
          </span>
        </div>
      </div>

      <div className="board-canvas-wrapper">
        <svg
          className="board-canvas"
          viewBox={`0 0 ${boardConfig.width} ${boardConfig.height}`}
          width={svgWidth}
          height={svgHeight}
        >
          {/* Board background - light grid */}
          <defs>
            <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
              <path
                d={`M 100 0 L 0 0 0 100`}
                fill="none"
                stroke="#E0E0E0"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>

          <rect
            width={boardConfig.width}
            height={boardConfig.height}
            fill="url(#grid)"
            stroke="#999"
            strokeWidth="2"
          />

          {/* Render each piece */}
          {allPieces.map((piece, idx) => {
            const color = getModuleColor(piece.moduleType)
            const x = piece.x
            const y = piece.y
            const width = piece.width
            const height = piece.height

            return (
              <g key={idx} className="piece-group">
                {/* Piece rectangle */}
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  fill={color}
                  stroke="#333"
                  strokeWidth="1"
                  opacity="0.85"
                />

                {/* Piece label - abbreviated to avoid overlap */}
                <text
                  x={x + width / 2}
                  y={y + height / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="piece-label"
                  fontSize="10"
                  fill="#000"
                  fontWeight="bold"
                  pointerEvents="none"
                >
                  {`${width}×${height}`}
                </text>

                {/* Module type as subtitle */}
                <text
                  x={x + width / 2}
                  y={y + height / 2 + 8}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="piece-module"
                  fontSize="8"
                  fill="#555"
                  pointerEvents="none"
                >
                  {piece.description}
                </text>
              </g>
            )
          })}

          {/* Board dimensions label */}
          <text
            x={boardConfig.width - 5}
            y={boardConfig.height - 5}
            textAnchor="end"
            dominantBaseline="hanging"
            fontSize="8"
            fill="#999"
            pointerEvents="none"
          >
            {boardConfig.width} × {boardConfig.height} cm
          </text>
        </svg>
      </div>

      {/* Piece legend for this board */}
      <div className="board-legend">
        <div className="legend-title">Piezas en esta plancha:</div>
        <div className="legend-items">
          {board.shelves.map((shelf, shelfIdx) =>
            shelf.pieces.map((piece, pieceIdx) => (
              <div key={`${shelfIdx}-${pieceIdx}`} className="legend-item">
                <span
                  className="legend-color"
                  style={{ backgroundColor: getModuleColor(piece.moduleType) }}
                />
                <span className="legend-text">
                  {piece.description} ({piece.width}×{piece.height} cm)
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
