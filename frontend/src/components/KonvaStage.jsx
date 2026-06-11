import React, { useRef, useState, useEffect, useImperativeHandle, forwardRef } from 'react'
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
  base: {
    width: 70, height: 10, depth: 65,
    zocaloCaras: { frontal: true, lateral_izq: true, lateral_der: true, trasera: false },
    numZocaloDivisiones: 0,
  },
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

const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)
// En móvil el dedo tiene ~40px de imprecisión vs ~5px del cursor.
// Los umbrales están en unidades de canvas (700px base), escala ~0.5 en móvil.
const SNAP_THRESHOLD = isTouchDevice ? 30 : 8
const SNAP_THRESHOLD_PRINCIPALES = isTouchDevice ? 65 : 22

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function clampToCanvas(shape, canvasWidth, canvasHeight) {
  const minX = 8
  const minY = 8
  const maxX = canvasWidth - 16 - shape.width
  const maxY = canvasHeight - 16 - shape.height

  return {
    x: clamp(shape.x, minX, maxX),
    y: clamp(shape.y, minY, maxY)
  }
}

function isPointInsideRect(point, rect) {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  )
}

function getContainers(shapes) {
  return shapes.filter(s => COLLISION_GROUPS.PRINCIPALES.includes(s.type))
}

function getContainerAtPoint(shapes, point) {
  const containers = getContainers(shapes).filter(c => isPointInsideRect(point, c))
  if (containers.length === 0) return null

  return containers[containers.length - 1]
}

function getContainerForShape(shapes, shape) {
  const center = {
    x: shape.x + shape.width / 2,
    y: shape.y + shape.height / 2
  }

  return getContainerAtPoint(shapes, center)
}

function getDivisionLines(container, shapes) {
  const vertical = []
  const horizontal = []

  shapes.forEach(s => {
    if (!COLLISION_GROUPS.INTERNOS.includes(s.type)) return
    if (s.id === container.id) return

    const center = { x: s.x + s.width / 2, y: s.y + s.height / 2 }
    if (!isPointInsideRect(center, container)) return

    if (s.type === 'divisor') {
      vertical.push(s.x)
      vertical.push(s.x + s.width)
    }
    if (s.type === 'estante') {
      horizontal.push(s.y)
      horizontal.push(s.y + s.height)
    }
  })

  const uniqueSorted = (values) => Array.from(new Set(values)).sort((a, b) => a - b)

  return {
    vertical: uniqueSorted(vertical),
    horizontal: uniqueSorted(horizontal)
  }
}

function computeCompartmentBounds(container, point, divisions) {
  // Define the sub-compartment by nearest divider lines around the drop point.
  const leftCandidates = divisions.vertical.filter(x => x < point.x)
  const rightCandidates = divisions.vertical.filter(x => x > point.x)
  const topCandidates = divisions.horizontal.filter(y => y < point.y)
  const bottomCandidates = divisions.horizontal.filter(y => y > point.y)

  const left = leftCandidates.length > 0 ? Math.max(...leftCandidates) : container.x
  const right = rightCandidates.length > 0 ? Math.min(...rightCandidates) : container.x + container.width
  const top = topCandidates.length > 0 ? Math.max(...topCandidates) : container.y
  const bottom = bottomCandidates.length > 0 ? Math.min(...bottomCandidates) : container.y + container.height

  return {
    x: left,
    y: top,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top)
  }
}

function fitInternalToCompartment(shape, compartment, dropPoint) {
  const base = defaultSizes[shape.type] || { width: shape.width, height: shape.height }

  if (shape.type === 'estante') {
    const height = base.height
    // Estante spans full width, Y clamps within compartment height.
    return {
      ...shape,
      width: compartment.width,
      height,
      x: compartment.x,
      y: clamp(dropPoint.y - height / 2, compartment.y, compartment.y + compartment.height - height)
    }
  }

  if (shape.type === 'divisor') {
    const width = base.width
    // Divisor spans full height, X clamps within compartment width.
    return {
      ...shape,
      width,
      height: compartment.height,
      x: clamp(dropPoint.x - width / 2, compartment.x, compartment.x + compartment.width - width),
      y: compartment.y
    }
  }

  if (shape.type === 'puerta') {
    // Puerta fills the full compartment front.
    return {
      ...shape,
      width: compartment.width,
      height: compartment.height,
      x: compartment.x,
      y: compartment.y
    }
  }

  return { ...shape }
}

