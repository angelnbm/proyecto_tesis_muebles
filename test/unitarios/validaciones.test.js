/**
 * Pruebas unitarias — Funciones de validación
 *
 * Prueba las funciones de validación de los endpoints:
 * - authRoutes: registro y login
 * - furnitureRoutes: guardar diseño
 * - materialRoutes: crear/editar material
 * - cotizacionRoutes: crear cotización
 */

// ─── Funciones de validación (extraídas de los routes) ────────────────────────

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validateRegister({ nombre, email, contrasena }) {
  if (!nombre?.trim() || !email?.trim() || !contrasena)
    return { ok: false, error: 'MISSING_FIELDS', message: 'Todos los campos son requeridos' }
  if (!validateEmail(email))
    return { ok: false, error: 'INVALID_EMAIL', message: 'Email inválido' }
  if (contrasena.length < 6)
    return { ok: false, error: 'PASSWORD_TOO_SHORT', message: 'La contraseña debe tener al menos 6 caracteres' }
  return { ok: true }
}

function validateLogin({ email, contrasena }) {
  if (!email?.trim() || !contrasena)
    return { ok: false, error: 'MISSING_FIELDS', message: 'Email y contraseña son requeridos' }
  return { ok: true }
}

function validateFurniturePayload({ nombre, shapes } = {}) {
  if (!nombre || typeof nombre !== 'string' || !nombre.trim())
    return 'El campo nombre es obligatorio'
  if (!Array.isArray(shapes) || shapes.length === 0)
    return 'El campo shapes debe ser un arreglo no vacio'
  return null
}

function validateMaterialPayload(body = {}) {
  const categoria = (body.categoria || '').toLowerCase().trim()

  if (!body.nombre || !body.nombre.trim())
    return 'El nombre es obligatorio'
  if (!categoria || !['material', 'accesorio', 'tapa-canto', 'cubierta'].includes(categoria))
    return 'La categoria debe ser material, accesorio, tapa-canto o cubierta'
  if (body.precio === undefined || body.precio === null || Number.isNaN(Number(body.precio)))
    return 'El precio es obligatorio'
  if (Number(body.precio) < 0)
    return 'El precio debe ser mayor o igual a 0'
  if (categoria === 'material') {
    if (!body.tipo || !body.tipo.trim())
      return 'El tipo de material es obligatorio'
    if (!body.dimensiones || !body.dimensiones.trim())
      return 'Las dimensiones son obligatorias'
  }
  if (categoria === 'accesorio') {
    if (!body.accesorio_tipo || !body.accesorio_tipo.trim())
      return 'El tipo de accesorio es obligatorio'
  }
  return null
}

const ESTADOS_VALIDOS = ['Pendiente', 'En Proceso', 'Completado']

function validateCotizacionEstado(estado) {
  return ESTADOS_VALIDOS.includes(estado)
}

function validateCotizacionPayload({ mueble_id, precio_total, lista_cortes, materiales_resumen } = {}) {
  if (!mueble_id || typeof mueble_id !== 'string' || !mueble_id.trim())
    return 'El campo mueble_id es obligatorio'
  if (precio_total === undefined || precio_total === null || isNaN(Number(precio_total)))
    return 'El campo precio_total debe ser un número'
  if (!Array.isArray(lista_cortes))
    return 'El campo lista_cortes debe ser un arreglo'
  if (!Array.isArray(materiales_resumen))
    return 'El campo materiales_resumen debe ser un arreglo'
  return null
}

// ─── Tests: Auth ──────────────────────────────────────────────────────────────

