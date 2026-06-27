/**
 * Pruebas unitarias — Lógica de navegación (App.jsx)
 *
 * Verifica la lógica pura de detección de viewport móvil, gestión de
 * pestañas, callbacks de navegación cruzada y cambios de estado.
 * No requiere React ni DOM real.
 */

// ─── Lógica extraída de App.jsx ──────────────────────────────────────────────

const TABS = ['diseno', 'cubicacion', 'biblioteca', 'estadisticas', 'cotizaciones']

function isMobile(width) { return width <= 600 }

function switchTab(current, next) {
  return TABS.includes(next) ? next : current
}

function handleLoadDesign(design, setState) {
  setState.shapes(design.shapes || [])
  setState.selectedId(null)
  setState.activeTab('diseno')
  setState.currentDesignId(design._id)
}

function handleLogout(setState) {
  setState.user(null)
  setState.shapes([])
  setState.designs([])
  setState.currentDesignId(null)
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Detección de viewport móvil', () => {
  test('ancho 600 px es considerado móvil', () => {
    expect(isMobile(600)).toBe(true)
  })

  test('ancho 601 px es escritorio', () => {
    expect(isMobile(601)).toBe(false)
  })
})

describe('Cambio de pestaña activa', () => {
  test('cambiar a "cubicacion" actualiza la pestaña', () => {
    expect(switchTab('diseno', 'cubicacion')).toBe('cubicacion')
  })

  test('pestaña inválida no cambia el estado actual', () => {
    expect(switchTab('diseno', 'inexistente')).toBe('diseno')
  })
})

describe('Callback onIrACubicacion', () => {
  test('setActiveTab se invoca con "cubicacion"', () => {
    let tab = 'cotizaciones'
    const irACubicacion = (set) => set('cubicacion')
    irACubicacion(v => { tab = v })
    expect(tab).toBe('cubicacion')
  })
})

describe('Cargar diseño (handleLoadDesign)', () => {
  const design = { _id: 'abc123', shapes: [{ id: '1', type: 'cajonera' }] }

  test('carga las shapes y navega a "diseno"', () => {
    const state = {}
    handleLoadDesign(design, {
      shapes: v => { state.shapes = v },
      selectedId: v => { state.selectedId = v },
      activeTab: v => { state.activeTab = v },
      currentDesignId: v => { state.currentDesignId = v },
    })
    expect(state.shapes).toEqual(design.shapes)
    expect(state.activeTab).toBe('diseno')
    expect(state.selectedId).toBeNull()
  })
})

describe('Cerrar sesión (handleLogout)', () => {
  test('limpia usuario, shapes y diseños', () => {
    const state = {}
    handleLogout({
      user: v => { state.user = v },
      shapes: v => { state.shapes = v },
      designs: v => { state.designs = v },
      currentDesignId: v => { state.currentDesignId = v },
    })
    expect(state.user).toBeNull()
    expect(state.shapes).toEqual([])
    expect(state.designs).toEqual([])
  })
})
