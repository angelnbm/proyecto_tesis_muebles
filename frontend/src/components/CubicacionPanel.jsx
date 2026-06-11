import React, { useMemo, useState, useEffect } from 'react'
import {
  generateStructuredCuts,
  optimizePiecesInBoards,
} from '../services/cubicacion'
import { parseBoardConfig } from '../services/boardUtils'

const clp = (n) => `$ ${Math.round(n).toLocaleString('es-CL')}`

export default function CubicacionPanel({ shapes, exportStageImage, selectedMaterial, drawerTypes, tapaCantos, materials, accessories, selectedAccessories, currentDesignName, selectedTapaCantoId, selectedDrawerTypeId }) {
  const [selectedModule, setSelectedModule] = useState(null)
  const [emailForm, setEmailForm] = useState({
    nombre_cliente: '',
    to_email: '',
    nombre_proyecto: currentDesignName || '',
  })
  const [isSending, setIsSending] = useState(false)
  const [emailStatus, setEmailStatus] = useState({ type: null, message: '' })
  const [previewImage, setPreviewImage] = useState(null)

  const emailServiceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_1rqf0vo'
  const emailTemplateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_egzw8fd'
  const emailPublicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'S1uLBrr9Cn3CVH4Nq'

  const boardConfig = useMemo(() => parseBoardConfig(selectedMaterial), [selectedMaterial])

  // Process all data: group pieces and optimize board packing
  const cubicacionData = useMemo(() => {
    const empty = { byModule: new Map(), allPieces: [], boards: [], boardGroups: [], statistics: null, tapaCantoList: [] }
    if (!shapes || shapes.length === 0) return empty

    try {
      const { byModule, allPieces, tapaCantoList } = generateStructuredCuts(shapes, { drawerTypes, tapaCantos, selectedTapaCantoId, selectedDrawerTypeId })

      // Separar piezas por material: cada material usa su propia plancha con sus medidas.
      // Si una pieza tiene materialId === selectedMaterial._id va al pool por defecto
      // (ej: partes de cajón cuyo tipo de cajón apunta al mismo material general).
      const defaultMatId = selectedMaterial?._id
      const piecesByMat = new Map()
      allPieces.forEach(piece => {
        const key = (!piece.materialId || piece.materialId === defaultMatId) ? '__default__' : piece.materialId
        if (!piecesByMat.has(key)) piecesByMat.set(key, [])
        piecesByMat.get(key).push(piece)
      })

      // El material principal va primero, luego los materiales de fondo/etc.
      const orderedKeys = ['__default__', ...Array.from(piecesByMat.keys()).filter(k => k !== '__default__')]

      const boardGroups = []
      const allBoards = []
      let totalUsedArea = 0
      let totalBoardArea = 0

      orderedKeys.forEach(key => {
        if (!piecesByMat.has(key)) return
        const pieces = piecesByMat.get(key)
        const isDefault = key === '__default__'
        const material = isDefault
          ? selectedMaterial
          : (Array.isArray(materials) ? materials.find(m => m._id === key) ?? null : null)
        const config = parseBoardConfig(material)
        const { boards, statistics } = optimizePiecesInBoards(pieces, config)

        boardGroups.push({ materialId: isDefault ? null : key, materialName: material?.nombre || 'Material', material, boards, statistics, config })
        allBoards.push(...boards)
        totalUsedArea += statistics.totalUsedArea
        totalBoardArea += statistics.totalBoardArea
      })

      const statistics = totalBoardArea > 0 ? {
        boardsNeeded: allBoards.length,
        totalUsedArea,
        totalBoardArea,
        utilizationPercentage: Math.round(totalUsedArea / totalBoardArea * 1000) / 10,
        wastePercentage: Math.round((1 - totalUsedArea / totalBoardArea) * 1000) / 10,
      } : null

      return { byModule, allPieces, boards: allBoards, boardGroups, statistics, tapaCantoList }
    } catch (error) {
      console.error('❌ Error in cubicacionData:', error)
      return empty
    }
  }, [shapes, drawerTypes, tapaCantos, selectedTapaCantoId, selectedDrawerTypeId, selectedMaterial, materials])

  const { byModule, boards, boardGroups, statistics, tapaCantoList = [] } = cubicacionData


  if (!shapes || shapes.length === 0) {
    return (
      <div className="cubicacion-panel">
        <p className="empty-message">No hay módulos añadidos. Ve a "Diseño" para crear.</p>
      </div>
    )
  }

  // Calculate total pieces (sum of all quantities)
  const totalPieces = cubicacionData.allPieces.reduce((sum, piece) => sum + piece.quantity, 0)

  const materialMap = useMemo(() => {
    const list = Array.isArray(materials) ? materials : []
    return list.reduce((acc, item) => {
      acc[item._id] = item
      return acc
    }, {})
  }, [materials])

  // Consolidate pieces by size (width × height)
  const consolidatedPieces = useMemo(() => {
    const map = new Map() // key: "material|width×height", value: { width, height, materialId, materialName, description[], qty, modules[] }
    
    cubicacionData.allPieces.forEach((piece) => {
      const materialId = piece.materialId || 'sin-material'
      const key = `${materialId}|${piece.width}×${piece.height}`
      if (!map.has(key)) {
        map.set(key, {
          width: piece.width,
          height: piece.height,
          materialId: piece.materialId || null,
          materialName: piece.materialId ? (materialMap[piece.materialId]?.nombre || 'Sin material') : null,
          descriptions: new Set(),
          quantity: 0,
          modules: new Set(),
        })
      }
      const entry = map.get(key)
      if (!entry.materialName && piece.materialId) {
        entry.materialName = materialMap[piece.materialId]?.nombre || 'Sin material'
      }
      entry.descriptions.add(piece.description)
      entry.quantity += piece.quantity
      entry.modules.add(piece.moduleName)
    })
    
    return Array.from(map.values())
      .sort((a, b) => b.quantity - a.quantity) // Sort by quantity descending
  }, [cubicacionData.allPieces, materialMap])

  // Accesorios seleccionados con auto-cálculo de cantidades
  const hardwareList = useMemo(() => {
    if (!selectedAccessories || selectedAccessories.length === 0) {
      return {}
    }

    // Contar puertas y cajones de todos los módulos
    let totalPuertas = 0
    let totalCajones = 0
    shapes.forEach((shape) => {
      if (shape.type === 'puerta') totalPuertas++
      if (shape.type === 'cajonera') {
        totalCajones += shape.numCajones || 3
      }
      if (shape.type === 'modular') {
        totalPuertas += shape.numPuertas || 0
      }
    })

    const accessoryMap = {}
    if (Array.isArray(accessories)) {
      accessories.forEach(a => { accessoryMap[a._id] = a })
    }

    const result = {}
    selectedAccessories.forEach(({ materialId, quantity }) => {
      const acc = accessoryMap[materialId]
      if (!acc) return

      // Auto-cálculo según tipo de accesorio
      let autoQty = 0
      if (acc.accesorio_tipo === 'tirador') {
        autoQty = totalPuertas + totalCajones
      } else if (acc.accesorio_tipo === 'corredera') {
        autoQty = totalCajones * 2
      } else if (acc.accesorio_tipo === 'visagra') {
        autoQty = totalPuertas * 2
      }

      // Usar cantidad manual si el usuario la seteó, sino auto-cálculo
      const finalQty = quantity > 0 ? quantity : autoQty
      if (finalQty > 0) {
        result[materialId] = {
          nombre: acc.nombre,
          color: acc.color || '',
          precio: acc.precio,
          cantidad: finalQty,
          total: acc.precio * finalQty,
          accesorio_tipo: acc.accesorio_tipo || '',
        }
      }
    })
    return result
  }, [selectedAccessories, accessories, shapes])

  const boardsCost = useMemo(() => {
    if (!boardGroups || boardGroups.length === 0) return null
    let total = 0
    let hasPrice = false
    boardGroups.forEach(group => {
      if (!group.material || !group.boards.length) return
      const price = Number(group.material.precio)
      if (!Number.isNaN(price)) {
        total += price * group.boards.length
        hasPrice = true
      }
    })
    return hasPrice ? total : null
  }, [boardGroups])

  // Costo total: planchas + accesorios + tapa-canto
  const totalCost = useMemo(() => {
    let total = 0
    if (boardsCost) total += boardsCost
    Object.values(hardwareList).forEach(item => { total += item.total })
    tapaCantoList.forEach(item => { total += item.totalCost })
    return total
  }, [boardsCost, hardwareList, tapaCantoList])

  // Auto-poblar nombre del proyecto cuando cambia el diseño activo
  useEffect(() => {
    setEmailForm(prev => ({
      ...prev,
      nombre_proyecto: currentDesignName || prev.nombre_proyecto,
    }))
  }, [currentDesignName])

  const boardsSummary = useMemo(() => {
    if (!boardGroups || boardGroups.length === 0) return 'Sin planchas calculadas'
    return boardGroups
      .filter(g => g.boards.length > 0)
      .map(g => {
        const colorStr = g.material?.color ? ` (${g.material.color})` : ''
        return `${g.boards.length} plancha${g.boards.length > 1 ? 's' : ''} de ${g.materialName}${colorStr} (${g.config.width}×${g.config.height}cm)`
      })
      .join('\n') || 'Sin planchas calculadas'
  }, [boardGroups])

  const extrasSummary = useMemo(() => {
    let parts = []

    const accEntries = Object.entries(hardwareList)
    if (accEntries.length > 0) {
      parts.push('Accesorios:')
      accEntries.forEach(([id, item]) => {
        parts.push(`  ${item.nombre}${item.color ? ` (${item.color})` : ''}: ${item.cantidad} u x ${clp(item.precio)}/u = ${clp(item.total)}`)
      })
    }

    if (tapaCantoList.length > 0) {
      parts.push('Tapa canto:')
      tapaCantoList.forEach((item) => {
        parts.push(`  ${item.materialName}${item.color ? ` (${item.color})` : ''}: ${item.linealMeters.toFixed(2)}m x ${clp(item.precio)}/m = ${clp(item.totalCost)}`)
      })
    }

    return parts.join('\n') || 'Sin accesorios seleccionados'
  }, [hardwareList, tapaCantoList])

  const handleEmailFieldChange = (field) => (event) => {
    setEmailForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  // Comprime un dataUrl hasta que su base64 quepa en maxChars.
  // Reduce la escala primero, luego la calidad JPEG, iterando hasta encajar.
  const compressImageToFit = (dataUrl, maxChars = 40000) => new Promise((resolve) => {
    if (!dataUrl) { resolve(''); return }
    const raw = dataUrl.split(',')[1] || ''
    if (raw.length <= maxChars) { resolve(raw); return }

    const img = new Image()
    img.onload = () => {
      // Factor de escala inicial basado en cuánto hay que reducir (más conservador)
      const ratio = Math.min(1, Math.sqrt(maxChars / raw.length) * 0.85)
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.floor(img.width * ratio))
      canvas.height = Math.max(1, Math.floor(img.height * ratio))
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // Reducir calidad hasta encajar
      let quality = 0.7
      let b64 = canvas.toDataURL('image/jpeg', quality).split(',')[1]
      while (b64.length > maxChars && quality > 0.15) {
        quality = Math.round((quality - 0.1) * 10) / 10
        b64 = canvas.toDataURL('image/jpeg', quality).split(',')[1]
      }
      resolve(b64)
    }
    img.onerror = () => resolve(raw.length <= maxChars ? raw : '')
    img.src = dataUrl
  })

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

    if (!emailForm.nombre_cliente.trim()) {
      setEmailStatus({
        type: 'error',
        message: 'Completá el nombre del cliente.',
      })
      return
    }

    setIsSending(true)

    try {
      // Comprimir imagen adaptativamente para no superar el límite de 50KB de EmailJS
      const imageBase64 = await compressImageToFit(imageDataUrl, 40000)

      const templateParams = {
        nombre_cliente: emailForm.nombre_cliente.trim(),
        to_email: emailForm.to_email.trim(),
        reply_to: emailForm.to_email.trim(),
        from_name: emailForm.nombre_cliente.trim(),
        nombre_proyecto: emailForm.nombre_proyecto.trim(),
        precio_total: totalCost > 0 ? clp(totalCost) : 'Sin calcular',
        planchas_resumen: boardsSummary,
        extras_resumen: extrasSummary,
        imagen_base64: imageBase64 || '',
        material_nombre: selectedMaterial?.nombre || 'Sin material seleccionado',
        material_precio: selectedMaterial?.precio != null ? clp(selectedMaterial.precio) : 'Sin definir',
        planchas_total: boards?.length || 0,
        nombre_empresa: 'Tablón',
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
          {boardGroups.filter(g => g.boards.length > 0).map((group, gIdx) => (
            <React.Fragment key={gIdx}>
              {boardGroups.filter(g => g.boards.length > 0).length > 1 && (
                <p style={{ color: 'var(--color-faded-grey)', fontSize: '11px', fontWeight: 600, margin: '12px 0 4px', letterSpacing: '0.06em', textTransform: 'uppercase', gridColumn: '1 / -1' }}>
                  {group.materialName}{group.material?.color ? ` (${group.material.color})` : ''} — plancha {group.config.width}×{group.config.height}cm
                </p>
              )}
              {group.boards.map((board) => (
                <BoardVisualization
                  key={`${gIdx}-${board.id}`}
                  board={board}
                  boardConfig={group.config}
                  getModuleColor={getModuleColor}
                />
              ))}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* SECTION 3: CONSOLIDATED PIECES LIST */}
      <section className="cubicacion-section cubicacion-pieces-list">
        <h2>Listado de Piezas General</h2>

        <div className="consolidated-pieces-wrapper">
          <table className="consolidated-pieces-table">
            <thead>
              <tr>
                <th>Dimensiones (cm)</th>
                <th>Cantidad</th>
                <th>Material</th>
                <th>Descripciones</th>
              </tr>
            </thead>
            <tbody>
              {consolidatedPieces.map((piece, idx) => (
                <tr key={idx}>
                  <td className="dimensions">{piece.width} × {piece.height}</td>
                  <td className="quantity">{piece.quantity}</td>
                  <td className="material">{piece.materialName || '-'}</td>
                  <td className="descriptions">{Array.from(piece.descriptions).join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 4: ACCESORIOS — antepenúltimo */}
      {Object.keys(hardwareList).length > 0 && (
        <section className="cubicacion-section cubicacion-hardware">
          <h2>Accesorios</h2>
          <div className="hardware-grid">
            {Object.entries(hardwareList).map(([id, item]) => (
              <div key={id} className="hardware-item">
                <div className="hardware-label">{item.nombre}{item.color ? ` (${item.color})` : ''}</div>
                <div className="hardware-value">{item.cantidad} u</div>
                <div className="hardware-desc">{clp(item.precio)}/u · Total: {clp(item.total)}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 5: TAPA-CANTO */}
      {tapaCantoList.length > 0 && (
        <section className="cubicacion-section cubicacion-hardware">
          <h2>Tapa canto</h2>

          <div className="hardware-grid">
            {tapaCantoList.map((item, idx) => (
              <div key={idx} className="hardware-item">
                <div className="hardware-label">{item.materialName}{item.color ? ` (${item.color})` : ''}</div>
                <div className="hardware-value">{item.linealMeters.toFixed(2)} m</div>
                <div className="hardware-desc">{clp(item.precio)}/m · Total: {clp(item.totalCost)}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 6: STATISTICS — penúltimo */}
      <section className="cubicacion-section cubicacion-stats">
        <h2>Resumen</h2>

        {statistics && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Planchas Necesarias</div>
              <div className="stat-value">{statistics.boardsNeeded}</div>
              <div className="stat-detail">
                {boardGroups.filter(g => g.boards.length > 0).map(g =>
                  `${g.boards.length} de ${g.materialName} (${g.config.width}×${g.config.height})`
                ).join(' · ')}
              </div>
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
                {boardsCost !== null ? clp(boardsCost) : 'Sin material seleccionado'}
              </div>
              <div className="stat-detail">
                {boardGroups.filter(g => g.boards.length > 0 && g.material?.precio != null).map(g =>
                  `${g.materialName}: ${g.boards.length} × ${clp(g.material.precio)}`
                ).join(' · ')}
              </div>
            </div>

            {(Object.keys(hardwareList).length > 0 || tapaCantoList.length > 0) && (() => {
              const accesoriosCost = Object.values(hardwareList).reduce((s, i) => s + i.total, 0)
              const tapaCost = tapaCantoList.reduce((s, i) => s + i.totalCost, 0)
              const extrasCost = accesoriosCost + tapaCost
              return (
                <div className="stat-card">
                  <div className="stat-label">Accesorios y enchape</div>
                  <div className="stat-value">{clp(extrasCost)}</div>
                  <div className="stat-detail">
                    {Object.entries(hardwareList).map(([id, item]) =>
                      `${item.nombre}: ${item.cantidad}u × ${clp(item.precio)}`
                    ).join(' · ')}
                    {Object.keys(hardwareList).length > 0 && tapaCantoList.length > 0 && ' · '}
                    {tapaCantoList.map(item =>
                      `Enchape ${item.materialName}: ${item.linealMeters.toFixed(2)}m`
                    ).join(' · ')}
                  </div>
                </div>
              )
            })()}

            {totalCost > 0 && (
              <div className="stat-card stat-card--total">
                <div className="stat-label">Total estimado</div>
                <div className="stat-value">{clp(totalCost)}</div>
                <div className="stat-detail">
                  {[
                    boardsCost != null && `planchas ${clp(boardsCost)}`,
                    Object.keys(hardwareList).length > 0 && `accesorios ${clp(Object.values(hardwareList).reduce((s, i) => s + i.total, 0))}`,
                    tapaCantoList.length > 0 && `enchape ${clp(tapaCantoList.reduce((s, i) => s + i.totalCost, 0))}`,
                  ].filter(Boolean).join(' + ')}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* SECTION 7: COTIZACION EMAILJS — último */}
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
              <label>Correo del cliente</label>
              <input
                type="email"
                value={emailForm.to_email}
                onChange={handleEmailFieldChange('to_email')}
                placeholder="cliente@email.com"
                required
              />
            </div>

            <div className="emailjs-field emailjs-field--full">
              <label>Nombre del proyecto</label>
              <input
                type="text"
                value={emailForm.nombre_proyecto}
                onChange={handleEmailFieldChange('nombre_proyecto')}
                placeholder="Cocina integral"
                required
              />
            </div>
          </div>

          {/* Resumen calculado automáticamente — no editable */}
          <div className="emailjs-computed">
            <div className="emailjs-computed-price">
              <span className="emailjs-computed-label">Total cotización</span>
              <span className="emailjs-computed-value">
                {totalCost > 0 ? clp(totalCost) : '—'}
              </span>
            </div>
            <div className="emailjs-computed-detail">
              {boardsSummary.split('\n').map((line, i) => <span key={i}>{line}</span>)}
              {Object.entries(hardwareList).map(([id, item]) => (
                <span key={id}>
                  {item.nombre}{item.color ? ` (${item.color})` : ''}: {item.cantidad}u × {clp(item.precio)} = <strong>{clp(item.total)}</strong>
                </span>
              ))}
              {tapaCantoList.map((item, idx) => (
                <span key={`tc-${idx}`}>
                  Enchape {item.materialName}{item.color ? ` (${item.color})` : ''}: {item.linealMeters.toFixed(2)}m × {clp(item.precio)}/m = <strong>{clp(item.totalCost)}</strong>
                </span>
              ))}
            </div>
          </div>

          {emailStatus.message && (
            <div className={`emailjs-status ${emailStatus.type}`}>
              {emailStatus.message}
            </div>
          )}

          <button type="submit" disabled={isSending} className="emailjs-submit-btn">
            {isSending ? 'Enviando…' : 'Enviar cotización'}
          </button>
        </form>
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

  // When pieces occupy <30% of board, crop viewBox to occupied area so pieces are visible
  const occupancyRatio = usedArea / boardArea
  let vbX = 0, vbY = 0, vbW = boardConfig.width, vbH = boardConfig.height
  if (occupancyRatio < 0.3 && usedWidth > 0 && usedHeight > 0) {
    const pad = Math.min(boardConfig.width, boardConfig.height) * 0.06
    vbX = Math.max(0, minX - pad)
    vbY = Math.max(0, minY - pad)
    vbW = Math.min(boardConfig.width - vbX, maxX + pad - vbX)
    vbH = Math.min(boardConfig.height - vbY, maxY + pad - vbY)
  }

  const maxBoardPx = 700

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

      <div className="board-canvas-wrapper" style={{ maxWidth: `${maxBoardPx + 16}px` }}>
        <svg
          className="board-canvas"
          viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
          style={{ width: '100%', height: 'auto', display: 'block' }}
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
            const { x, y, width, height } = piece

            // Adaptive font size: proportional to piece dimensions, capped at 9
            const dimFont = Math.min(9, width * 0.28, height * 0.28)
            const showDims = dimFont >= 2.5
            const showDesc = dimFont >= 4.5 && width >= 32 && height >= 16
            const descFont = Math.min(7, dimFont * 0.78)
            const desc = (piece.description || '').slice(0, 13)
            const clipId = `clip-${board.id}-${idx}`

            return (
              <g key={idx} className="piece-group">
                <defs>
                  <clipPath id={clipId}>
                    <rect x={x + 1} y={y + 1} width={Math.max(0, width - 2)} height={Math.max(0, height - 2)} />
                  </clipPath>
                </defs>
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
                {showDims && (
                  <text
                    x={x + width / 2}
                    y={showDesc ? y + height / 2 - dimFont * 0.65 : y + height / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="piece-label"
                    fontSize={dimFont}
                    fill="#fff"
                    fontWeight="bold"
                    pointerEvents="none"
                    clipPath={`url(#${clipId})`}
                  >
                    {`${width}×${height}`}
                  </text>
                )}
                {showDesc && (
                  <text
                    x={x + width / 2}
                    y={y + height / 2 + descFont * 0.9}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="piece-module"
                    fontSize={descFont}
                    fill="#ddd"
                    pointerEvents="none"
                    clipPath={`url(#${clipId})`}
                  >
                    {desc}
                  </text>
                )}
              </g>
            )
          })}

          {/* Board dimensions label — anchored to bottom-right of current viewBox */}
          <text
            x={vbX + vbW - 2}
            y={vbY + vbH - 2}
            textAnchor="end"
            dominantBaseline="auto"
            fontSize={Math.min(9, vbW * 0.04)}
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
