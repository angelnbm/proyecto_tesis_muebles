import React, { useRef, useState, useEffect } from 'react'
import { Stage, Layer, Rect, Group, Text } from 'react-konva'

const defaultSizes = {
  estante: { width: 120, height: 20, depth: 30 },
  cajonera: { width: 120, height: 140, depth: 40, numCajones: 3 }, // NUEVO: número de cajones por defecto
  base: { width: 140, height: 12, depth: 40 },
  divisor: { width: 4, height: 120, depth: 2 },
  cubierta: { width: 140, height: 6, depth: 60 },
  puerta: { width: 60, height: 120, depth: 2 },
}

// Detecta si dos rectángulos se solapan
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
      // NUEVO: Agregar numCajones si es cajonera
      ...(selectedModule === 'cajonera' && { numCajones: base.numCajones || 3 })
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
            text={window.innerWidth > 600 ? "Rueda del mouse para zoom" : "Arrastra módulos aquí"}
            fontSize={window.innerWidth > 600 ? 12 : 10}
            fill='#666' 
          />

          {ghostShape && (
            <Group
              x={ghostShape.x}
              y={ghostShape.y}
              opacity={0.4}
              listening={false}
            >
              {ghostShape.type === 'cubierta' ? (
                <Rect 
                  x={0} 
                  y={0} 
                  width={ghostShape.width} 
                  height={ghostShape.height} 
                  fill={ghostShape.isCentered ? "#4A90E2" : "#d4d4d4"}
                  stroke={ghostShape.isCentered ? "#6CB0FF" : "#888"}
                  strokeWidth={2}
                  dash={[5, 5]}
                />
              ) : (
                <Rect 
                  x={0} 
                  y={0} 
                  width={ghostShape.width} 
                  height={ghostShape.height} 
                  fill={ghostShape.isAboveCubierta ? "#22c55e" : "#4A90E2"} 
                  stroke={ghostShape.isAboveCubierta ? "#16a34a" : "#6CB0FF"}
                  strokeWidth={2}
                  dash={[5, 5]}
                />
              )}
            </Group>
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
              {s.type === 'estante' && (
                <>
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
                  <Rect x={4} y={s.height/2 - 1} width={s.width - 8} height={2} fill="#bbb" />
                </>
              )}

              {/* CAJONERA - ACTUALIZADO CON NÚMERO DINÁMICO DE CAJONES */}
              {s.type === 'cajonera' && (
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
                    shadowBlur={6}
                    shadowOpacity={0.3}
                    shadowOffsetY={3}
                  />
                  {Array.from({ length: s.numCajones || 3 }).map((_, i) => {
                    // Usar 3 por defecto si numCajones es null/undefined/0
                    const numCajones = s.numCajones && s.numCajones > 0 ? s.numCajones : 3
                    const totalPadding = 8 + 8
                    const totalGaps = (numCajones - 1) * 4
                    const drawerHeight = (s.height - totalPadding - totalGaps) / numCajones
                    const drawerY = 8 + i * (drawerHeight + 4)
                    return (
                      <Group key={i}>
                        <Rect 
                          x={6} 
                          y={drawerY} 
                          width={s.width - 12} 
                          height={drawerHeight} 
                          fill="#fff" 
                          stroke="#ccc"
                          strokeWidth={1}
                        />
                        <Rect
                          x={s.width/2 - 12}
                          y={drawerY + drawerHeight/2 - 3}
                          width={24}
                          height={6}
                          fill="#333"
                          cornerRadius={2}
                        />
                      </Group>
                    )
                  })}
                </>
              )}

              {s.type === 'base' && (
                <Rect 
                  x={0} 
                  y={0} 
                  width={s.width} 
                  height={s.height} 
                  fill="#a0a0a0" 
                  stroke={selectedId === s.id ? '#4A90E2' : '#666'}
                  strokeWidth={selectedId === s.id ? 3 : 2}
                  shadowColor="black"
                  shadowBlur={3}
                  shadowOpacity={0.4}
                  shadowOffsetY={2}
                />
              )}

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

              {s.type === 'cubierta' && (
                <Rect 
                  x={0} 
                  y={0} 
                  width={s.width} 
                  height={s.height} 
                  fill="#d4d4d4" 
                  stroke={selectedId === s.id ? '#4A90E2' : '#888'}
                  strokeWidth={selectedId === s.id ? 3 : 2}
                  shadowColor="black"
                  shadowBlur={4}
                  shadowOpacity={0.25}
                  shadowOffsetY={2}
                />
              )}

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
            </Group>
          ))}
        </Layer>
      </Stage>
    </div>
  )
}