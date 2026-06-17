# Pruebas de Caja Negra — HU14-HU15: Biblioteca de Materiales

**Historias de usuario:**
- HU14: Como usuario quiero disponer de una biblioteca de materiales.
- HU15: Como usuario quiero poder agregar, editar y eliminar materiales de la biblioteca.

**Objetivo específico relacionado:** OE4 — Implementar biblioteca de materiales.

**Módulo:** Biblioteca de Materiales (pestaña "Biblioteca")

---

## HU14 — Visualización de materiales

| ID      | Descripción                                                         | Entrada                                                              | Salida esperada                                                                          | Resultado |
|---------|---------------------------------------------------------------------|----------------------------------------------------------------------|------------------------------------------------------------------------------------------|-----------|
| PCN-69  | La biblioteca muestra los materiales guardados                      | Usuario autenticado abre pestaña "Biblioteca"                        | Lista de materiales del usuario visible con nombre, tipo y precio                        |           |
| PCN-70  | Biblioteca vacía muestra estado vacío                               | Usuario sin materiales en la biblioteca                              | Mensaje de estado vacío con instrucción para agregar materiales                          |           |
| PCN-71  | Filtrar materiales por categoría "material"                         | Clic en pestaña "Materiales" del selector de categoría               | Solo se muestran materiales con categoría "material"                                     |           |
| PCN-72  | Filtrar materiales por categoría "accesorio"                        | Clic en pestaña "Accesorios"                                         | Solo se muestran accesorios                                                              |           |
| PCN-73  | Filtrar materiales por categoría "tapa-canto"                       | Clic en pestaña "Tapa Canto"                                         | Solo se muestran tapa-cantos                                                             |           |

## HU15 — CRUD de materiales

### Agregar material

| ID      | Descripción                                                         | Entrada                                                              | Salida esperada                                                                          | Resultado |
|---------|---------------------------------------------------------------------|----------------------------------------------------------------------|------------------------------------------------------------------------------------------|-----------|
| PCN-74  | Agregar material de tipo "material" con todos los campos            | nombre: "Melamina Blanca", tipo: "Melamina", precio: 15000, grosor: 18, dimensiones: "250x183" | Material creado, aparece en la lista                        |           |
| PCN-75  | Agregar accesorio con todos los campos                              | nombre: "Riel telescópico", tipo: "accesorio", accesorio_tipo: "riel", precio: 5000 | Accesorio creado, aparece en la lista                                    |           |
| PCN-76  | Agregar tapa-canto                                                  | nombre: "Tapa canto blanco", tipo: "tapa-canto", precio: 800        | Tapa-canto creado, aparece en la lista                                                   |           |
| PCN-77  | Agregar material sin nombre                                         | nombre: `""`, resto de campos válidos                                | Error de validación: "El nombre es obligatorio"                                          |           |
| PCN-78  | Agregar material con precio negativo                                | nombre: "Test", precio: -500, categoría: "material"                  | Error de validación: precio debe ser mayor o igual a 0                                   |           |
| PCN-79  | Agregar material con categoría inválida                             | nombre: "Test", categoría: "otro"                                    | Error de validación: categoría debe ser material, accesorio o tapa-canto                 |           |
| PCN-80  | Agregar material de categoría "material" sin tipo                   | nombre: "Test", categoría: "material", tipo: `""`                    | Error de validación: tipo de material es obligatorio                                     |           |
| PCN-81  | Agregar material de categoría "material" sin dimensiones            | nombre: "Test", categoría: "material", tipo: "MDF", dimensiones: `""` | Error de validación: dimensiones son obligatorias                                       |           |

### Editar material

| ID      | Descripción                                                         | Entrada                                                              | Salida esperada                                                                          | Resultado |
|---------|---------------------------------------------------------------------|----------------------------------------------------------------------|------------------------------------------------------------------------------------------|-----------|
| PCN-82  | Editar nombre de material existente                                 | Material existente, cambiar nombre a "Melamina Negra"                | Nombre actualizado en la lista y en el diseño si está en uso                             |           |
| PCN-83  | Editar precio de material existente                                 | Material existente, cambiar precio de 15000 a 18000                  | Precio actualizado                                                                       |           |
| PCN-84  | Editar material de otro usuario (ataque directo)                    | PUT `/api/materiales/:id` con ID de material ajeno                   | Error 404, "Material no encontrado"                                                      |           |

### Eliminar material

| ID      | Descripción                                                         | Entrada                                                              | Salida esperada                                                                          | Resultado |
|---------|---------------------------------------------------------------------|----------------------------------------------------------------------|------------------------------------------------------------------------------------------|-----------|
| PCN-85  | Eliminar material con confirmación                                  | Clic eliminar en material, confirmar en diálogo                       | Material eliminado, desaparece de la lista                                               |           |
| PCN-86  | Cancelar eliminación de material                                    | Clic eliminar, clic "Cancelar" en diálogo                            | Material no se elimina                                                                   |           |
| PCN-87  | Eliminar material de otro usuario (ataque directo)                  | DELETE `/api/materiales/:id` con ID de material ajeno                | Error 404, "Material no encontrado"                                                      |           |

## Tipos de cajón (sub-módulo de la biblioteca)

| ID      | Descripción                                                         | Entrada                                                              | Salida esperada                                                                          | Resultado |
|---------|---------------------------------------------------------------------|----------------------------------------------------------------------|------------------------------------------------------------------------------------------|-----------|
| PCN-88  | Agregar tipo de cajón personalizado                                 | nombre: "Cajón económico", descuento alto: 2 cm, laterales: [materialId] | Tipo de cajón creado y disponible en el selector del módulo cajonera               |           |
| PCN-89  | Eliminar tipo de cajón con confirmación                             | Seleccionar tipo de cajón, clic eliminar, confirmar                  | Tipo de cajón eliminado de la lista                                                      |           |
