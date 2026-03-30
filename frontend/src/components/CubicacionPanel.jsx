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

  // Calculate total pieces (sum of all quantities)
  const totalPieces = cubicacionData.allPieces.reduce((sum, piece) => sum + piece.quantity, 0)

  // Consolidate pieces by size (width × height)
  const consolidatedPieces = useMemo(() => {
    const map = new Map() // key: "width×height", value: { width, height, description[], qty, modules[] }
    
    cubicacionData.allPieces.forEach((piece) => {
      const key = `${piece.width}×${piece.height}`
      if (!map.has(key)) {
        map.set(key, {
          width: piece.width,
          height: piece.height,
          descriptions: new Set(),
          quantity: 0,
          modules: new Set(),
        })
      }
      const entry = map.get(key)
      entry.descriptions.add(piece.description)
      entry.quantity += piece.quantity
      entry.modules.add(piece.moduleName)
    })
    
    return Array.from(map.values())
      .sort((a, b) => b.quantity - a.quantity) // Sort by quantity descending
  }, [cubicacionData.allPieces])

  // Calculate hardware requirements
  const hardwareList = useMemo(() => {
    const hardware = {
      tiradores: 0,      // drawer pulls
      visagras: 0,       // hinges
      correderas: 0,     // slides
    }

    shapes.forEach((shape) => {
      switch (shape.type) {
        case 'cajonera': {
          const numCajones = shape.numCajones && shape.numCajones > 0 ? shape.numCajones : 3
          // 1 drawer pull per drawer front (some cajoneras have 2 fronts per drawer)
          hardware.tiradores += numCajones
          // 1 pair of slides (2 units) per drawer
          hardware.correderas += numCajones * 2
          break
        }
        case 'puerta': {
          // 1 handle per door
          hardware.tiradores += 1
          // 2 hinges per door
          hardware.visagras += 2
          break
        }
        case 'modular': {
          const numPuertas = shape.numPuertas !== undefined && shape.numPuertas !== null ? shape.numPuertas : 0
          if (numPuertas > 0) {
            // 1 handle per door
            hardware.tiradores += numPuertas
            // 2 hinges per door
            hardware.visagras += numPuertas * 2
          }
          break
        }
        default:
          break
      }
    })

    return hardware
  }, [shapes])

  // Generate color for each module type - using app palette
  const getModuleColor = (moduleType) => {
    const colors = {
      cajonera: '#FF6B6B',      // Rojo - consistent with app
      modular: '#4ECDC4',       // Teal - lighter accent
      estante: '#4A90E2',       // Azul primario de app
      base: '#45B7D1',          // Azul cielo
      divisor: '#FFA500',       // Naranja
      cubierta: '#9B59B6',      // Púrpura
      puerta: '#FF8C42',        // Naranja oscuro
    }
    return colors[moduleType] || '#7F8C8D'
  }

  return (
    <div className="cubicacion-panel">
      {/* SECTION 1: GROUPED PIECES TABLE */}
      <section className="cubicacion-section cubicacion-pieces">
        <h2>Piezas Agrupadas por Módulo</h2>

        <div className="pieces-table-wrapper">
          <table className="pieces-table">
            <thead>
              <tr>
                <th>Módulo</th>
                <th>Descripción</th>
                <th>Ancho (cm)</th>
                <th>Alto (cm)</th>
                <th>Cantidad</th>
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
                      <td colSpan="5" className="module-name-cell">
                        <span
                          className="module-color-dot"
                          style={{ backgroundColor: getModuleColor(module.type) }}
                        />
                        <strong>{module.name}</strong>
                        <span className="module-type">({module.type})</span>
                        <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
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
        <h2>Visualización de Empaquetamiento en Planchas</h2>

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
        <h2>Resumen</h2>

        {statistics && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Planchas Necesarias</div>
              <div className="stat-value">{statistics.boardsNeeded}</div>
              <div className="stat-detail">de {BOARD_CONFIGS.melamina.width} x {BOARD_CONFIGS.melamina.height} cm</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Cantidad de Piezas</div>
              <div className="stat-value">{totalPieces}</div>
              <div className="stat-detail">piezas totales a cortar</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Utilización Promedio</div>
              <div className="stat-value">{statistics.utilizationPercentage}%</div>
              <div className="stat-detail">
                {(statistics.totalUsedArea / 10000).toFixed(2)} m²
              </div>
            </div>
          </div>
        )}
      </section>

      {/* SECTION 4: CONSOLIDATED PIECES LIST */}
      <section className="cubicacion-section cubicacion-pieces-list">
        <h2>Listado de Piezas General</h2>
        
        <div className="consolidated-pieces-wrapper">
          <table className="consolidated-pieces-table">
            <thead>
              <tr>
                <th>Dimensiones (cm)</th>
                <th>Cantidad</th>
                <th>Descripciones</th>
              </tr>
            </thead>
            <tbody>
              {consolidatedPieces.map((piece, idx) => (
                <tr key={idx}>
                  <td className="dimensions">{piece.width} × {piece.height}</td>
                  <td className="quantity">{piece.quantity}</td>
                  <td className="descriptions">{Array.from(piece.descriptions).join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 5: HARDWARE LIST */}
      <section className="cubicacion-section cubicacion-hardware">
        <h2>Otros materiales</h2>
        
        <div className="hardware-grid">
          <div className="hardware-item">
            <div className="hardware-label">Tiradores</div>
            <div className="hardware-value">{hardwareList.tiradores}</div>
            <div className="hardware-desc">Para puertas y cajones</div>
          </div>

          <div className="hardware-item">
            <div className="hardware-label">Visagras</div>
            <div className="hardware-value">{hardwareList.visagras}</div>
            <div className="hardware-desc">Para puertas (2 por puerta)</div>
          </div>

          <div className="hardware-item">
            <div className="hardware-label">Correderas</div>
            <div className="hardware-value">{hardwareList.correderas}</div>
            <div className="hardware-desc">Para cajones (pares)</div>
          </div>
        </div>
      </section>
    </div>
  )
}

/**
 * BoardVisualization - Renders a single board with packed pieces
 * Uses SVG with intelligent scaling to show pieces proportionally
 *
 * Design: SVG scales board to max 700px, but if pieces are tiny relative to board,
 * we calculate zoom factor based on average piece size to keep them visible
 */
function BoardVisualization({ board, boardConfig, getModuleColor }) {
  // Get all pieces to calculate zoom
  const allPieces = board.shelves.flatMap((shelf) => shelf.pieces)

  // Calculate bounding box of all pieces
  if (allPieces.length === 0) {
    return (
      <div className="board-visualization">
        <p style={{ color: '#aaa' }}>No hay piezas en esta plancha</p>
      </div>
    )
  }

  let minX = Infinity, minY = Infinity, maxX = 0, maxY = 0
  allPieces.forEach((piece) => {
    minX = Math.min(minX, piece.x)
    minY = Math.min(minY, piece.y)
    maxX = Math.max(maxX, piece.x + piece.width)
    maxY = Math.max(maxY, piece.y + piece.height)
  })

  const usedWidth = maxX - minX
  const usedHeight = maxY - minY
  const boardArea = boardConfig.width * boardConfig.height
  const usedArea = usedWidth * usedHeight

  // Zoom factor: if pieces use <30% of board, zoom in to make them visible
  // Base zoom is 1.0 (full board). If they use only 10% space, zoom to ~3.5x
  const occupancyRatio = usedArea / boardArea
  let zoomFactor = 1
  if (occupancyRatio < 0.3) {
    // Inverse: lower occupancy = higher zoom
    // occupancyRatio 0.1 => zoom 3.5
    // occupancyRatio 0.3 => zoom 1.2
    zoomFactor = Math.min(3.5, 1 + (0.3 - occupancyRatio) / 0.08)
  }

  // Now calculate SVG size with zoom
  const maxWidth = 700
  const baseScale = maxWidth / boardConfig.width
  const scale = baseScale * zoomFactor

  const svgWidth = boardConfig.width * scale
  const svgHeight = boardConfig.height * scale

  // Flattened pieces for rendering
  const displayPieces = board.shelves.flatMap((shelf) => shelf.pieces)

  // Calculate board utilization for this specific board
  const boardArea2 = boardConfig.width * boardConfig.height
  const utilization = ((board.usedArea / boardArea2) * 100).toFixed(1)
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

      <div className="board-canvas-wrapper" style={{ maxWidth: `${svgWidth + 20}px` }}>
        <svg
          className="board-canvas"
          viewBox={`0 0 ${boardConfig.width} ${boardConfig.height}`}
          width={svgWidth}
          height={svgHeight}
        >
          {/* Board background - light grid */}
          <defs>
            <pattern id={`grid-${board.id}`} width="100" height="100" patternUnits="userSpaceOnUse">
              <path
                d={`M 100 0 L 0 0 0 100`}
                fill="none"
                stroke="#444a52"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>

          {/* Board base */}
          <rect
            width={boardConfig.width}
            height={boardConfig.height}
            fill="#1b1e22"
            stroke="#2a2d32"
            strokeWidth="2"
          />

          {/* Grid pattern overlay */}
          <rect
            width={boardConfig.width}
            height={boardConfig.height}
            fill={`url(#grid-${board.id})`}
            pointerEvents="none"
          />

          {/* Render each piece */}
          {displayPieces.map((piece, idx) => {
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
                  stroke="#202226"
                  strokeWidth="1.5"
                  opacity="0.9"
                />

                {/* Piece label - dimensions */}
                <text
                  x={x + width / 2}
                  y={y + height / 2 - 3}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="piece-label"
                  fontSize="11"
                  fill="#fff"
                  fontWeight="bold"
                  pointerEvents="none"
                >
                  {`${width}×${height}`}
                </text>

                {/* Module type as subtitle */}
                <text
                  x={x + width / 2}
                  y={y + height / 2 + 10}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="piece-module"
                  fontSize="9"
                  fill="#ccc"
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
            fontSize="9"
            fill="#7F8C8D"
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
