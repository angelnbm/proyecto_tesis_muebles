import React from 'react'
import { useState, useEffect } from 'react'
import './App.css'
import Toolbar from './components/Toolbar.jsx'
import KonvaStage from './components/KonvaStage.jsx'
import AuthForm from './components/Login.jsx' 
import { saveFurniture, loadFurniture, deleteFurniture, updateFurniture } from './services/api.js'
import { getToken, removeToken, verifyToken } from './services/auth.js'

// Calcula lista de cortes para todos los shapes
function computeAllCuts(shapes) {
  const cuts = []
  shapes.forEach(shape => {
    const w = Math.round(shape.width)
    const h = Math.round(shape.height)
    const d = Math.round(shape.depth || 20)
    // Usar 3 por defecto si numCajones es null/undefined/0
    const numCajones = shape.numCajones && shape.numCajones > 0 ? shape.numCajones : 3
    
    switch (shape.type) {
      case 'cajonera':
        const drawerHeight = Math.round(h / numCajones)
        cuts.push(`- ${shape.type} (${numCajones} cajones) | Frente: ${w}x${drawerHeight} CM (x${numCajones})`)
        cuts.push(`- ${shape.type} | Laterales: ${d}x${h} CM (x2)`)
        cuts.push(`- ${shape.type} | Fondo: ${w}x${d} CM`)
        break
      case 'estante':
        cuts.push(`- ${shape.type} | Estante: ${w}x${d} CM`)
        break
      case 'cubierta':
        cuts.push(`- ${shape.type} | Cubierta: ${w}x${d} CM`)
        break
      case 'puerta':
        cuts.push(`- ${shape.type} | Puerta: ${w}x${h} CM`)
        break
      case 'base':
        cuts.push(`- ${shape.type} | Base: ${w}x${h}x${d} CM`)
        break
      case 'divisor':
        cuts.push(`- ${shape.type} | Divisor: ${w}x${h} CM`)
        break
      default:
        cuts.push(`- ${shape.type}: ${w}x${h}x${d} CM`)
    }
  })
  return cuts
}

