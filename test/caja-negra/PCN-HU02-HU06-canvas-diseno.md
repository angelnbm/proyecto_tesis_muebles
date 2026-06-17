# Pruebas de Caja Negra — HU02-HU06: Canvas y Gestión de Diseños

**Historias de usuario:**
- HU02: Como usuario quiero un canvas 2D para poder hacer diseños.
- HU03: Como usuario quiero crear, guardar, cargar y eliminar el diseño de un mueble.
- HU04: Como usuario quiero que el diseño se pueda hacer modular.
- HU05: Como usuario quiero que las medidas de los módulos sean editables.
- HU06: Como usuario quiero que los módulos sean móviles para acomodarlos según la necesidad.

**Objetivo específico relacionado:** OE1 — Implementar espacio de diseño 2D.

**Módulo:** Canvas de diseño

---

## HU02 — Canvas 2D

| ID      | Descripción                                         | Entrada                                           | Salida esperada                                                 | Resultado |
|---------|-----------------------------------------------------|---------------------------------------------------|-----------------------------------------------------------------|-----------|
| PCN-12  | El canvas se muestra al ingresar al dashboard       | Usuario autenticado abre la aplicación            | Área de diseño en blanco (canvas) visible en pantalla           |           |
| PCN-13  | El canvas es interactivo (acepta módulos)           | Usuario autenticado, canvas en estado vacío       | Botones de módulos disponibles y habilitados                    |           |
| PCN-14  | Acceso al canvas sin autenticación                  | Usuario no autenticado intenta acceder al canvas  | Redirige al formulario de login                                 |           |

## HU04 — Módulos

| ID      | Descripción                                         | Entrada                                                        | Salida esperada                                                       | Resultado |
|---------|-----------------------------------------------------|----------------------------------------------------------------|-----------------------------------------------------------------------|-----------|
| PCN-15  | Agregar módulo de tipo "cajonera"                   | Clic en botón cajonera, ingresar ancho: 60, alto: 80, prof: 50 | Módulo cajonera aparece en el canvas con las dimensiones indicadas    |           |
| PCN-16  | Agregar módulo de tipo "modular"                    | Clic en botón modular, dimensiones por defecto                 | Módulo modular aparece en el canvas                                   |           |
| PCN-17  | Agregar módulo de tipo "estante"                    | Clic en botón estante                                          | Módulo estante aparece en el canvas                                   |           |
| PCN-18  | Agregar módulo de tipo "puerta"                     | Clic en botón puerta                                           | Módulo puerta aparece en el canvas                                    |           |
| PCN-19  | Agregar módulo de tipo "cubierta"                   | Clic en botón cubierta                                         | Módulo cubierta aparece en el canvas                                  |           |
| PCN-20  | Agregar múltiples módulos distintos                 | Agregar 3 módulos distintos (cajonera, modular, estante)       | Los 3 módulos aparecen en el canvas sin superponerse                  |           |

## HU05 — Edición de medidas

| ID      | Descripción                                         | Entrada                                                        | Salida esperada                                                       | Resultado |
|---------|-----------------------------------------------------|----------------------------------------------------------------|-----------------------------------------------------------------------|-----------|
| PCN-21  | Editar ancho de un módulo existente                 | Seleccionar módulo, cambiar ancho de 60 a 80 cm               | Módulo actualiza su ancho visualmente a 80 cm                         |           |
| PCN-22  | Editar alto de un módulo existente                  | Seleccionar módulo, cambiar alto de 80 a 100 cm               | Módulo actualiza su alto visualmente a 100 cm                         |           |
| PCN-23  | Editar profundidad de un módulo                     | Seleccionar módulo, cambiar profundidad de 50 a 60 cm         | Campo profundidad actualizado correctamente                           |           |
| PCN-24  | Ingresar valor cero en medidas                      | Seleccionar módulo, ingresar ancho: 0                          | El sistema no acepta el valor o muestra advertencia                   |           |
| PCN-25  | Editar número de cajones en cajonera                | Seleccionar cajonera, cambiar de 3 a 5 cajones                 | Cajonera muestra 5 divisiones en el canvas                            |           |

## HU06 — Módulos móviles

| ID      | Descripción                                         | Entrada                                                        | Salida esperada                                                       | Resultado |
|---------|-----------------------------------------------------|----------------------------------------------------------------|-----------------------------------------------------------------------|-----------|
| PCN-26  | Arrastrar un módulo a una nueva posición            | Arrastrar cajonera desde posición inicial a otra parte         | Módulo se desplaza y queda en la nueva posición                       |           |
| PCN-27  | Seleccionar un módulo para editarlo                 | Clic sobre un módulo en el canvas                              | Módulo queda seleccionado (borde resaltado) y panel de edición activo |           |

## HU03 — Guardar, cargar y eliminar diseños

| ID      | Descripción                                         | Entrada                                                        | Salida esperada                                                       | Resultado |
|---------|-----------------------------------------------------|----------------------------------------------------------------|-----------------------------------------------------------------------|-----------|
| PCN-28  | Guardar diseño con nombre nuevo                     | Canvas con módulos, clic guardar, nombre: "Cocina test"        | Mensaje de éxito, diseño aparece en lista de diseños guardados        |           |
| PCN-29  | Guardar diseño con mismo nombre (sobrescribir)      | Diseño "Cocina test" ya guardado, guardar de nuevo             | Mensaje confirmación, diseño sobrescrito sin crear duplicado          |           |
| PCN-30  | Guardar canvas vacío                                | Canvas sin módulos, clic guardar                               | Mensaje de error: no se puede guardar un canvas vacío                 |           |
| PCN-31  | Guardar sin nombre                                  | Canvas con módulos, intentar guardar con nombre vacío          | Error de validación: el nombre es obligatorio                         |           |
| PCN-32  | Cargar un diseño previamente guardado               | Seleccionar "Cocina test" desde la lista de diseños            | Canvas se llena con los módulos del diseño guardado                   |           |
| PCN-33  | Eliminar un diseño guardado                         | Seleccionar diseño en lista, clic eliminar, confirmar          | Diseño eliminado, ya no aparece en la lista                           |           |
| PCN-34  | Cancelar eliminación de diseño                      | Diálogo confirmación abierto, clic en "Cancelar"               | Diseño no se elimina, sigue en la lista                               |           |
