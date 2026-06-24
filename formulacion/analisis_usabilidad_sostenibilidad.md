# Análisis de Usabilidad y Sostenibilidad

## 1. Análisis de Usabilidad (Accesibilidad)

### Criterio evaluado
> Identifica y reconoce todos los aspectos técnicos que su solución debe considerar para que los usuarios, independientemente de sus capacidades, puedan usar todas las funciones del sistema. Garantiza la accesibilidad de todos los artefactos técnicos y la documentación, asegurando que la metodología y los resultados sean comprensibles y reproducibles por terceros.

---

### Marco de referencia: WCAG 2.1

La solución se diseña considerando los lineamientos del estándar **Web Content Accessibility Guidelines (WCAG) 2.1**, nivel de conformidad **AA**, organizados en cuatro principios: Perceptible, Operable, Comprensible y Robusto.

---

### Aspectos técnicos identificados

#### Contraste visual
- La interfaz debe mantener una relación de contraste mínima de **4.5:1** entre texto y fondo.
- La paleta de materiales (colores de melamina) no puede depender exclusivamente del color para comunicar información; se deben agregar etiquetas textuales o íconos de apoyo.

#### Accesibilidad del canvas (desafío principal)
El elemento `<canvas>` sobre el que opera **Konva.js** no es interpretable por lectores de pantalla, ya que su contenido no forma parte del DOM accesible. Las medidas técnicas para mitigar esto son:
- Etiquetas ARIA descriptivas (`aria-label`, `role="img"`) en el contenedor del canvas.
- Mensajes de texto que describan el estado actual del diseño (módulos agregados, dimensiones, material seleccionado) mediante zonas ARIA live (`aria-live="polite"`).
- Atajos de teclado para las operaciones principales del canvas (agregar módulo, mover, eliminar).

#### Formularios accesibles
- Todos los campos de entrada deben tener etiquetas `<label>` explícitas y asociadas correctamente.
- Los mensajes de validación deben ser textuales, no dependientes únicamente del color rojo.
- Los campos obligatorios deben indicarse con texto (no solo con asterisco sin descripción).

#### Diseño responsive
- La interfaz se adapta a distintos tamaños de pantalla, aunque el módulo de diseño 2D está optimizado para uso en computador (según el alcance del proyecto).

#### Navegación por teclado
- El orden de foco de los componentes sigue una secuencia lógica accesible mediante la tecla `Tab`.
- Los elementos interactivos (botones, modales) deben ser alcanzables y operables sin ratón.

#### Perfil del usuario objetivo
Los mueblistas artesanales de zonas rurales pueden presentar:
- Menor familiaridad con entornos digitales.
- Posibles limitaciones de visión asociadas a la edad.

Por esto, la interfaz prioriza: íconos con etiquetas textuales, flujos de interacción simples, y mensajes de error descriptivos en lenguaje cotidiano.

---

### Accesibilidad de la documentación

Para que la metodología y resultados sean comprensibles y reproducibles por terceros:
- Este documento está escrito en LaTeX con estructura semántica (secciones, subsecciones, listas, tablas con caption).
- Las tablas comparativas incluyen encabezados explícitos.
- Las figuras incluyen `\caption` descriptivo y etiqueta `\label` para referencia cruzada.
- El código fuente del proyecto incluye un `README.md` con instrucciones de instalación y ejecución paso a paso.
- El entorno de ejecución está contenerizado con **Docker**, garantizando que cualquier tercero pueda reproducir el entorno exacto sin dependencias de versiones del sistema operativo.

---

## 2. Análisis de Sostenibilidad

### Criterio evaluado
> Evalúa críticamente la arquitectura del sistema, tecnologías utilizadas e intensidad del procesamiento y almacenamiento de datos, desde el punto de vista del consumo de recursos para reducir la huella de carbono y su impacto en el medio ambiente. Propone optimizaciones para reducir la huella de carbono derivada del procesamiento y almacenamiento de datos.

---

### Evaluación de la arquitectura

#### Frontend — React (SPA)
Al ser una **Single Page Application**, la carga inicial transfiere los recursos estáticos (HTML, JS, CSS) una sola vez al navegador. Las interacciones posteriores realizan únicamente peticiones de datos a la API REST, sin recargar la página completa.

**Impacto:** Reduce el volumen de transferencia de red y el procesamiento del servidor en comparación con modelos de renderizado completo de página (MPA tradicional).

#### Backend — Node.js + Express
El modelo de ejecución basado en un **bucle de eventos no bloqueante** (*event loop*) permite atender múltiples solicitudes concurrentes sin crear un hilo del sistema operativo por cada petición.

