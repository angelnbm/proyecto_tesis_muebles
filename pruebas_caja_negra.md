# Plan de Pruebas de Caja Negra — Amedida

**Versión:** 1.0  
**Fecha:** 2026-06-11  
**Alcance:** Evaluación funcional completa de la aplicación web Amedida (diseño 2D, cubicación, biblioteca de materiales, cotización).

---

## Convenciones

| Símbolo | Significado |
|---------|-------------|
| ✅ | Resultado esperado = aprobado |
| ❌ | Resultado esperado = error controlado |
| **P** | Precondición requerida |

**ID de caso:** `CT-[MÓDULO]-[NNN]`  
Módulos: `AUTH` · `DIS` · `INT` · `CUB` · `BIB` · `COT` · `DIS`

---

## 1. Autenticación

### CT-AUTH-001 — Registro exitoso
| Campo | Detalle |
|-------|---------|
| **Precondición** | El email no existe en el sistema |
| **Pasos** | 1. Ir a la landing page → "Empezar" · 2. Seleccionar "Registrarse" · 3. Ingresar nombre: "Juan Pérez", email: "juan@test.com", contraseña: "abc123" · 4. Enviar |
| **Resultado esperado** | ✅ Se crea la cuenta, se recibe token JWT, la app redirige al canvas principal |

### CT-AUTH-002 — Registro con email duplicado
| Campo | Detalle |
|-------|---------|
| **Precondición** | El email "juan@test.com" ya existe |
| **Pasos** | 1. Intentar registrar con el mismo email |
| **Resultado esperado** | ❌ Mensaje de error: el email ya está registrado (HTTP 409) |

### CT-AUTH-003 — Registro con contraseña corta
| Campo | Detalle |
|-------|---------|
| **Pasos** | 1. Registrar con contraseña "abc" (< 6 caracteres) |
| **Resultado esperado** | ❌ Error de validación antes de enviar al servidor |

### CT-AUTH-004 — Registro con email inválido
| Campo | Detalle |
|-------|---------|
| **Pasos** | 1. Registrar con email "noesuncorreo" |
| **Resultado esperado** | ❌ Error de validación de formato de email |

### CT-AUTH-005 — Login exitoso
| Campo | Detalle |
|-------|---------|
| **Precondición** | Cuenta "juan@test.com" / "abc123" existe |
| **Pasos** | 1. Ingresar email y contraseña correctos · 2. Enviar |
| **Resultado esperado** | ✅ Token JWT recibido, app carga el canvas principal, nombre del usuario visible |

### CT-AUTH-006 — Login con contraseña incorrecta
| Campo | Detalle |
|-------|---------|
| **Pasos** | 1. Login con email correcto y contraseña "mal" |
| **Resultado esperado** | ❌ Mensaje de credenciales inválidas (HTTP 401), no ingresa a la app |

### CT-AUTH-007 — Login con email inexistente
| Campo | Detalle |
|-------|---------|
| **Pasos** | 1. Login con "noexiste@test.com" |
| **Resultado esperado** | ❌ Mensaje de credenciales inválidas (HTTP 401) |

### CT-AUTH-008 — Cierre de sesión
| Campo | Detalle |
|-------|---------|
| **Precondición** | Usuario autenticado en la app |
| **Pasos** | 1. Clicar "Cerrar sesión" |
| **Resultado esperado** | ✅ Token eliminado de localStorage, app regresa a la landing page |

### CT-AUTH-009 — Acceso directo sin sesión activa
| Campo | Detalle |
|-------|---------|
| **Precondición** | No hay token en localStorage |
| **Pasos** | 1. Abrir la URL de la app directamente |
| **Resultado esperado** | ✅ App muestra landing page o pantalla de login, no el canvas |

### CT-AUTH-010 — Token vencido / inválido
| Campo | Detalle |
|-------|---------|
| **Precondición** | Modificar manualmente el token en localStorage a un valor inválido |
| **Pasos** | 1. Recargar la app |
| **Resultado esperado** | ❌ App detecta token inválido, cierra sesión automáticamente, redirige a login |

---

## 2. Gestión de Diseños (Guardar / Cargar / Eliminar)

