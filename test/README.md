# Carpeta de Pruebas — Amedida

Estructura de pruebas del proyecto de tesis, organizada en dos subcarpetas según la metodología PXP utilizada.

## Estructura

```
test/
├── caja-negra/          # Especificaciones de pruebas de caja negra por HU
│   ├── PCN-HU01-autenticacion.md
│   ├── PCN-HU02-HU06-canvas-diseno.md
│   ├── PCN-HU07-HU08-cubicacion.md
│   ├── PCN-HU09-HU12-cotizaciones.md
│   ├── PCN-HU14-HU15-materiales.md
│   └── PCN-HU16-HU17-estadisticas.md
└── unitarios/           # Pruebas unitarias ejecutables con Jest
    ├── package.json
    ├── cubicacion.test.js     # Algoritmo de generación de piezas y bin packing
    └── validaciones.test.js   # Funciones de validación de todos los endpoints
```

## Pruebas de Caja Negra (`caja-negra/`)

Especificaciones de pruebas funcionales basadas en las historias de usuario del proyecto. Cada archivo contiene una tabla con:

| Campo           | Descripción                                      |
|-----------------|--------------------------------------------------|
| **ID**          | Identificador único (PCN-XX)                     |
| **Descripción** | Qué se está probando                             |
| **Entrada**     | Datos de entrada o acción del usuario            |
| **Salida esperada** | Comportamiento esperado del sistema          |
| **Resultado**   | ✅ Pasa / ❌ Falla / ⏸ Pendiente (completar al ejecutar) |

### Cobertura por HU

| Archivo                          | HU cubiertas            | Tests |
|----------------------------------|-------------------------|-------|
| PCN-HU01-autenticacion.md        | HU01                    | 11    |
| PCN-HU02-HU06-canvas-diseno.md   | HU02, HU03, HU04, HU05, HU06 | 23 |
| PCN-HU07-HU08-cubicacion.md      | HU07, HU08              | 14    |
| PCN-HU09-HU12-cotizaciones.md    | HU09, HU10, HU11, HU12 | 20    |
| PCN-HU14-HU15-materiales.md      | HU14, HU15              | 21    |
| PCN-HU16-HU17-estadisticas.md    | HU16, HU17              | 13    |
| **Total**                        |                         | **102** |

## Pruebas Unitarias (`unitarios/`)

Pruebas de código automatizadas que se ejecutan con Jest. Cubren las funciones puras y lógica de validación del sistema.

### Ejecutar las pruebas

```bash
cd test/unitarios
npm install      # solo la primera vez
npm test         # ejecuta todos los tests
```

### Archivos de test

| Archivo                   | Descripción                                        | Tests |
|---------------------------|----------------------------------------------------|-------|
| `cubicacion.test.js`      | Algoritmo de generación de piezas por módulo y cálculo de planchas | 22 |
| `validaciones.test.js`    | Funciones de validación de auth, diseños, materiales, cotizaciones y PDF | 49 |
| **Total**                 |                                                    | **71** |

### Resultado esperado

```
Test Suites: 2 passed, 2 total
Tests:       71 passed, 71 total
```
