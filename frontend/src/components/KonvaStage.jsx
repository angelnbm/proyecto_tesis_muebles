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
  base: { width: 70, height: 10, depth: 65 },
  divisor: { width: 1.5, height: 30, depth: 70 },
  cubierta: { width: 110, height: 3, depth: 70 },
  puerta: { width: 70, height: 70, depth: 1.5 },
}

// ========== GRUPOS DE COLISIÓN ==========
const COLLISION_GROUPS = {
  INTERNOS: ['puerta', 'estante', 'divisor'],
  HORIZONTALES: ['base', 'cubierta'],
  PRINCIPALES: ['cajonera', 'modular']
}

// ========== FUNCIONES AUXILIARES ==========

function checkCollision(rect1, rect2) {
  return !(
    rect1.x + rect1.width <= rect2.x ||
    rect1.x >= rect2.x + rect2.width ||
    rect1.y + rect1.height <= rect2.y ||
    rect1.y >= rect2.y + rect2.height
  )
}

function isInside(rect1, rect2) {
  return (
    rect1.x >= rect2.x &&
    rect1.y >= rect2.y &&
    rect1.x + rect1.width <= rect2.x + rect2.width &&
    rect1.y + rect1.height <= rect2.y + rect2.height
  )
}

function findContainingModular(shape, modulares) {
  const centerX = shape.x + shape.width / 2
  const centerY = shape.y + shape.height / 2
  
  for (const modular of modulares) {
    if (
      centerX >= modular.x &&
      centerX <= modular.x + modular.width &&
      centerY >= modular.y &&
      centerY <= modular.y + modular.height
    ) {
      return modular
    }
  }
  return null
}

// ========== MANEJO DE COLISIONES POR GRUPO ==========

// GRUPO 1: Puerta, Estante, Divisor (Elementos internos)
function handleInternosCollision(candidateShape, shapes, BASE_WIDTH, BASE_HEIGHT) {
  const cubiertaCollision = shapes.find(s => 
    s.type === 'cubierta' && checkCollision(candidateShape, s)
  )

  if (cubiertaCollision) {
    candidateShape.y = cubiertaCollision.y - candidateShape.height - 2
    
    const otherShapes = shapes.filter(s => s.type !== 'cubierta')
    const stillCollides = otherShapes.some(s => checkCollision(candidateShape, s))
    
    if (stillCollides) {
      const snappedPos = findSnapPositionInternos(candidateShape, shapes, BASE_WIDTH, BASE_HEIGHT)
      candidateShape.x = snappedPos.x
      candidateShape.y = snappedPos.y
      
      const finalCheck = shapes.some(s => checkCollision(candidateShape, s))
      if (finalCheck) return null
    }
  } else {
    const snappedPos = findSnapPositionInternos(candidateShape, shapes, BASE_WIDTH, BASE_HEIGHT)
    candidateShape.x = snappedPos.x
    candidateShape.y = snappedPos.y
    
    const stillCollides = shapes.some(s => checkCollision(candidateShape, s))
    if (stillCollides) return null
  }

  return candidateShape
}

