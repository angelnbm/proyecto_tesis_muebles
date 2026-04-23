# Deployment local y Vercel

## Estructura de ejecucion

- `backend/app.js`: configura Express, middlewares, rutas y manejo de errores (sin `listen`).
- `backend/server.js`: solo uso local, conecta MongoDB y levanta el servidor en `PORT`.
- `api/[...all].js`: entrypoint serverless para Vercel; reutiliza `backend/app.js`.

## Variables de entorno

Copiar `.env.example` a `.env` y completar valores reales.

Minimas requeridas:

- `MONGODB_URI`
- `JWT_SECRET`
- `CORS_ORIGIN`
- `NODE_ENV`
- `PORT` (local)
- `VITE_API_URL` (opcional, por defecto `/api`)

## Correr local (sin build)

1. Backend:

```bash
cd backend
npm install
npm run dev
```

2. Frontend:

```bash
cd frontend
npm install
npm run dev
```

Notas:

- Vite proxy redirige `/api` a `http://localhost:5000`.
- En `NODE_ENV=development` se permite `http://localhost:5173` por CORS.

## Deploy en Vercel

1. Importar repo en Vercel.
2. Configurar variables de entorno en proyecto Vercel:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `CORS_ORIGIN` (ejemplo: `https://tu-app.vercel.app`)
   - `NODE_ENV=production`
   - `VITE_API_URL=/api` (recomendado)
3. Deploy.

`vercel.json` ya esta preparado para:

- servir frontend desde `frontend/dist`.
- enrutar `/api/*` al handler `api/[...all].js`.

## Rutas API esperadas

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/verify`
- `GET|POST|PUT|DELETE /api/furniture`

## Checks rapidos recomendados (sin build)

```bash
node --check backend/app.js
node --check backend/server.js
node --check api/[...all].js
```
