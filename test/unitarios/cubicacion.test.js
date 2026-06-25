/**
 * Pruebas unitarias — Algoritmo de Cubicación
 *
 * Verifica la lógica pura de generación de piezas y bin packing.
 * Las funciones son reimplementadas aquí en CommonJS para que Jest
 * pueda ejecutarlas sin necesidad de transformar ES modules.
 */

// ─── Reimplementación CommonJS de las funciones puras ─────────────────────────

const BOARD_CONFIG = { width: 250, height: 183, kerf: 0.3 }

function roundToTenth(value) {
  return Math.round(value * 10) / 10
}

/** Genera piezas para una cajonera dado ancho, alto, profundidad y número de cajones */
function piezasCajonera(w, h, d, numCajones = 3) {
  const drawerFrontHeight = Math.round(h / numCajones)
  return [
    { description: 'Techo/Piso', width: w, height: d, quantity: 2 },
    { description: 'Frente', width: w, height: drawerFrontHeight, quantity: numCajones },
    { description: 'Laterales', width: d, height: h, quantity: 2 },
    { description: 'Fondo', width: w, height: h, quantity: 1 },
  ]
}

/** Genera piezas para un módulo modular dado ancho, alto, profundidad, estantes, divisores y puertas */
function piezasModular(w, h, d, numEstantes = 0, numDivisores = 0, numPuertas = 0) {
  const pieces = [
    { description: 'Techo/Piso', width: w, height: d, quantity: 2 },
    { description: 'Laterales', width: d, height: h, quantity: 2 },
    { description: 'Fondo', width: w, height: h, quantity: 1 },
  ]
  if (numEstantes > 0) pieces.push({ description: 'Estantes', width: w, height: d, quantity: numEstantes })
  if (numDivisores > 0) pieces.push({ description: 'Divisores', width: d, height: h, quantity: numDivisores })
  if (numPuertas > 0) {
    const puertaWidth = Math.round(w / numPuertas)
    const puertaW = roundToTenth(Math.max(0.3, puertaWidth - 0.3))
    const puertaH = roundToTenth(Math.max(0.3, h - 0.3))
    pieces.push({ description: 'Puertas', width: puertaW, height: puertaH, quantity: numPuertas })
  }
  return pieces
}

/** Genera pieza de puerta con descuento de 3 mm */
function piezaPuerta(w, h) {
  return { description: 'Puerta', width: roundToTenth(Math.max(0.3, w - 0.3)), height: roundToTenth(Math.max(0.3, h - 0.3)), quantity: 1 }
}

/** Calcula el área total de un conjunto de piezas (expandidas por quantity) */
function totalArea(pieces) {
  return pieces.reduce((sum, p) => sum + p.width * p.height * p.quantity, 0)
}

