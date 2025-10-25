import React, { useRef, useState, useEffect } from 'react'
import { Stage, Layer, Rect, Group, Text } from 'react-konva'

const defaultSizes = {
  estante: { width: 120, height: 20, depth: 30 },
  cajonera: { width: 120, height: 140, depth: 40 },
  base: { width: 140, height: 12, depth: 40 },
  divisor: { width: 4, height: 120, depth: 2 },
  cubierta: { width: 140, height: 6, depth: 60 },
  puerta: { width: 40, height: 120, depth: 2 },
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

// Encuentra la mejor posición sin colisión, intentando pegar al borde más cercano
function findSnapPosition(newShape, existingShapes, canvasWidth, canvasHeight, snapThreshold = 8) {
  let bestX = newShape.x
  let bestY = newShape.y
  let minDistance = Infinity

  // Límites del canvas (considera el padding del fondo)
  const minX = 8
  const minY = 8
  const maxX = canvasWidth - 16 - newShape.width
  const maxY = canvasHeight - 16 - newShape.height

  for (const other of existingShapes) {
    if (other.id === newShape.id) continue

    // Calcula las 4 posiciones de "pegado" posibles (arriba, abajo, izquierda, derecha)
    const positions = [
      { x: other.x + other.width, y: other.y, side: 'right' }, // derecha
      { x: other.x - newShape.width, y: other.y, side: 'left' }, // izquierda
      { x: other.x, y: other.y + other.height, side: 'bottom' }, // abajo
      { x: other.x, y: other.y - newShape.height, side: 'top' }, // arriba
    ]

    for (const pos of positions) {
      // Limita la posición a los bordes del canvas
      const clampedX = Math.max(minX, Math.min(maxX, pos.x))
      const clampedY = Math.max(minY, Math.min(maxY, pos.y))
      
      const testShape = { ...newShape, x: clampedX, y: clampedY }
      
      // Verifica si esta posición colisiona con alguna figura existente
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

  // Si no se encontró posición válida, intenta centrar en espacio libre
  if (bestX === newShape.x && bestY === newShape.y) {
    // Limita la posición original al canvas
    bestX = Math.max(minX, Math.min(maxX, newShape.x))
    bestY = Math.max(minY, Math.min(maxY, newShape.y))
  }

  return { x: bestX, y: bestY }
}

export default function KonvaStage({ width = 900, height = 560, shapes, setShapes, selectedModule, setSelectedModule, selectedId, setSelectedId }) {
  const containerRef = useRef(null)
  const ORIGINAL_WIDTH = width
  const ORIGINAL_HEIGHT = height
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const calc = () => {
      const w = Math.max(240, container.clientWidth) // evita valores 0/pequeños
      const newScale = Math.min(1, w / ORIGINAL_WIDTH)
      setScale(newScale)
    }
    const ro = new ResizeObserver(calc)
    ro.observe(container)
    calc()
    return () => ro.disconnect()
  }, [ORIGINAL_WIDTH])

  const handleStageMouseDown = (e) => {
    const stage = e.target.getStage()
    const pos = stage.getPointerPosition()
    if (!pos) return
    if (e.target !== stage) return
    if (!selectedModule) return

    const base = defaultSizes[selectedModule] || { width: 60, height: 60, depth: 20 }
    const id = Date.now()
    const vx = pos.x / scale
    const vy = pos.y / scale
    
    const candidateShape = {
      id,
      type: selectedModule,
      x: vx - base.width / 2,
      y: vy - base.height / 2,
      width: base.width,
      height: base.height,
      depth: base.depth,
      rotation: 0,
    }

    // Verifica colisión antes de añadir
    const hasCollision = shapes.some(s => checkCollision(candidateShape, s))
    
    if (hasCollision) {
      // Intenta encontrar posición pegada sin colisión
      const snappedPos = findSnapPosition(candidateShape, shapes, ORIGINAL_WIDTH, ORIGINAL_HEIGHT, 100)
      candidateShape.x = snappedPos.x
      candidateShape.y = snappedPos.y
      
      // Verifica de nuevo si sigue habiendo colisión después del snap
      const stillCollides = shapes.some(s => checkCollision(candidateShape, s))
      if (stillCollides) {
        // No permite colocar si no hay espacio
        return
      }
    }

    setShapes(prev => [...prev, candidateShape])
    setSelectedId(id)

    if (typeof setSelectedModule === 'function') setSelectedModule(null)
  }

  const updateShape = (id, patch) => {
    setShapes(prev => prev.map(s => (s.id === id ? { ...s, ...patch } : s)))
  }

  const handleDragEnd = (shapeId, e) => {
    const vx = e.target.x() / scale
    const vy = e.target.y() / scale
    
    const draggedShape = shapes.find(s => s.id === shapeId)
    if (!draggedShape) return

    const updatedShape = { ...draggedShape, x: vx, y: vy }
    const otherShapes = shapes.filter(s => s.id !== shapeId)

    // Limita al canvas
    const minX = 8
    const minY = 8
    const maxX = ORIGINAL_WIDTH - 16 - updatedShape.width
    const maxY = ORIGINAL_HEIGHT - 16 - updatedShape.height
    updatedShape.x = Math.max(minX, Math.min(maxX, updatedShape.x))
    updatedShape.y = Math.max(minY, Math.min(maxY, updatedShape.y))

    // Verifica colisión
    const hasCollision = otherShapes.some(s => checkCollision(updatedShape, s))
    
    if (hasCollision) {
      // Intenta snap
      const snappedPos = findSnapPosition(updatedShape, otherShapes, ORIGINAL_WIDTH, ORIGINAL_HEIGHT, 50)
      updatedShape.x = snappedPos.x
      updatedShape.y = snappedPos.y
      
      // Si sigue colisionando después del snap, revierte a posición original
      const stillCollides = otherShapes.some(s => checkCollision(updatedShape, s))
      if (stillCollides) {
        e.target.x(draggedShape.x * scale)
        e.target.y(draggedShape.y * scale)
        return
      }
    }

    updateShape(shapeId, { x: updatedShape.x, y: updatedShape.y })
  }

  return (
    <div ref={containerRef} style={{ width: '100%', boxSizing: 'border-box' }}>
      <Stage
        width={ORIGINAL_WIDTH}
        height={ORIGINAL_HEIGHT}
        scaleX={scale}
        scaleY={scale}
        style={{ width: ORIGINAL_WIDTH * scale + 'px', height: ORIGINAL_HEIGHT * scale + 'px', display: 'block', margin: '0 auto' }}
        onMouseDown={handleStageMouseDown}
      >
        <Layer>
          {/* fondo redondeado */}
          <Rect
            x={8}
            y={8}
            width={ORIGINAL_WIDTH - 16}
            height={ORIGINAL_HEIGHT - 16}
            cornerRadius={12}
            fill={scale < 1 ? '#16171a' : '#f3ecf6'}
            stroke={scale < 1 ? '#2a2d30' : '#ddd'}
            strokeWidth={1}
            listening={false}
          />
          <Text x={18} y={18} text="Lienzo: haz clic para añadir el módulo seleccionado" fontSize={12} fill={scale < 1 ? '#9aa0a6' : '#666'} />

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
              {/* ESTANTE - líneas horizontales simples */}
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
                  {/* líneas decorativas */}
                  <Rect x={4} y={s.height/2 - 1} width={s.width - 8} height={2} fill="#bbb" />
                </>
              )}

              {/* CAJONERA - 3 cajones con manijas */}
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
                  {Array.from({ length: 3 }).map((_, i) => {
                    const drawerHeight = (s.height - 24) / 3
                    const drawerY = 8 + i * (drawerHeight + 4)
                    return (
                      <Group key={i}>
                        {/* cajón */}
                        <Rect 
                          x={6} 
                          y={drawerY} 
                          width={s.width - 12} 
                          height={drawerHeight} 
                          fill="#fff" 
                          stroke="#ccc"
                          strokeWidth={1}
                        />
                        {/* manija rectangular */}
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

              {/* BASE/ZÓCALO - rectángulo simple oscuro */}
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

              {/* DIVISOR - línea vertical delgada */}
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

              {/* CUBIERTA - superficie plana con borde */}
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

              {/* PUERTA - panel con manija vertical */}
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
                  {/* manija vertical */}
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