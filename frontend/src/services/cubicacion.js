// ============================================
// Cubicación Avanzada - Optimización de Planchas
// ============================================

// Configuración de planchas (en CM)
export const BOARD_CONFIGS = {
  melamina: {
    width: 250,      // Ancho en CM
    height: 183,     // Alto en CM
    name: 'Melamina',
    minMargin: 1,     // Margen mínimo entre cortes (1cm más compacto)
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

  shapes.forEach((shape, index) => {
    const moduleId = shape.id
    const moduleName = `${shape.type.toUpperCase()} ${index + 1}`
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

        modulePieces.push(
          {
            description: `Marco`,
            width: w,
            height: h,
            quantity: 1,
            area: w * h,
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
 * Algoritmo de optimización de piezas en planchas (First Fit Decreasing Height)
 * @param {Array} pieces - Array de piezas a optimizar
 * @param {Object} boardConfig - Configuración del tablero
 * @returns {Object} { boards: Array, statistics: Object }
 */
export function optimizePiecesInBoards(pieces, boardConfig = BOARD_CONFIGS.melamina) {
  // Crear copia de piezas expandidas por cantidad
  const expandedPieces = []
  pieces.forEach((piece) => {
    for (let i = 0; i < piece.quantity; i++) {
      expandedPieces.push({
        ...piece,
        sequenceId: `${piece.moduleId}-${piece.description}-${i + 1}`,
      })
    }
  })

  // Ordenar por altura descendente (First Fit Decreasing)
  expandedPieces.sort((a, b) => b.height - a.height || b.width - a.width)

  const boards = []
  const margin = boardConfig.minMargin

  // Algoritmo de empaque (Shelf Algorithm)
  expandedPieces.forEach((piece) => {
    let placed = false

    // Intentar colocar en tablero existente
    for (const board of boards) {
      if (tryPlacePiece(piece, board, boardConfig, margin)) {
        placed = true
        break
      }
    }

    // Si no cabe, crear nuevo tablero
    if (!placed) {
      const newBoard = {
        id: boards.length + 1,
        width: boardConfig.width,
        height: boardConfig.height,
        pieces: [],
        usedArea: 0,
        shelves: [],
      }
      tryPlacePiece(piece, newBoard, boardConfig, margin)
      boards.push(newBoard)
    }
  })

  // Calcular estadísticas
  const statistics = calculateStatistics(boards, boardConfig)

  return { boards, statistics }
}

/**
 * Intenta colocar una pieza en un tablero usando algoritmo de estantes
 * @private
 */
function tryPlacePiece(piece, board, boardConfig, margin) {
  const pieceWidth = piece.width + margin
  const pieceHeight = piece.height + margin

  // Si no hay estantes, crear uno nuevo
  if (board.shelves.length === 0) {
    if (pieceWidth <= boardConfig.width && pieceHeight <= boardConfig.height) {
      const newShelf = {
        y: margin,
        height: piece.height,
        remainingWidth: boardConfig.width - pieceWidth,
        pieces: [],
      }
      newShelf.pieces.push({
        ...piece,
        x: margin,
        y: newShelf.y,
      })
      board.shelves.push(newShelf)
      board.usedArea += piece.width * piece.height
      return true
    }
    return false
  }

  // Intentar colocar en estante existente
  for (const shelf of board.shelves) {
    if (pieceWidth <= shelf.remainingWidth) {
      const lastPiece = shelf.pieces[shelf.pieces.length - 1]
      const xPos = lastPiece.x + lastPiece.width + margin

      // Verificar que cabe verticalmente
      if (shelf.y + shelf.height + pieceHeight <= boardConfig.height) {
        shelf.pieces.push({
          ...piece,
          x: xPos,
          y: shelf.y,
        })
        shelf.remainingWidth -= pieceWidth
        board.usedArea += piece.width * piece.height
        return true
      }
    }
  }

  // Crear nuevo estante
  const totalUsedHeight = board.shelves.reduce((sum, shelf) => sum + shelf.height + margin, margin)
  const newShelfY = totalUsedHeight
  const newShelfHeight = pieceHeight

  if (newShelfY + newShelfHeight <= boardConfig.height && pieceWidth <= boardConfig.width) {
    const newShelf = {
      y: newShelfY,
      height: piece.height,
      remainingWidth: boardConfig.width - pieceWidth,
      pieces: [],
    }
    newShelf.pieces.push({
      ...piece,
      x: margin,
      y: newShelfY,
    })
    board.shelves.push(newShelf)
    board.usedArea += piece.width * piece.height
    return true
  }

  return false
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

/**
 * Formatea piezas para visualización en texto
 */
export function formatPiecesForDisplay(byModule) {
  const formatted = []

  byModule.forEach((module) => {
    formatted.push(`\n=== ${module.name.toUpperCase()} ===`)

    module.pieces.forEach((piece) => {
      const pieceStr = `- ${piece.description}: ${piece.width}x${piece.height} CM${
        piece.quantity > 1 ? ` (x${piece.quantity})` : ''
      }`
      formatted.push(pieceStr)
    })
  })

  return formatted.join('\n')
}