describe('Validación — Registro (authRoutes)', () => {
  test('datos completos y válidos pasan validación', () => {
    expect(validateRegister({ nombre: 'Juan', email: 'juan@test.com', contrasena: 'Test123!' }).ok).toBe(true)
  })

  test('falta el nombre retorna MISSING_FIELDS', () => {
    const result = validateRegister({ nombre: '', email: 'juan@test.com', contrasena: 'Test123!' })
    expect(result.ok).toBe(false)
    expect(result.error).toBe('MISSING_FIELDS')
  })

  test('falta el email retorna MISSING_FIELDS', () => {
    const result = validateRegister({ nombre: 'Juan', email: '  ', contrasena: 'Test123!' })
    expect(result.ok).toBe(false)
    expect(result.error).toBe('MISSING_FIELDS')
  })

  test('falta la contraseña retorna MISSING_FIELDS', () => {
    const result = validateRegister({ nombre: 'Juan', email: 'juan@test.com', contrasena: '' })
    expect(result.ok).toBe(false)
    expect(result.error).toBe('MISSING_FIELDS')
  })

  test('email sin @ retorna INVALID_EMAIL', () => {
    const result = validateRegister({ nombre: 'Juan', email: 'juantest.com', contrasena: 'Test123!' })
    expect(result.ok).toBe(false)
    expect(result.error).toBe('INVALID_EMAIL')
  })

  test('email con formato incompleto "a@b" retorna INVALID_EMAIL', () => {
    const result = validateRegister({ nombre: 'Juan', email: 'a@b', contrasena: 'Test123!' })
    expect(result.ok).toBe(false)
    expect(result.error).toBe('INVALID_EMAIL')
  })

  test('email válido "a@b.c" pasa validación', () => {
    const result = validateRegister({ nombre: 'Juan', email: 'a@b.c', contrasena: 'Test123!' })
    expect(result.ok).toBe(true)
  })

  test('contraseña de 5 caracteres retorna PASSWORD_TOO_SHORT', () => {
    const result = validateRegister({ nombre: 'Juan', email: 'juan@test.com', contrasena: 'abc12' })
    expect(result.ok).toBe(false)
    expect(result.error).toBe('PASSWORD_TOO_SHORT')
  })

  test('contraseña de exactamente 6 caracteres pasa validación', () => {
    const result = validateRegister({ nombre: 'Juan', email: 'juan@test.com', contrasena: 'abc123' })
    expect(result.ok).toBe(true)
  })
})

describe('Validación — Login (authRoutes)', () => {
  test('email y contraseña presentes pasan validación', () => {
    expect(validateLogin({ email: 'juan@test.com', contrasena: 'cualquier' }).ok).toBe(true)
  })

  test('email vacío retorna MISSING_FIELDS', () => {
    const result = validateLogin({ email: '', contrasena: 'pass' })
    expect(result.ok).toBe(false)
    expect(result.error).toBe('MISSING_FIELDS')
  })

  test('sin contraseña retorna MISSING_FIELDS', () => {
    const result = validateLogin({ email: 'juan@test.com', contrasena: '' })
    expect(result.ok).toBe(false)
    expect(result.error).toBe('MISSING_FIELDS')
  })
})

// ─── Tests: Diseños ───────────────────────────────────────────────────────────

describe('Validación — Diseño de mueble (furnitureRoutes)', () => {
  const validShape = { id: '1', type: 'cajonera', x: 0, y: 0, width: 60, height: 80 }

  test('nombre y shapes válidos pasan validación', () => {
    expect(validateFurniturePayload({ nombre: 'Cocina', shapes: [validShape] })).toBeNull()
  })

  test('sin nombre retorna error', () => {
    expect(validateFurniturePayload({ nombre: '', shapes: [validShape] })).toBeTruthy()
  })

  test('nombre solo espacios retorna error', () => {
    expect(validateFurniturePayload({ nombre: '   ', shapes: [validShape] })).toBeTruthy()
  })

  test('shapes vacío retorna error', () => {
    expect(validateFurniturePayload({ nombre: 'Cocina', shapes: [] })).toBeTruthy()
  })

  test('shapes no es arreglo retorna error', () => {
    expect(validateFurniturePayload({ nombre: 'Cocina', shapes: 'noarray' })).toBeTruthy()
  })

  test('sin payload retorna error', () => {
    expect(validateFurniturePayload()).toBeTruthy()
  })
})

// ─── Tests: Materiales ────────────────────────────────────────────────────────

describe('Validación — Material (materialRoutes)', () => {
  const validMaterial = {
    nombre: 'Melamina Blanca',
    categoria: 'material',
    precio: 15000,
    tipo: 'Melamina',
    dimensiones: '250x183',
  }

  test('material completo pasa validación', () => {
    expect(validateMaterialPayload(validMaterial)).toBeNull()
  })

  test('sin nombre retorna error', () => {
    expect(validateMaterialPayload({ ...validMaterial, nombre: '' })).toBeTruthy()
  })

  test('categoría "tapa-canto" es válida', () => {
    const body = { nombre: 'Tapa blanco', categoria: 'tapa-canto', precio: 800 }
    expect(validateMaterialPayload(body)).toBeNull()
  })

  test('categoría "accesorio" sin accesorio_tipo retorna error', () => {
    const body = { nombre: 'Riel', categoria: 'accesorio', precio: 5000 }
    expect(validateMaterialPayload(body)).toBeTruthy()
  })

  test('categoría "accesorio" con accesorio_tipo pasa validación', () => {
    const body = { nombre: 'Riel', categoria: 'accesorio', precio: 5000, accesorio_tipo: 'riel' }
    expect(validateMaterialPayload(body)).toBeNull()
  })

  test('categoría "cubierta" es válida', () => {
    const body = { nombre: 'Cubierta mármol', categoria: 'cubierta', precio: 12000 }
    expect(validateMaterialPayload(body)).toBeNull()
  })

  test('categoría inválida "otro" retorna error con texto que menciona cubierta', () => {
    const result = validateMaterialPayload({ ...validMaterial, categoria: 'otro' })
    expect(result).toBeTruthy()
    expect(result).toMatch(/cubierta/)
  })

  test('precio negativo retorna error', () => {
    expect(validateMaterialPayload({ ...validMaterial, precio: -100 })).toBeTruthy()
  })

  test('precio 0 es válido', () => {
    expect(validateMaterialPayload({ ...validMaterial, precio: 0 })).toBeNull()
  })

  test('precio como string numérico pasa validación', () => {
    expect(validateMaterialPayload({ ...validMaterial, precio: '15000' })).toBeNull()
  })

  test('material sin tipo retorna error', () => {
    expect(validateMaterialPayload({ ...validMaterial, tipo: '' })).toBeTruthy()
  })

  test('material sin dimensiones retorna error', () => {
    expect(validateMaterialPayload({ ...validMaterial, dimensiones: '' })).toBeTruthy()
  })
})

