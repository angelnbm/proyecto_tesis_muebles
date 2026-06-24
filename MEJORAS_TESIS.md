# Lista de mejoras — Memoria de Título "Tablón"

> Generado a partir de evaluación con dos rúbricas académicas.
> Ordenado por impacto en puntaje (mayor a menor).

---

## CRÍTICO — Elementos que no existen y valen 0

### 1. Escribir el Resumen
- El documento va directo de los índices al `\chapter{Introducción}` sin ningún `\begin{resumen}`.
- La plantilla `iccmemoria.cls` ya tiene el ambiente listo.
- El resumen debe cubrir **4 elementos**:
  - Descripción del problema (proceso manual lento en mueblería artesanal)
  - Descripción de la solución (app web con diseño 2D, cubicación automática, cotizaciones)
  - Análisis crítico de la solución (qué funciona, qué limitaciones tiene)
  - Proyección (trabajo futuro, escalabilidad)

### 2. Agregar sección de Accesibilidad
- No existe en el documento. Puede ir como subsección dentro del capítulo de Desarrollo o Conclusiones.
- Puntos a cubrir:
  - Diseño responsive (ya mencionado en Alcances, expandir)
  - Requisitos mínimos de hardware ya documentados (4 GB RAM, procesador gama media)
  - Adaptación a usuarios con baja alfabetización digital (mueblista artesanal)
  - Contraste de colores e iconografía clara en la interfaz
  - Conexión a internet mínima gracias a la arquitectura SPA (ya documentado en factibilidad técnica, referenciar)
  - Navegación básica sin requerir conocimientos técnicos

### 3. Agregar sección de Sostenibilidad
- No existe en el documento. Puede ir como subsección dentro del capítulo de Desarrollo o Conclusiones.
- Puntos a cubrir:
  - Stack gratuito y open source → costo $0 en licencias (ya en tabla 4.1, referenciar)
  - Arquitectura SPA minimiza peticiones al servidor → menor tráfico de red → menor consumo energético
  - MongoDB con esquema flexible reduce operaciones de lectura/escritura comparado con SQL normalizado
  - GCP ofrece opciones de infraestructura con energía renovable
  - Escalabilidad progresiva: no se requiere servidor dedicado hasta que el proyecto crezca

---

## ALTO IMPACTO — Mejoras que suben varios puntos

### 4. Agregar imágenes a las iteraciones 3–8
- Las iteraciones 1 y 2 tienen 8–12 figuras de código e interfaz cada una.
- Las iteraciones 3–8 tienen **cero imágenes** (solo bloques `% TODO` comentados).
- Para cada iteración agregar al menos:
  - Una captura del componente o panel principal implementado (interfaz de usuario)
  - Una captura del código más relevante (ruta backend o función principal)
- Imágenes sugeridas a tomar y agregar en `formulacion/imagenes/`:

| Iteración | Imagen sugerida | Nombre de archivo sugerido |
|---|---|---|
| 3 — Cubicación | Panel de cubicación con listado de piezas | `cubicacion_panel.png` |
| 3 — Cubicación | Fragmento del algoritmo en `cubicacion.js` | `cubicacion_algoritmo.png` |
| 4 — Cotizaciones | Vista de previsualización de cotización | `cotizacion_preview.png` |
| 4 — Cotizaciones | Ruta POST de creación de cotización | `cotizacion_ruta_crear.png` |
| 5 — Materiales | Vista de la biblioteca de materiales | `material_library.png` |
| 5 — Materiales | Función `validateMaterialPayload` | `material_validacion.png` |
| 6 — Estadísticas | Panel de estadísticas con KPIs y gráficos | `stats_panel.png` |
| 7 — Correo | Botón/flujo de envío de cotización por correo | `email_envio.png` |
| 8 — Biblioteca | Vista de biblioteca de muebles guardados | `biblioteca_muebles.png` |

- Una vez que agregues las imágenes, descomentar los bloques `% NOTA:` en `main.tex`.

### 5. Medir OE6 (reducción de tiempo del 15%)
- Actualmente en el capítulo de Conclusiones dice `"A evaluar con el mueblista"`.
- Sin esta medición no se puede declarar el OE6 cumplido.
- Cómo medirlo:
  1. Definir un caso de prueba estándar (ej: diseñar una cajonera 60×80×50 con 3 cajones + un módulo de repisas)
  2. Medir el tiempo que tarda el mueblista haciéndolo con el método manual (lápiz y papel)
  3. Medir el tiempo que tarda usando la aplicación
  4. Calcular el porcentaje de reducción y documentarlo en Conclusiones
- Agregar esa comparación numérica al análisis de resultados del OE6.

### 6. Documentar la desviación del orden de iteraciones
- La tabla de planificación (cap. 3) define un orden de iteraciones (1→8).
- El orden real de ejecución fue diferente (ej: I05 del itinerario = biblioteca de muebles, que en el plan es Iteración 8).
- Agregar en la Retrospectiva de alguna iteración intermedia (ej: Iteración 4 o 5) una nota explicando que el orden fue ajustado y por qué.
- La Retrospectiva de Iteración 2 dice que quedó incompleta pero nunca se documenta cómo se cerró ese pendiente — agregar esa resolución.

---

## MEDIO IMPACTO — Errores sistemáticos de redacción y ortografía

### 7. Corregir ortografía (errores confirmados)
Buscar y corregir cada uno en `main.tex`:

