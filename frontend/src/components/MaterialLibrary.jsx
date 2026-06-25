import React, { useEffect, useMemo, useState } from 'react'
import {
  listMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} from '../services/materials'
import {
  listDrawerTypes,
  createDrawerType,
  updateDrawerType,
  deleteDrawerType,
} from '../services/drawerTypes'

const EMPTY_FORM = {
  nombre: '',
  categoria: 'material',
  precio: '',
  unidad: 'unidad',
  dimensiones: '',
  grosor: '',
  tipo: '',
  color: '',
  accesorio_tipo: '',
  descripcion: '',
}

const EMPTY_DRAWER_FORM = {
  nombre: '',
  laterales: '',
  frenteInterno: '',
  trasera: '',
  fondo: '',
  hasRefuerzo: false,
  refuerzo: '',
  heightDiscountPct: '0',
  lateralDiscount: '5',
  separacionFondo: '0',
}

export default function MaterialLibrary({
  onMaterialSelect,
  drawerTypes,
  onDrawerTypesChange,
  selectedTapaCantoId,
  onTapaCantoSelect,
  selectedDrawerTypeId,
  onDrawerTypeSelect,
  selectedCubertaMaterial,
  onCubertaSelect,
  selected,
  onShapeUpdate,
  onAccessoriesChange,
  selectedAccessories,
  onMaterialsChange,
  showConfirm,
  showAlert,
}) {
  const [activeTab, setActiveTab] = useState('material')
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [filterText, setFilterText] = useState('')
  const [drawerLoading, setDrawerLoading] = useState(false)
  const [drawerError, setDrawerError] = useState('')
  const [drawerEditing, setDrawerEditing] = useState(null)
  const [drawerForm, setDrawerForm] = useState(EMPTY_DRAWER_FORM)
  const [drawerFilterText, setDrawerFilterText] = useState('')

  const refreshList = async () => {
    setLoading(true)
    setError('')

    try {
      const data = await listMaterials({ categoria: activeTab })
      setMaterials(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los materiales')
    } finally {
      setLoading(false)
    }
  }

  const refreshDrawerTypes = async () => {
    if (!onDrawerTypesChange) return
    setDrawerLoading(true)
    setDrawerError('')

    try {
      const data = await listDrawerTypes()
      onDrawerTypesChange(Array.isArray(data) ? data : [])
    } catch (err) {
      setDrawerError(err.message || 'No se pudieron cargar los tipos de cajon')
    } finally {
      setDrawerLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'drawerType') {
      refreshDrawerTypes()
      return
    }

    refreshList()
  }, [activeTab])

  useEffect(() => {
    if (activeTab !== 'drawerType') return
    if (!materials.length) {
      listMaterials({ categoria: 'material' })
        .then((data) => setMaterials(Array.isArray(data) ? data : []))
        .catch(() => {})
    }
  }, [activeTab, materials.length])

  const resetForm = () => {
    setEditing(null)
    setForm({ ...EMPTY_FORM, categoria: activeTab })
  }

  const resetDrawerForm = () => {
    setDrawerEditing(null)
    setDrawerForm({ ...EMPTY_DRAWER_FORM })
  }

  const handleInputChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleDrawerInputChange = (field) => (event) => {
    const value = field === 'hasRefuerzo' ? event.target.checked : event.target.value
    setDrawerForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleEdit = (material) => {
    setEditing(material)
    setForm({
      ...EMPTY_FORM,
      ...material,
      precio: material.precio ?? '',
      grosor: material.grosor ?? '',
    })
  }

  const handleDrawerEdit = (drawerType) => {
    setDrawerEditing(drawerType)
    setDrawerForm({
      ...EMPTY_DRAWER_FORM,
      ...drawerType,
      heightDiscountPct: drawerType.heightDiscountPct ?? '0',
      refuerzo: drawerType.refuerzo ?? '',
      hasRefuerzo: Boolean(drawerType.hasRefuerzo),
      lateralDiscount: drawerType.lateralDiscount != null ? String(drawerType.lateralDiscount) : '5',
      separacionFondo: drawerType.separacionFondo != null ? String(drawerType.separacionFondo) : '0',
    })
  }

  const handleDelete = async (id) => {
    const ok = await showConfirm('¿Eliminar este item? Esta acción no se puede deshacer.', {
      title: 'Eliminar material',
      variant: 'danger',
      confirmLabel: 'Eliminar',
    })
    if (!ok) return
    try {
      await deleteMaterial(id)
      await refreshList()
      onMaterialsChange?.()
    } catch (err) {
      await showAlert(err.message || 'No se pudo eliminar')
    }
  }

  const handleDrawerDelete = async (id) => {
    const ok = await showConfirm('¿Eliminar este tipo de cajón? Esta acción no se puede deshacer.', {
      title: 'Eliminar tipo de cajón',
      variant: 'danger',
      confirmLabel: 'Eliminar',
    })
    if (!ok) return
    try {
      await deleteDrawerType(id)
      await refreshDrawerTypes()
    } catch (err) {
      await showAlert(err.message || 'No se pudo eliminar')
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    const payload = {
      ...form,
      categoria: activeTab,
      precio: Number(form.precio),
      grosor: form.grosor === '' ? undefined : Number(form.grosor),
      ...(activeTab === 'cubierta' && { unidad: 'metro lineal' }),
    }

    try {
      if (editing) {
        await updateMaterial(editing._id, payload)
      } else {
        await createMaterial(payload)
      }

      resetForm()
      await refreshList()
      onMaterialsChange?.()
    } catch (err) {
      setError(err.message || 'No se pudo guardar')
    }
  }

  const handleDrawerSubmit = async (event) => {
    event.preventDefault()
    setDrawerError('')

    const payload = {
      nombre: drawerForm.nombre.trim(),
      laterales: drawerForm.laterales,
      frenteInterno: drawerForm.frenteInterno,
      trasera: drawerForm.trasera,
      fondo: drawerForm.fondo,
      hasRefuerzo: Boolean(drawerForm.hasRefuerzo),
      refuerzo: drawerForm.hasRefuerzo ? drawerForm.refuerzo || undefined : undefined,
      heightDiscountPct: drawerForm.heightDiscountPct === '' ? 0 : Number(drawerForm.heightDiscountPct),
      lateralDiscount:   drawerForm.lateralDiscount   === '' ? 5 : Number(drawerForm.lateralDiscount),
      separacionFondo:   drawerForm.separacionFondo   === '' ? 0 : Number(drawerForm.separacionFondo),
    }

    try {
      if (drawerEditing) {
        await updateDrawerType(drawerEditing._id, payload)
      } else {
        await createDrawerType(payload)
      }

      resetDrawerForm()
      await refreshDrawerTypes()
    } catch (err) {
      setDrawerError(err.message || 'No se pudo guardar')
    }
  }

  const materialesFiltrados = useMemo(() => {
    return materials
      .filter((item) => item.categoria === activeTab)
      .filter((item) => {
        if (!filterText.trim()) return true
        const term = filterText.trim().toLowerCase()
        return (
          item.nombre?.toLowerCase().includes(term) ||
          item.tipo?.toLowerCase().includes(term) ||
          item.accesorio_tipo?.toLowerCase().includes(term)
        )
      })
  }, [materials, activeTab, filterText])

  const drawerTypesFiltered = useMemo(() => {
    const source = Array.isArray(drawerTypes) ? drawerTypes : []
    if (!drawerFilterText.trim()) return source
    const term = drawerFilterText.trim().toLowerCase()
    return source.filter((item) => item.nombre?.toLowerCase().includes(term))
  }, [drawerTypes, drawerFilterText])

  const materialMap = useMemo(() => {
    return materials.reduce((acc, item) => {
      acc[item._id] = item
      return acc
    }, {})
  }, [materials])

  const canAssignDrawerType = selected?.type === 'cajonera'
  const drawerCount = canAssignDrawerType
    ? (selected.numCajones && selected.numCajones > 0 ? selected.numCajones : 3)
    : 0
  const drawerOverrides = canAssignDrawerType && Array.isArray(selected.drawers)
    ? selected.drawers
    : []

  const handleDefaultDrawerTypeChange = (event) => {
    if (!canAssignDrawerType) return
    const value = event.target.value
    onShapeUpdate?.(selected.id, {
      drawerTypeId: value || undefined,
    })
  }

  const handleDrawerOverrideChange = (index, value) => {
    if (!canAssignDrawerType) return
    const existing = Array.isArray(selected.drawers) ? selected.drawers : []
    const filtered = existing.filter((drawer) => drawer.index !== index)

    if (value) {
      filtered.push({ index, drawerTypeId: value })
    }

    const nextOverrides = filtered.length > 0 ? filtered : undefined
    onShapeUpdate?.(selected.id, { drawers: nextOverrides })
  }

  return (
    <div className={`material-library${activeTab === 'drawerType' ? ' material-library--drawer' : ''}`}>
      <div className="material-tabs">
        <button
          className={activeTab === 'material' ? 'active' : ''}
          onClick={() => {
            setActiveTab('material')
            resetForm()
          }}
        >
          Materiales
        </button>
        <button
          className={activeTab === 'accesorio' ? 'active' : ''}
          onClick={() => {
            setActiveTab('accesorio')
            resetForm()
          }}
        >
          Accesorios
        </button>
        <button
          className={activeTab === 'drawerType' ? 'active' : ''}
          onClick={() => {
            setActiveTab('drawerType')
            resetDrawerForm()
          }}
        >
          Tipo de cajon
        </button>
        <button
          className={activeTab === 'tapa-canto' ? 'active' : ''}
          onClick={() => {
            setActiveTab('tapa-canto')
            resetForm()
          }}
        >
          Tapa canto
        </button>
        <button
          className={activeTab === 'cubierta' ? 'active' : ''}
          onClick={() => {
            setActiveTab('cubierta')
            resetForm()
          }}
        >
          Cubiertas
        </button>
      </div>

      {activeTab === 'drawerType' ? (
        <div className="material-grid drawer-type-grid">
          <div className="material-list">
            <div className="material-list-header">
              <h3>Tipos de cajon</h3>
              <button onClick={resetDrawerForm}>Nuevo</button>
            </div>

            <input
              className="material-search"
              placeholder="Buscar..."
              value={drawerFilterText}
              onChange={(event) => setDrawerFilterText(event.target.value)}
            />

            {drawerLoading && <p>Cargando...</p>}
            {drawerError && <p className="error-text">{drawerError}</p>}

            {drawerTypesFiltered.length === 0 && !drawerLoading && (
              <p className="empty-message">No hay registros aún.</p>
            )}

            <ul>
              {drawerTypesFiltered.map((item) => (
                <li key={item._id}>
                  <div>
                    <strong>{item.nombre}</strong>
                    <p>Laterales: {materialMap[item.laterales]?.nombre || 'Sin material'}</p>
                    <p>Frente interno: {materialMap[item.frenteInterno]?.nombre || 'Sin material'}</p>
                    <p>Trasera: {materialMap[item.trasera]?.nombre || 'Sin material'}</p>
                    <p>Fondo: {materialMap[item.fondo]?.nombre || 'Sin material'}</p>
                    {item.hasRefuerzo && (
                      <p>Refuerzo: {materialMap[item.refuerzo]?.nombre || 'Sin material'}</p>
                    )}
                    {item.heightDiscountPct ? (
                      <p>Descuento altura: {item.heightDiscountPct} cm</p>
                    ) : null}
                    {item.lateralDiscount != null && (
                      <p>Desc. lateral: {item.lateralDiscount} cm</p>
                    )}
                    {item.separacionFondo > 0 && (
                      <p>Sep. fondo: {item.separacionFondo} cm</p>
                    )}
                  </div>
                  <div className="actions">
                    <button onClick={() => handleDrawerEdit(item)}>Editar</button>
                    <button onClick={() => handleDrawerDelete(item._id)}>Eliminar</button>
                    {onDrawerTypeSelect && (
                      <button onClick={() => onDrawerTypeSelect(selectedDrawerTypeId === item._id ? null : item._id)}>
                        {selectedDrawerTypeId === item._id ? 'Quitar' : 'Usar'}
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="material-form">
            <h3>{drawerEditing ? 'Editar' : 'Nuevo'} tipo de cajon</h3>
            <form onSubmit={handleDrawerSubmit}>
              <label>
                Nombre
                <input value={drawerForm.nombre} onChange={handleDrawerInputChange('nombre')} required />
              </label>

              <label>
                Laterales
                <select value={drawerForm.laterales} onChange={handleDrawerInputChange('laterales')} required>
                  <option value="">Seleccionar...</option>
                  {materials.filter((item) => item.categoria === 'material').map((item) => (
                    <option key={item._id} value={item._id}>{item.nombre}</option>
                  ))}
                </select>
              </label>

              <label>
                Frente interno
                <select value={drawerForm.frenteInterno} onChange={handleDrawerInputChange('frenteInterno')} required>
                  <option value="">Seleccionar...</option>
                  {materials.filter((item) => item.categoria === 'material').map((item) => (
                    <option key={item._id} value={item._id}>{item.nombre}</option>
                  ))}
                </select>
              </label>

              <label>
                Trasera
                <select value={drawerForm.trasera} onChange={handleDrawerInputChange('trasera')} required>
                  <option value="">Seleccionar...</option>
                  {materials.filter((item) => item.categoria === 'material').map((item) => (
                    <option key={item._id} value={item._id}>{item.nombre}</option>
                  ))}
                </select>
              </label>

              <label>
                Fondo
                <select value={drawerForm.fondo} onChange={handleDrawerInputChange('fondo')} required>
                  <option value="">Seleccionar...</option>
                  {materials.filter((item) => item.categoria === 'material').map((item) => (
                    <option key={item._id} value={item._id}>{item.nombre}</option>
                  ))}
                </select>
              </label>

              <label className="checkbox-field">
                <input
                  type="checkbox"
                  checked={drawerForm.hasRefuerzo}
                  onChange={handleDrawerInputChange('hasRefuerzo')}
                />
                Lleva refuerzo
              </label>

              {drawerForm.hasRefuerzo && (
                <label>
                  Refuerzo
                  <select value={drawerForm.refuerzo} onChange={handleDrawerInputChange('refuerzo')} required>
                    <option value="">Seleccionar...</option>
                    {materials.filter((item) => item.categoria === 'material').map((item) => (
                      <option key={item._id} value={item._id}>{item.nombre}</option>
                    ))}
                  </select>
                </label>
              )}

              <label>
                Descuento altura (cm)
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={drawerForm.heightDiscountPct}
                  onChange={handleDrawerInputChange('heightDiscountPct')}
                />
              </label>

              <label>
                Desc. lateral (cm)
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={drawerForm.lateralDiscount}
                  onChange={handleDrawerInputChange('lateralDiscount')}
                />
              </label>

              <label>
                Separación fondo (cm)
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={drawerForm.separacionFondo}
                  onChange={handleDrawerInputChange('separacionFondo')}
                />
              </label>

              <div className="form-actions">
                <button type="submit">{drawerEditing ? 'Actualizar' : 'Guardar'}</button>
                {drawerEditing && <button type="button" onClick={resetDrawerForm}>Cancelar</button>}
              </div>

            </form>
          </div>

          <div className="drawer-type-assign">
            <h3>Asignar tipo por defecto</h3>
            {canAssignDrawerType ? (
              <>
                <label>
                  Tipo de cajon
                  <select
                    value={selected.drawerTypeId || ''}
                    onChange={handleDefaultDrawerTypeChange}
                  >
                    <option value="">Sin tipo</option>
                    {drawerTypesFiltered.map((item) => (
                      <option key={item._id} value={item._id}>{item.nombre}</option>
                    ))}
                  </select>
                </label>

                <div className="drawer-override-list">
                  <h4>Override por cajon</h4>
                  {Array.from({ length: drawerCount }).map((_, index) => {
                    const override = drawerOverrides.find((drawer) => drawer.index === index + 1)
                    return (
                      <label key={index}>
                        Cajon {index + 1}
                        <select
                          value={override?.drawerTypeId || ''}
                          onChange={(event) => handleDrawerOverrideChange(index + 1, event.target.value)}
                        >
                          <option value="">Sin override</option>
                          {drawerTypesFiltered.map((item) => (
                            <option key={item._id} value={item._id}>{item.nombre}</option>
                          ))}
                        </select>
                      </label>
                    )
                  })}
                </div>
              </>
            ) : (
              <p className="empty-message">Selecciona una cajonera para asignar tipos.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="material-grid">
          <div className="material-list">
            <div className="material-list-header">
              <h3>
                {activeTab === 'material' ? 'Materiales'
                  : activeTab === 'accesorio' ? 'Accesorios'
                  : activeTab === 'tapa-canto' ? 'Tapa canto'
                  : 'Cubiertas'}
              </h3>
              <button onClick={resetForm}>Nuevo</button>
            </div>

            <input
              className="material-search"
              placeholder="Buscar..."
              value={filterText}
              onChange={(event) => setFilterText(event.target.value)}
            />

            {loading && <p>Cargando...</p>}
            {error && <p className="error-text">{error}</p>}

            {materialesFiltrados.length === 0 && !loading && (
              <p className="empty-message">No hay registros aún.</p>
            )}

            <ul>
              {materialesFiltrados.map((item) => (
                <li key={item._id}>
                  <div>
                    <strong>{item.nombre}</strong>
                    {item.categoria === 'tapa-canto' ? (
                      <p>Tapa canto</p>
                    ) : item.categoria === 'cubierta' ? (
                      item.tipo && <p>{item.tipo}</p>
                    ) : (
                      <p>{item.categoria === 'material' ? item.tipo : item.accesorio_tipo}</p>
                    )}
                    {item.color && <p>Color: {item.color}</p>}
                    {item.dimensiones && <p>Dimensiones: {item.dimensiones}</p>}
                    <p>Precio: $ {Math.round(item.precio).toLocaleString('es-CL')}{item.categoria === 'cubierta' ? '/m' : ''}</p>
                  </div>
                  <div className="actions">
                    <button onClick={() => handleEdit(item)}>Editar</button>
                    <button onClick={() => handleDelete(item._id)}>Eliminar</button>
                    {activeTab === 'material' && onMaterialSelect && (
                      <button onClick={() => onMaterialSelect(item)}>Usar</button>
                    )}
                    {activeTab === 'accesorio' && onAccessoriesChange && (
                      <button onClick={() => {
                        const exists = selectedAccessories?.find(a => a.materialId === item._id)
                        if (exists) {
                          onAccessoriesChange(prev => prev.filter(a => a.materialId !== item._id))
                        } else {
                          onAccessoriesChange(prev => [...prev, { materialId: item._id, quantity: 0 }])
                        }
                      }}>
                        {selectedAccessories?.find(a => a.materialId === item._id) ? 'Quitar' : 'Usar'}
                      </button>
                    )}
                    {activeTab === 'tapa-canto' && onTapaCantoSelect && (
                      <button onClick={() => onTapaCantoSelect(selectedTapaCantoId === item._id ? null : item._id)}>
                        {selectedTapaCantoId === item._id ? 'Quitar' : 'Usar'}
                      </button>
                    )}
                    {activeTab === 'cubierta' && onCubertaSelect && (
                      <button onClick={() => onCubertaSelect(selectedCubertaMaterial?._id === item._id ? null : item)}>
                        {selectedCubertaMaterial?._id === item._id ? 'Quitar' : 'Usar'}
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="material-form">
            <h3>
              {editing ? 'Editar' : 'Nuevo'}{' '}
              {activeTab === 'material' ? 'material'
                : activeTab === 'accesorio' ? 'accesorio'
                : activeTab === 'tapa-canto' ? 'tapa canto'
                : 'cubierta'}
            </h3>
            <form onSubmit={handleSubmit}>
              <label>
                Nombre
                <input value={form.nombre} onChange={handleInputChange('nombre')} required />
              </label>

              <label>
                Precio
                <input
                  type="number"
                  value={form.precio}
                  onChange={handleInputChange('precio')}
                  min="0"
                  step="0.01"
                  required
                />
              </label>

              <label>
                Unidad
                <input value={form.unidad} onChange={handleInputChange('unidad')} />
              </label>

              {activeTab === 'material' && (
                <>
                  <label>
                    Tipo (ej: Melamina)
                    <input value={form.tipo} onChange={handleInputChange('tipo')} required />
                  </label>
                  <label>
                    Color
                    <input value={form.color} onChange={handleInputChange('color')} />
                  </label>
                  <label>
                    Dimensiones(ej: 250x183)
                    <input value={form.dimensiones} onChange={handleInputChange('dimensiones')} required />
                  </label>
                  <label>
                    Grosor (mm)
                    <input type="number" value={form.grosor} onChange={handleInputChange('grosor')} />
                  </label>
                </>
              )}

              {activeTab === 'accesorio' && (
                <>
                  <label>
                    Tipo
                    <select value={form.accesorio_tipo} onChange={handleInputChange('accesorio_tipo')} required>
                      <option value="">Seleccionar...</option>
                      <option value="visagra">Visagra</option>
                      <option value="corredera">Corredera</option>
                      <option value="tirador">Tirador</option>
                      <option value="otro">Otro</option>
                    </select>
                  </label>
                  <label>
                    Descripción
                    <input value={form.descripcion} onChange={handleInputChange('descripcion')} />
                  </label>
                </>
              )}

              {activeTab === 'tapa-canto' && (
                <label>
                  Color
                  <input value={form.color} onChange={handleInputChange('color')} />
                </label>
              )}

              {activeTab === 'cubierta' && (
                <>
                  <label>
                    Tipo (ej: Postformada, Mármol)
                    <input value={form.tipo} onChange={handleInputChange('tipo')} />
                  </label>
                  <label>
                    Color
                    <input value={form.color} onChange={handleInputChange('color')} />
                  </label>
                  <label>
                    Descripción
                    <input value={form.descripcion} onChange={handleInputChange('descripcion')} />
                  </label>
                </>
              )}

              <div className="form-actions">
                <button type="submit">{editing ? 'Actualizar' : 'Guardar'}</button>
                {editing && <button type="button" onClick={resetForm}>Cancelar</button>}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
