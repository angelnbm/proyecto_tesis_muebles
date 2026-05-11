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
export default function CubicacionPanel({ shapes, exportStageImage, selectedMaterial }) {
  const [selectedModule, setSelectedModule] = useState(null)
  const [emailForm, setEmailForm] = useState({
    nombre_cliente: '',
    to_email: '',
    nombre_proyecto: '',
    precio_total: '',
    nombre_empresa: '',
  })
  const [isSending, setIsSending] = useState(false)
  const [emailStatus, setEmailStatus] = useState({ type: null, message: '' })
  const [previewImage, setPreviewImage] = useState(null)

  const emailServiceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_1rqf0vo'
  const emailTemplateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_egzw8fd'
  const emailPublicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'S1uLBrr9Cn3CVH4Nq'

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

    try {
    const { byModule, allPieces } = generateStructuredCuts(shapes)
    
    const { boards, statistics } = optimizePiecesInBoards(allPieces)

      return { byModule, allPieces, boards, statistics }
    } catch (error) {
      console.error('❌ Error in cubicacionData:', error)
      return {
        byModule: new Map(),
        allPieces: [],
        boards: [],
        statistics: null,
      }
    }
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

  const boardArea = BOARD_CONFIGS.melamina.width * BOARD_CONFIGS.melamina.height
  const boardsCost = useMemo(() => {
    if (!selectedMaterial || !boards || boards.length === 0) return null
    const unitPrice = Number(selectedMaterial.precio)
    if (Number.isNaN(unitPrice)) return null
    return unitPrice * boards.length
  }, [selectedMaterial, boards])
  const boardsSummary = useMemo(() => {
    if (!boards || boards.length === 0) return 'Sin planchas calculadas'

    return boards
      .map((board) => {
        const percent = boardArea > 0
          ? ((board.usedArea / boardArea) * 100).toFixed(1)
          : '0.0'
        const waste = (100 - Number(percent)).toFixed(1)
        return `Plancha #${board.id}: ${percent}% uso / ${waste}% desperdicio`
      })
      .join('\n')
  }, [boards, boardArea])

  const extrasSummary = useMemo(() => (
    `Tiradores: ${hardwareList.tiradores}\n` +
    `Visagras: ${hardwareList.visagras}\n` +
    `Correderas: ${hardwareList.correderas}`
  ), [hardwareList])

  const handleEmailFieldChange = (field) => (event) => {
    setEmailForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleSendEmail = async (event) => {
    event.preventDefault()
    setEmailStatus({ type: null, message: '' })

    const imageDataUrl = exportStageImage ? exportStageImage() : null
    setPreviewImage(imageDataUrl)

    if (!boards || boards.length === 0) {
      setEmailStatus({
        type: 'error',
        message: 'No hay planchas calculadas para enviar la cotización.',
      })
      return
    }

    if (!emailForm.to_email.trim()) {
      setEmailStatus({
        type: 'error',
        message: 'Ingresá el correo de destino.',
      })
      return
    }

    if (!emailForm.nombre_cliente.trim() || !emailForm.nombre_proyecto.trim()) {
      setEmailStatus({
        type: 'error',
        message: 'Completá el nombre del cliente y del proyecto.',
      })
      return
    }

    setIsSending(true)

    try {
      const imageBase64 = imageDataUrl ? imageDataUrl.split(',')[1] : ''
      const templateParams = {
        nombre_cliente: emailForm.nombre_cliente.trim(),
        to_email: emailForm.to_email.trim(),
        reply_to: emailForm.to_email.trim(),
        from_name: emailForm.nombre_empresa.trim() || emailForm.nombre_cliente.trim(),
        nombre_proyecto: emailForm.nombre_proyecto.trim(),
        precio_total: emailForm.precio_total.trim() || 'Sin definir',
        nombre_empresa: emailForm.nombre_empresa.trim() || 'Sin definir',
        planchas_resumen: boardsSummary,
        extras_resumen: extrasSummary,
        imagen_base64: imageBase64 || '',
        imagen_data_url: imageDataUrl || '',
        material_nombre: selectedMaterial?.nombre || 'Sin material seleccionado',
        material_precio: selectedMaterial?.precio != null ? `$ ${Number(selectedMaterial.precio).toFixed(2)}` : 'Sin definir',
        planchas_total: boards?.length || 0,
      }

      if (!window.emailjs) {
        throw new Error('EmailJS no está disponible. Revisá el script en index.html')
      }

      if (!templateParams.imagen_base64) {
        throw new Error('No se pudo generar la imagen del diseño. Volvé a la pestaña Diseño y probá de nuevo.')
      }

      window.emailjs.init(emailPublicKey)
      await window.emailjs.send(emailServiceId, emailTemplateId, templateParams)

      setEmailStatus({
        type: 'success',
        message: 'Cotización enviada correctamente.',
      })
    } catch (error) {
      const errorMessage = error?.text || error?.message || 'No se pudo enviar la cotización.'
      setEmailStatus({
        type: 'error',
        message: `${errorMessage} Revisá el template y los campos requeridos en EmailJS.`,
      })
    } finally {
      setIsSending(false)
    }
  }

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
            <div className="stat-card">
              <div className="stat-label">Costo de planchas</div>
              <div className="stat-value">
                {boardsCost !== null ? `$ ${boardsCost.toFixed(2)}` : 'Sin material seleccionado'}
              </div>
              {selectedMaterial && (
                <div className="stat-detail">
                  {selectedMaterial.nombre} · ${Number(selectedMaterial.precio).toFixed(2)} c/u
                </div>
              )}
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

      {/* SECTION 5: COTIZACION EMAILJS */}
      <section className="cubicacion-section cubicacion-email">
        <h2>Enviar cotización por Email</h2>

        <form className="emailjs-form" onSubmit={handleSendEmail}>
          <div className="emailjs-grid">
            <div className="emailjs-field">
              <label>Nombre del cliente</label>
              <input
                type="text"
                value={emailForm.nombre_cliente}
                onChange={handleEmailFieldChange('nombre_cliente')}
                placeholder="Juan Pérez"
                required
              />
            </div>

            <div className="emailjs-field">
              <label>Correo de destino</label>
              <input
                type="email"
                value={emailForm.to_email}
                onChange={handleEmailFieldChange('to_email')}
                placeholder="cliente@email.com"
                required
              />
            </div>

            <div className="emailjs-field">
              <label>Nombre del proyecto</label>
              <input
                type="text"
                value={emailForm.nombre_proyecto}
                onChange={handleEmailFieldChange('nombre_proyecto')}
                placeholder="Cocina integral"
                required
              />
            </div>

            <div className="emailjs-field">
              <label>Precio total</label>
              <input
                type="text"
                value={emailForm.precio_total}
                onChange={handleEmailFieldChange('precio_total')}
                placeholder="$ 0,00"
              />
            </div>

            <div className="emailjs-field">
              <label>Nombre de la empresa</label>
              <input
                type="text"
                value={emailForm.nombre_empresa}
                onChange={handleEmailFieldChange('nombre_empresa')}
                placeholder="Muebles S.A."
              />
            </div>
          </div>

          <div className="emailjs-summary">
            <h4>Planchas a utilizar</h4>
            <pre>{boardsSummary}</pre>
            <h4>Extras</h4>
            <pre>{extrasSummary}</pre>
            {selectedMaterial && (
              <>
                <h4>Material seleccionado</h4>
                <p>{selectedMaterial.nombre} · ${Number(selectedMaterial.precio).toFixed(2)} c/u</p>
              </>
            )}
            <h4>Imagen del diseño</h4>
            {previewImage ? (
              <img
                src={previewImage}
                alt="Diseño"
                style={{ width: '100%', height: 'auto', borderRadius: '6px', marginTop: '8px' }}
              />
            ) : (
              <p></p>
            )}
          </div>

          {emailStatus.message && (
            <div className={`emailjs-status ${emailStatus.type}`}>
              {emailStatus.message}
            </div>
          )}

          <button type="submit" disabled={isSending}>
            {isSending ? 'Enviando...' : 'Enviar cotización'}
          </button>
        </form>
      </section>

      {/* SECTION 6: HARDWARE LIST */}
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
  // Get all pieces - handle both old structure (board.shelves) and new Guillotine (board.pieces)
  const allPieces = board.pieces || (board.shelves ? board.shelves.flatMap((shelf) => shelf.pieces) : [])

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
  const displayPieces = board.pieces || (board.shelves ? board.shelves.flatMap((shelf) => shelf.pieces) : [])

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
          {(board.pieces || (board.shelves ? board.shelves.flatMap((shelf) => shelf.pieces) : [])).map((piece, pieceIdx) => (
            <div key={pieceIdx} className="legend-item">
              <span
                className="legend-color"
                style={{ backgroundColor: getModuleColor(piece.moduleType) }}
              />
              <span className="legend-text">
                {piece.description} ({piece.width}×{piece.height} cm)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