### CT-DIS-001 — Guardar nuevo diseño
| Campo | Detalle |
|-------|---------|
| **P** | Usuario autenticado, al menos un módulo en el canvas |
| **Pasos** | 1. Clicar "Guardar" · 2. Ingresar nombre "Cocina 01" · 3. Confirmar |
| **Resultado esperado** | ✅ Diseño persiste en BD, aparece en la lista de diseños del usuario |

### CT-DIS-002 — Guardar diseño sin módulos
| Campo | Detalle |
|-------|---------|
| **P** | Canvas vacío |
| **Pasos** | 1. Clicar "Guardar" |
| **Resultado esperado** | ❌ Error o bloqueo: no se puede guardar un diseño vacío |

### CT-DIS-003 — Guardar diseño sin nombre
| Campo | Detalle |
|-------|---------|
| **Pasos** | 1. Clicar "Guardar" · 2. Dejar el campo nombre vacío · 3. Intentar confirmar |
| **Resultado esperado** | ❌ Validación: nombre requerido, no se guarda |

### CT-DIS-004 — Actualizar diseño existente
| Campo | Detalle |
|-------|---------|
| **P** | Diseño "Cocina 01" ya guardado y cargado |
| **Pasos** | 1. Agregar un módulo · 2. Clicar "Guardar" (sin cambiar nombre) |
| **Resultado esperado** | ✅ Se actualiza el diseño existente (PUT), no se crea uno duplicado |

### CT-DIS-005 — Cargar diseño previo
| Campo | Detalle |
|-------|---------|
| **P** | Al menos dos diseños guardados |
| **Pasos** | 1. Abrir selector de diseños · 2. Elegir "Cocina 01" |
| **Resultado esperado** | ✅ Canvas carga las formas del diseño seleccionado, dimensiones intactas |

### CT-DIS-006 — Eliminar diseño
| Campo | Detalle |
|-------|---------|
| **P** | Diseño "Cocina 01" guardado |
| **Pasos** | 1. Seleccionar diseño · 2. Eliminar · 3. Confirmar |
| **Resultado esperado** | ✅ Diseño eliminado de la BD, desaparece del listado |

### CT-DIS-007 — Aislamiento entre usuarios
| Campo | Detalle |
|-------|---------|
| **P** | Dos cuentas: usuario A y usuario B |
| **Pasos** | 1. Usuario A guarda "Diseño Privado" · 2. Usuario B inicia sesión y abre su lista de diseños |
| **Resultado esperado** | ✅ Usuario B no ve el diseño de usuario A (isolación por userId) |

---

## 3. Canvas de Diseño — Módulos Base

### CT-MOD-001 — Agregar estante
| Campo | Detalle |
|-------|---------|
| **P** | Canvas vacío |
| **Pasos** | 1. Clicar "Estante" en el toolbar · 2. Verificar que aparece en el canvas |
| **Resultado esperado** | ✅ Forma rectangular delgada (horizontal) aparece con dimensiones por defecto |

### CT-MOD-002 — Agregar cajonera
| Campo | Detalle |
|-------|---------|
| **Pasos** | 1. Clicar "Cajonera" en toolbar |
| **Resultado esperado** | ✅ Módulo cajonera aparece con representación de cajones visibles (líneas horizontales internas) |

### CT-MOD-003 — Agregar modular
| Campo | Detalle |
|-------|---------|
| **Pasos** | 1. Clicar "Modular" en toolbar |
| **Resultado esperado** | ✅ Módulo rectangular vacío aparece en el canvas |

### CT-MOD-004 — Agregar base/zócalo
| Campo | Detalle |
|-------|---------|
| **Pasos** | 1. Clicar "Base" en toolbar |
| **Resultado esperado** | ✅ Forma de base plana (baja y ancha) aparece en canvas |

### CT-MOD-005 — Mover módulo con drag
| Campo | Detalle |
|-------|---------|
| **P** | Al menos un módulo en canvas |
| **Pasos** | 1. Clicar y arrastrar módulo a otra posición |
| **Resultado esperado** | ✅ El módulo se mueve a la nueva posición, las coordenadas cambian |

### CT-MOD-006 — Editar ancho de módulo
| Campo | Detalle |
|-------|---------|
| **P** | Módulo cajonera seleccionado |
| **Pasos** | 1. Seleccionar cajonera · 2. Cambiar ancho de 60 a 90 cm en el panel lateral |
| **Resultado esperado** | ✅ La forma en canvas cambia de tamaño visualmente; la propiedad `width` = 90 |

