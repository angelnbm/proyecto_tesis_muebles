import React, { useState, useEffect, useRef } from 'react'
import './App.css'
import Toolbar from './components/Toolbar.jsx'
import KonvaStage from './components/KonvaStage.jsx'
import CubicacionPanel from './components/CubicacionPanel.jsx'
import MaterialLibrary from './components/MaterialLibrary.jsx'
import AuthForm from './components/Login.jsx' 
import LandingPage from './components/LandingPage.jsx'
import { saveFurniture, loadFurniture, deleteFurniture, updateFurniture } from './services/api.js'
import { listDrawerTypes } from './services/drawerTypes.js'
import { listMaterials } from './services/materials.js'
import { getToken, removeToken, verifyToken } from './services/auth.js'
import { parseBoardConfig, getDimensionWarnings } from './services/boardUtils.js'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showLogin, setShowLogin] = useState(false)
  const [selectedModule, setSelectedModule] = useState(null)
  const [shapes, setShapes] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [activeTab, setActiveTab] = useState('diseno')
  const [selectedMaterial, setSelectedMaterial] = useState(null)
  const [designs, setDesigns] = useState([])
  const [drawerTypes, setDrawerTypes] = useState([])
  const [tapaCantos, setTapaCantos] = useState([])
  const [materials, setMaterials] = useState([])
  const [accessories, setAccessories] = useState([])
  const [selectedAccessories, setSelectedAccessories] = useState([])
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600)
  const [currentDesignId, setCurrentDesignId] = useState(null)
  const [selectedTapaCantoId, setSelectedTapaCantoId] = useState(null)
  const [selectedDrawerTypeId, setSelectedDrawerTypeId] = useState(null)
  const stageRef = useRef(null)

  const selected = shapes.find(s => s.id === selectedId) || null

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
    let isMounted = true
    const token = getToken()
    const startTime = Date.now()

    if (token) {
      verifyToken(token)
        .then(data => {
          if (!isMounted) return
          const elapsed = Date.now() - startTime
          const delay = Math.max(0, 500 - elapsed)

          setTimeout(() => {
            if (!isMounted) return
            setUser(data.user)
            setLoading(false)
          }, delay)
        })
        .catch(() => {
          if (!isMounted) return
          removeToken()
          setUser(null)
          setLoading(false)
        })
    } else {
      setLoading(false)
    }

    return () => { isMounted = false }
  }, [])

  // Cargar diseños guardados
  useEffect(() => {
    if (user) {
      loadFurniture()
        .then(data => setDesigns(data))
        .catch(err => {
          console.error('Error al cargar diseños:', err)
        })
    }
  }, [user])

  useEffect(() => {
    if (!user) {
      setDrawerTypes([])
      setTapaCantos([])
      setMaterials([])
      return
    }

    listDrawerTypes()
      .then(data => setDrawerTypes(Array.isArray(data) ? data : []))
      .catch(() => setDrawerTypes([]))

    listMaterials({ categoria: 'tapa-canto' })
      .then(data => setTapaCantos(Array.isArray(data) ? data : []))
      .catch(() => setTapaCantos([]))

    listMaterials({})
      .then(data => setMaterials(Array.isArray(data) ? data : []))
      .catch(() => setMaterials([]))

    listMaterials({ categoria: 'accesorio' })
      .then(data => setAccessories(Array.isArray(data) ? data : []))
      .catch(() => setAccessories([]))
  }, [user])

  // Guardar diseño actual con validaciones
  const handleSave = async () => {
    const currentDesign = designs.find(d => d._id === currentDesignId)
    const defaultName = currentDesign ? currentDesign.nombre : ''
    const name = prompt('Nombre del diseño:', defaultName)
    
    if (!name) return
    if (!name.trim()) {
      alert('El nombre no puede estar vacío')
      return
    }

    const existingDesign = designs.find(d => d.nombre === name.trim())

    // Actualizar diseño existente
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

    // Sobrescribir diseño con mismo nombre
    if (existingDesign) {
      const shouldOverwrite = confirm(
        `Ya existe un diseño llamado "${name}".\n¿Deseas sobrescribirlo?`
      )
      
      if (!shouldOverwrite) {
        return
      }

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

    // Crear nuevo diseño
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
    setCurrentDesignId(null)
  }

  const updateShape = (id, updates) => {
    setShapes(prev => prev.map(s => 
      s.id === id ? { ...s, ...updates } : s
    ))
  }

  const updateSelectedShape = (key, value) => {
    if (!selected) return

    if (key === 'numCajones' || key === 'numEstantes' || key === 'numDivisores' || key === 'numPuertas') {
      const numValue = value === '' ? null : Number(value)
      updateShape(selected.id, { [key]: numValue })
    } else if (key === 'numZocaloDivisiones') {
      updateShape(selected.id, { [key]: value === '' ? 0 : Math.max(0, Number(value)) })
    } else {
      updateShape(selected.id, { [key]: Number(value) })
    }
  }

  const updateZocaloCaras = (cara, checked) => {
    if (!selected) return
    const current = selected.zocaloCaras || { frontal: true, lateral_izq: true, lateral_der: true, trasera: false }
    updateShape(selected.id, { zocaloCaras: { ...current, [cara]: checked } })
  }

  const handleLoadDesign = (design) => {
    setShapes(design.shapes || [])
    setSelectedId(null)
    setActiveTab('diseno')
    setCurrentDesignId(design._id)
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

  const handleNewDesign = () => {
    if (shapes.length > 0 && !confirm('¿Descartar el diseño actual?')) return
    setShapes([])
    setSelectedId(null)
    setCurrentDesignId(null)
    setActiveTab('diseno')
  }

  // Pantalla de carga mientras verifica token
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: 'var(--color-ink-black)',
        color: 'var(--color-canvas-white)',
        flexDirection: 'column',
        gap: '16px',
        fontFamily: 'var(--font-matter)',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '2px solid var(--color-slate-border)',
          borderTop: '2px solid var(--color-ideation-blue)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }}></div>
        <p style={{ color: 'var(--color-faded-grey)', fontSize: '14px' }}>Cargando...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  // Si no hay usuario (después de verificar), mostrar login
  if (!user) {
    return showLogin ? (
      <AuthForm onLogin={(userData) => {
        setUser(userData)
        setLoading(false)
      }} />
    ) : (
      <LandingPage onLoginClick={() => setShowLogin(true)} />
    )
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
            <button
              className={activeTab === 'biblioteca' ? 'active' : ''}
              onClick={() => setActiveTab('biblioteca')}
            >
              Biblioteca
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
           <div className={`mobile-canvas ${activeTab === 'diseno' ? '' : 'is-hidden'}`}>
             <KonvaStage
                ref={stageRef}
                shapes={shapes}
                setShapes={setShapes}
                selectedModule={selectedModule}
                setSelectedModule={setSelectedModule}
                selectedId={selectedId}
                setSelectedId={setSelectedId}
                updateShape={updateShape}
              />
           </div>

           {activeTab === 'diseno' && (
            <>

              {selected && (
                <div className="bottom-panel">
                  <div className="measure-section">
                    <h3>Editando: {selected.type}</h3>
                    <div className="measure-grid">
                      <div className="measure-field">
                        <label>Alto (CM)</label>
                        <input
                          type="number"
                          min="0.5"
                          step="0.5"
                          value={selected.height}
                          onChange={e => updateSelectedShape('height', e.target.value)}
                        />
                      </div>
                      <div className="measure-field">
                        <label>Ancho (CM)</label>
                        <input
                          type="number"
                          min="0.5"
                          step="0.5"
                          value={selected.width}
                          onChange={e => updateSelectedShape('width', e.target.value)}
                        />
                      </div>
                      <div className="measure-field">
                        <label>Profundidad (CM)</label>
                        <input
                          type="number"
                          min="0.5"
                          step="0.5"
                          value={selected.depth}
                          onChange={e => updateSelectedShape('depth', e.target.value)}
                        />
                      </div>

                      {/* Advertencias de dimensiones vs plancha */}
                      {(() => {
                        const warnings = getDimensionWarnings(selected, parseBoardConfig(selectedMaterial))
                        if (warnings.length === 0) return null
                        return (
                          <div style={{ gridColumn: '1/-1', background: 'rgba(255,180,0,0.1)', border: '1px solid rgba(255,180,0,0.4)', borderRadius: '6px', padding: '6px 8px', marginTop: '2px' }}>
                            {warnings.map((w, i) => (
                              <p key={i} style={{ margin: '2px 0', fontSize: '11px', color: '#f5c842', lineHeight: 1.4 }}>⚠ {w}</p>
                            ))}
                          </div>
                        )
                      })()}

                      {/* Campo de cajones para cajonera */}
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
                              if (e.target.value === '' || Number(e.target.value) < 1) {
                                updateSelectedShape('numCajones', '3')
                              }
                            }}
                            placeholder="Ej: 3"
                          />
                        </div>
                      )}

                      {/* Campos para módulo modular */}
                      {selected.type === 'modular' && (
                        <>
                          <div className="measure-field">
                            <label>Nº Estantes</label>
                            <input
                              type="number"
                              min="0"
                              max="10"
                              value={selected.numEstantes === null || selected.numEstantes === undefined ? '' : selected.numEstantes}
                              onChange={e => updateSelectedShape('numEstantes', e.target.value)}
                              onBlur={e => {
                                if (e.target.value === '') {
                                  updateSelectedShape('numEstantes', '0')
                                }
                              }}
                              placeholder="Ej: 2"
                            />
                          </div>
                          <div className="measure-field">
                            <label>Nº Divisores</label>
                            <input
                              type="number"
                              min="0"
                              max="10"
                              value={selected.numDivisores === null || selected.numDivisores === undefined ? '' : selected.numDivisores}
                              onChange={e => updateSelectedShape('numDivisores', e.target.value)}
                              onBlur={e => {
                                if (e.target.value === '') {
                                  updateSelectedShape('numDivisores', '0')
                                }
                              }}
                              placeholder="Ej: 1"
                            />
                          </div>
                          <div className="measure-field">
                            <label>Nº Puertas</label>
                            <input
                              type="number"
                              min="0"
                              max="6"
                              value={selected.numPuertas === null || selected.numPuertas === undefined ? '' : selected.numPuertas}
                              onChange={e => updateSelectedShape('numPuertas', e.target.value)}
                              onBlur={e => {
                                if (e.target.value === '') {
                                  updateSelectedShape('numPuertas', '0')
                                }
                              }}
                              placeholder="Ej: 2"
                            />
                          </div>
                        </>
                      )}

                      {/* Fondo del módulo - cajonera y modular */}
                      {(selected.type === 'cajonera' || selected.type === 'modular') && (
                        <>
                          <div style={{ gridColumn: '1/-1', borderTop: '1px solid var(--color-slate-border)', paddingTop: '8px', marginTop: '4px' }}>
                            <label style={{ fontSize: '10px', color: 'var(--color-faded-grey)', letterSpacing: '0.05em' }}>FONDO</label>
                          </div>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--color-paper-grey)', cursor: 'pointer', gridColumn: '1/-1' }}>
                            <input
                              type="checkbox"
                              checked={!!selected.noFondo}
                              onChange={e => updateShape(selected.id, { noFondo: e.target.checked })}
                              style={{ accentColor: 'var(--color-ideation-blue)', width: '14px', height: '14px' }}
                            />
                            Sin fondo
                          </label>
                          {!selected.noFondo && (
                            <div className="measure-field" style={{ gridColumn: '1/-1' }}>
                              <label>Material fondo</label>
                              <select
                                value={selected.fondoMaterialId || ''}
                                onChange={e => updateShape(selected.id, { fondoMaterialId: e.target.value || null })}
                                style={{ width: '100%', background: 'var(--color-dark-surface)', color: 'var(--color-paper-grey)', border: '1px solid var(--color-slate-border)', borderRadius: '4px', padding: '4px 6px', fontSize: '12px' }}
                              >
                                <option value="">— mismo material —</option>
                                {materials.filter(m => m.categoria === 'material').map(m => (
                                  <option key={m._id} value={m._id}>{m.nombre}</option>
                                ))}
                              </select>
                            </div>
                          )}
                        </>
                      )}

                      {/* Configuración de caras para base/zócalo en mobile */}
                      {selected.type === 'base' && (() => {
                        const caras = selected.zocaloCaras || { frontal: true, lateral_izq: true, lateral_der: true, trasera: false }
                        return (
                          <>
                            <div style={{ gridColumn: '1/-1', borderTop: '1px solid var(--color-slate-border)', paddingTop: '8px', marginTop: '4px' }}>
                              <label style={{ fontSize: '10px', color: 'var(--color-faded-grey)', letterSpacing: '0.05em' }}>CARAS DEL ZÓCALO</label>
                            </div>
                            {[
                              { key: 'frontal',     label: 'Frente' },
                              { key: 'lateral_izq', label: 'Lateral izq.' },
                              { key: 'lateral_der', label: 'Lateral der.' },
                              { key: 'trasera',     label: 'Trasera' },
                            ].map(({ key, label }) => (
                              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--color-paper-grey)', cursor: 'pointer', gridColumn: '1/-1' }}>
                                <input
                                  type="checkbox"
                                  checked={!!caras[key]}
                                  onChange={e => updateZocaloCaras(key, e.target.checked)}
                                  style={{ accentColor: 'var(--color-ideation-blue)', width: '14px', height: '14px' }}
                                />
                                {label}
                              </label>
                            ))}
                            <div className="measure-field">
                              <label>Divisiones int.</label>
                              <input
                                type="number"
                                min="0"
                                max="10"
                                value={selected.numZocaloDivisiones ?? 0}
                                onChange={e => updateSelectedShape('numZocaloDivisiones', e.target.value)}
                                placeholder="0"
                              />
                            </div>
                          </>
                        )
                      })()}

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
            <CubicacionPanel
              shapes={shapes}
              exportStageImage={() => stageRef.current?.exportImage?.() || null}
              selectedMaterial={selectedMaterial}
              drawerTypes={drawerTypes}
              tapaCantos={tapaCantos}
              materials={materials}
              accessories={accessories}
              selectedAccessories={selectedAccessories}
              currentDesignName={designs.find(d => d._id === currentDesignId)?.nombre || ''}
              selectedTapaCantoId={selectedTapaCantoId}
              selectedDrawerTypeId={selectedDrawerTypeId}
            />
          )}

          {activeTab === 'biblioteca' && (
            <MaterialLibrary
              onMaterialSelect={setSelectedMaterial}
              drawerTypes={drawerTypes}
              onDrawerTypesChange={setDrawerTypes}
              selectedTapaCantoId={selectedTapaCantoId}
              onTapaCantoSelect={setSelectedTapaCantoId}
              selectedDrawerTypeId={selectedDrawerTypeId}
              onDrawerTypeSelect={setSelectedDrawerTypeId}
              selected={selected}
              onShapeUpdate={updateShape}
              onAccessoriesChange={setSelectedAccessories}
              selectedAccessories={selectedAccessories}
            />
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
          <p style={{ color: 'var(--color-faded-grey)', fontSize: '11px', marginBottom: '4px' }}>Usuario</p>
          <p style={{ color: 'var(--color-canvas-white)', fontWeight: '500', marginBottom: '10px', fontSize: '13px' }}>{user.nombre}</p>
          <button onClick={handleLogout} style={{
            width: '100%',
            padding: '6px 12px',
            background: 'transparent',
            color: 'var(--color-faded-grey)',
            border: '1px solid var(--color-slate-border)',
            borderRadius: 'var(--radius-buttons)',
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}>
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
          <button
            className={`canvas-tab ${activeTab === 'biblioteca' ? 'active' : ''}`}
            onClick={() => setActiveTab('biblioteca')}
          >
            Biblioteca
          </button>

          {/* Botones a la derecha */}
          <div className="canvas-buttons-container">
            <button onClick={handleNewDesign} className="new-btn-desktop" title="Nuevo diseño">
              📄 Nuevo
            </button>
            <button onClick={handleSave} className="save-btn-desktop" title="Guardar">
              💾 Guardar
            </button>
          </div>
        </div>

        <div className={`konva-wrapper ${activeTab === 'diseno' ? '' : 'is-hidden'}`}>
          <KonvaStage
            ref={stageRef}
            shapes={shapes}
            setShapes={setShapes}
            selectedModule={selectedModule}
            setSelectedModule={setSelectedModule}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            updateShape={updateShape}
          />
        </div>

        {activeTab === 'cubicacion' && (
          <CubicacionPanel
            shapes={shapes}
            exportStageImage={() => stageRef.current?.exportImage?.() || null}
            selectedMaterial={selectedMaterial}
            drawerTypes={drawerTypes}
            tapaCantos={tapaCantos}
            materials={materials}
            accessories={accessories}
            selectedAccessories={selectedAccessories}
            currentDesignName={designs.find(d => d._id === currentDesignId)?.nombre || ''}
            selectedTapaCantoId={selectedTapaCantoId}
            selectedDrawerTypeId={selectedDrawerTypeId}
          />
        )}

        {activeTab === 'biblioteca' && (
          <MaterialLibrary
            onMaterialSelect={setSelectedMaterial}
            drawerTypes={drawerTypes}
            onDrawerTypesChange={setDrawerTypes}
            selectedTapaCantoId={selectedTapaCantoId}
            onTapaCantoSelect={setSelectedTapaCantoId}
            selectedDrawerTypeId={selectedDrawerTypeId}
            onDrawerTypeSelect={setSelectedDrawerTypeId}
            selected={selected}
            onShapeUpdate={updateShape}
            onAccessoriesChange={setSelectedAccessories}
            selectedAccessories={selectedAccessories}
          />
        )}
      </main>

      <aside className="right-sidebar">
        {selected && (
          <div className="sidebar-measures">
            <h3>Editando: {selected.type}</h3>
            {currentDesignId && (
              <p style={{ fontSize: '10px', color: 'var(--color-faded-grey)', marginBottom: '8px' }}>
                {designs.find(d => d._id === currentDesignId)?.nombre || 'Sin nombre'}
              </p>
            )}
            <div className="sidebar-measure-fields">
              <div className="sidebar-measure-item">
                <label>ALTO (CM)</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={selected.height}
                  onChange={e => updateSelectedShape('height', e.target.value)}
                />
              </div>
              <div className="sidebar-measure-item">
                <label>ANCHO (CM)</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={selected.width}
                  onChange={e => updateSelectedShape('width', e.target.value)}
                />
              </div>
              <div className="sidebar-measure-item">
                <label>PROFUNDIDAD (CM)</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={selected.depth}
                  onChange={e => updateSelectedShape('depth', e.target.value)}
                />
              </div>

              {/* Advertencias de dimensiones vs plancha */}
              {(() => {
                const warnings = getDimensionWarnings(selected, parseBoardConfig(selectedMaterial))
                if (warnings.length === 0) return null
                return (
                  <div style={{ gridColumn: '1/-1', background: 'rgba(255,180,0,0.1)', border: '1px solid rgba(255,180,0,0.4)', borderRadius: '6px', padding: '6px 8px', marginTop: '2px' }}>
                    {warnings.map((w, i) => (
                      <p key={i} style={{ margin: '2px 0', fontSize: '11px', color: '#f5c842', lineHeight: 1.4 }}>⚠ {w}</p>
                    ))}
                  </div>
                )
              })()}

              {/* Campo de cajones para cajonera */}
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
                      if (e.target.value === '' || Number(e.target.value) < 1) {
                        updateSelectedShape('numCajones', '3')
                      }
                    }}
                    placeholder="Ej: 3"
                  />
                </div>
              )}

              {/* Campos para módulo modular en desktop */}
              {selected.type === 'modular' && (
                <>
                  <div className="sidebar-measure-item">
                    <label>Nº ESTANTES</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={selected.numEstantes === null || selected.numEstantes === undefined ? '' : selected.numEstantes}
                      onChange={e => updateSelectedShape('numEstantes', e.target.value)}
                      onBlur={e => {
                        if (e.target.value === '') {
                          updateSelectedShape('numEstantes', '0')
                        }
                      }}
                      placeholder="Ej: 2"
                    />
                  </div>
                  <div className="sidebar-measure-item">
                    <label>Nº DIVISORES</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={selected.numDivisores === null || selected.numDivisores === undefined ? '' : selected.numDivisores}
                      onChange={e => updateSelectedShape('numDivisores', e.target.value)}
                      onBlur={e => {
                        if (e.target.value === '') {
                          updateSelectedShape('numDivisores', '0')
                        }
                      }}
                      placeholder="Ej: 1"
                    />
                  </div>
                  <div className="sidebar-measure-item">
                    <label>Nº PUERTAS</label>
                    <input
                      type="number"
                      min="0"
                      max="6"
                      value={selected.numPuertas === null || selected.numPuertas === undefined ? '' : selected.numPuertas}
                      onChange={e => updateSelectedShape('numPuertas', e.target.value)}
                      onBlur={e => {
                        if (e.target.value === '') {
                          updateSelectedShape('numPuertas', '0')
                        }
                      }}
                      placeholder="Ej: 2"
                    />
                  </div>
                </>
              )}

              {/* Fondo del módulo - cajonera y modular */}
              {(selected.type === 'cajonera' || selected.type === 'modular') && (
                <>
                  <div style={{ gridColumn: '1/-1', borderTop: '1px solid var(--color-slate-border)', paddingTop: '8px', marginTop: '4px' }}>
                    <label style={{ fontSize: '10px', color: 'var(--color-faded-grey)', letterSpacing: '0.05em' }}>FONDO</label>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--color-paper-grey)', cursor: 'pointer', gridColumn: '1/-1' }}>
                    <input
                      type="checkbox"
                      checked={!!selected.noFondo}
                      onChange={e => updateShape(selected.id, { noFondo: e.target.checked })}
                      style={{ accentColor: 'var(--color-ideation-blue)', width: '14px', height: '14px' }}
                    />
                    Sin fondo
                  </label>
                  {!selected.noFondo && (
                    <div className="sidebar-measure-item" style={{ gridColumn: '1/-1' }}>
                      <label>MATERIAL FONDO</label>
                      <select
                        value={selected.fondoMaterialId || ''}
                        onChange={e => updateShape(selected.id, { fondoMaterialId: e.target.value || null })}
                        style={{ width: '100%', background: 'var(--color-dark-surface)', color: 'var(--color-paper-grey)', border: '1px solid var(--color-slate-border)', borderRadius: '4px', padding: '4px 6px', fontSize: '11px' }}
                      >
                        <option value="">— mismo material —</option>
                        {materials.filter(m => m.categoria === 'material').map(m => (
                          <option key={m._id} value={m._id}>{m.nombre}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}

              {/* Configuración de caras para base/zócalo en desktop */}
              {selected.type === 'base' && (() => {
                const caras = selected.zocaloCaras || { frontal: true, lateral_izq: true, lateral_der: true, trasera: false }
                return (
                  <>
                    <div style={{ gridColumn: '1/-1', borderTop: '1px solid var(--color-slate-border)', paddingTop: '8px', marginTop: '4px' }}>
                      <label style={{ fontSize: '10px', color: 'var(--color-faded-grey)', letterSpacing: '0.05em' }}>CARAS DEL ZÓCALO</label>
                    </div>
                    {[
                      { key: 'frontal',     label: 'Frente' },
                      { key: 'lateral_izq', label: 'Lateral izq.' },
                      { key: 'lateral_der', label: 'Lateral der.' },
                      { key: 'trasera',     label: 'Trasera' },
                    ].map(({ key, label }) => (
                      <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--color-paper-grey)', cursor: 'pointer', gridColumn: '1/-1' }}>
                        <input
                          type="checkbox"
                          checked={!!caras[key]}
                          onChange={e => updateZocaloCaras(key, e.target.checked)}
                          style={{ accentColor: 'var(--color-ideation-blue)', width: '14px', height: '14px' }}
                        />
                        {label}
                      </label>
                    ))}
                    <div className="sidebar-measure-item" style={{ gridColumn: '1/-1' }}>
                      <label>DIVISIONES INT.</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={selected.numZocaloDivisiones ?? 0}
                        onChange={e => updateSelectedShape('numZocaloDivisiones', e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </>
                )
              })()}
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
