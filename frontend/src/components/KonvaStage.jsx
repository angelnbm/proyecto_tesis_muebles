import React, { useRef, useState, useEffect } from 'react'
import { Stage, Layer, Rect, Group, Text, Line } from 'react-konva'

const defaultSizes = {
  estante: { width: 100, height: 1.5, depth: 70 },
  cajonera: { width: 100, height: 70, depth: 70, numCajones: 3 },
  modular: { 
    width: 100, 
    height: 70, 
    depth: 70, 
    numEstantes: 2, 
    numDivisores: 1, 
    numPuertas: 2 
  },
  base: { width: 600, height: 10, depth: 65 },
  divisor: { width: 1.5, height: 30, depth: 70 },
  cubierta: { width: 110, height: 3, depth: 70 },
  puerta: { width: 70, height: 70, depth: 1.5 },
}


function checkCollision(rect1, rect2) {
  return !(
    rect1.x + rect1.width <= rect2.x ||
    rect1.x >= rect2.x + rect2.width ||
    rect1.y + rect1.height <= rect2.y ||
    rect1.y >= rect2.y + rect2.height
  )
}

// Encuentra la mejor posición sin colisión
function findSnapPosition(newShape, existingShapes, canvasWidth, canvasHeight) {
  let bestX = newShape.x
  let bestY = newShape.y
  let minDistance = Infinity

  const minX = 8
  const minY = 8
  const maxX = canvasWidth - 16 - newShape.width
  const maxY = canvasHeight - 16 - newShape.height

  // Verificar si hay colisión con cubierta
  const cubiertaCollision = existingShapes.find(s => 
    s.type === 'cubierta' && checkCollision(newShape, s)
  )

  // Si colisiona con cubierta Y es divisor/estante/puerta, posicionar arriba
  if (cubiertaCollision && ['divisor', 'estante', 'puerta'].includes(newShape.type)) {
    const aboveCubierta = {
      x: newShape.x,
      y: cubiertaCollision.y - newShape.height - 2
    }
    
    const testShape = { ...newShape, ...aboveCubierta }
    const otherShapes = existingShapes.filter(s => s.id !== newShape.id && s.type !== 'cubierta')
    const hasOtherCollision = otherShapes.some(s => checkCollision(testShape, s))
    
    if (!hasOtherCollision) {
      return {
        x: Math.max(minX, Math.min(maxX, aboveCubierta.x)),
        y: Math.max(minY, Math.min(maxY, aboveCubierta.y))
      }
    }
  }

  // Lógica original para otros casos
  for (const other of existingShapes) {
    if (other.id === newShape.id) continue

    const positions = [
      { x: other.x + other.width, y: other.y },
      { x: other.x - newShape.width, y: other.y },
      { x: other.x, y: other.y + other.height },
      { x: other.x, y: other.y - newShape.height },
    ]

    for (const pos of positions) {
      const clampedX = Math.max(minX, Math.min(maxX, pos.x))
      const clampedY = Math.max(minY, Math.min(maxY, pos.y))
      
      const testShape = { ...newShape, x: clampedX, y: clampedY }
      
      const hasCollision = existingShapes.some(s => 
        s.id !== newShape.id && checkCollision(testShape, s)
      )

      if (!hasCollision) {
        const distance = Math.sqrt(
          Math.pow(clampedX - newShape.x, 2) + Math.pow(clampedY - newShape.y, 2)
        )
        
        if (distance < minDistance) {
          minDistance = distance
          bestX = clampedX
          bestY = clampedY
        }
      }
    }
  }

  if (bestX === newShape.x && bestY === newShape.y) {
    bestX = Math.max(minX, Math.min(maxX, newShape.x))
    bestY = Math.max(minY, Math.min(maxY, newShape.y))
  }

  return { x: bestX, y: bestY }
}