### CT-MOD-007 — Editar altura de módulo
| Campo | Detalle |
|-------|---------|
| **Pasos** | 1. Seleccionar modular · 2. Cambiar alto de 80 a 120 cm |
| **Resultado esperado** | ✅ La forma crece verticalmente en el canvas |

### CT-MOD-008 — Editar número de cajones
| Campo | Detalle |
|-------|---------|
| **P** | Cajonera seleccionada |
| **Pasos** | 1. Cambiar numCajones de 3 a 5 |
| **Resultado esperado** | ✅ Aparecen 5 divisiones horizontales dentro de la cajonera en el canvas |

### CT-MOD-009 — Editar número de estantes en modular
| Campo | Detalle |
|-------|---------|
| **P** | Módulo "modular" seleccionado |
| **Pasos** | 1. Cambiar numEstantes de 0 a 3 |
| **Resultado esperado** | ✅ 3 líneas horizontales de estantes aparecen dentro del modular |

### CT-MOD-010 — Activar/desactivar fondo (noFondo)
| Campo | Detalle |
|-------|---------|
| **P** | Cajonera o modular seleccionado |
| **Pasos** | 1. Marcar checkbox "Sin fondo" |
| **Resultado esperado** | ✅ En cubicación, la pieza de fondo desaparece del listado de cortes |

### CT-MOD-011 — Eliminar módulo
| Campo | Detalle |
|-------|---------|
| **P** | Módulo seleccionado |
| **Pasos** | 1. Presionar tecla "Delete" o botón de eliminar |
| **Resultado esperado** | ✅ El módulo desaparece del canvas |

### CT-MOD-012 — Agregar cubierta
| Campo | Detalle |
|-------|---------|
| **Pasos** | 1. Agregar módulo tipo "Cubierta" |
| **Resultado esperado** | ✅ Forma plana y ancha aparece, genera solo 1 pieza en cubicación (w × d) |

### CT-MOD-013 — Agregar divisor standalone
| Campo | Detalle |
|-------|---------|
| **Pasos** | 1. Agregar "Divisor" al canvas sin un contenedor |
| **Resultado esperado** | ✅ Divisor delgado vertical aparece, en cubicación genera pieza de (depth × height) |

---

## 4. Canvas — Módulos Internos (INTERNO placement)

### CT-INT-001 — Colocar puerta dentro de modular
| Campo | Detalle |
|-------|---------|
| **P** | Módulo "modular" en canvas, "Puerta" seleccionada en toolbar |
| **Pasos** | 1. Con puerta seleccionada, clicar dentro del área del modular |
| **Resultado esperado** | ✅ Puerta se coloca dentro del modular, sin poder salirse de sus límites |

### CT-INT-002 — Colocar estante dentro de modular
| Campo | Detalle |
|-------|---------|
| **Pasos** | 1. Con estante seleccionado, clicar dentro del modular |
| **Resultado esperado** | ✅ Estante horizontal se coloca dentro del modular |

### CT-INT-003 — Colocar divisor dentro de modular
| Campo | Detalle |
|-------|---------|
| **Pasos** | 1. Con divisor seleccionado, clicar dentro del modular |
| **Resultado esperado** | ✅ Divisor vertical se coloca dentro del modular |

### CT-INT-004 — Intento de colocar puerta fuera de contenedor (mobile)
| Campo | Detalle |
|-------|---------|
| **P** | Canvas vacío (sin modulares ni cajoneras), modo mobile |
| **Pasos** | 1. Con puerta seleccionada, tocar el fondo del canvas |
| **Resultado esperado** | ✅ Puerta se coloca igualmente (INTERNOS se pueden colocar en cualquier parte del canvas según implementación) |

### CT-INT-005 — Colocar estante dentro de cajonera
| Campo | Detalle |
|-------|---------|
| **P** | Cajonera en canvas |
| **Pasos** | 1. Con estante seleccionado, clicar dentro de la cajonera |
| **Resultado esperado** | ✅ Estante se coloca dentro de la cajonera |

---

## 5. Canvas — Snap y Alineación