| Error | Corrección | Dónde aparece |
|---|---|---|
| `ususario` | `usuario` | Tabla HU (HU02, HU05, HU15), Iteración 2 |
| `técnologico` | `tecnológico` | Inicio de Iteración 1 |
| `desaorrollo` | `desarrollo` | Introducción de Iteración 2 |
| `implemetación` | `implementación` | Sección Plan de Trabajo |
| `solitudces` | `solicitudes` | Concepto de Servidor (Cap. 2) |
| `coceptos` | `conceptos` | Resumen Cap. 1 |
| `soluicionarlo` | `solucionarlo` | Conclusiones (versión anterior) |
| `estádisticas` | `estadísticas` | Tabla de planificación de iteraciones |
| `priorizacion` | `priorización` | Cap. 3, sección MuSCoW |
| `Gloogle Cloud` | `Google Cloud` | Sección de tecnologías (Cap. 2) |

### 8. Unificar la voz y los tiempos verbales
- El capítulo de Desarrollo mezcla primera persona (`"tuve que"`, `"procedemos"`) con impersonal (`"se crea"`, `"se implementa"`) dentro del mismo párrafo.
- Elegir una sola voz para todo el capítulo de Desarrollo. Recomendación: **pasado en primera persona** para las subsecciones de Implementación (`"se implementó"`, `"se creó"`, `"se desarrolló"`), que es el estilo del resto del documento.
- Revisar especialmente las subsecciones de Implementación de las Iteraciones 1 y 2 donde el cambio es más evidente.

### 9. Mejorar las referencias cruzadas
- Las 173 tablas de pruebas del capítulo 5 aparecen en secuencia sin ser referenciadas en el texto del resumen del capítulo.
- En el párrafo introductorio de cada subsección de pruebas (ej: "HU01 — Registro y Login") agregar referencias como `"como se muestra en la Tabla~\ref{tab:pu23}"` al menos para la primera prueba de cada grupo.
- El resumen del capítulo 5 menciona las pruebas por nombre pero no usa `\ref{}` — corregir para que apunten a las tablas reales.
- Verificar que todas las figuras del documento tengan su `\label{}` y sean referenciadas con `\ref{}` en el texto que las introduce.

---

## MENOR IMPACTO — Detalles de presentación

### 10. Completar Dedicatoria y Agradecimientos
- Actualmente dicen `"Dedicado a ..."` y `"Agradecimientos a ..."` (texto placeholder de la plantilla).
- Un evaluador lo ve antes de leer la primera página.

### 11. Completar el análisis crítico en Conclusiones
- La sección de Conclusiones ahora lista el cumplimiento de cada OE, pero el análisis crítico es superficial.
- Para el puntaje máximo, agregar por cada OE cumplido: qué funcionó bien Y qué limitación o aspecto mejorable quedó (no solo listar "Cumplido").
- Ejemplo para OE2: *"El algoritmo de cubicación calcula correctamente las planchas por área, pero no implementa optimización de disposición de cortes (bin packing 2D), lo que puede sobreestimar el número de planchas en diseños con piezas de dimensiones variadas."*

### 12. Revisar etiquetas duplicadas en tablas
- La etiqueta `\label{tab:Clasificación_historias_de_usuario}` aparece dos veces en el documento (tablas 3.1 y 3.2).
- La etiqueta `\label{tab:tareas_historias_de_usuario}` aparece en las iteraciones 1 y 2.
- Esto genera warnings en LaTeX y puede afectar la numeración automática con `\ref{}`.
- Renombrar cada etiqueta para que sea única (ej: `tab:hu_clasificacion`, `tab:hu_moscow`, `tab:tareas_i1`, `tab:tareas_i2`).

### 13. Agregar diagrama de secuencia para iteraciones 3–8
- Las iteraciones 1 y 2 tienen diagramas de secuencia (`.drawio.png`).
- Las iteraciones 3–8 describen el flujo en texto pero sin diagrama.
- Mínimo para las iteraciones más complejas (3 - Cubicación, 4 - Cotizaciones): crear el diagrama en draw.io y exportarlo como `.png`.
- La imagen `imagenes/secuencia.drawio.png` existe pero no está usada — si corresponde a uno de los módulos nuevos, referenciarla.

### 14. Revisar el análisis de resultados del OE8 (SUS)
- El puntaje SUS calculado es 85, que está en rango "Aceptable" (>68).
- El documento actualmente solo muestra el número. Para un análisis comparativo real agregar:
  - Qué ítem tuvo la peor evaluación y por qué (ítem 5: "funciones bien integradas" = 3)
  - Qué ítem tuvo la mejor evaluación (ítem 1 y 7 = 5)
  - Qué implica ese resultado para el perfil del mueblista artesanal
  - Si se puede: comparar con el benchmark promedio de SUS (68 = aceptable, >80 = bueno)

---

## Resumen de impacto en puntaje

| Grupo | Mejora | Puntos recuperables (aprox.) |
|---|---|---|
| Crítico | Escribir resumen | +3 |
| Crítico | Sección de accesibilidad | +2 |
| Crítico | Sección de sostenibilidad | +2 |
| Alto | Imágenes iteraciones 3–8 | +1 |
| Alto | Medir OE6 con mueblista | +1 |
| Alto | Documentar desviación de iteraciones | +0.5 |
| Medio | Ortografía (10 errores confirmados) | +1 |
| Medio | Unificar voz/tiempos verbales | +1 |
| Medio | Referencias cruzadas con \ref{} | +1 |
| Menor | Completar dedicatoria/agradecimientos | — |
| Menor | Análisis crítico en conclusiones | +0.5 |
| Menor | Etiquetas duplicadas | — |

**Potencial de mejora: ~13 puntos sobre 78 → pasar de ~55% a ~72%**

---

*Archivo generado el 2026-06-22*
