import React from 'react'
import { useState } from 'react'
import './App.css'
import Toolbar from './components/Toolbar.jsx'
import KonvaStage from './components/KonvaStage.jsx'

export default function App() {
  const [selectedModule, setSelectedModule] = useState(null)
  const [shapes, setShapes] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [activeTab, setActiveTab] = useState('diseno')

  const selected = shapes.find(s => s.id === selectedId) || null

  const updateSelectedShape = (key, value) => {
    if (!selected) return
    setShapes(prev => prev.map(s => 
      s.id === selected.id ? { ...s, [key]: Number(value) } : s
    ))
  }

  return (
    <div className="app-root">
      <aside className="left-toolbar">
        <Toolbar selectedModule={selectedModule} onSelect={setSelectedModule} />
      </aside>

      <main className="canvas-area">
        <div className="canvas-tabs">
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
        </div>

        <div className="konva-wrapper">
          <KonvaStage
            width={700}
            height={480}
            shapes={shapes}
            setShapes={setShapes}
            selectedModule={selectedModule}
            setSelectedModule={setSelectedModule}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
          />
        </div>
      </main>

      <aside className="right-sidebar">
        <div className="measure-panel">
          <h3>Medidas:</h3>
          
          <div className="measure-item">
            <label>
              <span>Alto</span>
            </label>
            <div className="measure-value">
              <input
                type="number"
                value={selected ? selected.height : ''}
                onChange={e => updateSelectedShape('height', e.target.value)}
                placeholder="0"
                disabled={!selected}
              />
              <span>CM</span>
            </div>
          </div>

          <div className="measure-item">
            <label>
              <span>Ancho</span>
            </label>
            <div className="measure-value">
              <input
                type="number"
                value={selected ? selected.width : ''}
                onChange={e => updateSelectedShape('width', e.target.value)}
                placeholder="0"
                disabled={!selected}
              />
              <span>CM</span>
            </div>
          </div>

          <div className="measure-item">
            <label>
              <span>Profundidad</span>
            </label>
            <div className="measure-value">
              <input
                type="number"
                value={selected ? selected.depth : ''}
                onChange={e => updateSelectedShape('depth', e.target.value)}
                placeholder="0"
                disabled={!selected}
              />
              <span>CM</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}
