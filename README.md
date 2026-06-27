# Tablón — Aplicación web para diseño y cotización de muebles a medida

Tablón es una aplicación web MERN que permite a mueblistas diseñar muebles modulares en un canvas 2D, calcular automáticamente el material necesario (cubicación), generar cotizaciones en PDF y enviarlas por correo, gestionar una biblioteca de materiales y consultar estadísticas de su actividad.

---

## Stack tecnológico

| Capa       | Tecnología                                      |
|------------|-------------------------------------------------|
| Frontend   | React 19, Vite, Konva.js, jsPDF, EmailJS        |
| Backend    | Node.js, Express 5, Mongoose, JWT, bcryptjs     |
| Base de datos | MongoDB 7                                    |
| Infraestructura | Docker, Docker Compose                     |

---

## Módulos

| Módulo            | Descripción                                                                                  |
|-------------------|----------------------------------------------------------------------------------------------|
| Auth              | Registro e inicio de sesión con JWT. Rutas protegidas, rate limiting y sanitización de inputs |
| Canvas 2D         | Diseñador de muebles con Konva.js. Módulos: cajonera, modular, estante, base, divisor, cubierta |
| Cubicación        | Algoritmo Guillotine Rectangle Packing para calcular piezas y planchas necesarias             |
| Cotizaciones      | Generación de PDF con jsPDF, previsualización, envío por correo con EmailJS                   |
| Biblioteca de materiales | Gestión de materiales, accesorios, tapa-cantos y cubiertas. Vinculados al cálculo de costos |
| Estadísticas      | KPIs y gráficos de barras filtrables por año (diseños, cotizaciones, módulos)                 |
| Notificaciones    | Envío de cotizaciones por correo a través de la API de EmailJS                                |

---

## Estructura del proyecto

```
proyecto_tesis_muebles/
├── backend/                  # API REST (Node.js + Express)
│   ├── models/               # Esquemas Mongoose (mueblista, mueble, material, cotización)
│   ├── routes/               # authRoutes, furnitureRoutes, materialRoutes,
│   │                         # drawerTypeRoutes, cotizacionRoutes
│   ├── middleware/           # rateLimit, validation, auth
│   ├── app.js                # Configuración Express (CORS, Helmet, rutas)
│   └── server.js             # Punto de entrada
│
├── frontend/                 # SPA React + Vite
│   └── src/
│       ├── components/       # App.jsx, KonvaStage, CubicacionPanel, MaterialLibrary,
│       │                     # StatsPanel, MisCotizacionesPanel, Login, LandingPage, Dialog
│       └── services/         # api.js, auth.js, cubicacion.js, cotizaciones.js,
│                             # pdfCotizacion.js, materials.js, boardUtils.js, drawerTypes.js
│
├── test/
│   ├── unitarios/            # Jest — lógica pura (cubicación y validaciones)
│   └── caja-negra/           # Tablas PCN por historia de usuario (Markdown)
│
├── formulacion/              # Documento de tesis (LaTeX)
├── docker-compose.yml
├── .env.example
└── .env.production.example
```

---

## Variables de entorno

Copia `.env.example` a `.env` en la raíz y completa los valores:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/furniture_db
JWT_SECRET=reemplazar-con-secreto-fuerte
CORS_ORIGIN=http://localhost:5173

# Frontend (prefijo VITE_ — expuestos al cliente)
VITE_API_URL=/api
VITE_EMAILJS_SERVICE_ID=tu_service_id
VITE_EMAILJS_TEMPLATE_ID=tu_template_id
VITE_EMAILJS_PUBLIC_KEY=tu_public_key
```

---

## Ejecución local

### Requisitos previos

- Node.js ≥ 18
- MongoDB corriendo localmente en el puerto 27017 (o usar Docker)

### Backend

```bash
cd backend
npm install
npm run dev        # nodemon, recarga automática en :5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev        # Vite dev server en :5173
```

---

## Ejecución con Docker

```bash
# Levanta MongoDB + backend + frontend
docker-compose up --build

# Solo la base de datos (útil para desarrollo local sin contenedores)
docker-compose up mongodb
```

El frontend queda disponible en `http://localhost:80` y el backend en `http://localhost:5000`.

---

## Pruebas

### Unitarias (Jest)

Cubren la lógica pura de cubicación (generación de piezas, bin packing) y las funciones de validación de los endpoints.

```bash
cd test/unitarios
npm install
npm test                # ejecución única con reporte en consola
npm run test:watch      # modo watch
npm run test:report     # genera test/unitarios/reporte/resultados.html
```

### Caja negra (manuales)

Tablas de casos de prueba por historia de usuario en `test/caja-negra/`:

| Archivo                              | Casos   | Módulo                         |
|--------------------------------------|---------|-------------------------------|
| PCN-HU01-autenticacion.md            | PCN-01 a PCN-11  | Login / Registro       |
| PCN-HU02-HU06-canvas-diseno.md       | PCN-12 a PCN-...| Canvas 2D               |
| PCN-HU07-HU08-cubicacion.md          | —       | Cubicación                     |
| PCN-HU09-HU12-cotizaciones.md        | —       | Cotizaciones                   |
| PCN-HU14-HU15-materiales.md          | —       | Biblioteca de materiales       |
| PCN-HU16-HU17-estadisticas.md        | PCN-90 a PCN-102 | Estadísticas           |
| PCN-IT8-integracion.md               | PCN-103 a PCN-110 | Integración / navegación |

---

## API — Endpoints principales

| Método | Ruta                        | Descripción                            |
|--------|-----------------------------|----------------------------------------|
| POST   | `/api/auth/register`        | Registro de nuevo mueblista            |
| POST   | `/api/auth/login`           | Login, retorna JWT                     |
| GET    | `/api/auth/verify`          | Verificar token activo                 |
| GET    | `/api/furniture`            | Listar diseños del usuario autenticado |
| POST   | `/api/furniture`            | Guardar nuevo diseño                   |
| PUT    | `/api/furniture/:id`        | Actualizar diseño existente            |
| DELETE | `/api/furniture/:id`        | Eliminar diseño                        |
| GET    | `/api/materials`            | Listar materiales (filtro por categoría) |
| POST   | `/api/materials`            | Crear material                         |
| PUT    | `/api/materials/:id`        | Editar material                        |
| DELETE | `/api/materials/:id`        | Eliminar material                      |
| GET    | `/api/drawer-types`         | Listar tipos de cajón                  |
| GET    | `/api/cotizaciones`         | Listar cotizaciones del usuario        |
| POST   | `/api/cotizaciones`         | Crear cotización                       |
| PUT    | `/api/cotizaciones/:id`     | Actualizar estado de cotización        |
| DELETE | `/api/cotizaciones/:id`     | Eliminar cotización                    |
| GET    | `/api/health`               | Estado de la API                       |