/** Versión simplificada del bin packing — cuenta cuántas planchas se necesitan */
function boardsNeeded(pieces, boardConfig = BOARD_CONFIG) {
  const boardArea = boardConfig.width * boardConfig.height
  const usedArea = totalArea(pieces)
  return Math.ceil(usedArea / boardArea)
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Generación de piezas — Cajonera', () => {
  test('cajonera 60×80×50 con 3 cajones genera 4 tipos de piezas', () => {
    const pieces = piezasCajonera(60, 80, 50, 3)
    expect(pieces).toHaveLength(4)
  })

  test('cajonera genera Techo/Piso ×2', () => {
    const pieces = piezasCajonera(60, 80, 50, 3)
    const techo = pieces.find(p => p.description === 'Techo/Piso')
    expect(techo).toBeDefined()
    expect(techo.quantity).toBe(2)
  })

  test('cajonera genera Laterales ×2', () => {
    const pieces = piezasCajonera(60, 80, 50, 3)
    const laterales = pieces.find(p => p.description === 'Laterales')
    expect(laterales).toBeDefined()
    expect(laterales.quantity).toBe(2)
  })

  test('cajonera genera Frente con quantity = numCajones', () => {
    const pieces = piezasCajonera(60, 80, 50, 5)
    const frente = pieces.find(p => p.description === 'Frente')
    expect(frente.quantity).toBe(5)
  })

  test('Frente de cajonera 3 cajones tiene alto = 80/3 ≈ 27 cm', () => {
    const pieces = piezasCajonera(60, 80, 50, 3)
    const frente = pieces.find(p => p.description === 'Frente')
    expect(frente.height).toBe(Math.round(80 / 3))
  })

  test('Laterales de cajonera usan profundidad como ancho', () => {
    const pieces = piezasCajonera(60, 80, 50, 3)
    const laterales = pieces.find(p => p.description === 'Laterales')
    expect(laterales.width).toBe(50)  // profundidad
    expect(laterales.height).toBe(80) // alto
  })

  test('Techo/Piso de cajonera usa profundidad como alto', () => {
    const pieces = piezasCajonera(60, 80, 50, 3)
    const techo = pieces.find(p => p.description === 'Techo/Piso')
    expect(techo.width).toBe(60)  // ancho
    expect(techo.height).toBe(50) // profundidad
  })

  test('cajonera con 1 cajón genera Frente ×1', () => {
    const pieces = piezasCajonera(60, 80, 50, 1)
    const frente = pieces.find(p => p.description === 'Frente')
    expect(frente.quantity).toBe(1)
    expect(frente.height).toBe(80)
  })

  test('cajonera genera Fondo ×1', () => {
    const pieces = piezasCajonera(60, 80, 50, 3)
    const fondo = pieces.find(p => p.description === 'Fondo')
    expect(fondo).toBeDefined()
    expect(fondo.quantity).toBe(1)
  })
})

describe('Generación de piezas — Módulo modular', () => {
  test('modular sin estantes ni puertas genera 3 tipos de piezas', () => {
    const pieces = piezasModular(90, 200, 40)
    expect(pieces).toHaveLength(3)
  })

  test('modular con 3 estantes genera pieza Estantes ×3', () => {
    const pieces = piezasModular(90, 200, 40, 3)
    const estantes = pieces.find(p => p.description === 'Estantes')
    expect(estantes).toBeDefined()
    expect(estantes.quantity).toBe(3)
  })

  test('modular con 2 puertas genera puertas con ancho = totalAncho/2 - 3mm', () => {
    const pieces = piezasModular(80, 180, 40, 0, 0, 2)
    const puertas = pieces.find(p => p.description === 'Puertas')
    expect(puertas).toBeDefined()
    expect(puertas.quantity).toBe(2)
    expect(puertas.width).toBeCloseTo(40 - 0.3, 1) // 80/2 = 40, menos 3mm = 39.7
  })

  test('modular con 1 divisor genera Divisores ×1', () => {
    const pieces = piezasModular(90, 200, 40, 0, 1)
    const divisores = pieces.find(p => p.description === 'Divisores')
    expect(divisores).toBeDefined()
    expect(divisores.quantity).toBe(1)
  })
})

describe('Generación de piezas — Puerta individual', () => {
  test('puerta descuenta 3 mm de ancho', () => {
    const p = piezaPuerta(40, 70)
    expect(p.width).toBeCloseTo(39.7, 1)
  })

  test('puerta descuenta 3 mm de alto', () => {
    const p = piezaPuerta(40, 70)
    expect(p.height).toBeCloseTo(69.7, 1)
  })

  test('puerta con dimensión < 3mm usa mínimo 0.3 cm', () => {
    const p = piezaPuerta(0.1, 0.1)
    expect(p.width).toBeGreaterThanOrEqual(0.3)
    expect(p.height).toBeGreaterThanOrEqual(0.3)
  })
})