// ─── Tests: Cotizaciones ──────────────────────────────────────────────────────

describe('Validación — Cotización (cotizacionRoutes)', () => {
  const validPayload = {
    mueble_id: '507f1f77bcf86cd799439011',
    precio_total: 125000,
    lista_cortes: [],
    materiales_resumen: [],
  }

  test('payload completo pasa validación', () => {
    expect(validateCotizacionPayload(validPayload)).toBeNull()
  })

  test('sin mueble_id retorna error', () => {
    expect(validateCotizacionPayload({ ...validPayload, mueble_id: '' })).toBeTruthy()
  })

  test('mueble_id solo espacios retorna error', () => {
    expect(validateCotizacionPayload({ ...validPayload, mueble_id: '   ' })).toBeTruthy()
  })

  test('precio_total como string numérico pasa validación', () => {
    expect(validateCotizacionPayload({ ...validPayload, precio_total: '125000' })).toBeNull()
  })

  test('precio_total undefined retorna error', () => {
    const { precio_total, ...rest } = validPayload
    expect(validateCotizacionPayload(rest)).toBeTruthy()
  })

  test('lista_cortes no arreglo retorna error', () => {
    expect(validateCotizacionPayload({ ...validPayload, lista_cortes: null })).toBeTruthy()
  })

  test('materiales_resumen no arreglo retorna error', () => {
    expect(validateCotizacionPayload({ ...validPayload, materiales_resumen: 'string' })).toBeTruthy()
  })
})

describe('Validación — Estado de cotización', () => {
  test('estado "Pendiente" es válido', () => {
    expect(validateCotizacionEstado('Pendiente')).toBe(true)
  })

  test('estado "En Proceso" es válido', () => {
    expect(validateCotizacionEstado('En Proceso')).toBe(true)
  })

  test('estado "Completado" es válido', () => {
    expect(validateCotizacionEstado('Completado')).toBe(true)
  })

  test('estado "Cancelado" no es válido', () => {
    expect(validateCotizacionEstado('Cancelado')).toBe(false)
  })

  test('estado vacío no es válido', () => {
    expect(validateCotizacionEstado('')).toBe(false)
  })

  test('estado en minúsculas no es válido', () => {
    expect(validateCotizacionEstado('pendiente')).toBe(false)
  })
})

// ─── Tests: Función slug (nombres de archivo PDF) ─────────────────────────────

describe('Generación de slug para nombre de archivo PDF', () => {
  function slug(s) {
    return s
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/gi, '_')
      .replace(/^_|_$/g, '')
      .toLowerCase()
  }

  test('convierte texto simple a minúsculas con guiones', () => {
    expect(slug('Cocina Test')).toBe('cocina_test')
  })

  test('elimina tildes', () => {
    expect(slug('Diseño')).toBe('diseno')
    expect(slug('Habitación')).toBe('habitacion')
  })

  test('elimina la ñ (reemplaza por n)', () => {
    expect(slug('Ñoño')).toBe('nono')
    expect(slug('González')).toBe('gonzalez')
  })

  test('múltiples espacios se convierten en un solo guion bajo', () => {
    expect(slug('Cocina  test   final')).toBe('cocina_test_final')
  })

  test('no genera guiones al inicio ni al final', () => {
    const result = slug('  Cocina test  ')
    expect(result).not.toMatch(/^_/)
    expect(result).not.toMatch(/_$/)
  })

  test('texto vacío produce string vacío', () => {
    expect(slug('')).toBe('')
  })

  test('caracteres especiales son eliminados', () => {
    expect(slug('Pedro & María (2024)')).toBe('pedro_maria_2024')
  })
})
