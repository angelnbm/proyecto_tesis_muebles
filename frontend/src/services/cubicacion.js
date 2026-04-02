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
 */

/**
 * Genera lista de piezas estructurada por módulo
 * @param {Array} shapes - Array de shapes del canvas
 * @returns {Object} { byModule: Map, allPieces: Array }
 */
export function generateStructuredCuts(shapes) {
  const byModule = new Map() // Map<moduleId, { type, name, pieces: [] }>
  const allPieces = []

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
        const drawerHeight = Math.round(h / numCajones)

        modulePieces.push(
          {
            description: `Frente`,
            width: w,
            height: drawerHeight,
            quantity: numCajones,
            area: w * drawerHeight,
          },
          {
            description: `Laterales`,
            width: d,
            height: h,
            quantity: 2,
            area: d * h,
          },
          {
            description: `Fondo`,
            width: w,
            height: d,
            quantity: 1,
            area: w * d,
          }
        )
        break
      }

      case 'modular': {
        const numEstantes = shape.numEstantes !== undefined && shape.numEstantes !== null ? shape.numEstantes : 0
        const numDivisores = shape.numDivisores !== undefined && shape.numDivisores !== null ? shape.numDivisores : 0
        const numPuertas = shape.numPuertas !== undefined && shape.numPuertas !== null ? shape.numPuertas : 0

        // No incluir "Marco" - las puertas ya cumplen ese rol como frontal
        modulePieces.push(
          {
            description: `Laterales`,
            width: d,
            height: h,
            quantity: 2,
            area: d * h,
          },
          {
            description: `Fondo`,
            width: w,
            height: d,
            quantity: 1,
            area: w * d,
          }
        )

        if (numEstantes > 0) {
          modulePieces.push({
            description: `Estantes`,
            width: w,
            height: d,
            quantity: numEstantes,
            area: w * d,
          })
        }

        if (numDivisores > 0) {
          const divisorHeight = Math.round(h / (numDivisores + 1))
          modulePieces.push({
            description: `Divisores`,
            width: w,
            height: divisorHeight,
            quantity: numDivisores,
            area: w * divisorHeight,
          })
        }

        if (numPuertas > 0) {
          const puertaWidth = Math.round(w / numPuertas)
          modulePieces.push({
            description: `Puertas`,
            width: puertaWidth,
            height: h,
            quantity: numPuertas,
            area: puertaWidth * h,
          })
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

      case 'puerta':
        modulePieces.push({
          description: `Puerta`,
          width: w,
          height: h,
          quantity: 1,
          area: w * h,
        })
        break

      case 'base':
        modulePieces.push({
          description: `Base`,
          width: w,
          height: h,
          quantity: 1,
          area: w * h,
        })
        break

      case 'divisor':
        modulePieces.push({
          description: `Divisor`,
          width: w,
          height: h,
          quantity: 1,
          area: w * h,
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

  return { byModule, allPieces }
}

/**
 * Algoritmo Guillotine Rectangle Packing con Rotación
 * Mejor utilización de espacio que Shelf Algorithm
 * @param {Array} pieces - Array de piezas a optimizar
 * @param {Object} boardConfig - Configuración del tablero
 * @returns {Object} { boards: Array, statistics: Object }
 */
export function optimizePiecesInBoards(pieces, boardConfig = BOARD_CONFIGS.melamina) {
  // 1. Expandir piezas por cantidad
  const expandedPieces = []
  pieces.forEach((piece) => {
    for (let i = 0; i < piece.quantity; i++) {
      expandedPieces.push({
        ...piece,
        sequenceId: `${piece.moduleId}-${piece.description}-${i + 1}`,
        rotated: false, // Track si fue rotada
      })
    }
  })

  // 2. Ordenar por área descendente (piezas grandes primero)
  expandedPieces.sort((a, b) => {
    const areaA = a.width * a.height
    const areaB = b.width * b.height
    return areaB - areaA
  })

  const boards = []
  const kerf = boardConfig.kerf

  // 3. Intentar colocar cada pieza
  for (const piece of expandedPieces) {
    let placed = false

    // Intentar en tableros existentes
    for (let boardIdx = 0; boardIdx < boards.length && !placed; boardIdx++) {
      const result = tryPlacePieceInBoard(piece, boards[boardIdx], boardConfig, kerf)
      if (result) {
        placed = true
      }
    }

    // Si no cabe en ninguno, crear tablero nuevo
    if (!placed) {
      const newBoard = {
        id: boards.length + 1,
        width: boardConfig.width,
        height: boardConfig.height,
        pieces: [],
        usedArea: 0,
        freeRectangles: [
          {
            x: 0,
            y: 0,
            width: boardConfig.width,
            height: boardConfig.height,
          },
        ],
      }
      tryPlacePieceInBoard(piece, newBoard, boardConfig, kerf)
      boards.push(newBoard)
    }
  }

  // Calcular estadísticas
  const statistics = calculateStatistics(boards, boardConfig)

  return { boards, statistics }
}

/**
 * Intenta colocar una pieza en un tablero usando algoritmo Guillotine
 * @private
 */
function tryPlacePieceInBoard(piece, board, boardConfig, kerf) {
  // Intentar ambas orientaciones (normal y rotada)
  const orientations = [
    { width: piece.width, height: piece.height, rotated: false },
    { width: piece.height, height: piece.width, rotated: true },
  ]

  for (const orientation of orientations) {
    const requiredWidth = orientation.width + kerf
    const requiredHeight = orientation.height + kerf

    // Buscar el mejor rectángulo libre que quepa
    let bestRectIdx = -1
    let bestWaste = Infinity

    for (let i = 0; i < board.freeRectangles.length; i++) {
      const rect = board.freeRectangles[i]
      if (rect.width >= requiredWidth && rect.height >= requiredHeight) {
        // Calcular desperdicio en este rectángulo
        const waste =
          rect.width * rect.height -
          requiredWidth * requiredHeight
        if (waste < bestWaste) {
          bestWaste = waste
          bestRectIdx = i
        }
      }
    }

    if (bestRectIdx !== -1) {
      const rect = board.freeRectangles[bestRectIdx]

      // Colocar pieza
      board.pieces.push({
        ...piece,
        width: orientation.width,
        height: orientation.height,
        x: rect.x,
        y: rect.y,
        rotated: orientation.rotated,
      })

      board.usedArea += orientation.width * orientation.height

      // Dividir rectángulo libre (Guillotine)
      // Crear dos nuevos rectángulos del espacio restante
      const newRectangles = []

      // Rectángulo a la derecha
      if (rect.width > requiredWidth) {
        newRectangles.push({
          x: rect.x + requiredWidth,
          y: rect.y,
          width: rect.width - requiredWidth,
          height: rect.height,
        })
      }

      // Rectángulo abajo
      if (rect.height > requiredHeight) {
        newRectangles.push({
          x: rect.x,
          y: rect.y + requiredHeight,
          width: requiredWidth,
          height: rect.height - requiredHeight,
        })
      }

      // Remover rectángulo usado y agregar nuevos
      board.freeRectangles.splice(bestRectIdx, 1)
      board.freeRectangles.push(...newRectangles)

      // Limpiar rectángulos que se superponen
      mergeAndCleanRectangles(board.freeRectangles)

      return true
    }
  }

  return false
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