export default function App() {
  const [user, setUser] = useState(null)
  const [selectedModule, setSelectedModule] = useState(null)
  const [shapes, setShapes] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [activeTab, setActiveTab] = useState('diseno')
  const [designs, setDesigns] = useState([])
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600)
  const [currentDesignId, setCurrentDesignId] = useState(null) // NUEVO: ID del diseño actual si fue cargado

  const selected = shapes.find(s => s.id === selectedId) || null
  const allCuts = computeAllCuts(shapes)

  // Detectar cambio de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Verificar token al cargar
  useEffect(() => {
    const token = getToken()
    if (token) {
      verifyToken(token)
        .then(data => setUser(data.user))
        .catch(() => {
          removeToken()
          setUser(null)
        })
    }
  }, [])

  // Cargar diseños guardados
  useEffect(() => {
    if (user) {
      loadFurniture()
        .then(data => setDesigns(data))
        .catch(err => console.error(err))
    }
  }, [user])

  // Guardar diseño actual con validaciones
  const handleSave = async () => {
    // Obtener el diseño actual si existe
    const currentDesign = designs.find(d => d._id === currentDesignId)
    
    // Sugerir nombre actual si hay un diseño cargado
    const defaultName = currentDesign ? currentDesign.nombre : ''
    const name = prompt('Nombre del diseño:', defaultName)
    
    if (!name) return
    if (!name.trim()) {
      alert('El nombre no puede estar vacío')
      return
    }

    // Buscar si existe un diseño con ese nombre
    const existingDesign = designs.find(d => d.nombre === name.trim())

    // CASO 1: Sobrescribir el diseño actual que fue cargado
    if (currentDesignId && currentDesign && currentDesign.nombre === name.trim()) {
      if (!confirm(`¿Sobrescribir el diseño "${name}"?`)) return
      
      try {
        const updated = await updateFurniture(currentDesignId, { 
          nombre: name.trim(), 
          shapes 
        })
        setDesigns(prev => prev.map(d => d._id === currentDesignId ? updated : d))
        alert('Diseño actualizado correctamente')
      } catch (err) {
        alert('Error al actualizar: ' + err.message)
      }
      return
    }

    // CASO 2: Ya existe un diseño con ese nombre (pero NO es el actual)
    if (existingDesign) {
      const shouldOverwrite = confirm(
        `Ya existe un diseño llamado "${name}".\n¿Deseas sobrescribirlo?`
      )
      
      if (!shouldOverwrite) {
        // Volver a pedir el nombre
        handleSave()
        return
      }

      // Sobrescribir el diseño existente
      try {
        const updated = await updateFurniture(existingDesign._id, { 
          nombre: name.trim(), 
          shapes 
        })
        setDesigns(prev => prev.map(d => d._id === existingDesign._id ? updated : d))
        setCurrentDesignId(existingDesign._id)
        alert('Diseño sobrescrito correctamente')
      } catch (err) {
        alert('Error al sobrescribir: ' + err.message)
      }
      return
    }

    // CASO 3: Guardar como nuevo diseño
    try {
      const saved = await saveFurniture(name.trim(), shapes)
      setDesigns(prev => [saved, ...prev])
      setCurrentDesignId(saved._id)
      alert('Diseño guardado correctamente')
    } catch (err) {
      alert('Error al guardar: ' + err.message)
    }
  }

  const handleLogout = () => {
    removeToken()
    setUser(null)
    setShapes([])
    setDesigns([])
    setCurrentDesignId(null) // NUEVO: Limpiar diseño actual
  }

  const updateSelectedShape = (key, value) => {
    if (!selected) return
    
    if (key === 'numCajones') {
      const numValue = value === '' ? null : Number(value)
      setShapes(prev => prev.map(s => 
        s.id === selected.id ? { ...s, [key]: numValue } : s
      ))
    } else {
      setShapes(prev => prev.map(s => 
        s.id === selected.id ? { ...s, [key]: Number(value) } : s
      ))
    }
  }

  const handleLoadDesign = (design) => {
    setShapes(design.shapes || [])
    setSelectedId(null)
    setActiveTab('diseno')
    setCurrentDesignId(design._id) // NUEVO: Marcar diseño como cargado
  }

  const handleDeleteDesign = async (id) => {
    if (!confirm('¿Eliminar este diseño?')) return
    try {
      await deleteFurniture(id)
      setDesigns(prev => prev.filter(d => d._id !== id))
      
      // Si se eliminó el diseño actual, limpiar el canvas
      if (currentDesignId === id) {
        setShapes([])
        setCurrentDesignId(null)
        setSelectedId(null)
      }
    } catch (err) {
      alert('Error al eliminar: ' + err.message)
    }
  }

  // NUEVO: Crear nuevo diseño desde cero
  const handleNewDesign = () => {
    if (shapes.length > 0 && !confirm('¿Descartar el diseño actual?')) return
    setShapes([])
    setSelectedId(null)
    setCurrentDesignId(null)
    setActiveTab('diseno')
  }

  // Si no hay usuario, mostrar login
  if (!user) {
    return <AuthForm onLogin={setUser} />
  }

  // ============================================
  // VISTA MÓVIL (≤600px)
  // ============================================
  if (isMobile) {
    return (
      <div className="app-root-mobile">
        {/* Header móvil */}
        <header className="mobile-header">
          <div className="mobile-user-info">
            <span>{user.nombre}</span>
            <button onClick={handleLogout} className="mobile-logout-btn">
              Salir
            </button>
          </div>
        </header>

        {/* Toolbar horizontal */}
        <div className="mobile-toolbar">
          <Toolbar selectedModule={selectedModule} onSelect={setSelectedModule} />
        </div>

        {/* Tabs */}
        <div className="mobile-tabs">
          <button 
            className={activeTab === 'diseno' ? 'active' : ''}
            onClick={() => setActiveTab('diseno')}
          >
            Diseño
          </button>
          <button 
            className={activeTab === 'cubicacion' ? 'active' : ''}
            onClick={() => setActiveTab('cubicacion')}
          >
            Cubicación
          </button>
          <button onClick={handleNewDesign} className="new-btn-mobile" title="Nuevo diseño">
            📄
          </button>
          <button onClick={handleSave} className="save-btn-mobile" title="Guardar">
            💾
          </button>
        </div>

        {/* Contenido principal - SCROLLEABLE */}
        <main className="mobile-content">
          {activeTab === 'diseno' && (
            <>
              {/* Canvas - altura fija */}
              <div className="mobile-canvas">
                <KonvaStage
                  shapes={shapes}
                  setShapes={setShapes}
                  selectedModule={selectedModule}
                  setSelectedModule={setSelectedModule}
                  selectedId={selectedId}
                  setSelectedId={setSelectedId}
                />
              </div>

              {/* Panel de medidas - DEBAJO del canvas */}
              {selected && (
                <div className="bottom-panel">
                  <div className="measure-section">
                    <h3>Editando: {selected.type}</h3>
                    <div className="measure-grid">
                      <div className="measure-field">
                        <label>Alto (CM)</label>
                        <input
                          type="number"
                          value={selected.height}
                          onChange={e => updateSelectedShape('height', e.target.value)}
                        />
                      </div>
                      <div className="measure-field">
                        <label>Ancho (CM)</label>
                        <input
                          type="number"
                          value={selected.width}
                          onChange={e => updateSelectedShape('width', e.target.value)}
                        />
                      </div>
                      <div className="measure-field">
                        <label>Profundidad (CM)</label>
                        <input
                          type="number"
                          value={selected.depth}
                          onChange={e => updateSelectedShape('depth', e.target.value)}
                        />
                      </div>
                      
                      {/* Campo de cajones en móvil */}
                      {selected.type === 'cajonera' && (
                        <div className="measure-field">
                          <label>Nº Cajones</label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={selected.numCajones === null || selected.numCajones === undefined ? '' : selected.numCajones}
                            onChange={e => updateSelectedShape('numCajones', e.target.value)}
                            onBlur={e => {
                              // Al perder el foco, si está vacío, poner 3 por defecto
                              if (e.target.value === '' || Number(e.target.value) < 1) {
                                updateSelectedShape('numCajones', '3')
                              }
                            }}
                            placeholder="Ej: 3"
                          />
                        </div>
                      )}
                      
                      <button 
                        className="delete-shape-btn"
                        onClick={() => {
                          setShapes(prev => prev.filter(s => s.id !== selected.id))
                          setSelectedId(null)
                        }}
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Diseños recientes - DEBAJO de medidas */}
              <div className="mobile-recent-designs">
                <div className="recent-designs">
                  <h3>Diseños recientes</h3>
                  {designs.length === 0 ? (
                    <p className="empty-message">No hay diseños guardados</p>
                  ) : (
                    <ul className="designs-list">
                      {designs.slice(0, 5).map(design => (
                        <li key={design._id} className="design-item">
                          <div className="design-info" onClick={() => handleLoadDesign(design)}>
                            <span className="design-name">{design.nombre}</span>
                            <span className="design-date">
                              {new Date(design.createdAt).toLocaleDateString('es-ES')}
                            </span>
                          </div>
                          <button 
                            className="delete-btn"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteDesign(design._id)
                            }}
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'cubicacion' && (
            <div className="cubicacion-panel">
              <h2>Lista de cortes</h2>
              {allCuts.length === 0 ? (
                <p className="empty-message">No hay módulos añadidos</p>
              ) : (
                <ul className="cut-list">
                  {allCuts.map((cut, i) => <li key={i}>{cut}</li>)}
                </ul>
              )}
            </div>
          )}
        </main>
      </div>
    )
  }

  // ============================================
  // VISTA DESKTOP (>600px)
  // ============================================
  return (
    <div className="app-root">
      <aside className="left-toolbar">
        <div>
          <p style={{ color: '#9aa0a6', fontSize: '12px', marginBottom: '4px' }}>Usuario:</p>
          <p style={{ color: '#e8eaed', fontWeight: 'bold', marginBottom: '8px' }}>{user.nombre}</p>
          <button onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>
        <Toolbar selectedModule={selectedModule} onSelect={setSelectedModule} />
      </aside>

      <main className="canvas-area">
        <div className="canvas-tabs">
          {/* Tabs centrados */}
          <button 
            className={`canvas-tab ${activeTab === 'diseno' ? 'active' : ''}`}
            onClick={() => setActiveTab('diseno')}
          >
            Diseño
          </button>
          <button 
            className={`canvas-tab ${activeTab === 'cubicacion' ? 'active' : ''}`}
            onClick={() => setActiveTab('cubicacion')}
          >
            Cubicación
          </button>

          {/* Botones a la derecha - DENTRO DE UN CONTENEDOR */}
          <div className="canvas-buttons-container">
            <button onClick={handleNewDesign} className="new-btn-desktop" title="Nuevo diseño">
              📄 Nuevo
            </button>
            <button onClick={handleSave} className="save-btn-desktop" title="Guardar">
              💾 Guardar
            </button>
          </div>
        </div>

        {activeTab === 'diseno' && (
          <div className="konva-wrapper">
            <KonvaStage
              shapes={shapes}
              setShapes={setShapes}
              selectedModule={selectedModule}
              setSelectedModule={setSelectedModule}
              selectedId={selectedId}
              setSelectedId={setSelectedId}
            />
          </div>
        )}

        {activeTab === 'cubicacion' && (
          <div className="cubicacion-panel">
            <h2>Lista de cortes:</h2>
            {allCuts.length === 0 ? (
              <p className="empty-message">No hay módulos añadidos. Ve a "Diseño" para crear.</p>
            ) : (
              <ul className="cut-list">
                {allCuts.map((cut, i) => <li key={i}>{cut}</li>)}
              </ul>
            )}
          </div>
        )}
      </main>

      <aside className="right-sidebar">
        {/* Panel de medidas ARRIBA */}
        {selected && (
          <div className="sidebar-measures">
            <h3>Editando: {selected.type}</h3>
            {currentDesignId && (
              <p style={{ fontSize: '10px', color: '#9aa0a6', marginBottom: '8px' }}>
                Diseño: {designs.find(d => d._id === currentDesignId)?.nombre || 'Sin nombre'}
              </p>
            )}
            <div className="sidebar-measure-fields">
              <div className="sidebar-measure-item">
                <label>ALTO (CM)</label>
                <input
                  type="number"
                  value={selected.height}
                  onChange={e => updateSelectedShape('height', e.target.value)}
                />
              </div>
              <div className="sidebar-measure-item">
                <label>ANCHO (CM)</label>
                <input
                  type="number"
                  value={selected.width}
                  onChange={e => updateSelectedShape('width', e.target.value)}
                />
              </div>
              <div className="sidebar-measure-item">
                <label>PROFUNDIDAD (CM)</label>
                <input
                  type="number"
                  value={selected.depth}
                  onChange={e => updateSelectedShape('depth', e.target.value)}
                />
              </div>
              
              {/* Campo de número de cajones solo para cajoneras */}
              {selected.type === 'cajonera' && (
                <div className="sidebar-measure-item">
                  <label>Nº CAJONES</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={selected.numCajones === null || selected.numCajones === undefined ? '' : selected.numCajones}
                    onChange={e => updateSelectedShape('numCajones', e.target.value)}
                    onBlur={e => {
                      // Al perder el foco, si está vacío, poner 3 por defecto
                      if (e.target.value === '' || Number(e.target.value) < 1) {
                        updateSelectedShape('numCajones', '3')
                      }
                    }}
                    placeholder="Ej: 3"
                  />
                </div>
              )}
            </div>
            <button 
              className="sidebar-delete-btn"
              onClick={() => {
                setShapes(prev => prev.filter(s => s.id !== selected.id))
                setSelectedId(null)
              }}
            >
              🗑️ Eliminar
            </button>
          </div>
        )}

        {/* Diseños recientes ABAJO */}
        <div className="recent-designs">
          <h3>Diseños recientes:</h3>
          {designs.length === 0 ? (
            <p className="empty-message">No hay diseños guardados</p>
          ) : (
            <ul className="designs-list">
              {designs.slice(0, 5).map(design => (
                <li key={design._id} className="design-item">
                  <div className="design-info" onClick={() => handleLoadDesign(design)}>
                    <span className="design-name">{design.nombre}</span>
                    <span className="design-date">
                      {new Date(design.createdAt).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                  <button 
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteDesign(design._id)
                    }}
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  )
}