### CT-SNAP-001 — Snap entre módulos
| Campo | Detalle |
|-------|---------|
| **P** | Un módulo en canvas |
| **Pasos** | 1. Arrastrar segundo módulo hasta que quede muy cerca del primero (< 8px en desktop) |
| **Resultado esperado** | ✅ El módulo "snappea" y queda alineado exactamente con el borde del primero |

### CT-SNAP-002 — Snap a grilla
| Campo | Detalle |
|-------|---------|
| **Pasos** | 1. Arrastrar módulo libremente |
| **Resultado esperado** | ✅ El módulo se alinea a incrementos de grilla al soltar |

---

## 6. Cubicación — Generación de Piezas

### CT-CUB-001 — Cubicación de estante simple
| Campo | Detalle |
|-------|---------|
| **P** | Un estante de 90 × 3 × 40 cm |
| **Pasos** | 1. Ir a pestaña "Cubicación" |
| **Resultado esperado** | ✅ Lista incluye 1 pieza: "Estante" 90 × 40 cm |

### CT-CUB-002 — Cubicación de cajonera con 3 cajones
| Campo | Detalle |
|-------|---------|
| **P** | Cajonera 60 × 90 × 40 cm, 3 cajones, sin noFondo |
| **Pasos** | 1. Ir a "Cubicación" |
| **Resultado esperado** | ✅ Lista incluye: 2 Techo/Piso (60×40), 2 Laterales (40×90), 1 Fondo (60×40), 3 Frentes exteriores, por cada cajón: 2 laterales + frente interno + trasera + fondo (piezas con ancho = 60−2.6 = 57.4 cm) |

### CT-CUB-003 — Cajonera sin fondo
| Campo | Detalle |
|-------|---------|
| **P** | Cajonera con "noFondo" activado |
| **Pasos** | 1. Ir a "Cubicación" |
| **Resultado esperado** | ✅ Pieza "Fondo" de la carcasa no aparece en el listado |

### CT-CUB-004 — Cubicación de modular con estantes y puertas
| Campo | Detalle |
|-------|---------|
| **P** | Modular 80 × 120 × 40 cm, 2 estantes, 2 puertas, 1 divisor |
| **Pasos** | 1. Ir a "Cubicación" |
| **Resultado esperado** | ✅ Piezas: 2 Techo/Piso, 2 Laterales, 1 Fondo, 2 Estantes (80×40), 2 Puertas (40×120), 1 Divisor (40×120) |

### CT-CUB-005 — Cubicación de base/zócalo con caras habilitadas
| Campo | Detalle |
|-------|---------|
| **P** | Base 120 × 10 × 65 cm con frontal + lateral_izq + lateral_der habilitados |
| **Pasos** | 1. Ir a "Cubicación" |
| **Resultado esperado** | ✅ 3 piezas: frontal (120×10), lateral izq (65×10), lateral der (65×10). Sin trasera. |

### CT-CUB-006 — Cubicación de divisor standalone
| Campo | Detalle |
|-------|---------|
| **P** | Divisor 1.5 × 80 × 40 cm |
| **Pasos** | 1. Ir a "Cubicación" |
| **Resultado esperado** | ✅ 1 pieza: Divisor 40 × 80 cm (depth × height, no width visual) |

### CT-CUB-007 — Recalculo al modificar dimensiones
| Campo | Detalle |
|-------|---------|
| **P** | Cubicación visible con cajonera de 60 cm |
| **Pasos** | 1. Volver a "Diseño" · 2. Cambiar ancho cajonera a 90 cm · 3. Volver a "Cubicación" |
| **Resultado esperado** | ✅ Los valores de piezas se actualizan reflejando ancho 90 cm |

---

## 7. Cubicación — Optimización de Tableros

### CT-OPT-001 — Tableros necesarios para piezas grandes
| Campo | Detalle |
|-------|---------|
| **P** | Material seleccionado (ej. Melamina 244×183 cm), diseño con varios módulos |
| **Pasos** | 1. Ir a "Cubicación", revisar sección de planchas |
| **Resultado esperado** | ✅ Se muestra cantidad de planchas necesarias, porcentaje de utilización (0–100%) y desperdicio |

