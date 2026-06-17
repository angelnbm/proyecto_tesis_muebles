# Pruebas de Caja Negra — HU16-HU17: Estadísticas

**Historias de usuario:**
- HU16: Como usuario quiero ver estadísticas básicas.
- HU17: Como usuario quiero que se puedan filtrar las estadísticas por periodos.

**Objetivo específico relacionado:** OE7 — Implementar módulo de estadísticas.

**Módulo:** Panel de Estadísticas (pestaña "Estadísticas")

---

## HU16 — Estadísticas básicas

| ID      | Descripción                                                              | Entrada                                                              | Salida esperada                                                                              | Resultado |
|---------|--------------------------------------------------------------------------|----------------------------------------------------------------------|----------------------------------------------------------------------------------------------|-----------|
| PCN-90  | Panel de estadísticas es accesible                                       | Usuario autenticado clic en pestaña "Estadísticas"                   | Panel de estadísticas visible con KPIs y gráficos                                           |           |
| PCN-91  | KPI "Diseños totales" muestra conteo correcto                            | Usuario con 5 diseños guardados                                      | KPI muestra el valor "5"                                                                     |           |
| PCN-92  | KPI "Cotizaciones totales" muestra conteo correcto                       | Usuario con 3 cotizaciones                                           | KPI muestra el valor "3"                                                                     |           |
| PCN-93  | KPI "Monto acumulado" muestra suma de cotizaciones                       | Cotizaciones con precios: $50.000, $80.000, $120.000                 | KPI muestra "$ 250.000" (suma total)                                                         |           |
| PCN-94  | KPI "Precio promedio cotización" calcula correctamente                   | 3 cotizaciones: $50.000, $80.000, $120.000                           | KPI muestra "$ 83.333" (promedio)                                                            |           |
| PCN-95  | KPI "Módulos totales" cuenta todos los módulos en todos los diseños      | 2 diseños: uno con 3 módulos, otro con 2 módulos                     | KPI muestra "5"                                                                              |           |
| PCN-96  | Gráfico "Diseños por mes" muestra barras                                 | Usuario con diseños en distintos meses                               | Gráfico de barras visible con el conteo por mes                                              |           |
| PCN-97  | Gráfico "Cotizaciones por estado" muestra distribución                   | Cotizaciones: 2 Pendiente, 1 En Proceso, 1 Completado               | Gráfico de barras con los 3 estados y sus conteos                                            |           |
| PCN-98  | Panel sin datos muestra estado vacío o ceros                             | Usuario sin diseños ni cotizaciones                                  | KPIs muestran "0", gráficos vacíos o mensaje de sin datos                                    |           |
| PCN-99  | Tipos de módulos usados aparecen en gráfico                              | Diseños con cajoneras, modulares y estantes                          | Gráfico "Tipos de módulos" muestra las categorías correspondientes                           |           |

## HU17 — Filtros por periodo

| ID       | Descripción                                                             | Entrada                                                              | Salida esperada                                                                              | Resultado |
|----------|-------------------------------------------------------------------------|----------------------------------------------------------------------|----------------------------------------------------------------------------------------------|-----------|
| PCN-100  | Filtrar estadísticas por año actual                                     | Selector de año = año actual                                         | Gráficos y KPIs muestran solo datos del año actual                                           |           |
| PCN-101  | Filtrar estadísticas por año anterior                                   | Selector de año = año anterior                                       | Gráficos actualizados con datos del año anterior                                             |           |
| PCN-102  | Sin datos en el periodo seleccionado muestra ceros/vacío                | Seleccionar año sin ningún diseño ni cotización                      | KPIs en 0, gráficos vacíos o mensaje "sin datos en este periodo"                             |           |