function snapInternalToCompartmentEdges(shape, compartment, threshold) {
  const right = compartment.x + compartment.width - shape.width
  const bottom = compartment.y + compartment.height - shape.height
  let nextX = shape.x
  let nextY = shape.y

  if (shape.type !== 'estante') {
    if (Math.abs(shape.x - compartment.x) <= threshold) nextX = compartment.x
    if (Math.abs(shape.x - right) <= threshold) nextX = right
  }

  if (shape.type !== 'divisor') {
    if (Math.abs(shape.y - compartment.y) <= threshold) nextY = compartment.y
    if (Math.abs(shape.y - bottom) <= threshold) nextY = bottom
  }

  return { ...shape, x: nextX, y: nextY }
}

function findSnapPositionToEdges(newShape, referenceShapes, canvasWidth, canvasHeight, threshold) {
  let bestX = newShape.x
  let bestY = newShape.y
  let minDistance = threshold + 1

  referenceShapes.forEach(other => {
    const candidates = [
      { x: other.x, y: newShape.y, distance: Math.abs(newShape.x - other.x) },
      { x: other.x + other.width - newShape.width, y: newShape.y, distance: Math.abs(newShape.x - (other.x + other.width - newShape.width)) },
      { x: other.x - newShape.width, y: newShape.y, distance: Math.abs(newShape.x - (other.x - newShape.width)) },
      { x: other.x + other.width, y: newShape.y, distance: Math.abs(newShape.x - (other.x + other.width)) },
      { x: newShape.x, y: other.y, distance: Math.abs(newShape.y - other.y) },
      { x: newShape.x, y: other.y + other.height - newShape.height, distance: Math.abs(newShape.y - (other.y + other.height - newShape.height)) },
      { x: newShape.x, y: other.y - newShape.height, distance: Math.abs(newShape.y - (other.y - newShape.height)) },
      { x: newShape.x, y: other.y + other.height, distance: Math.abs(newShape.y - (other.y + other.height)) }
    ]

    candidates.forEach(candidate => {
      if (candidate.distance > threshold) return
      const clamped = clampToCanvas({ ...newShape, x: candidate.x, y: candidate.y }, canvasWidth, canvasHeight)
      if (candidate.distance < minDistance) {
        minDistance = candidate.distance
        bestX = clamped.x
        bestY = clamped.y
      }
    })
  })

  return { x: bestX, y: bestY }
}

function getCollisionShapesForInternal(shapes, container) {
  return shapes.filter(s => {
    if (container && s.id === container.id) return false
    if (container && COLLISION_GROUPS.INTERNOS.includes(s.type)) {
      const otherContainer = getContainerForShape(shapes, s)
      if (otherContainer && otherContainer.id === container.id) return false
    }
    return true
  })
}

function resolveInternalPlacement(candidateShape, shapes, canvasWidth, canvasHeight) {
  const dropPoint = {
    x: candidateShape.x + candidateShape.width / 2,
    y: candidateShape.y + candidateShape.height / 2
  }

  const container = getContainerAtPoint(shapes, dropPoint)

  // INTERNOs solo son válidos dentro de un módulo principal
  if (!container) {
    return { shape: candidateShape, isValid: false }
  }

  let adjusted = { ...candidateShape }

  const divisions = getDivisionLines(container, shapes)
  const compartment = computeCompartmentBounds(container, dropPoint, divisions)

  adjusted = fitInternalToCompartment(adjusted, compartment, dropPoint)
  adjusted = snapInternalToCompartmentEdges(adjusted, compartment, SNAP_THRESHOLD)

  const clamped = clampToCanvas(adjusted, canvasWidth, canvasHeight)
  adjusted.x = clamped.x
  adjusted.y = clamped.y

  const collisionShapes = getCollisionShapesForInternal(shapes, container)
  const hasCollision = collisionShapes.some(s => checkCollision(adjusted, s))

  return { shape: adjusted, isValid: !hasCollision }
}

