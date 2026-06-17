// ============================================
// Cubicación Avanzada - Optimización de Planchas
// Algoritmo: Guillotine Rectangle Packing con Rotación
// ============================================

// Configuración de planchas (en CM)
export const BOARD_CONFIGS = {
  melamina: {
    width: 250,      // Ancho en CM
    height: 183,     // Alto en CM
    name: 'Melamina',
    kerf: 0.3,       // Grosor de corte (3mm = 0.3cm)
  },
  // Puedes agregar más tipos de tableros aquí
}

/**
 * Estructura de pieza de corte
 * @typedef {Object} Piece
 * @property {string} id - ID único (shape.id)
 * @property {string} moduleType - Tipo de módulo (cajonera, modular, etc)
 * @property {string} description - Descripción de la pieza (Frente, Lateral, etc)
 * @property {number} width - Ancho en CM
 * @property {number} height - Alto en CM
 * @property {number} quantity - Cantidad necesaria
 * @property {number} area - Área en CM² (calculada)
 * @property {string} [materialId] - ID de material si aplica
 */

/**
 * Genera lista de piezas estructurada por módulo
 * @param {Array} shapes - Array de shapes del canvas
 * @returns {Object} { byModule: Map, allPieces: Array }
 */
export function generateStructuredCuts(shapes, options = {}) {
  const byModule = new Map() // Map<moduleId, { type, name, pieces: [] }>
  const allPieces = []
  const drawerTypes = Array.isArray(options.drawerTypes) ? options.drawerTypes : []
  const drawerTypeMap = new Map(drawerTypes.map((item) => [item._id, item]))
  const materialsList = Array.isArray(options.materials) ? options.materials : []
  const materialMap = new Map(materialsList.map((m) => [String(m._id), m]))

  const roundToTenth = (value) => Math.round(value * 10) / 10

  const tapaCantos = Array.isArray(options.tapaCantos) ? options.tapaCantos : []
  const tapaCantoMap = new Map(tapaCantos.map((item) => [item._id, item]))
  const tapaCantoAccum = new Map()
  const defaultTapaCantoId = tapaCantos.length > 0 ? tapaCantos[0]._id : null
  const defaultDrawerTypeId = drawerTypes.length > 0 ? drawerTypes[0]._id : null
  const { selectedTapaCantoId, selectedDrawerTypeId } = options

  const addPiece = (target, piece) => {
    target.push({
      ...piece,
      area: piece.width * piece.height,
    })
  }

  const addTapaCanto = (tapaCantoId, linealMetersCm) => {
    const effectiveId = selectedTapaCantoId || tapaCantoId || defaultTapaCantoId
    if (!effectiveId) return
    const material = tapaCantoMap.get(effectiveId)
    if (!material) return
    const linealMeters = linealMetersCm / 100
    if (!tapaCantoAccum.has(effectiveId)) {
      tapaCantoAccum.set(effectiveId, {
        materialId: effectiveId,
        materialName: material.nombre,
        color: material.color || null,
        precio: Number(material.precio) || 0,
        linealMeters: 0,
      })
    }
    tapaCantoAccum.get(effectiveId).linealMeters += linealMeters
  }

  // First pass: count how many of each type
  const typeCount = {}
  const typeIndex = {}
  shapes.forEach((shape) => {
    const type = shape.type.toUpperCase()
    typeCount[type] = (typeCount[type] || 0) + 1
    typeIndex[type] = 0
  })

  // Second pass: generate names
  shapes.forEach((shape) => {
    const moduleId = shape.id
    const type = shape.type.toUpperCase()
    typeIndex[type]++

    // Only add number if there's more than one of this type
    const moduleName = typeCount[type] > 1 
      ? `${type} ${typeIndex[type]}`
      : type

    const w = Math.round(shape.width)
    const h = Math.round(shape.height)
    const d = Math.round(shape.depth || 20)

    if (!byModule.has(moduleId)) {
      byModule.set(moduleId, {
        type: shape.type,
        name: moduleName,
        shapeId: moduleId,
        pieces: [],
      })
    }

    const modulePieces = byModule.get(moduleId).pieces

    // Generar piezas según tipo de módulo
    switch (shape.type) {
      case 'cajonera': {
        const numCajones = shape.numCajones && shape.numCajones > 0 ? shape.numCajones : 3
        const drawerFrontHeight = Math.round(h / numCajones)
        const mmToCm            = (mm) => (Number(mm) > 0 ? Number(mm) / 10 : 1.5)
        const cajoneraMat       = materialMap.get(String(shape.materialId))
        const grosorCajonera    = mmToCm(cajoneraMat?.grosor)
        const slideGapPerSide   = 1.3
        const internalWidth     = Math.max(0, roundToTenth(w - 2 * grosorCajonera - 2 * slideGapPerSide))
        const drawerOverrides = Array.isArray(shape.drawers) ? shape.drawers : []
        const drawerOverrideMap = new Map(
          drawerOverrides
            .filter((drawer) => drawer && drawer.index != null)
            .map((drawer) => [drawer.index, drawer.drawerTypeId])
        )

        addPiece(modulePieces, {
          description: 'Techo/Piso',
          width: w,
          height: d,
          quantity: 2,
        })
        addPiece(modulePieces, {
          description: 'Frente',
          width: w,
          height: drawerFrontHeight,
          quantity: numCajones,
        })
        addPiece(modulePieces, {
          description: 'Laterales',
          width: d,
          height: h,
          quantity: 2,
        })
        if (!shape.noFondo) {
          addPiece(modulePieces, {
            description: 'Fondo',
            width: w,
            height: h,
            quantity: 1,
            materialId: shape.fondoMaterialId || undefined,
          })
        }

        addTapaCanto(shape.tapaCantoId, w)

        for (let index = 1; index <= numCajones; index++) {
          const drawerTypeId = drawerOverrideMap.get(index) || selectedDrawerTypeId || shape.drawerTypeId || defaultDrawerTypeId
          const drawerType = drawerTypeMap.get(drawerTypeId)

          if (!drawerType) {
            continue
          }

          const heightDiscountCm = Number(drawerType.heightDiscountPct) || 0
          const lateralDiscount  = Number(drawerType.lateralDiscount)  >= 0 ? Number(drawerType.lateralDiscount)  : 5
          const separacionFondo  = Number(drawerType.separacionFondo)  >= 0 ? Number(drawerType.separacionFondo)  : 0
          const lateralMat       = materialMap.get(String(drawerType.laterales))
          const frontalMat       = materialMap.get(String(drawerType.frenteInterno))
          const lateralThickness = mmToCm(lateralMat?.grosor)
          const frontalThickness = mmToCm(frontalMat?.grosor)
          const drawerHeight     = Math.max(1, roundToTenth(drawerFrontHeight - heightDiscountCm))
          const lateralHeight    = Math.max(1, roundToTenth(drawerHeight - lateralDiscount))
          const drawerDepth      = Math.max(1, roundToTenth(d - separacionFondo))
          const innerFrontWidth  = Math.max(1, roundToTenth(internalWidth - 2 * lateralThickness))
          const fondoDepth       = Math.max(1, roundToTenth(drawerDepth - 2 * frontalThickness))

          addPiece(modulePieces, {
            description: 'Laterales cajon',
            width: drawerDepth,
            height: lateralHeight,
            quantity: 2,
          })
          addPiece(modulePieces, {
            description: 'Frente interno cajon',
            width: innerFrontWidth,
            height: lateralHeight,
            quantity: 1,
          })
          addPiece(modulePieces, {
            description: 'Trasera cajon',
            width: innerFrontWidth,
            height: lateralHeight,
            quantity: 1,
          })
          addPiece(modulePieces, {
            description: 'Fondo cajon',
            width: innerFrontWidth,
            height: fondoDepth,
            quantity: 1,
          })

          if (drawerType.hasRefuerzo) {
            addPiece(modulePieces, {
              description: 'Refuerzo cajon',
              width: roundToTenth(Math.max(0.3, w - 0.3)),
              height: roundToTenth(Math.max(0.3, drawerFrontHeight - 0.3)),
              quantity: 1,
            })
          }

          addTapaCanto(shape.tapaCantoId, 2 * internalWidth + 2 * drawerHeight)
          addTapaCanto(shape.tapaCantoId, d * 2)
        }
        break
      }

      case 'modular': {
        const numEstantes = shape.numEstantes !== undefined && shape.numEstantes !== null ? shape.numEstantes : 0
        const numDivisores = shape.numDivisores !== undefined && shape.numDivisores !== null ? shape.numDivisores : 0
        const numPuertas = shape.numPuertas !== undefined && shape.numPuertas !== null ? shape.numPuertas : 0

        modulePieces.push({
          description: 'Techo/Piso',
          width: w,
          height: d,
          quantity: 2,
          area: w * d,
        })
        modulePieces.push({
          description: `Laterales`,
          width: d,
          height: h,
          quantity: 2,
          area: d * h,
        })
        if (!shape.noFondo) {
          modulePieces.push({
            description: `Fondo`,
            width: w,
            height: h,
            quantity: 1,
            area: w * h,
            materialId: shape.fondoMaterialId || undefined,
          })
        }

        // Techo + Piso (×2) y 2 laterales
        addTapaCanto(shape.tapaCantoId, w * 2)
        addTapaCanto(shape.tapaCantoId, h * 2)

        if (numEstantes > 0) {
          modulePieces.push({
            description: `Estantes`,
            width: w,
            height: d,
            quantity: numEstantes,
            area: w * d,
          })
          addTapaCanto(shape.tapaCantoId, w * numEstantes)
        }

        if (numDivisores > 0) {
          modulePieces.push({
            description: 'Divisores',
            width: d,
            height: h,
            quantity: numDivisores,
            area: d * h,
          })
          addTapaCanto(shape.tapaCantoId, h * numDivisores)
        }

        if (numPuertas > 0) {
          const puertaWidth = Math.round(w / numPuertas)
          const puertaW = roundToTenth(Math.max(0.3, puertaWidth - 0.3))
          const puertaH = roundToTenth(Math.max(0.3, h - 0.3))
          modulePieces.push({
            description: `Puertas`,
            width: puertaW,
            height: puertaH,
            quantity: numPuertas,
            area: puertaW * puertaH,
          })
          addTapaCanto(shape.tapaCantoId, (2 * puertaWidth + 2 * h) * numPuertas)
        }
        break
      }

      case 'estante':
        modulePieces.push({
          description: `Estante`,
          width: w,
          height: d,
          quantity: 1,
          area: w * d,
        })
        addTapaCanto(shape.tapaCantoId, w)
        break

      case 'cubierta':
        modulePieces.push({
          description: `Cubierta`,
          width: w,
          height: d,
          quantity: 1,
          area: w * d,
        })
        break

      case 'puerta': {
        const pw = roundToTenth(Math.max(0.3, w - 0.3))
        const ph = roundToTenth(Math.max(0.3, h - 0.3))
        modulePieces.push({
          description: `Puerta`,
          width: pw,
          height: ph,
          quantity: 1,
          area: pw * ph,
        })
        addTapaCanto(shape.tapaCantoId, 2 * w + 2 * h)
        break
      }

      case 'base': {
        const caras = shape.zocaloCaras || { frontal: true, lateral_izq: false, lateral_der: false, trasera: false }
        const numDiv = shape.numZocaloDivisiones > 0 ? shape.numZocaloDivisiones : 0

        if (caras.frontal)
          modulePieces.push({ description: 'Zócalo frontal',  width: w, height: h, quantity: 1, area: w * h })
        if (caras.trasera)
          modulePieces.push({ description: 'Zócalo trasero',  width: w, height: h, quantity: 1, area: w * h })
        if (caras.lateral_izq)
          modulePieces.push({ description: 'Zócalo lat. izq', width: d, height: h, quantity: 1, area: d * h })
        if (caras.lateral_der)
          modulePieces.push({ description: 'Zócalo lat. der', width: d, height: h, quantity: 1, area: d * h })

        for (let i = 0; i < numDiv; i++) {
          modulePieces.push({ description: `Zócalo división ${i + 1}`, width: d, height: h, quantity: 1, area: d * h })
        }
        break
      }

      case 'divisor':
        // El divisor ocupa profundidad × alto en la plancha (w canvas = grosor visual, no el corte real)
        modulePieces.push({
          description: `Divisor`,
          width: d,
          height: h,
          quantity: 1,
          area: d * h,
        })
        break

      default:
        modulePieces.push({
          description: `Pieza`,
          width: w,
          height: h,
          quantity: 1,
          area: w * h,
        })
    }

    // Agregar a lista global con referencia al módulo
    modulePieces.forEach((piece) => {
      allPieces.push({
        ...piece,
        moduleId,
        moduleName,
        moduleType: shape.type,
      })
    })
  })

  const tapaCantoList = Array.from(tapaCantoAccum.values()).map((item) => ({
    ...item,
    linealMeters: Math.round(item.linealMeters * 100) / 100,
    totalCost: Math.round(item.linealMeters * item.precio * 100) / 100,
  }))

  return { byModule, allPieces, tapaCantoList }
}

