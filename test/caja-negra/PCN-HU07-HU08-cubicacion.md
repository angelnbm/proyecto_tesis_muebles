# Pruebas de Caja Negra — HU07-HU08: Cubicación

**Historias de usuario:**
- HU07: Como usuario quiero que el sistema me calcule la cantidad de material.
- HU08: Como usuario quiero que se muestre un listado de las piezas que se van a utilizar.

**Objetivo específico relacionado:** OE2 — Implementar módulo de cubicación.

**Módulo:** Vista de Cubicación (pestaña "Cubicación")

---

## HU07 — Cálculo de material

| ID      | Descripción                                                        | Entrada                                                                                           | Salida esperada                                                                                                | Resultado |
|---------|--------------------------------------------------------------------|---------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|-----------|
| PCN-35  | Cubicación de cajonera simple (3 cajones)                          | Cajonera: ancho 60 cm, alto 80 cm, prof 50 cm, 3 cajones                                          | Piezas: Techo/Piso ×2, Laterales ×2, Frente ×3, Fondo ×1; número de planchas ≥ 1                              |           |
| PCN-36  | Cubicación de módulo modular sin estantes ni puertas               | Módulo: ancho 90 cm, alto 200 cm, prof 40 cm, 0 estantes                                          | Piezas: Techo/Piso ×2, Laterales ×2, Fondo ×1                                                                 |           |
| PCN-37  | Cubicación de módulo modular con estantes                          | Módulo: ancho 90 cm, alto 200 cm, prof 40 cm, 3 estantes                                          | Piezas básicas + Estantes ×3                                                                                   |           |
| PCN-38  | Cubicación de módulo con puertas                                   | Módulo: ancho 80 cm, alto 180 cm, prof 40 cm, 2 puertas                                           | Piezas básicas + Puertas ×2 con ancho ≈ 40 cm c/u                                                             |           |
| PCN-39  | Cubicación de estante simple                                       | Estante: ancho 100 cm, alto 3 cm (grosor visual), prof 30 cm                                      | Pieza: Estante ×1                                                                                              |           |
| PCN-40  | Cubicación de puerta individual                                    | Puerta: ancho 40 cm, alto 70 cm                                                                    | Pieza: Puerta ×1 con dimensiones descontadas 3 mm                                                             |           |
| PCN-41  | Cubicación de cubierta                                             | Cubierta: ancho 120 cm, prof 60 cm                                                                | Pieza: Cubierta ×1                                                                                             |           |
| PCN-42  | Cubicación con múltiples módulos distintos                         | 1 cajonera + 1 modular + 1 estante en el canvas                                                   | Listado de piezas con todas las piezas de cada módulo agrupadas correctamente                                  |           |
| PCN-43  | Número de planchas calculado correctamente                         | Piezas que ocupan más de una plancha de melamina (250×183 cm)                                     | Sistema indica correctamente la cantidad de planchas necesarias (≥ 2)                                         |           |
| PCN-44  | Cubicación con material asignado muestra costo                     | Módulo con material "Melamina blanca" a $15.000/plancha asignado                                  | La cubicación muestra subtotal calculado correctamente                                                         |           |

## HU08 — Listado de piezas

| ID      | Descripción                                                        | Entrada                                                                                           | Salida esperada                                                                                                | Resultado |
|---------|--------------------------------------------------------------------|---------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|-----------|
| PCN-45  | Listado muestra descripción de cada pieza                          | Canvas con cajonera (ancho 60, alto 80, prof 50)                                                  | Listado contiene: Techo/Piso, Laterales, Frente, Fondo con sus dimensiones en cm                               |           |
| PCN-46  | Listado muestra cantidad de cada pieza                             | Canvas con cajonera de 3 cajones                                                                  | Frente aparece con cantidad 3, Laterales con cantidad 2, Techo/Piso con cantidad 2                             |           |
| PCN-47  | Listado vacío si canvas está vacío                                 | Canvas sin módulos en pestaña Cubicación                                                          | Panel muestra mensaje de estado vacío o sin piezas                                                             |           |
| PCN-48  | Dimensiones de piezas corresponden al diseño                       | Cajonera 60×80×50, profundidad verificable                                                        | Laterales: ancho=50 cm (profundidad), alto=80 cm; Techo/Piso: ancho=60 cm, alto=50 cm (profundidad)           |           |