// ========== MANEJO DE COLISIONES POR GRUPO ==========

// GRUPO 1: Puerta, Estante, Divisor (Elementos internos)
function handleInternosCollision(candidateShape, shapes, BASE_WIDTH, BASE_HEIGHT) {
  const resolved = resolveInternalPlacement(candidateShape, shapes, BASE_WIDTH, BASE_HEIGHT)
  return resolved.isValid ? resolved.shape : null
}

function findSnapPositionInternos(newShape, existingShapes, canvasWidth, canvasHeight) {
  const referenceShapes = existingShapes.filter(s => 
    s.type === 'cubierta' || COLLISION_GROUPS.PRINCIPALES.includes(s.type)
  )

  return findSnapPositionToEdges(newShape, referenceShapes, canvasWidth, canvasHeight, SNAP_THRESHOLD)
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

function getSnapReferencesForPrincipales(existingShapes) {
  const principales = existingShapes.filter(s => COLLISION_GROUPS.PRINCIPALES.includes(s.type))
  if (principales.length > 0) return principales

  return existingShapes.filter(s => COLLISION_GROUPS.HORIZONTALES.includes(s.type))
}

function findSnapPositionPrincipales(newShape, existingShapes, canvasWidth, canvasHeight) {
  const references = getSnapReferencesForPrincipales(existingShapes)
  if (references.length === 0) {
    return { x: Math.round(newShape.x), y: Math.round(newShape.y) }
  }

  const threshold = SNAP_THRESHOLD_PRINCIPALES
  let bestSingle = { x: newShape.x, y: newShape.y, distance: threshold + 1 }
  let bestCorner = null
  let bestCornerScore = Number.POSITIVE_INFINITY
  const xCandidates = []

  references.forEach(other => {
    const xOptions = [
      { value: other.x, distance: Math.abs(newShape.x - other.x), refId: other.id },
      { value: other.x + other.width - newShape.width, distance: Math.abs(newShape.x - (other.x + other.width - newShape.width)), refId: other.id },
      { value: other.x - newShape.width, distance: Math.abs(newShape.x - (other.x - newShape.width)), refId: other.id },
      { value: other.x + other.width, distance: Math.abs(newShape.x - (other.x + other.width)), refId: other.id }
    ]

    const yOptions = [
      { value: other.y, distance: Math.abs(newShape.y - other.y), refId: other.id },
      { value: other.y + other.height - newShape.height, distance: Math.abs(newShape.y - (other.y + other.height - newShape.height)), refId: other.id },
      { value: other.y - newShape.height, distance: Math.abs(newShape.y - (other.y - newShape.height)), refId: other.id },
      { value: other.y + other.height, distance: Math.abs(newShape.y - (other.y + other.height)), refId: other.id }
    ]

    xOptions.forEach(option => {
      if (option.distance > threshold) return
      xCandidates.push(option)
      if (option.distance < bestSingle.distance) {
        const clamped = clampToCanvas({ ...newShape, x: option.value, y: newShape.y }, canvasWidth, canvasHeight)
        bestSingle = { x: clamped.x, y: clamped.y, distance: option.distance }
      }
    })

    yOptions.forEach(option => {
      if (option.distance > threshold) return
      if (option.distance < bestSingle.distance) {
        const clamped = clampToCanvas({ ...newShape, x: newShape.x, y: option.value }, canvasWidth, canvasHeight)
        bestSingle = { x: clamped.x, y: clamped.y, distance: option.distance }
      }
    })

    xOptions.forEach(xOption => {
      if (xOption.distance > threshold) return
      yOptions.forEach(yOption => {
        if (yOption.distance > threshold) return
        const clamped = clampToCanvas({ ...newShape, x: xOption.value, y: yOption.value }, canvasWidth, canvasHeight)
        const score = xOption.distance + yOption.distance
        if (score < bestCornerScore) {
          bestCornerScore = score
          bestCorner = { x: clamped.x, y: clamped.y }
        }
      })
    })
  })

  if (bestCorner) {
    return { x: Math.round(bestCorner.x), y: Math.round(bestCorner.y) }
  }

  if (xCandidates.length > 1) {
    const left = xCandidates.filter(c => c.value <= newShape.x)
    const right = xCandidates.filter(c => c.value >= newShape.x)
    if (left.length > 0 && right.length > 0) {
      const bestX = xCandidates.reduce((best, current) =>
        current.distance < best.distance ? current : best
      , xCandidates[0])
      const clamped = clampToCanvas({ ...newShape, x: bestX.value, y: newShape.y }, canvasWidth, canvasHeight)
      return { x: Math.round(clamped.x), y: Math.round(clamped.y) }
    }
  }

  return { x: Math.round(bestSingle.x), y: Math.round(bestSingle.y) }
}

function findAttachPositionPrincipales(newShape, existingShapes, canvasWidth, canvasHeight) {
  const references = getSnapReferencesForPrincipales(existingShapes)
  let bestPosition = null
  let minDistance = Number.POSITIVE_INFINITY
  // Limitar cuánto puede "volar" un módulo al resolver colisión.
  // En móvil el dedo es impreciso, así que el límite es más generoso
  // pero evita que el módulo salte al otro extremo del canvas.
  const maxAllowedDist = isTouchDevice ? 160 : 80

  references.forEach(other => {
    const candidates = [
      { x: other.x - newShape.width, y: newShape.y },
      { x: other.x + other.width, y: newShape.y },
      { x: newShape.x, y: other.y - newShape.height },
      { x: newShape.x, y: other.y + other.height }
    ]

    candidates.forEach(candidate => {
      const clamped = clampToCanvas({ ...newShape, x: candidate.x, y: candidate.y }, canvasWidth, canvasHeight)
      const distance = Math.abs(newShape.x - clamped.x) + Math.abs(newShape.y - clamped.y)
      if (distance >= minDistance || distance > maxAllowedDist) return

      const testShape = { ...newShape, x: clamped.x, y: clamped.y }
      const hasCollision = existingShapes.some(s => checkCollision(testShape, s))
      if (hasCollision) return

      minDistance = distance
      bestPosition = { x: clamped.x, y: clamped.y }
    })
  })

  if (!bestPosition) return null

  return { x: Math.round(bestPosition.x), y: Math.round(bestPosition.y) }
}

// ========== COMPONENTE PRINCIPAL ==========

const KonvaStage = forwardRef(function KonvaStage({ 
  selectedModule, 
  shapes, 
  setShapes, 
  selectedId, 
  setSelectedId,
  updateShape,
  setSelectedModule
}, ref) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0, scale: 1 })
  const [zoom, setZoom] = useState(1)
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 })
  const [ghostShape, setGhostShape] = useState(null)
  const [isPanning, setIsPanning] = useState(false)
  const stageRef = useRef(null)
  const containerRef = useRef(null)
  const lastValidSnapRef = useRef(new Map())
  
  const BASE_WIDTH = 700
  const BASE_HEIGHT = 480
  
  useImperativeHandle(ref, () => ({
    exportImage: () => {
      if (!stageRef.current) return null
      const stage = stageRef.current
      const prevScale = stage.scale()
      const prevPos = stage.position()
      const prevSize = { width: stage.width(), height: stage.height() }

      stage.scale({ x: 1, y: 1 })
      stage.position({ x: 0, y: 0 })
      stage.size({ width: BASE_WIDTH, height: BASE_HEIGHT })
      stage.batchDraw()

      const dataUrl = stage.toDataURL({
        mimeType: 'image/jpeg',
        quality: 0.7,
        pixelRatio: 1,
        backgroundColor: '#ffffff',
      })

      stage.size(prevSize)
      stage.scale(prevScale)
      stage.position(prevPos)
      stage.batchDraw()

      return dataUrl
    },
  }))

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    
    const updateDimensions = () => {
      const containerWidth = container.clientWidth
      const containerHeight = container.clientHeight

      if (containerWidth === 0 || containerHeight === 0) {
        return
      }
      
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

    if (COLLISION_GROUPS.INTERNOS.includes(selectedModule)) {
      const resolved = resolveInternalPlacement({ ...candidateShape }, shapes, BASE_WIDTH, BASE_HEIGHT)
      setGhostShape({ ...resolved.shape, isValid: resolved.isValid })
      return
    }

    if (COLLISION_GROUPS.PRINCIPALES.includes(selectedModule)) {
      const snappedPos = findSnapPositionPrincipales(candidateShape, shapes, BASE_WIDTH, BASE_HEIGHT)
      let previewShape = { ...candidateShape, x: snappedPos.x, y: snappedPos.y }
      let isValid = !shapes.some(s => checkCollision(previewShape, s))

      if (!isValid) {
        const attachPos = findAttachPositionPrincipales(candidateShape, shapes, BASE_WIDTH, BASE_HEIGHT)
        if (attachPos) {
          previewShape = { ...candidateShape, x: attachPos.x, y: attachPos.y }
          isValid = true
        }
      }

      setGhostShape({ ...previewShape, isValid })
      return
    }

    // Solo HORIZONTALES llega aquí (INTERNOS y PRINCIPALES retornan antes)
    const hasCollision = shapes.some(s => checkCollision(candidateShape, s))

    if (hasCollision) {
      const processedShape = handleHorizontalesCollision({ ...candidateShape }, shapes, BASE_WIDTH, BASE_HEIGHT)
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

    // INTERNOS (estante/divisor/puerta) deben colocarse dentro de un container.
    // En móvil el usuario toca el container directamente, por lo que e.target
    // es el Rect del container (no el Stage). Permitimos placement igualmente.
    const canPlaceInternal = selectedModule && COLLISION_GROUPS.INTERNOS.includes(selectedModule)

    if (selectedModule && (e.target === stage || canPlaceInternal)) {
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
        }),
        ...(selectedModule === 'base' && {
          zocaloCaras: base.zocaloCaras || { frontal: true, lateral_izq: true, lateral_der: true, trasera: false },
          numZocaloDivisiones: base.numZocaloDivisiones ?? 0,
        })
      }

      if (COLLISION_GROUPS.INTERNOS.includes(selectedModule)) {
        const resolved = resolveInternalPlacement(candidateShape, shapes, BASE_WIDTH, BASE_HEIGHT)
        if (!resolved.isValid) return
        candidateShape.x = resolved.shape.x
        candidateShape.y = resolved.shape.y
        candidateShape.width = resolved.shape.width
        candidateShape.height = resolved.shape.height
      } else {
        const hasCollision = shapes.some(s => checkCollision(candidateShape, s))
        
        if (hasCollision) {
          let processedShape = null

          if (COLLISION_GROUPS.HORIZONTALES.includes(selectedModule)) {
            processedShape = handleHorizontalesCollision(candidateShape, shapes, BASE_WIDTH, BASE_HEIGHT)
          }
          else if (COLLISION_GROUPS.PRINCIPALES.includes(selectedModule)) {
            processedShape = handlePrincipalesCollision(candidateShape, shapes, BASE_WIDTH, BASE_HEIGHT)
          }

          if (!processedShape) return
          candidateShape.x = processedShape.x
          candidateShape.y = processedShape.y
        } else if (COLLISION_GROUPS.PRINCIPALES.includes(selectedModule)) {
          const snappedPos = findSnapPositionPrincipales(candidateShape, shapes, BASE_WIDTH, BASE_HEIGHT)
          const snappedCandidate = { ...candidateShape, x: snappedPos.x, y: snappedPos.y }
          const stillValid = !shapes.some(s => checkCollision(snappedCandidate, s))
          if (stillValid) {
            candidateShape.x = snappedCandidate.x
            candidateShape.y = snappedCandidate.y
          }
        }
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

    if (COLLISION_GROUPS.INTERNOS.includes(updatedShape.type)) {
      const resolved = resolveInternalPlacement(updatedShape, otherShapes, BASE_WIDTH, BASE_HEIGHT)
      if (!resolved.isValid) {
        node.x(draggedShape.x)
        node.y(draggedShape.y)
        return
      }

      updatedShape.x = resolved.shape.x
      updatedShape.y = resolved.shape.y
      updatedShape.width = resolved.shape.width
      updatedShape.height = resolved.shape.height
      node.x(updatedShape.x)
      node.y(updatedShape.y)
    } else {
      let snappedForPrincipal = null
      const hasCollision = otherShapes.some(s => checkCollision(updatedShape, s))
      
      if (hasCollision) {
        let snappedPos = null
        let attachPos = null

        if (COLLISION_GROUPS.PRINCIPALES.includes(updatedShape.type)) {
          attachPos = findAttachPositionPrincipales(updatedShape, otherShapes, BASE_WIDTH, BASE_HEIGHT)
        }

        if (COLLISION_GROUPS.PRINCIPALES.includes(updatedShape.type)) {
          snappedPos = findSnapPositionPrincipales(updatedShape, otherShapes, BASE_WIDTH, BASE_HEIGHT)
        } else if (COLLISION_GROUPS.HORIZONTALES.includes(updatedShape.type)) {
          const centered = findCenterPositionHorizontales(otherShapes, updatedShape, BASE_WIDTH, BASE_HEIGHT)
          snappedPos = centered
        }

        if (attachPos) {
          updatedShape.x = attachPos.x
          updatedShape.y = attachPos.y
          node.x(updatedShape.x)
          node.y(updatedShape.y)
          snappedForPrincipal = { x: updatedShape.x, y: updatedShape.y }
        } else if (snappedPos) {
          updatedShape.x = snappedPos.x
          updatedShape.y = snappedPos.y
          node.x(updatedShape.x)
          node.y(updatedShape.y)
          if (COLLISION_GROUPS.PRINCIPALES.includes(updatedShape.type)) {
            snappedForPrincipal = { x: updatedShape.x, y: updatedShape.y }
          }
        }
        
        const finalCheck = otherShapes.some(s => checkCollision(updatedShape, s))
        if (finalCheck) {
          if (COLLISION_GROUPS.PRINCIPALES.includes(updatedShape.type)) {
            const lastValid = lastValidSnapRef.current.get(shapeId)
            if (lastValid) {
              node.x(lastValid.x)
              node.y(lastValid.y)
              updateShape(shapeId, { x: lastValid.x, y: lastValid.y })
              return
            }
          }
          node.x(draggedShape.x)
          node.y(draggedShape.y)
          return
        }
      } else if (COLLISION_GROUPS.PRINCIPALES.includes(updatedShape.type)) {
        const snappedPos = findSnapPositionPrincipales(updatedShape, otherShapes, BASE_WIDTH, BASE_HEIGHT)
        const snappedCandidate = { ...updatedShape, x: snappedPos.x, y: snappedPos.y }
        const stillValid = !otherShapes.some(s => checkCollision(snappedCandidate, s))
        if (stillValid) {
          updatedShape.x = snappedCandidate.x
          updatedShape.y = snappedCandidate.y
          node.x(updatedShape.x)
          node.y(updatedShape.y)
          if (snappedPos.x !== newX || snappedPos.y !== newY) {
            snappedForPrincipal = { x: updatedShape.x, y: updatedShape.y }
          }
        }
      }

      if (snappedForPrincipal) {
        lastValidSnapRef.current.set(shapeId, snappedForPrincipal)
      }
    }

    updateShape(shapeId, {
      x: updatedShape.x,
      y: updatedShape.y,
      width: updatedShape.width,
      height: updatedShape.height
    })
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
        onTouchMove={handleMouseMove}
        onTouchEnd={handleStageMouseUp}
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
              draggable={!selectedModule}
              rotation={s.rotation}
              onDragEnd={e => handleDragEnd(s.id, e)}
              onClick={() => { if (!selectedModule) setSelectedId(s.id) }}
              onTap={() => { if (!selectedModule) setSelectedId(s.id) }}
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
                  hitStrokeWidth={isTouchDevice ? 22 : 0}
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
                  hitStrokeWidth={isTouchDevice ? 16 : 0}
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
                  hitStrokeWidth={isTouchDevice ? 22 : 0}
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
                  hitStrokeWidth={isTouchDevice ? 16 : 0}
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
})

export default KonvaStage