/**
 * Algoritmo Guillotine Rectangle Packing con Rotación
 * Mejor utilización de espacio que Shelf Algorithm
 * @param {Array} pieces - Array de piezas a optimizar
 * @param {Object} boardConfig - Configuración del tablero
 * @returns {Object} { boards: Array, statistics: Object }
 */
export function optimizePiecesInBoards(pieces, boardConfig = BOARD_CONFIGS.melamina) {
  // Expandir piezas por cantidad
  const expandedPieces = []
  pieces.forEach((piece) => {
    for (let i = 0; i < piece.quantity; i++) {
      expandedPieces.push({
        ...piece,
        sequenceId: `${piece.moduleId}-${piece.description}-${i + 1}`,
        rotated: false,
      })
    }
  })

  // Probar múltiples estrategias de orden (incluyendo ascendentes) y quedarse con la que use menos planchas
  const sortStrategies = [
    (a, b) => b.width * b.height - a.width * a.height,
    (a, b) => a.width * a.height - b.width * b.height,
    (a, b) => Math.max(b.width, b.height) - Math.max(a.width, a.height),
    (a, b) => Math.max(a.width, a.height) - Math.max(b.width, b.height),
    (a, b) => (b.width + b.height) - (a.width + a.height),
    (a, b) => (a.width + a.height) - (b.width + b.height),
    (a, b) => Math.min(b.width, b.height) - Math.min(a.width, a.height),
    (a, b) => Math.min(a.width, a.height) - Math.min(b.width, b.height),
    (a, b) => Math.max(b.width, b.height) - Math.max(a.width, a.height) || b.width * b.height - a.width * a.height,
    (a, b) => Math.max(a.width, a.height) - Math.max(b.width, b.height) || a.width * a.height - b.width * b.height,
  ]

  let bestBoards = null
  for (const sortFn of sortStrategies) {
    const sorted = [...expandedPieces].sort(sortFn)
    const boards = runPacking(sorted, boardConfig)
    if (!bestBoards || boards.length < bestBoards.length) {
      bestBoards = boards
    }
  }

  // Fase de compactación: intentar mover todas las piezas del último tablero
  // a los tableros anteriores. Si caben, se elimina ese tablero.
  bestBoards = tryCompact(bestBoards, boardConfig)

  const statistics = calculateStatistics(bestBoards, boardConfig)
  return { boards: bestBoards, statistics }
}

