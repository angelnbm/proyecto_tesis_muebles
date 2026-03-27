# 🛋️ Proyecto Diseño de Muebles - Guía para Agentes IA

Este documento proporciona una visión general completa del proyecto para que agentes IA puedan navegar y contribuir sin necesidad de revisar todos los archivos.

---

## 📋 Resumen Ejecutivo

**Proyecto**: Sistema web de diseño e visualización 2D de muebles personalizados  
**Stack**: React 19 + Vite (frontend) | Node.js + Express + MongoDB (backend)  
**Propósito**: Permite a usuarios (mueblistas) diseñar muebles modularmente, guardar diseños, y generar listas de cortes de materiales.

---

## 🏗️ Arquitectura General

### Frontend (React + Vite)
- **Ubicación**: `/frontend`
- **Responsabilidades**: 
  - Interfaz interactiva con canvas 2D usando Konva.js
  - Gestión de autenticación (JWT en localStorage)
  - Edición visual de componentes de muebles
  - Generación de "cubicación" (lista de cortes necesarios)

### Backend (Express + MongoDB)
- **Ubicación**: `/backend`
- **Responsabilidades**:
  - API REST para autenticación (register/login/verify)
  - CRUD de diseños de muebles
  - Validación de JWT
  - Persistencia en MongoDB (Furniture y User models)

### Comunicación
- **URL API**: `http://localhost:5000/api` (por defecto)
- **Autenticación**: Bearer tokens (JWT, 7 días de expiración)
- **CORS**: Habilitado

---

## 📁 Estructura de Archivos Clave

```
proyecto_tesis_muebles/
├── frontend/
│   ├── src/
│   │   ├── App.jsx                    # Componente raíz, lógica principal
│   │   ├── App.css                    # Estilos globales
│   │   ├── main.jsx                   # Punto de entrada
│   │   ├── components/
│   │   │   ├── KonvaStage.jsx        # Canvas 2D (Konva) - CRÍTICO
│   │   │   ├── Toolbar.jsx            # Selector de módulos
│   │   │   ├── Sidebar.jsx            # Panel derecho
│   │   │   └── Login.jsx              # Formulario de auth
│   │   └── services/
│   │       ├── api.js                 # Llamadas CRUD a muebles
│   │       └── auth.js                # Token management
│   ├── package.json                   # Deps: React, Konva, React-Konva, Vite
│   └── vite.config.js                 # Config Vite
│
├── backend/
│   ├── server.js                      # Punto de entrada
│   ├── routes/
│   │   ├── authRoutes.js              # POST /register, /login, GET /verify
│   │   └── furnitureRoutes.js         # CRUD /furniture
│   ├── models/
│   │   ├── Furniture.js               # Schema: userId, nombre, shapes[]
│   │   ├── mueblista.js               # Schema: nombre, email, contrasena
│   │   ├── cotizacion.js              # (no se usa actualmente)
│   │   └── material.js                # (no se usa actualmente)
│   ├── middleware/
│   │   └── auth.js                    # Middleware JWT (posible)
│   ├── package.json                   # Deps: Express, Mongoose, JWT, bcrypt
│   └── .env                           # MONGODB_URI, JWT_SECRET, PORT
│
├── public/                            # Assets estáticos
├── .env                               # Variables globales
├── .gitignore
├── docker-compose.yml                 # (si usas Docker)
├── Makefile                           # Scripts útiles
├── agent.md                           # ← ESTE ARCHIVO
└── README.md                          # (minimalista, debe expandirse)
```

---

## 🎨 Conceptos Clave del Dominio

### Tipos de Módulos (Shapes)
El sistema soporta 7 tipos de componentes de muebles:

| Tipo | Propiedades | Descripción |
|------|-------------|-------------|
| **estante** | width, height, depth | Repisa simple horizontal |
| **cajonera** | width, height, depth, **numCajones** | Mueble con gavetas (default 3) |
| **modular** | width, height, depth, **numEstantes, numDivisores, numPuertas** | Módulo configurable |
| **base** | width, height, depth | Pie/base del mueble |
| **divisor** | width, height, depth | Separador interno vertical |
| **cubierta** | width, height, depth | Tapa superior |
| **puerta** | width, height, depth | Puerta independiente |

### Shape (Objeto en Canvas)
```javascript
{
  id: Number,              // Timestamp (Date.now()) - único
  type: String,            // Uno de los 7 tipos arriba
  x: Number, y: Number,    // Posición en canvas (píxeles)
  width, height, depth: Number,  // Dimensiones
  rotation: Number,        // Ángulo (0-360)
  numCajones?: Number | null,     // Solo cajonera
  numEstantes?: Number | null,    // Solo modular
  numDivisores?: Number | null,   // Solo modular
  numPuertas?: Number | null      // Solo modular
}
```

### Cubicación (Lista de Cortes)
La función `computeAllCuts(shapes)` en `App.jsx` convierte shapes en instrucciones de corte:
- Ejemplo para cajonera: `"- cajonera (3 cajones) | Frente: 100x30 CM (x3)"`
- Se usa para que mueblista sepa qué materiales cortar

---