**Impacto:** Menor consumo de CPU y memoria RAM frente a servidores multihilo tradicionales (PHP, Java EE) bajo carga concurrente equivalente.

#### Base de datos — MongoDB
Para el patrón de acceso predominante de esta aplicación (cargar y guardar un diseño completo), el modelo de documento evita operaciones de JOIN entre múltiples tablas.

**Impacto:** Menor costo computacional por consulta en comparación con una alternativa relacional (SQL) para este caso de uso específico.

#### Contenerización — Docker
Los contenedores comparten el kernel del sistema operativo anfitrión, sin necesidad de virtualizar un sistema operativo completo por servicio.

**Impacto:** Menor uso de memoria y CPU que una virtualización completa (VMs), con la posibilidad de escalar únicamente los servicios que lo requieran.

#### Infraestructura — Google Cloud
Google Cloud opera con un compromiso de abastecimiento de **energía 100% renovable** para sus centros de datos, lo que reduce directamente la huella de carbono del alojamiento frente a infraestructuras sin este compromiso o frente a servidores físicos propios.

---

### Proceso de mayor intensidad computacional

El **módulo de cubicación** es el proceso de mayor carga computacional de la solución, al aplicar un algoritmo de optimización de corte (*bin packing*) sobre el conjunto de piezas del diseño. Al ejecutarse en el **servidor** (Node.js) y no en el navegador del cliente:
- El cálculo ocurre una única vez por solicitud.
- No se reprocesa en cada dispositivo cliente.
- El resultado puede ser devuelto directamente sin reprocesamiento.

El **renderizado del canvas** (Konva.js), en cambio, se ejecuta en el **cliente**, descargando esta tarea del servidor y distribuyendo el procesamiento gráfico hacia el dispositivo del usuario.

---

### Evaluación del almacenamiento

Cada diseño de mueble se almacena como un documento JSON en MongoDB, que incluye módulos, piezas y sus atributos (dimensiones, material, orientación). Para diseños complejos, estos documentos pueden crecer en tamaño.

**Consideración:** El almacenamiento en la nube (MongoDB Atlas o instancia en Google Cloud) se beneficia de la infraestructura de centros de datos compartidos, que operan con mayor eficiencia energética que almacenamiento físico dedicado.

---

### Optimizaciones propuestas

| Optimización | Impacto esperado |
|---|---|
| Compresión gzip en respuestas HTTP (`compression` middleware de Express) | Reduce el volumen de datos transferidos en red |
| *Lazy loading* de la lista de muebles guardados | Evita transferir documentos que el usuario no solicitó |
| Caché del resultado de cubicación mientras el diseño no cambie | Evita recalcular el mismo resultado ante solicitudes repetidas |
| Paginación en el historial de muebles | Reduce el tamaño de las respuestas de la API |

---

## Referencias a agregar en `refs.bib`

```bibtex
@misc{wcag,
  title        = {{Web Content Accessibility Guidelines (WCAG) 2.1}},
  author       = {{W3C}},
  year         = {2018},
  url          = {https://www.w3.org/TR/WCAG21/},
  note         = {Accessed: 2025}
}

@misc{google_sustainability,
  title        = {{Google Environmental Report}},
  author       = {{Google LLC}},
  year         = {2024},
  url          = {https://sustainability.google/reports/},
  note         = {Accessed: 2025}
}

@misc{aria,
  title        = {{Accessible Rich Internet Applications (WAI-ARIA) 1.2}},
  author       = {{W3C}},
  year         = {2023},
  url          = {https://www.w3.org/TR/wai-aria-1.2/},
  note         = {Accessed: 2025}
}
```

---

## Contenido LaTeX listo para copiar en `main.tex`

