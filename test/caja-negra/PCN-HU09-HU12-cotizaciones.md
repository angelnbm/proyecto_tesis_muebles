# Pruebas de Caja Negra — HU09-HU12: Cotizaciones

**Historias de usuario:**
- HU09: Como usuario quiero que el sistema pueda generar cotizaciones a partir del diseño.
- HU10: Como usuario quiero que se vea una previsualización de la cotización.
- HU11: Como usuario quiero que en la previsualización de la cotización se puedan personalizar.
- HU12: Como usuario quiero que las cotizaciones se puedan exportar como PDF.

**Objetivo específico relacionado:** OE5 — Automatizar generación de cotizaciones.

**Módulo:** Gestión de Cotizaciones (pestaña "Mis Cotizaciones")

---

## HU09 — Generación de cotizaciones

| ID      | Descripción                                                         | Entrada                                                                                              | Salida esperada                                                                              | Resultado |
|---------|---------------------------------------------------------------------|------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------|-----------|
| PCN-49  | Generar cotización desde diseño con material asignado               | Diseño con módulos, material con precio asignado, clic "Generar Cotización"                          | Cotización guardada con precio total calculado correctamente                                 |           |
| PCN-50  | Cotización incluye nombre y email del cliente                       | Ingresar nombre cliente: "María López", email: "maria@test.com"                                      | Cotización guardada muestra nombre y email correctos                                         |           |
| PCN-51  | Cotización sin nombre de cliente (campo opcional)                   | Campo nombre cliente vacío, clic "Generar Cotización"                                                | Cotización guardada sin nombre de cliente (campo vacío permitido)                            |           |
| PCN-52  | Cotización se muestra en lista "Mis Cotizaciones"                   | Cotización generada previamente                                                                      | Aparece en la lista con nombre del mueble, cliente y precio total                            |           |
| PCN-53  | Múltiples cotizaciones del mismo mueble                             | Generar 2 cotizaciones del mismo diseño                                                              | Ambas cotizaciones aparecen en la lista como entradas separadas                              |           |

## HU10 — Previsualización

| ID      | Descripción                                                         | Entrada                                                                                              | Salida esperada                                                                              | Resultado |
|---------|---------------------------------------------------------------------|------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------|-----------|
| PCN-54  | Expandir tarjeta de cotización muestra detalles                     | Clic en botón "Ver detalles" de cotización en la lista                                               | Panel expandido con lista de materiales, cortes, precio total y estado                       |           |
| PCN-55  | Precio total visible en la previsualización                         | Cotización con precio_total: $125.000                                                                | Precio formateado correctamente en moneda CLP (ej. "$ 125.000")                             |           |
| PCN-56  | Lista de materiales visible en la previsualización                  | Cotización con 2 materiales distintos                                                                | Ambos materiales aparecen con nombre, cantidad de planchas y subtotal                        |           |
| PCN-57  | Lista de cortes visible en la previsualización                      | Cotización con 5 tipos de cortes                                                                     | Todos los cortes aparecen con material, dimensión y cantidad                                 |           |

## HU11 — Personalización (estado)

| ID      | Descripción                                                         | Entrada                                                                                              | Salida esperada                                                                              | Resultado |
|---------|---------------------------------------------------------------------|------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------|-----------|
| PCN-58  | Cambiar estado de cotización a "En Proceso"                         | Cotización en estado "Pendiente", cambiar a "En Proceso"                                             | Estado actualizado correctamente, badge de color cambia                                      |           |
| PCN-59  | Cambiar estado de cotización a "Completado"                         | Cotización en cualquier estado, cambiar a "Completado"                                               | Estado actualizado, fecha de término registrada                                              |           |
| PCN-60  | Cambiar estado a valor inválido (ataque directo a API)              | PATCH `/api/cotizaciones/:id/estado` con estado: `"Cancelado"` (no permitido)                        | Error 400, mensaje "Estado inválido"                                                         |           |
| PCN-61  | Loading visible durante cambio de estado                            | Cambiar estado con conexión lenta simulada                                                           | El selector muestra estado "Guardando..." mientras procesa                                   |           |

## HU12 — Exportar PDF

| ID      | Descripción                                                         | Entrada                                                                                              | Salida esperada                                                                              | Resultado |
|---------|---------------------------------------------------------------------|------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------|-----------|
| PCN-62  | Exportar cotización como PDF                                        | Cotización guardada, clic en botón "Descargar PDF"                                                   | Archivo PDF descargado con nombre `cotizacion_[mueble]_[cliente].pdf`                       |           |
| PCN-63  | PDF generado tiene contenido correcto                               | Cotización con cliente "María López", mueble "Cocina"                                                | PDF contiene: nombre cliente, nombre mueblista, precio total, fecha                         |           |
| PCN-64  | Nombre del archivo PDF no contiene tildes ni ñ                      | Cotización con cliente "Ñoño González", mueble "Diseño Especial"                                     | Nombre archivo: `cotizacion_diseno_especial_nono_gonzalez.pdf`                              |           |
| PCN-65  | PDF tiene múltiples páginas si hay muchos cortes                    | Cotización con más de 30 cortes en la lista                                                          | PDF generado con 2+ páginas correctamente paginadas                                          |           |

## Eliminación de cotizaciones

| ID      | Descripción                                                         | Entrada                                                                                              | Salida esperada                                                                              | Resultado |
|---------|---------------------------------------------------------------------|------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------|-----------|
| PCN-66  | Eliminar cotización con confirmación                                | Clic en botón eliminar, confirmar en diálogo                                                         | Cotización eliminada, desaparece de la lista                                                 |           |
| PCN-67  | Cancelar eliminación de cotización                                  | Clic en botón eliminar, clic "Cancelar" en diálogo                                                   | Cotización no se elimina, sigue en la lista                                                  |           |
| PCN-68  | Un usuario no puede ver cotizaciones de otro usuario                | Usuario B intenta acceder a cotización del Usuario A por ID directo                                  | Error 404, "Cotización no encontrada"                                                        |           |