## 🔐 Flujo de Autenticación

```
1. Usuario hace register/login en Login.jsx
   ↓
2. Backend (authRoutes.js) valida credenciales y retorna JWT
   ↓
3. Frontend guarda token en localStorage (services/auth.js)
   ↓
4. En cada solicitud API, se adjunta: Authorization: Bearer <token>
   ↓
5. Al recargar, App.jsx verifica token sin necesidad de login nuevamente
   ↓
6. Si token expira (7 días), debe hacer login de nuevo
```

**Endpoint verify**: `GET /api/auth/verify` - Backend decodifica JWT y retorna usuario

---

## 🎯 Flujo de Diseño (Caso de Uso Principal)

```
1. Usuario autenticado ve App.jsx con toolbar a la izquierda
   ↓
2. Selecciona módulo (ej: "cajonera") → setSelectedModule()
   ↓
3. Mueve mouse sobre canvas → KonvaStage muestra "ghost shape" (preview)
   ↓
4. Click en canvas → crea shape nuevo con ID único (Date.now())
   ↓
5. Shape aparece en "shapes" array (estado React)
   ↓
6. Click en shape → se selecciona (setSelectedId) y panel derecho permite editar:
   - width, height, depth
   - Si es cajonera: numCajones
   - Si es modular: numEstantes, numDivisores, numPuertas
   ↓
7. Click "Guardar" → saveFurniture() o updateFurniture() a backend
   ↓
8. Diseño guardado aparece en "Diseños recientes" del sidebar
```

---

## 🔧 Stack y Dependencias

### Frontend
```json
{
  "dependencies": {
    "react": "19.2.x",
    "react-dom": "19.2.x",
    "konva": "10.2.x",          // Canvas library
    "react-konva": "19.2.x"     // React wrapper for Konva
  },
  "devDependencies": {
    "vite": "7.1.x",
    "eslint": "9.38.x",
    "vitejs/plugin-react": "5.1.x"
  }
}
```

### Backend
```json
{
  "dependencies": {
    "express": "5.1.x",
    "mongoose": "8.19.x",       // MongoDB ORM
    "jsonwebtoken": "9.0.x",    // JWT auth
    "bcryptjs": "3.0.x",        // Password hashing
    "cors": "2.8.x",
    "dotenv": "17.2.x"
  },
  "devDependencies": {
    "nodemon": "3.1.x"          // Auto-reload dev
  }
}
```

---

## 🌍 Endpoints de API

### Autenticación (`/api/auth`)
```
POST /register
  Request: { nombre, email, contrasena }
  Response: { message, token, user }

POST /login
  Request: { email, contrasena }
  Response: { message, token, user }

GET /verify
  Headers: Authorization: Bearer <token>
  Response: { user }
```

### Muebles (`/api/furniture`)
```
GET /
  Headers: Authorization: Bearer <token>
  Response: [ { _id, userId, nombre, shapes, createdAt, updatedAt } ]

POST /
  Headers: Authorization: Bearer <token>
  Body: { nombre, shapes }
  Response: { _id, userId, nombre, shapes, createdAt, updatedAt }

PUT /:id
  Headers: Authorization: Bearer <token>
  Body: { nombre, shapes }
  Response: { _id, userId, nombre, shapes, createdAt, updatedAt }

DELETE /:id
  Headers: Authorization: Bearer <token>
  Response: { message }
```

---

## 📱 Responsive Design

**Breakpoint**: 600px width
- **Mobile** (≤600px): Tabs, bottom panels, diseño comprimido
- **Desktop** (>600px): Sidebar izq + canvas central + sidebar derecho

Estados se controlan con `isMobile` en App.jsx

---

## 🐛 Estado Actual del Proyecto

### ✅ Código Limpio (Actualizado)
- **ESLint**: 0 errores (se resolvieron todos 10)
  - Scope en switch statements (cajonera, modular)
  - Funciones sin usar removidas (isInside, findContainingModular)
  - Props sin usar removidos (deleteShape)
  - Funciones duplicadas removidas (handleLogin)

### ⚠️ Dependencias Desactualizadas (TODAVÍA)
**Frontend** (13 minor/major):
- React: 19.2.0 → 19.2.4
- Vite: 7.1.12 → 8.0.2 (major)
- ESLint: 9.38.0 → 10.1.0 (major)
- Konva: 10.0.8 → 10.2.3
- @vitejs/plugin-react: 5.1.0 → 6.0.1 (major)

**Backend** (7 minor):
- Express: 5.1.0 → 5.2.1
- Mongoose: 8.19.2 → 9.3.1 (major)
- bcryptjs, cors, dotenv, jsonwebtoken, nodemon: minor updates

### 📝 Deuda Técnica
- README.md es un template genérico (debe documentar proyecto específico)
- TypeScript no está configurado (proyecto en JSX/CommonJS)
- Tests no existen (sin cobertura)
- Validación de input minimalista
- Manejo de errores puede mejorar
- Collision detection en KonvaStage es complejo y podría refactorizarse

---

## 💡 Convenciones de Código