// Encuentra el centro de todos los shapes (para cubierta)
function findCenterPosition(shapes, newShape, canvasWidth, canvasHeight) {
  if (shapes.length === 0) {
    return { 
      x: (canvasWidth - newShape.width) / 2, 
      y: 8 
    }
  }

  // Buscar cajoneras específicamente
  const cajoneras = shapes.filter(s => s.type === 'cajonera')
  
  let minX, maxX, minY
  
  if (cajoneras.length > 0) {
    // Si hay cajoneras, centrar sobre ellas
    minX = Math.min(...cajoneras.map(s => s.x))
    maxX = Math.max(...cajoneras.map(s => s.x + s.width))
    minY = Math.min(...cajoneras.map(s => s.y))
  } else {
    // Si no hay cajoneras, usar todos los shapes
    minX = Math.min(...shapes.map(s => s.x))
    maxX = Math.max(...shapes.map(s => s.x + s.width))
    minY = Math.min(...shapes.map(s => s.y))
  }

  const centerX = (minX + maxX) / 2 - newShape.width / 2
  const topY = minY - newShape.height - 4 // 4px de separación

  return {
    x: Math.max(8, Math.min(canvasWidth - 16 - newShape.width, centerX)),
    y: Math.max(8, topY)
  }
}

export default function KonvaStage({ shapes, setShapes, selectedModule, setSelectedModule, selectedId, setSelectedId }) {
  const containerRef = useRef(null)
  const stageRef = useRef(null)
  
  const BASE_WIDTH = 700
  const BASE_HEIGHT = 480
  
  const [dimensions, setDimensions] = useState({
    width: BASE_WIDTH,
    height: BASE_HEIGHT,
    scale: 1
  })
  
  const [zoom, setZoom] = useState(1)
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 })
  const [ghostShape, setGhostShape] = useState(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    
    const updateDimensions = () => {
      const containerWidth = container.clientWidth
      const containerHeight = container.clientHeight
      
      const scaleX = containerWidth / BASE_WIDTH
      const scaleY = containerHeight / BASE_HEIGHT
      const newScale = Math.min(scaleX, scaleY) * 0.98
      
      setDimensions({
        width: BASE_WIDTH * newScale,
        height: BASE_HEIGHT * newScale,
        scale: newScale
      })
    }
    
    updateDimensions()
    
    const resizeObserver = new ResizeObserver(updateDimensions)
    resizeObserver.observe(container)
    
    return () => resizeObserver.disconnect()
  }, [])

  const handleWheel = (e) => {
    e.evt.preventDefault()
    
    const stage = stageRef.current
    if (!stage) return

    const oldZoom = zoom
    const pointer = stage.getPointerPosition()
    
    if (!pointer) return
    
    const mousePointTo = {
      x: (pointer.x - stagePos.x) / (dimensions.scale * oldZoom),
      y: (pointer.y - stagePos.y) / (dimensions.scale * oldZoom),
    }

    const scaleBy = 1.05
    const direction = e.evt.deltaY > 0 ? -1 : 1
    const newZoom = direction > 0 ? oldZoom * scaleBy : oldZoom / scaleBy
    const clampedZoom = Math.max(0.5, Math.min(3, newZoom))

    setZoom(clampedZoom)

    const newPos = {
      x: pointer.x - mousePointTo.x * dimensions.scale * clampedZoom,
      y: pointer.y - mousePointTo.y * dimensions.scale * clampedZoom,
    }
    setStagePos(newPos)
  }

  const handleResetZoom = () => {
    setZoom(1)
    setStagePos({ x: 0, y: 0 })
  }

  const handleZoomIn = () => {
    const newZoom = Math.min(3, zoom * 1.2)
    setZoom(newZoom)
  }

  const handleZoomOut = () => {
    const newZoom = Math.max(0.5, zoom / 1.2)
    setZoom(newZoom)
  }

  const handleMouseMove = (e) => {
    if (!selectedModule) {
      setGhostShape(null)
      return
    }

    const stage = e.target.getStage()
    const pos = stage.getPointerPosition()
    if (!pos) return

    const base = defaultSizes[selectedModule] || { width: 60, height: 60, depth: 20 }
    const canvasX = (pos.x - stagePos.x) / (dimensions.scale * zoom)
    const canvasY = (pos.y - stagePos.y) / (dimensions.scale * zoom)

    const candidateShape = {
      type: selectedModule,
      x: canvasX - base.width / 2,
      y: canvasY - base.height / 2,
      width: base.width,
      height: base.height,
      depth: base.depth,
    }

    const hasCollision = shapes.some(s => checkCollision(candidateShape, s))

    if (hasCollision) {
      if (selectedModule === 'cubierta') {
        const centered = findCenterPosition(shapes, candidateShape, BASE_WIDTH, BASE_HEIGHT)
        setGhostShape({ ...candidateShape, x: centered.x, y: centered.y, isCentered: true })
      } 
      else if (['divisor', 'estante', 'puerta'].includes(selectedModule)) {
        const cubiertaCollision = shapes.find(s => 
          s.type === 'cubierta' && checkCollision(candidateShape, s)
        )
        
        if (cubiertaCollision) {
          const aboveY = cubiertaCollision.y - candidateShape.height - 2
          setGhostShape({ 
            ...candidateShape, 
            y: aboveY, 
            isCentered: false,
            isAboveCubierta: true
          })
        } else {
          const snappedPos = findSnapPosition(candidateShape, shapes, BASE_WIDTH, BASE_HEIGHT)
          setGhostShape({ ...candidateShape, x: snappedPos.x, y: snappedPos.y, isCentered: false })
        }
      }
      else {
        const snappedPos = findSnapPosition(candidateShape, shapes, BASE_WIDTH, BASE_HEIGHT)
        setGhostShape({ ...candidateShape, x: snappedPos.x, y: snappedPos.y, isCentered: false })
      }
    } else {
      setGhostShape({ ...candidateShape, isCentered: false })
    }
  }

  const handleStageMouseDown = (e) => {
    const stage = e.target.getStage()
    const pos = stage.getPointerPosition()
    if (!pos) return
    if (e.target !== stage) return
    if (!selectedModule) return

    const base = defaultSizes[selectedModule] || { width: 60, height: 60, depth: 20 }
    const id = Date.now()
    
    const canvasX = (pos.x - stagePos.x) / (dimensions.scale * zoom)
    const canvasY = (pos.y - stagePos.y) / (dimensions.scale * zoom)
    
    const candidateShape = {
      id,
      type: selectedModule,
      x: canvasX - base.width / 2,
      y: canvasY - base.height / 2,
      width: base.width,
      height: base.height,
      depth: base.depth,
      rotation: 0,
      ...(selectedModule === 'cajonera' && { numCajones: base.numCajones || 3 }),
      ...(selectedModule === 'modular' && { 
        numEstantes: base.numEstantes !== undefined ? base.numEstantes : 2,
        numDivisores: base.numDivisores !== undefined ? base.numDivisores : 1,
        numPuertas: base.numPuertas !== undefined ? base.numPuertas : 2
      })
    }

    const hasCollision = shapes.some(s => checkCollision(candidateShape, s))
    
    if (hasCollision) {
      if (selectedModule === 'cubierta') {
        const centered = findCenterPosition(shapes, candidateShape, BASE_WIDTH, BASE_HEIGHT)
        candidateShape.x = centered.x
        candidateShape.y = centered.y
        
        const stillCollides = shapes.some(s => checkCollision(candidateShape, s))
        if (stillCollides) return
      } 
      else if (['divisor', 'estante', 'puerta'].includes(selectedModule)) {
        const cubiertaCollision = shapes.find(s => 
          s.type === 'cubierta' && checkCollision(candidateShape, s)
        )
        
        if (cubiertaCollision) {
          candidateShape.y = cubiertaCollision.y - candidateShape.height - 2
          
          const otherShapes = shapes.filter(s => s.type !== 'cubierta')
          const stillCollides = otherShapes.some(s => checkCollision(candidateShape, s))
          if (stillCollides) {
            const snappedPos = findSnapPosition(candidateShape, shapes, BASE_WIDTH, BASE_HEIGHT)
            candidateShape.x = snappedPos.x
            candidateShape.y = snappedPos.y
            
            const finalCheck = shapes.some(s => checkCollision(candidateShape, s))
            if (finalCheck) return
          }
        } else {
          const snappedPos = findSnapPosition(candidateShape, shapes, BASE_WIDTH, BASE_HEIGHT)
          candidateShape.x = snappedPos.x
          candidateShape.y = snappedPos.y
          
          const stillCollides = shapes.some(s => checkCollision(candidateShape, s))
          if (stillCollides) return
        }
      } 
      else {
        const snappedPos = findSnapPosition(candidateShape, shapes, BASE_WIDTH, BASE_HEIGHT)
        candidateShape.x = snappedPos.x
        candidateShape.y = snappedPos.y
        
        const stillCollides = shapes.some(s => checkCollision(candidateShape, s))
        if (stillCollides) return
      }
    }

    setShapes(prev => [...prev, candidateShape])
    setSelectedId(id)
    setGhostShape(null)
    if (typeof setSelectedModule === 'function') setSelectedModule(null)
  }

  const updateShape = (id, patch) => {
    setShapes(prev => prev.map(s => (s.id === id ? { ...s, ...patch } : s)))
  }

  const handleDragEnd = (shapeId, e) => {
    const draggedShape = shapes.find(s => s.id === shapeId)
    if (!draggedShape) return

    const updatedShape = { 
      ...draggedShape, 
      x: e.target.x(), 
      y: e.target.y() 
    }
    const otherShapes = shapes.filter(s => s.id !== shapeId)

    const minX = 8
    const minY = 8
    const maxX = BASE_WIDTH - 16 - updatedShape.width
    const maxY = BASE_HEIGHT - 16 - updatedShape.height
    updatedShape.x = Math.max(minX, Math.min(maxX, updatedShape.x))
    updatedShape.y = Math.max(minY, Math.min(maxY, updatedShape.y))

    const hasCollision = otherShapes.some(s => checkCollision(updatedShape, s))
    
    if (hasCollision) {
      if (['divisor', 'estante', 'puerta'].includes(updatedShape.type)) {
        const cubiertaCollision = otherShapes.find(s => 
          s.type === 'cubierta' && checkCollision(updatedShape, s)
        )
        
        if (cubiertaCollision) {
          updatedShape.y = cubiertaCollision.y - updatedShape.height - 2
          
          const otherNonCubierta = otherShapes.filter(s => s.type !== 'cubierta')
          const stillCollides = otherNonCubierta.some(s => checkCollision(updatedShape, s))
          
          if (!stillCollides) {
            updateShape(shapeId, { x: updatedShape.x, y: updatedShape.y })
            return
          }
        }
      }
      
      const snappedPos = findSnapPosition(updatedShape, otherShapes, BASE_WIDTH, BASE_HEIGHT)
      updatedShape.x = snappedPos.x
      updatedShape.y = snappedPos.y
      
      const stillCollides = otherShapes.some(s => checkCollision(updatedShape, s))
      if (stillCollides) {
        e.target.x(draggedShape.x)
        e.target.y(draggedShape.y)
        return
      }
    }

    updateShape(shapeId, { x: updatedShape.x, y: updatedShape.y })
  }

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 0
      }}
    >
      <div style={{ 
        position: 'absolute', 
        top: 10, 
        right: 10, 
        zIndex: 10, 
        display: 'flex', 
        gap: 6, 
        background: 'rgba(0,0,0,0.7)', 
        padding: 6, 
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
      }}>
        <button 
          onClick={handleZoomIn}
          style={{ 
            background: '#4A90E2', 
            color: '#fff', 
            border: 'none', 
            borderRadius: 4, 
            padding: '4px 10px', 
            cursor: 'pointer', 
            fontSize: 14, 
            fontWeight: 'bold',
            minWidth: '32px'
          }}
          title="Acercar"
        >
          +
        </button>
        <button 
          onClick={handleResetZoom}
          style={{ 
            background: '#666', 
            color: '#fff', 
            border: 'none', 
            borderRadius: 4, 
            padding: '4px 8px', 
            cursor: 'pointer', 
            fontSize: 11,
            minWidth: '45px'
          }}
          title="Restablecer zoom"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button 
          onClick={handleZoomOut}
          style={{ 
            background: '#4A90E2', 
            color: '#fff', 
            border: 'none', 
            borderRadius: 4, 
            padding: '4px 10px', 
            cursor: 'pointer', 
            fontSize: 14, 
            fontWeight: 'bold',
            minWidth: '32px'
          }}
          title="Alejar"
        >
          −
        </button>
      </div>

      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        scaleX={dimensions.scale * zoom}
        scaleY={dimensions.scale * zoom}
        x={stagePos.x}
        y={stagePos.y}
        draggable={false}
        onWheel={handleWheel}
        onMouseDown={handleStageMouseDown}
        onTouchStart={handleStageMouseDown}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setGhostShape(null)}
        style={{ 
          cursor: selectedModule ? 'crosshair' : 'default',
          touchAction: 'none'
        }}
      >
        <Layer>
          <Rect
            x={8}
            y={8}
            width={BASE_WIDTH - 16}
            height={BASE_HEIGHT - 16}
            cornerRadius={12}
            fill='#f3ecf6'
            stroke='#ddd'
            strokeWidth={1}
            listening={false}
          />
          <Text 
            x={18}
            y={18}
            text='Canvas de diseño'
            fontSize={14}
            fill='#333'
            listening={false}
          />

          {ghostShape && (
            <Rect
              x={ghostShape.x}
              y={ghostShape.y}
              width={ghostShape.width}
              height={ghostShape.height}
              fill='rgba(74, 144, 226, 0.3)'
              stroke='#4A90E2'
              strokeWidth={2}
              dash={[10, 5]}
              listening={false}
            />
          )}

          {shapes.map(s => (
            <Group
              key={s.id}
              x={s.x}
              y={s.y}
              draggable
              rotation={s.rotation}
              onDragEnd={e => handleDragEnd(s.id, e)}
              onClick={() => setSelectedId(s.id)}
              onTap={() => setSelectedId(s.id)}
            >
              {/* ESTANTE */}
              {s.type === 'estante' && (
                <Rect 
                  x={0} 
                  y={0} 
                  width={s.width} 
                  height={s.height} 
                  fill="#e8e8e8" 
                  stroke={selectedId === s.id ? '#4A90E2' : '#999'} 
                  strokeWidth={selectedId === s.id ? 3 : 2}
                  shadowColor="black"
                  shadowBlur={4}
                  shadowOpacity={0.3}
                  shadowOffsetY={2}
                />
              )}

              {/* CAJONERA */}
              {s.type === 'cajonera' && (() => {
                const numCajones = s.numCajones && s.numCajones > 0 ? s.numCajones : 3
                const drawerHeight = s.height / numCajones
                return (
                  <>
                    <Rect 
                      x={0} 
                      y={0} 
                      width={s.width} 
                      height={s.height} 
                      fill="#d9d9d9" 
                      stroke={selectedId === s.id ? '#4A90E2' : '#777'}
                      strokeWidth={selectedId === s.id ? 3 : 2}
                      shadowColor="black"
                      shadowBlur={5}
                      shadowOpacity={0.4}
                      shadowOffsetY={3}
                    />
                    {Array.from({ length: numCajones }).map((_, i) => (
                      <React.Fragment key={i}>
                        <Line
                          points={[0, (i + 1) * drawerHeight, s.width, (i + 1) * drawerHeight]}
                          stroke="#555"
                          strokeWidth={1}
                        />
                        <Rect
                          x={s.width / 2 - 15}
                          y={i * drawerHeight + drawerHeight / 2 - 3}
                          width={30}
                          height={6}
                          fill="#444"
                          cornerRadius={3}
                        />
                      </React.Fragment>
                    ))}
                  </>
                )
              })()}

              {/* MÓDULO MODULAR */}
              {s.type === 'modular' && (() => {
                // IMPORTANTE: Usar valores por defecto si son undefined
                const numEstantes = s.numEstantes !== undefined && s.numEstantes !== null ? s.numEstantes : 0
                const numDivisores = s.numDivisores !== undefined && s.numDivisores !== null ? s.numDivisores : 0
                const numPuertas = s.numPuertas !== undefined && s.numPuertas !== null ? s.numPuertas : 0
                
                const estanteSpacing = numEstantes > 0 ? s.height / (numEstantes + 1) : 0
                const divisorSpacing = numDivisores > 0 ? s.width / (numDivisores + 1) : 0
                const puertaWidth = numPuertas > 0 ? s.width / numPuertas : 0
                
                return (
                  <>
                    <Rect 
                      x={0} 
                      y={0} 
                      width={s.width} 
                      height={s.height} 
                      fill="#f5f5f5" 
                      stroke={selectedId === s.id ? '#4A90E2' : '#888'}
                      strokeWidth={selectedId === s.id ? 3 : 2}
                      shadowColor="black"
                      shadowBlur={5}
                      shadowOpacity={0.3}
                      shadowOffsetY={2}
                    />
                    
                    {Array.from({ length: numEstantes }).map((_, i) => (
                      <Line
                        key={`estante-${i}`}
                        points={[0, (i + 1) * estanteSpacing, s.width, (i + 1) * estanteSpacing]}
                        stroke="#999"
                        strokeWidth={3}
                      />
                    ))}
                    
                    {Array.from({ length: numDivisores }).map((_, i) => (
                      <Line
                        key={`divisor-${i}`}
                        points={[(i + 1) * divisorSpacing, 0, (i + 1) * divisorSpacing, s.height]}
                        stroke="#777"
                        strokeWidth={3}
                      />
                    ))}
                    
                    {/* PUERTAS CON MANIJAS ALTERNAS */}
                    {Array.from({ length: numPuertas }).map((_, i) => {
                      // Determinar si la manija va a la izquierda o derecha
                      // Si el índice es par (0, 2, 4...) → manija derecha
                      // Si el índice es impar (1, 3, 5...) → manija izquierda
                      const manijaIzquierda = i % 2 === 1
                      
                      return (
                        <React.Fragment key={`puerta-${i}`}>
                          {/* Cuerpo de la puerta */}
                          <Rect
                            x={i * puertaWidth + 2}
                            y={2}
                            width={puertaWidth - 4}
                            height={s.height - 4}
                            fill="rgba(255,255,255,0.6)"
                            stroke="#555"
                            strokeWidth={2}
                            cornerRadius={4}
                          />
                          
                          {/* Manija de puerta - ALTERNADA */}
                          <Rect
                            x={manijaIzquierda 
                              ? i * puertaWidth + 8  // Manija a la izquierda
                              : i * puertaWidth + puertaWidth - 12  // Manija a la derecha
                            }
                            y={s.height / 2 - 15}
                            width={4}
                            height={30}
                            fill="#333"
                            cornerRadius={2}
                          />
                        </React.Fragment>
                      )
                    })}
                  </>
                )
              })()}

              {/* BASE */}
              {s.type === 'base' && (
                <Rect 
                  x={0} 
                  y={0} 
                  width={s.width} 
                  height={s.height} 
                  fill="#c8c8c8" 
                  stroke={selectedId === s.id ? '#4A90E2' : '#666'}
                  strokeWidth={selectedId === s.id ? 3 : 2}
                  shadowColor="black"
                  shadowBlur={3}
                  shadowOpacity={0.2}
                  shadowOffsetY={1}
                />
              )}

              {/* DIVISOR */}
              {s.type === 'divisor' && (
                <Rect 
                  x={0} 
                  y={0} 
                  width={s.width} 
                  height={s.height} 
                  fill="#b8b8b8" 
                  stroke={selectedId === s.id ? '#4A90E2' : '#777'}
                  strokeWidth={selectedId === s.id ? 2 : 1}
                />
              )}

              {/* CUBIERTA */}
              {s.type === 'cubierta' && (
                <Rect 
                  x={0} 
                  y={0} 
                  width={s.width} 
                  height={s.height} 
                  fill="#f0f0f0" 
                  stroke={selectedId === s.id ? '#4A90E2' : '#999'}
                  strokeWidth={selectedId === s.id ? 3 : 2}
                  shadowColor="black"
                  shadowBlur={4}
                  shadowOpacity={0.3}
                  shadowOffsetY={2}
                />
              )}

              {/* PUERTA */}
              {s.type === 'puerta' && (
                <>
                  <Rect 
                    x={0} 
                    y={0} 
                    width={s.width} 
                    height={s.height} 
                    fill="#f8f8f8" 
                    stroke={selectedId === s.id ? '#4A90E2' : '#999'}
                    strokeWidth={selectedId === s.id ? 3 : 2}
                    shadowColor="black"
                    shadowBlur={5}
                    shadowOpacity={0.3}
                    shadowOffsetY={2}
                  />
                  <Rect
                    x={s.width - 10}
                    y={s.height/2 - 20}
                    width={4}
                    height={40}
                    fill="#444"
                    cornerRadius={2}
                  />
                </>
              )}

              <Text 
                x={5} 
                y={5} 
                text={`${Math.round(s.width)}x${Math.round(s.height)}`} 
                fontSize={10} 
                fill={selectedId === s.id ? '#4A90E2' : '#666'} 
              />
            </Group>
          ))}
        </Layer>
      </Stage>
    </div>
  )
}
