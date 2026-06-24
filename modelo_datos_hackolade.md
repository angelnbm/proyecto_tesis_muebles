# Modelo de Datos — Proyecto Tablón (MongoDB)

## Cómo importar en Hackolade Studio

1. Abrir Hackolade Studio → **New Model** → seleccionar **MongoDB**
2. Por cada colección: clic en **Add collection**, pegar el documento de muestra en
   **Reverse Engineer > JSON document** para inferir el schema
3. Luego definir las relaciones entre colecciones usando **Add relationship**

---

## Colecciones

### 1. `mueblistas`

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `_id` | ObjectId | auto | PK |
| `nombre` | String | sí | |
| `email` | String | sí | único |
| `contrasena` | String | sí | hash bcrypt |
| `createdAt` | Date | auto | timestamps |
| `updatedAt` | Date | auto | timestamps |

```json
{
  "_id": { "$oid": "64a1b2c3d4e5f6a7b8c9d0e1" },
  "nombre": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "contrasena": "$2b$10$hasheado",
  "createdAt": { "$date": "2025-01-10T10:00:00Z" },
  "updatedAt": { "$date": "2025-01-10T10:00:00Z" }
}
```

---

### 2. `furnitures`

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `_id` | ObjectId | auto | PK |
| `userId` | ObjectId | sí | ref → mueblistas |
| `nombre` | String | sí | |
| `shapes` | Array\<Shape\> | | ver subdocumento |
| `createdAt` | Date | auto | |
| `updatedAt` | Date | auto | |

**Subdocumento Shape:**

| Campo | Tipo | Notas |
|---|---|---|
| `id` | Number | identificador local |
| `type` | String | cajonera / modular / estante / base / divisor / cubierta / puerta |
| `x`, `y` | Number | posición en canvas (cm) |
| `width`, `height`, `depth` | Number | dimensiones (cm) |
| `rotation` | Number | grados |
| `numCajones` | Number | null si no aplica |
| `numEstantes` | Number | null si no aplica |
| `numDivisores` | Number | null si no aplica |
| `numPuertas` | Number | null si no aplica |
| `drawerTypeId` | ObjectId | ref → drawertypes |
| `drawers` | Array\<DrawerOverride\> | sobreescritura por cajón |
| `tapaCantoId` | ObjectId | ref → materials |
| `fondoMaterialId` | ObjectId | ref → materials |
| `noFondo` | Boolean | |
| `cubertaMaterialId` | ObjectId | ref → materials |
| `zocaloCaras.frontal` | Boolean | |
| `zocaloCaras.lateral_izq` | Boolean | |
| `zocaloCaras.lateral_der` | Boolean | |
| `zocaloCaras.trasera` | Boolean | |
| `numZocaloDivisiones` | Number | |

**Subdocumento DrawerOverride:**

| Campo | Tipo | Notas |
|---|---|---|
| `index` | Number | índice del cajón |
| `drawerTypeId` | ObjectId | ref → drawertypes |

```json
{
  "_id": { "$oid": "64a1b2c3d4e5f6a7b8c9d0e2" },
  "userId": { "$oid": "64a1b2c3d4e5f6a7b8c9d0e1" },
  "nombre": "Cajonera living",
  "shapes": [
    {
      "id": 1,
      "type": "cajonera",
      "x": 100,
      "y": 100,
      "width": 60,
      "height": 80,
      "depth": 50,
      "rotation": 0,
      "numCajones": 3,
      "numEstantes": null,
      "numDivisores": null,
      "numPuertas": null,
      "drawerTypeId": { "$oid": "64a1b2c3d4e5f6a7b8c9d0e5" },
      "drawers": [
        { "index": 0, "drawerTypeId": { "$oid": "64a1b2c3d4e5f6a7b8c9d0e5" } }
      ],
      "tapaCantoId": { "$oid": "64a1b2c3d4e5f6a7b8c9d0e4" },
      "fondoMaterialId": { "$oid": "64a1b2c3d4e5f6a7b8c9d0e4" },
      "noFondo": false,
      "cubertaMaterialId": null,
      "zocaloCaras": {
        "frontal": true,
        "lateral_izq": true,
        "lateral_der": true,
        "trasera": false
      },
      "numZocaloDivisiones": null
    }
  ],
  "createdAt": { "$date": "2025-01-10T10:00:00Z" },
  "updatedAt": { "$date": "2025-01-10T10:00:00Z" }
}
```

---

### 3. `cotizaciones`

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `_id` | ObjectId | auto | PK |
| `mueblista_id` | ObjectId | sí | ref → mueblistas |
| `mueble_id` | ObjectId | sí | ref → furnitures |
| `nombre_cliente` | String | | default '' |
| `email_cliente` | String | | default '' |
| `estado` | String | | Pendiente / En Proceso / Completado |
| `fecha_inicio` | Date | | default now |
| `fecha_termino` | Date | | |
| `precio_total` | Number | | CLP |
| `lista_cortes` | Array\<Corte\> | | ver subdocumento |
| `materiales_resumen` | Array\<MaterialResumen\> | | ver subdocumento |
| `createdAt` | Date | auto | |
| `updatedAt` | Date | auto | |

**Subdocumento Corte:**

| Campo | Tipo |
|---|---|
| `material` | String |
| `dimension` | String |
| `cantidad` | Number |

**Subdocumento MaterialResumen:**

| Campo | Tipo | Notas |
|---|---|---|
| `material_id` | ObjectId | ref → materials |
| `nombre` | String | |
| `cantidad_planchas` | Number | |
| `subtotal` | Number | CLP |