### Nombres de Variables
- **Shapes**: Array principal de componentes de muebles
- **SelectedId**: ID (timestamp) del shape actualmente seleccionado
- **SelectedModule**: Tipo de módulo a insertar (null si no hay selección)
- **CurrentDesignId**: ID del diseño cargado actualmente

### Estado React (App.jsx)
```javascript
const [user, setUser]                    // Usuario autenticado
const [loading, setLoading]              // Estado de carga al verificar token
const [shapes, setShapes]                // Array de shapes en canvas
const [selectedId, setSelectedId]        // Shape seleccionado
const [selectedModule, setSelectedModule]// Módulo a insertar
const [designs, setDesigns]              // Diseños guardados
const [activeTab, setActiveTab]          // 'diseno' | 'cubicacion'
const [isMobile, setIsMobile]            // Responsive flag
const [currentDesignId, setCurrentDesignId] // Design ID cargado
```

### Funciones Utilities
- `computeAllCuts(shapes)`: Convierte shapes a lista de cortes legible (App.jsx línea 11-70)
- `checkCollision(rect1, rect2)`: Detección AABB simple (KonvaStage.jsx línea 30-37)
- `handleInternosCollision()`: Colisiones para elementos internos
- `handlePrincipalesCollision()`: Colisiones para módulos principales
- `handleHorizontalesCollision()`: Colisiones para base/cubierta

### Estilo de Código
- Variables lowerCamelCase
- Funciones PascalCase (React components)
- Comentarios en español (codebase es hispanohablante)
- Console.logs con emojis para debugging (✅ 🔐 ❌ ℹ️ 📝 💾)

---

## 🔄 Procedimiento de Desarrollo

### Setup Local
```bash
# Backend
cd backend
npm install
# Crear .env con: MONGODB_URI, JWT_SECRET, PORT
npm run dev           # Inicia con nodemon

# Frontend
cd frontend
npm install
npm run dev           # Inicia Vite (http://localhost:5173)
```

### Scripts Disponibles
```bash
# Frontend
npm run dev           # Dev server con HMR
npm run build         # Build para producción
npm run lint          # ESLint check (ahora 0 errores ✅)
npm run preview       # Preview de build

# Backend
npm run dev           # Inicia con nodemon
npm start             # Inicia sin nodemon
```

### Git Workflow
- Branch principal: `main`
- Commits siguen conventional commits (feat:, fix:, docs:, etc.)
- NO hay CI/CD configurado actualmente
- Ultimo commit: `f1de85a fix: resolve all 10 ESLint errors`

---

## 🚨 Notas Importantes para IA

1. **Konva Stage es CRÍTICO**: Es el canvas 2D y tiene lógica compleja de colisiones. Cambios aquí afectan UX fuertemente.

2. **Shape ID es timestamp**: `Date.now()` se usa como ID único. Funciona pero idealmente debería ser UUID.

3. **JWT sin refresh**: Tokens duran 7 días. No hay mecanismo de refresh.

4. **localStorage en Frontend**: Token se guarda en localStorage (no ideal para seguridad, pero funcional para prototipo).

5. **Mongoose sin validación custom**: Los modelos no tienen validaciones strict. Deberían agregarse.

6. **Responsive no testado en todos los dispositivos**: `isMobile` es un simple breakpoint.

7. **Cubicación es hardcoded**: La lógica de cortes está dentro de `computeAllCuts()`. Si cambias tipos de módulos, debe actualizarse.

8. **MongoDB connection con retry**: Backend intenta 3 veces antes de fallback a localhost. Útil para desarrollo.

9. **ESLint está limpio**: Todos los 10 errores fueron solucionados (f1de85a commit).

---

## 📚 Recursos Principales

- **Konva Docs**: https://konvajs.org/docs/
- **React 19**: https://react.dev/
- **MongoDB Mongoose**: https://mongoosejs.com/
- **JWT**: https://jwt.io/

---

## ✅ Checklist para Nuevas Features

Cuando agregues una feature:
- [ ] Agregar shape type en `defaultSizes` si es nuevo módulo
- [ ] Actualizar `computeAllCuts()` si cambia lógica de cortes
- [ ] Actualizar Furniture schema si hay nuevas propiedades
- [ ] Agregar validación en backend
- [ ] Agregar UI en mobile Y desktop
- [ ] Ejecutar `npm run lint` y fijar errores (debe pasar limpio)
- [ ] Testar collision detection si afecta KonvaStage
- [ ] Probar en mobile (<= 600px)
- [ ] Actualizar este documento

---

## 🎓 Próximos Pasos Recomendados (Priority Order)

1. ✅ **Fijar errores ESLint** - DONE ✔
2. **Actualizar dependencias** - 1 hora (test después)
3. **Agregar TypeScript** - 4 horas
4. **Crear suite de tests** - 8 horas
5. **Mejorar validación backend** - 2 horas
6. **Refactorizar KonvaStage** - 6 horas (dividir en sub-componentes)
7. **Agregar logging centralizado** - 1 hora
8. **Documentar endpoints en Swagger** - 2 horas

---

**Última actualización**: Marzo 2026  
**Versión del documento**: 2.0  
**Estado**: ESLint limpio ✅