function deepCopyBoards(boards) {
  return boards.map(b => ({
    ...b,
    pieces: [...b.pieces],
    freeRectangles: b.freeRectangles.map(r => ({ ...r })),
    usedArea: b.usedArea,
  }))
}

function tryCompact(boards, boardConfig) {
  if (boards.length < 2) return boards

  // Intentar eliminar el último tablero moviendo sus piezas a los anteriores
  const earlierBoards = deepCopyBoards(boards.slice(0, -1))
  const lastPieces = [...boards[boards.length - 1].pieces]
    .sort((a, b) => b.width * b.height - a.width * a.height) // intentar las más grandes primero

  for (const piece of lastPieces) {
    let placed = false
    for (const board of earlierBoards) {
      if (tryPlacePieceInBoard({ ...piece, rotated: false }, board, boardConfig, boardConfig.kerf)) {
        placed = true
        break
      }
    }
    if (!placed) return boards // no se puede compactar
  }

  // Todas las piezas del último tablero cupieron en los anteriores
  return tryCompact(earlierBoards, boardConfig) // intentar compactar de nuevo recursivamente
}

function runPacking(sortedPieces, boardConfig) {
  const boards = []
  const kerf = boardConfig.kerf

  for (const piece of sortedPieces) {
    let placed = false
    for (let boardIdx = 0; boardIdx < boards.length && !placed; boardIdx++) {
      if (tryPlacePieceInBoard(piece, boards[boardIdx], boardConfig, kerf)) placed = true
    }
    if (!placed) {
      const newBoard = {
        id: boards.length + 1,
        width: boardConfig.width,
        height: boardConfig.height,
        pieces: [],
        usedArea: 0,
        freeRectangles: [{ x: 0, y: 0, width: boardConfig.width, height: boardConfig.height }],
      }
      tryPlacePieceInBoard(piece, newBoard, boardConfig, kerf)
      boards.push(newBoard)
    }
  }
  return boards
}

