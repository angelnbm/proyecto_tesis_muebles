# Guía de Screenshots — Apartado de Implementación

## Auth

| Archivo | Líneas | Qué capturar | Por qué |
|---|---|---|---|
| `backend/middleware/auth.js` | completo (28 líneas) | verificación JWT | muestra middleware de autenticación |
| `backend/routes/authRoutes.js` | 1–60 | registro con bcrypt + generación token | flujo de registro server-side |
| `frontend/src/services/auth.js` | completo (82 líneas) | gestión localStorage + llamadas API | capa de auth en el cliente |

---

## Canvas 2D — Konva.js

| Archivo | Líneas | Qué capturar | Por qué |
|---|---|---|---|
| `frontend/src/components/KonvaStage.jsx` | 1–80 | setup del Stage y grid | configuración inicial del canvas |
| `frontend/src/components/KonvaStage.jsx` | sección snap magnético | algoritmo de alineación automática | lógica de snap 8px/30px |
| `frontend/src/components/KonvaStage.jsx` | sección colisión AABB | evitar solapamiento de módulos | detección de colisiones |

---

## Cubicación — Algoritmo Guillotine

| Archivo | Líneas | Qué capturar | Por qué |
|---|---|---|---|
| `frontend/src/services/cubicacion.js` | función `generateStructuredCuts()` | generación de piezas por módulo | entrada del algoritmo |
| `frontend/src/services/cubicacion.js` | 401–443 | `optimizePiecesInBoards()` — orquestador | selección de mejor estrategia de orden |
| `frontend/src/services/cubicacion.js` | 477–500 | `runPacking()` | loop principal de empaque en planchas |
| `frontend/src/services/cubicacion.js` | 509–558 | `tryPlacePieceInBoard()` | algoritmo MAXRECTS + BSSF |
| `frontend/src/services/cubicacion.js` | 454–475 | `tryCompact()` | fase de compactación recursiva |
| `frontend/src/services/boardUtils.js` | completo (47 líneas) | configuración de planchas | parámetros de melamina (250×183cm, kerf 0.3cm) |

### Detalle de `optimizePiecesInBoards` (líneas 401–443)

```
401  export function optimizePiecesInBoards(pieces, boardConfig = BOARD_CONFIGS.melamina) {
         // Expandir piezas por cantidad
402–412  → expande cada pieza según su quantity en un array plano con sequenceId único

         // 10 estrategias de orden probadas (desc área, asc área, max lado, min lado, etc.)
415–426  → sortStrategies: array de 10 funciones comparadoras

         // Ejecuta runPacking con cada estrategia, se queda con la que use menos planchas
429–435  → loop: bestBoards = mínimo de boards.length entre todas las estrategias

         // Compactación: intenta eliminar el último tablero moviendo sus piezas a los anteriores
439      → tryCompact(bestBoards, boardConfig)  ← recursivo

441–442  → retorna { boards, statistics }
```

### Detalle de `tryPlacePieceInBoard` — MAXRECTS + BSSF (líneas 509–558)

```
510–513  → evalúa 2 orientaciones: normal y rotada 90°

515–536  → BSSF (Best Short Side Fit):
           para cada orientación × cada rectángulo libre:
             shortFit = min(rect.width - rw, rect.height - rh)
             score    = shortFit × 1e6 + área_sobrante   ← prioriza ajuste en lado corto

538      → si no hay rectángulo válido: return false

547      → coloca la pieza: agrega a board.pieces con coordenadas (px, py)
548      → acumula área usada

551–555  → recorta TODOS los rectángulos libres solapados con la pieza colocada
           (splitRectByPlacedPiece → mergeAndCleanRectangles)
```

---

## Cotizaciones y PDF

| Archivo | Líneas | Qué capturar | Por qué |
|---|---|---|---|
| `backend/routes/cotizacionRoutes.js` | POST `/` (creación) | lógica de cálculo server-side | calcula precio_total y lista_cortes |
| `frontend/src/services/pdfCotizacion.js` | sección header + tabla de piezas | generación dinámica con jsPDF | estructura del PDF |

---

## Biblioteca de Materiales

| Archivo | Líneas | Qué capturar | Por qué |
|---|---|---|---|
| `backend/models/material.js` | completo (17 líneas) | esquema Mongoose | define categorías y campos del material |
| `backend/routes/materialRoutes.js` | POST + PUT | CRUD con validación de categorías | validación de accesorio_tipo, precio, etc. |

---

## Estadísticas

| Archivo | Líneas | Qué capturar | Por qué |
|---|---|---|---|
| `frontend/src/components/StatsPanel.jsx` | completo (245 líneas) | KPIs + gráficos de barras | módulo más corto, ideal para captura completa |

---

## Seguridad y Configuración General

| Archivo | Líneas | Qué capturar | Por qué |
|---|---|---|---|
| `backend/app.js` | completo (129 líneas) | CORS, Helmet, rate limiting, rutas | configuración central del servidor |
| `backend/middleware/rateLimit.js` | completo (59 líneas) | limitadores por endpoint | globalLimiter, authLimiter, furnitureLimiter |