```json
{
  "_id": { "$oid": "64a1b2c3d4e5f6a7b8c9d0e3" },
  "mueblista_id": { "$oid": "64a1b2c3d4e5f6a7b8c9d0e1" },
  "mueble_id": { "$oid": "64a1b2c3d4e5f6a7b8c9d0e2" },
  "nombre_cliente": "María González",
  "email_cliente": "maria@cliente.com",
  "estado": "Pendiente",
  "fecha_inicio": { "$date": "2025-01-10T10:00:00Z" },
  "fecha_termino": { "$date": "2025-02-10T10:00:00Z" },
  "precio_total": 150000,
  "lista_cortes": [
    { "material": "Melamina Blanca", "dimension": "60x80 cm", "cantidad": 2 },
    { "material": "Melamina Blanca", "dimension": "50x80 cm", "cantidad": 2 }
  ],
  "materiales_resumen": [
    {
      "material_id": { "$oid": "64a1b2c3d4e5f6a7b8c9d0e4" },
      "nombre": "Melamina Blanca",
      "cantidad_planchas": 3,
      "subtotal": 90000
    }
  ],
  "createdAt": { "$date": "2025-01-10T10:00:00Z" },
  "updatedAt": { "$date": "2025-01-10T10:00:00Z" }
}
```

---

### 4. `materials`

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `_id` | ObjectId | auto | PK |
| `userId` | ObjectId | sí | ref → mueblistas |
| `nombre` | String | sí | |
| `categoria` | String | sí | material / accesorio / tapa-canto / cubierta |
| `precio` | Number | sí | min 0, CLP |
| `unidad` | String | | default 'unidad' |
| `dimensiones` | String | | ej: "250x183cm" |
| `grosor` | Number | | mm |
| `tipo` | String | | ej: "Melamina" |
| `color` | String | | |
| `accesorio_tipo` | String | | visagra / corredera / tirador / otro |
| `descripcion` | String | | |
| `createdAt` | Date | auto | |
| `updatedAt` | Date | auto | |

```json
{
  "_id": { "$oid": "64a1b2c3d4e5f6a7b8c9d0e4" },
  "userId": { "$oid": "64a1b2c3d4e5f6a7b8c9d0e1" },
  "nombre": "Melamina Blanca",
  "categoria": "material",
  "precio": 30000,
  "unidad": "plancha",
  "dimensiones": "250x183cm",
  "grosor": 18,
  "tipo": "Melamina",
  "color": "Blanco",
  "accesorio_tipo": null,
  "descripcion": null,
  "createdAt": { "$date": "2025-01-10T10:00:00Z" },
  "updatedAt": { "$date": "2025-01-10T10:00:00Z" }
}
```

---

### 5. `drawertypes`

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `_id` | ObjectId | auto | PK |
| `userId` | ObjectId | sí | ref → mueblistas |
| `nombre` | String | sí | |
| `laterales` | ObjectId | sí | ref → materials |
| `frenteInterno` | ObjectId | sí | ref → materials |
| `trasera` | ObjectId | sí | ref → materials |
| `fondo` | ObjectId | sí | ref → materials |
| `refuerzo` | ObjectId | | ref → materials |
| `hasRefuerzo` | Boolean | | default false |
| `heightDiscountPct` | Number | | descuento % alto, default 0 |
| `lateralDiscount` | Number | | descuento lateral cm, default 5 |
| `separacionFondo` | Number | | cm, default 0 |
| `createdAt` | Date | auto | |
| `updatedAt` | Date | auto | |

```json
{
  "_id": { "$oid": "64a1b2c3d4e5f6a7b8c9d0e5" },
  "userId": { "$oid": "64a1b2c3d4e5f6a7b8c9d0e1" },
  "nombre": "Cajón estándar",
  "laterales": { "$oid": "64a1b2c3d4e5f6a7b8c9d0e4" },
  "frenteInterno": { "$oid": "64a1b2c3d4e5f6a7b8c9d0e4" },
  "trasera": { "$oid": "64a1b2c3d4e5f6a7b8c9d0e4" },
  "fondo": { "$oid": "64a1b2c3d4e5f6a7b8c9d0e4" },
  "refuerzo": null,
  "hasRefuerzo": false,
  "heightDiscountPct": 5,
  "lateralDiscount": 5,
  "separacionFondo": 0,
  "createdAt": { "$date": "2025-01-10T10:00:00Z" },
  "updatedAt": { "$date": "2025-01-10T10:00:00Z" }
}
```

---

## Relaciones entre colecciones

| Desde | Campo | Hacia | Cardinalidad |
|---|---|---|---|
| `furnitures` | `userId` | `mueblistas._id` | N:1 |
| `furnitures.shapes` | `drawerTypeId` | `drawertypes._id` | N:1 |
| `furnitures.shapes` | `tapaCantoId` | `materials._id` | N:1 |
| `furnitures.shapes` | `fondoMaterialId` | `materials._id` | N:1 |
| `furnitures.shapes` | `cubertaMaterialId` | `materials._id` | N:1 |
| `furnitures.shapes.drawers` | `drawerTypeId` | `drawertypes._id` | N:1 |
| `cotizaciones` | `mueblista_id` | `mueblistas._id` | N:1 |
| `cotizaciones` | `mueble_id` | `furnitures._id` | N:1 |
| `cotizaciones.materiales_resumen` | `material_id` | `materials._id` | N:1 |
| `materials` | `userId` | `mueblistas._id` | N:1 |
| `drawertypes` | `userId` | `mueblistas._id` | N:1 |
| `drawertypes` | `laterales` | `materials._id` | N:1 |
| `drawertypes` | `frenteInterno` | `materials._id` | N:1 |
| `drawertypes` | `trasera` | `materials._id` | N:1 |
| `drawertypes` | `fondo` | `materials._id` | N:1 |
| `drawertypes` | `refuerzo` | `materials._id` | N:1 |