/**
 * Intenta colocar una pieza en un tablero usando algoritmo MAXRECTS
 * Después de colocar cada pieza, recorta TODOS los rectángulos libres que se
 * solapan con ella — garantiza que no haya piezas superpuestas y maximiza el
 * aprovechamiento del espacio libre.
 * @private
 */
function tryPlacePieceInBoard(piece, board, boardConfig, kerf) {
  const orientations = [
    { width: piece.width, height: piece.height, rotated: false },
    { width: piece.height, height: piece.width, rotated: true },
  ]

  // BSSF: evaluar todas las orientaciones y rectángulos de una sola pasada
  let bestScore = Infinity
  let bestRectIdx = -1
  let bestOrientation = null

  for (const orientation of orientations) {
    const rw = orientation.width + kerf
    const rh = orientation.height + kerf
    for (let i = 0; i < board.freeRectangles.length; i++) {
      const rect = board.freeRectangles[i]
      if (rect.width >= rw && rect.height >= rh) {
        // BSSF: priorizar ajuste en el lado más corto; área como desempate
        const shortFit = Math.min(rect.width - rw, rect.height - rh)
        const score = shortFit * 1e6 + (rect.width * rect.height - rw * rh)
        if (score < bestScore) {
          bestScore = score
          bestRectIdx = i
          bestOrientation = orientation
        }
      }
    }
  }

  if (bestRectIdx === -1) return false

  const { width: ow, height: oh, rotated } = bestOrientation
  const rw = ow + kerf
  const rh = oh + kerf
  const rect = board.freeRectangles[bestRectIdx]
  const px = rect.x
  const py = rect.y

  board.pieces.push({ ...piece, width: ow, height: oh, x: px, y: py, rotated })
  board.usedArea += ow * oh

  const nextFreeRects = []
  for (const freeRect of board.freeRectangles) {
    nextFreeRects.push(...splitRectByPlacedPiece(freeRect, px, py, rw, rh))
  }
  board.freeRectangles = nextFreeRects
  mergeAndCleanRectangles(board.freeRectangles)

  return true
}