### CT-OPT-002 — Todas las piezas caben en la plancha
| Campo | Detalle |
|-------|---------|
| **P** | Un estante 90×40 cm (plancha 244×183 cm) |
| **Pasos** | 1. Cubicación |
| **Resultado esperado** | ✅ 1 plancha, utilización baja pero > 0%, la pieza está ubicada dentro de los límites |

### CT-OPT-003 — Pieza que supera la dimensión de la plancha
| Campo | Detalle |
|-------|---------|
| **P** | Módulo con una pieza de 300 cm de ancho (mayor que cualquier plancha estándar) |
| **Pasos** | 1. Cubicación |
| **Resultado esperado** | ❌ Advertencia visible: la pieza no cabe en el formato de plancha seleccionado |

### CT-OPT-004 — Múltiples planchas por volumen
| Campo | Detalle |
|-------|---------|
| **P** | Diseño complejo con muchos módulos (> 5), todas del mismo material |
| **Pasos** | 1. Cubicación |
| **Resultado esperado** | ✅ Se generan múltiples planchas (Plancha #1, #2, ...), la suma de utilización es coherente |

### CT-OPT-005 — Multi-material: piezas separadas por material
| Campo | Detalle |
|-------|---------|
| **P** | Material principal = Melamina; fondoMaterialId de un módulo = MDF 9mm |
| **Pasos** | 1. Cubicación |
| **Resultado esperado** | ✅ Dos grupos de planchas separados: uno para Melamina y otro para MDF 9mm |

---

## 8. Cubicación — Tapa Canto y Hardware

### CT-TC-001 — Cálculo de tapa canto
| Campo | Detalle |
|-------|---------|
| **P** | Tapa canto seleccionada, al menos un módulo con bordes frontales |
| **Pasos** | 1. Cubicación → sección "Tapa canto" |
| **Resultado esperado** | ✅ Metros lineales calculados y mostrados; precio total = metros × precio/ml |

### CT-TC-002 — Sin tapa canto seleccionada
| Campo | Detalle |
|-------|---------|
| **P** | Ninguna tapa canto activa |
| **Pasos** | 1. Cubicación |
| **Resultado esperado** | ✅ Sección de tapa canto muestra 0 ml o no aparece; no genera error |

### CT-HW-001 — Cálculo automático de visagras
| Campo | Detalle |
|-------|---------|
| **P** | Módulo con 2 puertas; accesorio "visagra" en la biblioteca seleccionado |
| **Pasos** | 1. Cubicación → sección de accesorios |
| **Resultado esperado** | ✅ Cantidad de visagras = 2 × número estándar por puerta; precio calculado |

### CT-HW-002 — Cálculo automático de correderas
| Campo | Detalle |
|-------|---------|
| **P** | Cajonera con 3 cajones; accesorio "corredera" en biblioteca |
| **Pasos** | 1. Cubicación → sección de accesorios |
| **Resultado esperado** | ✅ Cantidad de correderas = 3 pares (una por cajón) |

### CT-HW-003 — Sin accesorios configurados
| Campo | Detalle |
|-------|---------|
| **P** | Biblioteca de accesorios vacía |
| **Pasos** | 1. Cubicación |
| **Resultado esperado** | ✅ Sección de accesorios vacía o con 0; no genera errores |

---

## 9. Biblioteca — Materiales

### CT-BIB-001 — Crear material nuevo
| Campo | Detalle |
|-------|---------|
| **P** | Usuario autenticado, pestaña "Materiales" activa |
| **Pasos** | 1. Clicar "Nuevo" · 2. Completar: nombre "MDF Blanco 18mm", tipo "MDF", dimensiones "244×183 cm", grosor 18, precio 12000 · 3. Guardar |
| **Resultado esperado** | ✅ Material aparece en el listado con todos sus datos correctos |

### CT-BIB-002 — Crear material sin campos requeridos
| Campo | Detalle |
|-------|---------|
| **Pasos** | 1. Crear material sin "tipo" ni "dimensiones" |
| **Resultado esperado** | ❌ Error de validación, material no se guarda |

### CT-BIB-003 — Seleccionar material activo
| Campo | Detalle |
|-------|---------|
| **P** | Al menos un material en la biblioteca |
| **Pasos** | 1. Clicar "Usar" en un material |
| **Resultado esperado** | ✅ Material queda marcado como activo, la cubicación usa sus dimensiones y precio |

### CT-BIB-004 — Editar material existente
| Campo | Detalle |
|-------|---------|
| **P** | Material "MDF Blanco 18mm" en biblioteca |
| **Pasos** | 1. Clicar "Editar" · 2. Cambiar precio de 12000 a 14500 · 3. Actualizar |
| **Resultado esperado** | ✅ El precio se actualiza en el listado; la cubicación refleja el nuevo precio |

### CT-BIB-005 — Eliminar material
| Campo | Detalle |
|-------|---------|
| **Pasos** | 1. Clicar "Eliminar" en un material · 2. Confirmar |
| **Resultado esperado** | ✅ Material desaparece del listado |

### CT-BIB-006 — Filtrar material por nombre
| Campo | Detalle |
|-------|---------|
| **P** | Varios materiales en lista |
| **Pasos** | 1. Ingresar "MDF" en el buscador |
| **Resultado esperado** | ✅ Solo aparecen materiales cuyo nombre contiene "MDF" |

---

## 10. Biblioteca — Accesorios

### CT-ACC-001 — Crear accesorio corredera
| Campo | Detalle |
|-------|---------|
| **Pasos** | 1. Pestaña "Accesorios" · 2. Nuevo · 3. nombre: "Corredera 45cm", accesorio_tipo: "corredera", precio: 4200 · 4. Guardar |
| **Resultado esperado** | ✅ Accesorio aparece en el listado |

### CT-ACC-002 — Crear accesorio sin tipo
| Campo | Detalle |
|-------|---------|
| **Pasos** | 1. Crear accesorio sin "accesorio_tipo" |
| **Resultado esperado** | ❌ Error de validación, no se guarda |

### CT-ACC-003 — Agregar/quitar accesorio del proyecto
| Campo | Detalle |
|-------|---------|
| **P** | Accesorio "Corredera 45cm" en biblioteca |
| **Pasos** | 1. Clicar "Usar" · 2. Verificar en cubicación que aparece · 3. Clicar "Quitar" |
| **Resultado esperado** | ✅ Accesorio entra y sale del resumen de cubicación |

---

## 11. Biblioteca — Tapa Canto

### CT-TAPA-001 — Crear tapa canto
| Campo | Detalle |
|-------|---------|
| **Pasos** | 1. Pestaña "Tapa canto" · 2. Nuevo · 3. nombre: "Enchape PVC Blanco", precio: 650, color: "Blanco" · 4. Guardar |
| **Resultado esperado** | ✅ Aparece en el listado |

### CT-TAPA-002 — Seleccionar tapa canto activa
| Campo | Detalle |
|-------|---------|
| **Pasos** | 1. Clicar "Usar" en la tapa canto |
| **Resultado esperado** | ✅ La tapa canto queda activa; en cubicación se muestran los metros lineales y precio total |

---

## 12. Biblioteca — Tipos de Cajón

### CT-CAJ-001 — Crear tipo de cajón
| Campo | Detalle |
|-------|---------|
| **P** | Al menos 4 materiales en biblioteca (para laterales, frente interno, trasera, fondo) |
| **Pasos** | 1. Pestaña "Tipo de cajon" · 2. Nuevo · 3. nombre: "Cajón estándar" · 4. Asignar material a cada componente · 5. Guardar |
| **Resultado esperado** | ✅ Tipo de cajón aparece en listado con sus 4 materiales |

### CT-CAJ-002 — Crear tipo de cajón con refuerzo
| Campo | Detalle |
|-------|---------|
| **Pasos** | 1. En formulario de tipo cajón, activar "Lleva refuerzo" · 2. Seleccionar material · 3. Guardar |
| **Resultado esperado** | ✅ En cubicación, cada cajón de ese tipo incluye una pieza de refuerzo adicional |

### CT-CAJ-003 — Descuento de altura en tipo de cajón
| Campo | Detalle |
|-------|---------|
| **P** | Tipo de cajón con heightDiscountPct = 10 |
| **Pasos** | 1. Cajonera de 90 cm alto / 3 cajones (altura teórica por cajón = 30 cm) |
| **Resultado esperado** | ✅ Altura real de piezas del cajón = 30 × 0.9 = 27 cm |

### CT-CAJ-004 — Asignar tipo de cajón a una cajonera
| Campo | Detalle |
|-------|---------|
| **P** | Tipo de cajón creado, cajonera en canvas seleccionada |
| **Pasos** | 1. En panel lateral del módulo, asignar tipo de cajón |
| **Resultado esperado** | ✅ En cubicación, las piezas de cajón usan los materiales del tipo asignado |

### CT-CAJ-005 — Override de tipo por cajón individual
| Campo | Detalle |
|-------|---------|
| **P** | Cajonera con 3 cajones, dos tipos de cajón disponibles |
| **Pasos** | 1. Asignar "Tipo A" como default · 2. Asignar "Tipo B" solo al cajón 2 (override) |
| **Resultado esperado** | ✅ En cubicación, cajones 1 y 3 usan Tipo A; cajón 2 usa Tipo B |

---

## 13. Cotización — Envío por Email

### CT-COT-001 — Envío de cotización exitoso
| Campo | Detalle |
|-------|---------|
| **P** | Material seleccionado, diseño con módulos, accesorios configurados |
| **Pasos** | 1. En "Cubicación", clicar "Enviar cotización" · 2. Completar: nombre_cliente "María Soto", to_email "maria@test.com", nombre_proyecto "Cocina Principal" · 3. Enviar |
| **Resultado esperado** | ✅ Mensaje de éxito en la UI, correo recibido con planchas + imagen + total en CLP |

### CT-COT-002 — Envío sin email destinatario
| Campo | Detalle |
|-------|---------|
| **Pasos** | 1. Intentar enviar con campo "to_email" vacío |
| **Resultado esperado** | ❌ Validación impide el envío |

### CT-COT-003 — Imagen en el correo legible
| Campo | Detalle |
|-------|---------|
| **P** | Diseño con varios módulos, correo enviado |
| **Pasos** | 1. Abrir el correo recibido |
| **Resultado esperado** | ✅ La imagen del canvas se visualiza correctamente (compresión adaptativa < 40KB base64) |

### CT-COT-004 — Fondo oscuro del correo en cliente mobile
| Campo | Detalle |
|-------|---------|
| **P** | Correo recibido |
| **Pasos** | 1. Abrir el correo en Gmail en dispositivo móvil |
| **Resultado esperado** | ✅ El fondo del correo es oscuro (#131313), no se reemplaza por blanco |

### CT-COT-005 — Formato CLP en el correo
| Campo | Detalle |
|-------|---------|
| **P** | Material con precio asignado, diseño calculado |
| **Pasos** | 1. Enviar cotización · 2. Revisar el total en el correo |
| **Resultado esperado** | ✅ El total se muestra con formato CLP: símbolo $, separador de miles con punto, sin decimales (ej: "$ 124.500") |

---

## 14. Exportación PDF (Cotización imprimible)

### CT-PDF-001 — Generar PDF desde cubicación
| Campo | Detalle |
|-------|---------|
| **P** | Diseño con módulos y material seleccionado |
| **Pasos** | 1. En "Cubicación", clicar "Descargar cotización PDF" · 2. El diálogo de impresión del navegador se abre · 3. Guardar como PDF |
| **Resultado esperado** | ✅ El PDF generado muestra: marca Amedida, datos del proyecto, tabla de planchas, accesorios, imagen del diseño, total en CLP |

### CT-PDF-002 — Formato de impresión oculta la UI de la app
| Campo | Detalle |
|-------|---------|
| **Pasos** | 1. Activar "Vista previa de impresión" del navegador |
| **Resultado esperado** | ✅ Solo se ve el bloque de cotización (`.cubicacion-print`), no el canvas, toolbar ni biblioteca |

### CT-PDF-003 — PDF con fondo blanco
| Campo | Detalle |
|-------|---------|
| **Pasos** | 1. Generar PDF · 2. Revisar colores |
| **Resultado esperado** | ✅ El PDF tiene fondo blanco y texto oscuro (legible para imprimir) |

---

## 15. Responsive / Mobile

### CT-MOB-001 — Canvas funcional en pantalla mobile
| Campo | Detalle |
|-------|---------|
| **P** | Dispositivo o viewport ≤ 600px |
| **Pasos** | 1. Abrir la app en mobile · 2. Agregar un módulo |
| **Resultado esperado** | ✅ El canvas es usable, los módulos aparecen y son manipulables mediante touch |

### CT-MOB-002 — Colocar módulo interno con tap en mobile
| Campo | Detalle |
|-------|---------|
| **P** | Modular en canvas, "Estante" seleccionado, dispositivo táctil |
| **Pasos** | 1. Tocar dentro del modular |
| **Resultado esperado** | ✅ El estante se coloca dentro del modular (umbral de snap ampliado a 30/65px en mobile) |

### CT-MOB-003 — Cubicación legible en mobile
| Campo | Detalle |
|-------|---------|
| **Pasos** | 1. Ir a "Cubicación" desde mobile |
| **Resultado esperado** | ✅ Las tablas y visualización de planchas no tienen overflow horizontal; texto legible |

---

## 16. Seguridad y API

### CT-SEC-001 — Endpoint protegido sin token
| Campo | Detalle |
|-------|---------|
| **Pasos** | 1. Llamar a `GET /api/furniture` sin header de autorización |
| **Resultado esperado** | ❌ HTTP 401, mensaje de no autorizado |

### CT-SEC-002 — Rate limiting en login
| Campo | Detalle |
|-------|---------|
| **Pasos** | 1. Intentar login con credenciales incorrectas 10+ veces seguidas en < 15 minutos |
| **Resultado esperado** | ❌ HTTP 429 (Too Many Requests) bloqueando intentos adicionales |

### CT-SEC-003 — NoSQL injection en login
| Campo | Detalle |
|-------|---------|
| **Pasos** | 1. Login con email: `{ "$gt": "" }` |
| **Resultado esperado** | ❌ Sanitización bloquea el intento, HTTP 400 o 401, no bypasea auth |

### CT-SEC-004 — Health check del API
| Campo | Detalle |
|-------|---------|
| **Pasos** | 1. Llamar a `GET /api/health` |
| **Resultado esperado** | ✅ HTTP 200, respuesta con status, environment y timestamp |

---

## Resumen de Cobertura

| Módulo | Casos |
|--------|-------|
| Autenticación | 10 |
| Gestión de Diseños | 7 |
| Módulos del Canvas | 13 |
| Módulos Internos | 5 |
| Snap y Colisión | 2 |
| Cubicación — Piezas | 7 |
| Cubicación — Tableros | 5 |
| Cubicación — Hardware/TC | 5 |
| Biblioteca — Materiales | 6 |
| Biblioteca — Accesorios | 3 |
| Biblioteca — Tapa Canto | 2 |
| Biblioteca — Tipo Cajón | 5 |
| Cotización Email | 5 |
| PDF Export | 3 |
| Mobile | 3 |
| Seguridad API | 4 |
| **Total** | **85** |

---

## ⚠️ Funcionalidades Faltantes según el Informe

Se identificaron los siguientes requerimientos documentados en el informe de tesis que **no están implementados** en el código actual:

### 1. HU16 / HU17 — Módulo de Estadísticas *(prioridad: Could Have)*
> El informe describe un módulo donde el mueblista puede consultar estadísticas históricas: número de cotizaciones por período, materiales más usados, demanda por tipo de mueble.

**Estado actual:** No existe ningún endpoint de estadísticas en el backend (`/api/stats` o similar), ni componente frontend para mostrar gráficos o resúmenes.

**Impacto:** Las historias de usuario HU16 (*"ver estadísticas de proyectos"*) y HU17 (*"filtrar estadísticas por período"*) no pueden ser evaluadas.

### 2. Modelo `Cotizacion` — Sin rutas ni UI *(prioridad: Should Have)*
> El esquema de base de datos incluye un modelo `Cotizacion` con campos `estado`, `precio_total`, `lista_cortes`, y `materiales_resumen`, lo que sugiere que se planificó persistir cotizaciones en la BD.

**Estado actual:** El modelo existe en el código pero no hay endpoints (`/api/cotizaciones`), ni la UI guarda las cotizaciones generadas. Cada cotización se calcula en el cliente y se envía por email sin persistencia.

**Impacto:** No es posible recuperar el historial de cotizaciones enviadas, ni listar cotizaciones por estado.

---

*Las dos funcionalidades faltantes corresponden a historias "Could Have" y "Should Have" en el backlog del informe. Todo el resto del alcance funcional documentado está implementado.*
