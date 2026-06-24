# Flujos para Diagramas de Secuencia — Proyecto Tablón

---

## Iteración 1 — HU01: Login / Registro

**Actores:** Mueblista · Frontend · API · MongoDB

**Flujo Login:**
1. Mueblista ingresa email + contraseña → Frontend
2. Frontend → `POST /auth/login`
3. API busca usuario por email → MongoDB
4. MongoDB retorna documento usuario → API
5. API verifica contraseña con bcrypt
6. API retorna JWT → Frontend
7. Frontend guarda token en localStorage → redirige al canvas

**Flujo Registro:**
1. Mueblista ingresa nombre, email, contraseña → Frontend
2. Frontend valida formato (email, largo contraseña ≥6)
3. Frontend → `POST /auth/register`
4. API verifica email único → MongoDB
5. API hashea contraseña con bcrypt → guarda usuario → MongoDB
6. API retorna JWT → Frontend → redirige

---

## Iteración 2 — HU02/03/04/05/06: Canvas 2D

**Actores:** Mueblista · Frontend (KonvaStage) · API · MongoDB

**Flujo agregar y mover módulo (HU02, HU04, HU06):**
1. Mueblista selecciona tipo de módulo en Toolbar
2. Frontend crea shape con dimensiones por defecto
3. Mueblista arrastra módulo → KonvaStage detecta drag
4. KonvaStage verifica colisión AABB con otros shapes
5. KonvaStage aplica snap magnético (8px)
6. Frontend actualiza posición en estado

**Flujo editar medidas (HU05):**
1. Mueblista modifica ancho/alto en el panel lateral
2. Frontend actualiza shape en estado → re-renderiza canvas

**Flujo guardar / cargar diseño (HU03):**
1. Mueblista hace clic en "Guardar"
2. Frontend → `POST /api/furniture` con `{ nombre, shapes[] }`
3. API valida nombre + shapes → guarda → MongoDB
4. MongoDB retorna documento creado → API → Frontend
5. Mueblista selecciona diseño del dropdown
6. Frontend → `GET /api/furniture/:id`
7. API → MongoDB → retorna shapes → Frontend renderiza en canvas

---

## Iteración 3 — HU07/08: Cubicación

**Actores:** Mueblista · Frontend (CubicacionPanel) · cubicacion.js

*(Todo ocurre en el cliente, sin llamadas al backend)*

1. Mueblista abre panel de cubicación
2. CubicacionPanel lee shapes del estado del canvas
3. `generateStructuredCuts()` genera lista de piezas por módulo (frentes, laterales, estantes, etc.)
4. `optimizePiecesInBoards()` ejecuta MAXRECTS + BSSF: prueba 10 estrategias de orden, elige la que usa menos planchas, aplica compactación
5. Se calculan metros lineales de tapa-canto y cubiertas
6. Frontend muestra listado de piezas (HU08) + cantidad de planchas + resumen de materiales

---

## Iteración 4 — HU09/10/12: Cotizaciones y PDF

**Actores:** Mueblista · Frontend · API · MongoDB · jsPDF

**Flujo guardar cotización (HU09):**
1. Mueblista selecciona material y hace clic en "Guardar cotización"
2. Frontend → `POST /api/cotizaciones` con `{ mueble_id, precio_total, lista_cortes[], materiales_resumen[] }`
3. API valida payload → guarda → MongoDB
4. MongoDB retorna cotización con `_id` → API → Frontend
5. Frontend muestra previsualización (HU10)

**Flujo exportar PDF (HU12):**
1. Mueblista hace clic en "Exportar PDF"
2. `pdfCotizacion.js` construye documento: header con datos mueblista, tabla de piezas, tabla de materiales, total CLP
3. jsPDF genera blob → descarga automática en el browser

---

## Iteración 5 — HU14/15: Biblioteca de Materiales

**Actores:** Mueblista · Frontend (MaterialLibrary) · API · MongoDB

**Flujo crear material (HU15):**
1. Mueblista llena formulario (nombre, categoría, precio, dimensiones) → clic "Guardar"
2. Frontend valida categoría, precio ≥ 0, accesorio_tipo si aplica
3. Frontend → `POST /api/materials`
4. API valida payload → guarda → MongoDB
5. MongoDB retorna material creado → API → Frontend actualiza lista

**Flujo editar / eliminar:** mismo camino con `PUT /api/materials/:id` y `DELETE /api/materials/:id`

---

## Iteración 6 — HU16/17: Estadísticas

**Actores:** Mueblista · Frontend (StatsPanel) · API · MongoDB

1. Mueblista abre panel de estadísticas
2. Frontend → `GET /api/cotizaciones`
3. API → MongoDB retorna todas las cotizaciones del usuario → Frontend
4. StatsPanel calcula KPIs: total cotizaciones, ingresos, módulos por tipo, costos por material
5. Frontend renderiza gráficos de barras
6. Mueblista selecciona filtro por periodo (HU17)
7. Frontend filtra el array localmente → re-renderiza gráficos

---

## Iteración 7 — HU13: Envío por correo

**Actores:** Mueblista · Frontend · EmailJS API · Destinatario

1. Mueblista ingresa email del destinatario → clic "Enviar"
2. Frontend construye payload con datos de la cotización
3. Frontend → `EmailJS.send()` → EmailJS API
4. EmailJS API envía correo al destinatario
5. EmailJS API retorna confirmación → Frontend muestra mensaje de éxito

---

## Iteración 8 — HU03 ext.: Biblioteca de muebles

**Actores:** Mueblista · Frontend · API · MongoDB

1. Mueblista abre panel de biblioteca de muebles
2. Frontend → `GET /api/furniture` lista todos los diseños del usuario
3. MongoDB retorna array de diseños → Frontend muestra tarjetas/lista
4. Mueblista selecciona un diseño → Frontend → `GET /api/furniture/:id`
5. Frontend carga shapes en el canvas
6. Mueblista elimina un diseño → Frontend → `DELETE /api/furniture/:id`
7. API elimina documento → MongoDB → Frontend actualiza lista