/**
 * Divide un rectángulo libre en las partes que quedan fuera del área ocupada.
 * Genera hasta 4 sub-rectángulos (izquierda, derecha, arriba, abajo de la pieza).
 * Si no hay solapamiento devuelve el rectángulo original intacto.
 * @private
 */
function splitRectByPlacedPiece(freeRect, px, py, pw, ph) {
  // Sin solapamiento — el rect queda tal cual
  if (
    px >= freeRect.x + freeRect.width ||
    px + pw <= freeRect.x ||
    py >= freeRect.y + freeRect.height ||
    py + ph <= freeRect.y
  ) {
    return [freeRect]
  }

  const result = []

  // Franja izquierda (entre freeRect.x y px)
  if (px > freeRect.x) {
    result.push({ x: freeRect.x, y: freeRect.y, width: px - freeRect.x, height: freeRect.height })
  }
  // Franja derecha (entre px+pw y el borde derecho de freeRect)
  if (px + pw < freeRect.x + freeRect.width) {
    result.push({ x: px + pw, y: freeRect.y, width: freeRect.x + freeRect.width - (px + pw), height: freeRect.height })
  }
  // Franja superior (entre freeRect.y y py)
  if (py > freeRect.y) {
    result.push({ x: freeRect.x, y: freeRect.y, width: freeRect.width, height: py - freeRect.y })
  }
  // Franja inferior (entre py+ph y el borde inferior de freeRect)
  if (py + ph < freeRect.y + freeRect.height) {
    result.push({ x: freeRect.x, y: py + ph, width: freeRect.width, height: freeRect.y + freeRect.height - (py + ph) })
  }

  return result
}

/**
 * Limpia y fusiona rectángulos libres superpuestos
 * @private
 */
function mergeAndCleanRectangles(rectangles) {
  // Remover rectángulos que están contenidos en otros
  for (let i = rectangles.length - 1; i >= 0; i--) {
    for (let j = 0; j < rectangles.length; j++) {
      if (i !== j) {
        const rect1 = rectangles[i]
        const rect2 = rectangles[j]

        // Si rect1 está contenido en rect2, remover rect1
        if (
          rect1.x >= rect2.x &&
          rect1.y >= rect2.y &&
          rect1.x + rect1.width <= rect2.x + rect2.width &&
          rect1.y + rect1.height <= rect2.y + rect2.height
        ) {
          rectangles.splice(i, 1)
          break
        }
      }
    }
  }
}

/**
 * Calcula estadísticas de uso de tableros
 * @private
 */
function calculateStatistics(boards, boardConfig) {
  const boardArea = boardConfig.width * boardConfig.height
  const totalBoardArea = boards.length * boardArea
  const totalUsedArea = boards.reduce((sum, board) => sum + board.usedArea, 0)
  const wasteArea = totalBoardArea - totalUsedArea
  const utilizationPercentage = (totalUsedArea / totalBoardArea) * 100

  return {
    boardsNeeded: boards.length,
    totalBoardArea,
    totalUsedArea,
    wasteArea,
    utilizationPercentage: Math.round(utilizationPercentage * 10) / 10,
    wastePercentage: Math.round((100 - utilizationPercentage) * 10) / 10,
  }
}