```latex
\section{Análisis de Usabilidad y Accesibilidad}

Para garantizar que el sistema sea utilizable independientemente de las 
capacidades del usuario, se consideran los lineamientos del estándar 
\textit{Web Content Accessibility Guidelines} (WCAG 2.1)~\cite{wcag}, 
nivel de conformidad AA. Los aspectos técnicos identificados son los siguientes:

\begin{itemize}
    \item \textbf{Contraste visual}: Los elementos de la interfaz mantienen 
    una relación de contraste mínima de 4.5:1 entre texto y fondo, garantizando 
    legibilidad para usuarios con baja visión. La paleta de materiales no 
    depende exclusivamente del color para comunicar información.

    \item \textbf{Accesibilidad del canvas}: El elemento \texttt{<canvas>} 
    sobre el cual opera Konva.js no es interpretable por lectores de pantalla, 
    ya que su contenido no forma parte del DOM accesible. Para mitigar esto 
    se consideran: etiquetas ARIA~\cite{aria} descriptivas en el contenedor 
    del canvas, zonas \textit{aria-live} con mensajes de texto que describan 
    el estado del diseño, y atajos de teclado para las operaciones principales.

    \item \textbf{Formularios accesibles}: Todos los campos de entrada cuentan 
    con etiquetas \texttt{<label>} explícitas y mensajes de validación textuales, 
    no dependientes únicamente del color.

    \item \textbf{Diseño responsive}: La interfaz se adapta a distintos tamaños 
    de pantalla, facilitando su uso en dispositivos con resoluciones variadas.

    \item \textbf{Navegación por teclado}: El orden de foco de los componentes 
    sigue una secuencia lógica accesible mediante la tecla Tab, permitiendo 
    operar el sistema sin ratón.
\end{itemize}

Adicionalmente, el perfil del usuario objetivo (mueblista artesanal de zona 
rural) puede presentar una menor familiaridad con entornos digitales, por lo 
que la interfaz prioriza una curva de aprendizaje baja mediante íconos con 
etiquetas textuales, flujos de interacción simples y mensajes de error en 
lenguaje cotidiano.

En cuanto a la reproducibilidad de la metodología, el entorno de ejecución 
está contenerizado con Docker, garantizando que cualquier tercero pueda 
reproducir el entorno exacto independientemente de su sistema operativo.

\section{Análisis de Sostenibilidad}

Se evalúa el impacto ambiental de la solución desde el punto de vista 
del consumo de recursos computacionales y la huella de carbono asociada.

\subsection{Arquitectura y eficiencia energética}

\begin{itemize}
    \item \textbf{Frontend SPA (React)}: Al tratarse de una 
    \textit{Single Page Application}, la carga inicial transfiere los recursos 
    estáticos una sola vez. Las interacciones posteriores realizan únicamente 
    peticiones de datos a la API, reduciendo el volumen de transferencia de red 
    y el procesamiento del servidor frente a modelos de renderizado completo.

    \item \textbf{Backend Node.js}: El modelo de ejecución basado en un bucle 
    de eventos no bloqueante (\textit{event loop}) permite atender múltiples 
    solicitudes concurrentes sin crear un hilo del sistema operativo por 
    petición, reduciendo el consumo de CPU y memoria RAM frente a servidores 
    multihilo tradicionales.

    \item \textbf{Base de datos MongoDB}: Para el patrón de acceso predominante 
    de esta aplicación (cargar y guardar diseños completos), el modelo de 
    documento evita operaciones de JOIN entre múltiples tablas, reduciendo el 
    costo computacional por consulta frente a una alternativa relacional.

    \item \textbf{Contenedores Docker}: La contenerización permite que los 
    servicios compartan el kernel del sistema operativo anfitrión, consumiendo 
    menos recursos que una virtualización completa, con la posibilidad de 
    escalar solo los servicios necesarios.

    \item \textbf{Infraestructura en Google Cloud}: La plataforma opera con 
    un compromiso de abastecimiento de energía 100\% renovable~\cite{google_sustainability}, 
    reduciendo la huella de carbono asociada al alojamiento frente a 
    infraestructuras sin este compromiso.
\end{itemize}

\subsection{Proceso de mayor intensidad computacional}

El módulo de cubicación representa el proceso de mayor carga computacional, 
al aplicar un algoritmo de optimización de corte sobre el conjunto de piezas 
del diseño. Al ejecutarse en el servidor y no en el navegador, el cálculo 
ocurre una única vez por solicitud. El renderizado del canvas (Konva.js), 
en cambio, se ejecuta en el cliente, descargando esta tarea del servidor.

\subsection{Optimizaciones propuestas}

Para minimizar el consumo de recursos se proponen las siguientes medidas:

\begin{itemize}
    \item Compresión gzip en las respuestas HTTP mediante el middleware 
    \texttt{compression} de Express, reduciendo el volumen de datos transferidos.

    \item \textit{Lazy loading} en la carga del historial de muebles, 
    evitando transferir documentos que el usuario no ha solicitado.

    \item Caché del resultado de cubicación mientras el diseño no haya 
    sido modificado, evitando recalcular el mismo resultado ante 
    solicitudes repetidas.

    \item Paginación en el historial de muebles para reducir el tamaño 
    de las respuestas de la API.
\end{itemize}
```