function findSnapPositionInternos(newShape, existingShapes, canvasWidth, canvasHeight) {
  let bestX = newShape.x
  let bestY = newShape.y
  let minDistance = Infinity

  const minX = 8
  const minY = 8
  const maxX = canvasWidth - 16 - newShape.width
  const maxY = canvasHeight - 16 - newShape.height

  const referenceShapes = existingShapes.filter(s => 
    s.type === 'cubierta' || COLLISION_GROUPS.PRINCIPALES.includes(s.type)
  )

  for (const other of referenceShapes) {
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

  return { x: bestX, y: bestY }
}

// GRUPO 2: Base, Cubierta (Elementos horizontales)
function handleHorizontalesCollision(candidateShape, shapes, BASE_WIDTH, BASE_HEIGHT) {
  const centered = findCenterPositionHorizontales(shapes, candidateShape, BASE_WIDTH, BASE_HEIGHT)
  candidateShape.x = centered.x
  candidateShape.y = centered.y
  
  const stillCollides = shapes.some(s => checkCollision(candidateShape, s))
  if (stillCollides) return null
  
  return candidateShape
}

function findCenterPositionHorizontales(shapes, newShape, canvasWidth, canvasHeight) {
  if (shapes.length === 0) {
    return { 
      x: (canvasWidth - newShape.width) / 2, 
      y: newShape.type === 'base' ? canvasHeight - newShape.height - 8 : 8
    }
  }

  const principalesShapes = shapes.filter(s => COLLISION_GROUPS.PRINCIPALES.includes(s.type))
  
  let minX, maxX, minY, maxY
  
  if (principalesShapes.length > 0) {
    minX = Math.min(...principalesShapes.map(s => s.x))
    maxX = Math.max(...principalesShapes.map(s => s.x + s.width))
    minY = Math.min(...principalesShapes.map(s => s.y))
    maxY = Math.max(...principalesShapes.map(s => s.y + s.height))
  } else {
    minX = Math.min(...shapes.map(s => s.x))
    maxX = Math.max(...shapes.map(s => s.x + s.width))
    minY = Math.min(...shapes.map(s => s.y))
    maxY = Math.max(...shapes.map(s => s.y + s.height))
  }

  const centerX = (minX + maxX) / 2 - newShape.width / 2
  
  const finalY = newShape.type === 'base' 
    ? maxY + 4 
    : minY - newShape.height - 4

  return {
    x: Math.max(8, Math.min(canvasWidth - 16 - newShape.width, centerX)),
    y: Math.max(8, Math.min(canvasHeight - 16 - newShape.height, finalY))
  }
}

// GRUPO 3: Cajonera, Modular (Módulos principales)
function handlePrincipalesCollision(candidateShape, shapes, BASE_WIDTH, BASE_HEIGHT) {
  const snappedPos = findSnapPositionPrincipales(candidateShape, shapes, BASE_WIDTH, BASE_HEIGHT)
  candidateShape.x = snappedPos.x
  candidateShape.y = snappedPos.y
  
  const stillCollides = shapes.some(s => checkCollision(candidateShape, s))
  if (stillCollides) return null
  
  return candidateShape
}

function findSnapPositionPrincipales(newShape, existingShapes, canvasWidth, canvasHeight) {
  let bestX = newShape.x
  let bestY = newShape.y
  let minDistance = Infinity

  const minX = 8
  const minY = 8
  const maxX = canvasWidth - 16 - newShape.width
  const maxY = canvasHeight - 16 - newShape.height

  const otherPrincipales = existingShapes.filter(s => 
    COLLISION_GROUPS.PRINCIPALES.includes(s.type)
  )

  for (const other of otherPrincipales) {
    const positions = [
      { x: other.x + other.width + 4, y: other.y },
      { x: other.x - newShape.width - 4, y: other.y },
      { x: other.x, y: other.y + other.height + 4 },
      { x: other.x, y: other.y - newShape.height - 4 },
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

  return { x: bestX, y: bestY }
}

// ========== COMPONENTE PRINCIPAL ==========

export default function KonvaStage({ 
  selectedModule, 
  shapes, 
  setShapes, 
  selectedId, 
  setSelectedId,
  updateShape,
  deleteShape,
  setSelectedModule
}) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0, scale: 1 })
  const [zoom, setZoom] = useState(1)
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 })
  const [ghostShape, setGhostShape] = useState(null)
  const [isPanning, setIsPanning] = useState(false)
  const stageRef = useRef(null)
  const containerRef = useRef(null)
  
  const BASE_WIDTH = 700
  const BASE_HEIGHT = 480
  
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
      let processedShape = null

      if (COLLISION_GROUPS.INTERNOS.includes(selectedModule)) {
        processedShape = handleInternosCollision({ ...candidateShape }, shapes, BASE_WIDTH, BASE_HEIGHT)
      }
      else if (COLLISION_GROUPS.HORIZONTALES.includes(selectedModule)) {
        processedShape = handleHorizontalesCollision({ ...candidateShape }, shapes, BASE_WIDTH, BASE_HEIGHT)
      }
      else if (COLLISION_GROUPS.PRINCIPALES.includes(selectedModule)) {
        processedShape = handlePrincipalesCollision({ ...candidateShape }, shapes, BASE_WIDTH, BASE_HEIGHT)
      }

      if (processedShape) {
        setGhostShape({ ...processedShape, isValid: true })
      } else {
        setGhostShape({ ...candidateShape, isValid: false })
      }
    } else {
      setGhostShape({ ...candidateShape, isValid: true })
    }
  }

  const handleStageMouseDown = (e) => {
    const stage = e.target.getStage()
    const pos = stage.getPointerPosition()
    if (!pos) return
    
    if (e.target === stage && !selectedModule) {
      setIsPanning(true)
      setSelectedId(null)
      return
    }
    
    if (e.target === stage && selectedModule) {
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
        let processedShape = null

        if (COLLISION_GROUPS.INTERNOS.includes(selectedModule)) {
          processedShape = handleInternosCollision(candidateShape, shapes, BASE_WIDTH, BASE_HEIGHT)
        }
        else if (COLLISION_GROUPS.HORIZONTALES.includes(selectedModule)) {
          processedShape = handleHorizontalesCollision(candidateShape, shapes, BASE_WIDTH, BASE_HEIGHT)
        }
        else if (COLLISION_GROUPS.PRINCIPALES.includes(selectedModule)) {
          processedShape = handlePrincipalesCollision(candidateShape, shapes, BASE_WIDTH, BASE_HEIGHT)
        }

        if (!processedShape) return
      }

      if (COLLISION_GROUPS.PRINCIPALES.includes(selectedModule) && shapes.length === 0) {
        candidateShape.x = (BASE_WIDTH - candidateShape.width) / 2
        candidateShape.y = (BASE_HEIGHT - candidateShape.height) / 2
      }

      setShapes(prev => [...prev, candidateShape])
      setSelectedId(id)
      setGhostShape(null)
      if (typeof setSelectedModule === 'function') setSelectedModule(null)
    }
  }

  const handleStageMouseUp = () => {
    setIsPanning(false)
  }

  const handleDragEnd = (shapeId, e) => {
    const draggedShape = shapes.find(s => s.id === shapeId)
    if (!draggedShape) return

    const node = e.target
    const newX = node.x()
    const newY = node.y()

    const updatedShape = { 
      ...draggedShape, 
      x: newX, 
      y: newY 
    }

    const minX = 8
    const minY = 8
    const maxX = BASE_WIDTH - 16 - updatedShape.width
    const maxY = BASE_HEIGHT - 16 - updatedShape.height

    updatedShape.x = Math.max(minX, Math.min(maxX, updatedShape.x))
    updatedShape.y = Math.max(minY, Math.min(maxY, updatedShape.y))

    if (updatedShape.x !== newX || updatedShape.y !== newY) {
      node.x(updatedShape.x)
      node.y(updatedShape.y)
    }

    const otherShapes = shapes.filter(s => s.id !== shapeId)
    const hasCollision = otherShapes.some(s => checkCollision(updatedShape, s))
    
    if (hasCollision) {
      let snappedPos = null

      if (COLLISION_GROUPS.INTERNOS.includes(updatedShape.type)) {
        snappedPos = findSnapPositionInternos(updatedShape, otherShapes, BASE_WIDTH, BASE_HEIGHT)
      } else if (COLLISION_GROUPS.PRINCIPALES.includes(updatedShape.type)) {
        snappedPos = findSnapPositionPrincipales(updatedShape, otherShapes, BASE_WIDTH, BASE_HEIGHT)
      } else if (COLLISION_GROUPS.HORIZONTALES.includes(updatedShape.type)) {
        const centered = findCenterPositionHorizontales(otherShapes, updatedShape, BASE_WIDTH, BASE_HEIGHT)
        snappedPos = centered
      }

      if (snappedPos) {
        updatedShape.x = snappedPos.x
        updatedShape.y = snappedPos.y
        node.x(updatedShape.x)
        node.y(updatedShape.y)
      }
      
      const finalCheck = otherShapes.some(s => checkCollision(updatedShape, s))
      if (finalCheck) {
        node.x(draggedShape.x)
        node.y(draggedShape.y)
        return
      }
    }

    updateShape(shapeId, { x: updatedShape.x, y: updatedShape.y })
  }

  return (
    <div ref={containerRef} style={{ 
      width: '100%', 
      height: '100%', 
      position: 'relative', 
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 0
    }}>
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
        draggable={!selectedModule}
        onWheel={handleWheel}
        onMouseDown={handleStageMouseDown}
        onMouseUp={handleStageMouseUp}
        onTouchStart={handleStageMouseDown}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setGhostShape(null)}
        style={{ 
          cursor: selectedModule ? 'crosshair' : (isPanning ? 'grabbing' : 'grab'),
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
              fill={ghostShape.isValid ? 'rgba(74, 144, 226, 0.3)' : 'rgba(255, 0, 0, 0.3)'}
              stroke={ghostShape.isValid ? '#4A90E2' : '#ff0000'}
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
              dragBoundFunc={(pos) => {
                const minX = 8
                const minY = 8
                const maxX = BASE_WIDTH - 16 - s.width
                const maxY = BASE_HEIGHT - 16 - s.height
                
                return {
                  x: Math.max(minX, Math.min(maxX, pos.x)),
                  y: Math.max(minY, Math.min(maxY, pos.y))
                }
              }}
            >
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

              {s.type === 'modular' && (() => {
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
                    
                    {Array.from({ length: numPuertas }).map((_, i) => {
                      const manijaIzquierda = i % 2 === 1
                      
                      return (
                        <React.Fragment key={`puerta-${i}`}>
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
                          <Rect
                            x={manijaIzquierda 
                              ? i * puertaWidth + 8
                              : i * puertaWidth + puertaWidth - 12
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
                  fill="#f0f0f0" 
                  stroke={selectedId === s.id ? '#4A90E2' : '#999'}
                  strokeWidth={selectedId === s.id ? 3 : 2}
                  shadowColor="black"
                  shadowBlur={4}
                  shadowOpacity={0.3}
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
