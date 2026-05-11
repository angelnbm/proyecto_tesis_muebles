import React, { useEffect, useMemo, useState } from 'react'
import {
  listMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} from '../services/materials'

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

export default function MaterialLibrary({ onMaterialSelect }) {
  const [activeTab, setActiveTab] = useState('material')
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [filterText, setFilterText] = useState('')

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

  useEffect(() => {
    refreshList()
  }, [activeTab])

  const resetForm = () => {
    setEditing(null)
    setForm({ ...EMPTY_FORM, categoria: activeTab })
  }

  const handleInputChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
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

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este item?')) return

    try {
      await deleteMaterial(id)
      await refreshList()
    } catch (err) {
      setError(err.message || 'No se pudo eliminar')
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
    }

    try {
      if (editing) {
        await updateMaterial(editing._id, payload)
      } else {
        await createMaterial(payload)
      }

      resetForm()
      await refreshList()
    } catch (err) {
      setError(err.message || 'No se pudo guardar')
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

  return (
    <div className="material-library">
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
      </div>

      <div className="material-grid">
        <div className="material-list">
          <div className="material-list-header">
            <h3>{activeTab === 'material' ? 'Materiales' : 'Accesorios'}</h3>
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
                  <p>{item.categoria === 'material' ? item.tipo : item.accesorio_tipo}</p>
                  {item.color && <p>Color: {item.color}</p>}
                  {item.dimensiones && <p>Dimensiones: {item.dimensiones}</p>}
                  <p>Precio: ${item.precio}</p>
                </div>
                <div className="actions">
                  <button onClick={() => handleEdit(item)}>Editar</button>
                  <button onClick={() => handleDelete(item._id)}>Eliminar</button>
                  {activeTab === 'material' && onMaterialSelect && (
                    <button onClick={() => onMaterialSelect(item)}>Usar</button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="material-form">
          <h3>{editing ? 'Editar' : 'Nuevo'} {activeTab === 'material' ? 'material' : 'accesorio'}</h3>
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
                  Dimensiones
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
                  Tipo (visagra/corredera/tirador)
                  <input value={form.accesorio_tipo} onChange={handleInputChange('accesorio_tipo')} required />
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
    </div>
  )
}