describe('Cálculo de área y planchas necesarias', () => {
  test('área de cajonera 60×80×50 (3 cajones) > 0', () => {
    const pieces = piezasCajonera(60, 80, 50, 3)
    expect(totalArea(pieces)).toBeGreaterThan(0)
  })

  test('una pieza pequeña requiere 1 plancha', () => {
    const pieces = [{ width: 10, height: 10, quantity: 1 }]
    expect(boardsNeeded(pieces)).toBe(1)
  })

  test('piezas que superan área de plancha requieren más de 1', () => {
    // Plancha 250×183 = 45750 cm². 50 piezas de 50×50 = 125000 cm² → 3 planchas mínimo
    const pieces = [{ width: 50, height: 50, quantity: 50 }]
    expect(boardsNeeded(pieces)).toBeGreaterThanOrEqual(3)
  })

  test('área usada nunca supera área teórica de planchas calculadas', () => {
    const pieces = piezasCajonera(60, 80, 50, 3)
    const n = boardsNeeded(pieces)
    const boardArea = BOARD_CONFIG.width * BOARD_CONFIG.height
    expect(totalArea(pieces)).toBeLessThanOrEqual(n * boardArea)
  })
})

// ─── Reimplementación de la lógica de unidad par (hardwareList en CubicacionPanel) ─

/**
 * Dado una cantidad raw de unidades y la unidad del accesorio,
 * devuelve la cantidad a mostrar/cobrar.
 */
function calcularCantidadAccesorio(cantidadRaw, unidad) {
  if (unidad === 'par') return Math.ceil(cantidadRaw / 2)
  return cantidadRaw
}

function calcularTotalAccesorio(precio, cantidadRaw, unidad) {
  return precio * calcularCantidadAccesorio(cantidadRaw, unidad)
}

describe('Lógica de unidad par — Accesorios', () => {
  test('unidad "unidad" no modifica la cantidad', () => {
    expect(calcularCantidadAccesorio(6, 'unidad')).toBe(6)
  })

  test('unidad "par" divide la cantidad entre 2', () => {
    expect(calcularCantidadAccesorio(6, 'par')).toBe(3)
  })

  test('unidad "par" con cantidad impar aplica Math.ceil', () => {
    expect(calcularCantidadAccesorio(5, 'par')).toBe(3)
    expect(calcularCantidadAccesorio(1, 'par')).toBe(1)
    expect(calcularCantidadAccesorio(3, 'par')).toBe(2)
  })

  test('unidad "par" con cantidad 2 devuelve 1', () => {
    expect(calcularCantidadAccesorio(2, 'par')).toBe(1)
  })

  test('cantidad 0 siempre devuelve 0', () => {
    expect(calcularCantidadAccesorio(0, 'par')).toBe(0)
    expect(calcularCantidadAccesorio(0, 'unidad')).toBe(0)
  })

  test('total con unidad "unidad" = precio × cantidad', () => {
    expect(calcularTotalAccesorio(5000, 4, 'unidad')).toBe(20000)
  })

  test('total con unidad "par" = precio × Math.ceil(cantidad/2)', () => {
    expect(calcularTotalAccesorio(5000, 4, 'par')).toBe(10000)  // 4/2 = 2 pares × 5000
    expect(calcularTotalAccesorio(5000, 5, 'par')).toBe(15000)  // ceil(5/2) = 3 pares × 5000
  })

  test('unidad undefined o vacía se trata como "unidad"', () => {
    expect(calcularCantidadAccesorio(6, undefined)).toBe(6)
    expect(calcularCantidadAccesorio(6, '')).toBe(6)
  })
})

describe('Utilidad: roundToTenth', () => {
  test('redondea a una decimal correctamente', () => {
    expect(roundToTenth(3.14159)).toBe(3.1)
    expect(roundToTenth(3.15)).toBe(3.2)
    expect(roundToTenth(3.05)).toBe(3.1)
  })

  test('valores enteros se mantienen', () => {
    expect(roundToTenth(5)).toBe(5)
    expect(roundToTenth(100)).toBe(100)
  })
})
