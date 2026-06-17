import { jsPDF } from 'jspdf'

const clp = (n) => `$ ${Math.round(n).toLocaleString('es-CL')}`
const fmt = (d) => new Date(d).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })
const slug = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '').toLowerCase()

const C = {
  black:     [17,  17,  17],
  white:     [255, 255, 255],
  blue:      [69,  134, 218],   // #4586da — matches print CSS
  grey:      [102, 102, 102],   // #666
  greyMid:   [68,  68,  68],    // #444
  greyLight: [224, 224, 224],   // #e0e0e0
  greyBg:    [248, 248, 248],   // #f8f8f8
  tableHdr:  [238, 240, 243],
  green:     [39,  174, 96],
  orange:    [230, 126, 34],
}

const ESTADO_COLOR = {
  'Pendiente':  C.orange,
  'En Proceso': C.blue,
  'Completado': C.green,
}

function setFill(doc, rgb)   { doc.setFillColor(...rgb) }
function setStroke(doc, rgb) { doc.setDrawColor(...rgb) }
function setFont(doc, rgb)   { doc.setTextColor(...rgb) }

function resolverMueblista(mueblista) {
  if (!mueblista) return { nombre: 'Mueblista', email: null }
  if (typeof mueblista === 'string') return { nombre: mueblista, email: null }
  return { nombre: mueblista.nombre || 'Mueblista', email: mueblista.email || null }
}

// Logo de 4 cuadrados igual al SVG del print
function drawLogo(doc, x, y, size = 5, gap = 1.5) {
  const r = 0.8
  // Top-left: relleno azul
  setFill(doc, C.blue)
  doc.setLineWidth(0)
  doc.roundedRect(x, y, size, size, r, r, 'F')
  // Top-right: borde oscuro
  setFill(doc, C.white)
  setStroke(doc, [17, 17, 17])
  doc.setLineWidth(0.35)
  doc.roundedRect(x + size + gap, y, size, size, r, r, 'D')
  // Bottom-left: borde oscuro
  doc.roundedRect(x, y + size + gap, size, size, r, r, 'D')
  // Bottom-right: borde gris claro
  setStroke(doc, [200, 200, 200])
  doc.roundedRect(x + size + gap, y + size + gap, size, size, r, r, 'D')
}

function buildDoc(cotizacion, mueblista) {
  const { nombre: nombreMueblista, email: emailMueblista } = resolverMueblista(mueblista)
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = 210
  const margin = 18
  const contentW = W - margin * 2
  let y = 0

  // ── HEADER ──────────────────────────────────────────────
  const logoX = margin
  const logoY = 20

  drawLogo(doc, logoX, logoY)

  // "Amedida" junto al logo
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  setFont(doc, C.black)
  doc.text('Amedida', logoX + 14, logoY + 7.5)

  // Nombre del mueblista
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  setFont(doc, [51, 51, 51])
  doc.text(nombreMueblista, logoX + 14, logoY + 14)

  // Email del mueblista
  if (emailMueblista) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    setFont(doc, C.grey)
    doc.text(emailMueblista, logoX + 14, logoY + 19.5)
  }

  // Meta derecha: título + fecha + estado
  const fechaDoc = fmt(cotizacion.createdAt || new Date())
  const estadoColor = ESTADO_COLOR[cotizacion.estado] || C.grey

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  setFont(doc, C.black)
  doc.text('Cotización de proyecto', W - margin, logoY + 4, { align: 'right' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  setFont(doc, C.grey)
  doc.text(`Fecha: ${fechaDoc}`, W - margin, logoY + 10, { align: 'right' })

  // Badge de estado
  const badgeW = 30
  const badgeH = 6
  setFill(doc, estadoColor)
  doc.setLineWidth(0)
  doc.roundedRect(W - margin - badgeW, logoY + 14, badgeW, badgeH, 1.5, 1.5, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  setFont(doc, C.white)
  doc.text(cotizacion.estado.toUpperCase(), W - margin - badgeW / 2, logoY + 17.8, { align: 'center' })

  // Línea divisora gruesa — igual al border-bottom: 2px solid #111 del print
  setStroke(doc, C.black)
  doc.setLineWidth(0.6)
  doc.line(margin, logoY + 25, W - margin, logoY + 25)

  y = logoY + 34

  // ── PARA / DE ────────────────────────────────────────────
  const col2x = margin + contentW / 2 + 4

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  setFont(doc, C.grey)
  doc.text('PARA', margin, y)
  doc.text('DE', col2x, y)

  y += 5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  setFont(doc, C.black)
  doc.text(cotizacion.nombre_cliente || 'Sin especificar', margin, y)
  doc.text(nombreMueblista, col2x, y)

  const hasAnyEmail = cotizacion.email_cliente || emailMueblista
  if (hasAnyEmail) {
    y += 5
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    setFont(doc, C.grey)
    if (cotizacion.email_cliente) doc.text(cotizacion.email_cliente, margin, y)
    if (emailMueblista)           doc.text(emailMueblista, col2x, y)
  }

  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  setFont(doc, C.grey)
  doc.text(`Proyecto: ${cotizacion.mueble_id?.nombre || 'Sin nombre'}`, margin, y)

  y += 13

  // ── MATERIALES ───────────────────────────────────────────
  if (cotizacion.materiales_resumen?.length > 0) {
    y = sectionTitle(doc, 'Materiales', y, margin, contentW)
    const cols = [
      { label: 'Material',  x: margin,                   w: contentW * 0.55, align: 'left'  },
      { label: 'Planchas',  x: margin + contentW * 0.55, w: contentW * 0.2,  align: 'right' },
      { label: 'Subtotal',  x: margin + contentW * 0.75, w: contentW * 0.25, align: 'right' },
    ]
    y = tableHeader(doc, cols, y, margin, contentW)
    cotizacion.materiales_resumen.forEach((m, i) => {
      if (y > 260) { doc.addPage(); y = 20 }
      if (i % 2 !== 0) {
        setFill(doc, C.greyBg)
        doc.rect(margin, y - 4, contentW, 7, 'F')
      }
      setStroke(doc, C.greyLight)
      doc.setLineWidth(0.15)
      doc.line(margin, y + 3, W - margin, y + 3)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      setFont(doc, C.black)
      doc.text(m.nombre || '', cols[0].x, y, { maxWidth: cols[0].w - 2 })
      doc.text(String(m.cantidad_planchas ?? ''), cols[1].x + cols[1].w, y, { align: 'right' })
      doc.text(clp(m.subtotal ?? 0), cols[2].x + cols[2].w, y, { align: 'right' })
      y += 7
    })
    y += 7
  }

  // ── LISTA DE CORTES ─────────────────────────────────────
  if (cotizacion.lista_cortes?.length > 0) {
    y = sectionTitle(doc, 'Lista de cortes', y, margin, contentW)
    const cols = [
      { label: 'Material',  x: margin,                   w: contentW * 0.5,  align: 'left'  },
      { label: 'Dimensión', x: margin + contentW * 0.5,  w: contentW * 0.35, align: 'left'  },
      { label: 'Cant.',     x: margin + contentW * 0.85, w: contentW * 0.15, align: 'right' },
    ]
    y = tableHeader(doc, cols, y, margin, contentW)
    cotizacion.lista_cortes.forEach((c, i) => {
      if (y > 260) { doc.addPage(); y = 20 }
      if (i % 2 !== 0) {
        setFill(doc, C.greyBg)
        doc.rect(margin, y - 4, contentW, 7, 'F')
      }
      setStroke(doc, C.greyLight)
      doc.setLineWidth(0.15)
      doc.line(margin, y + 3, W - margin, y + 3)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      setFont(doc, C.black)
      doc.text(c.material || '', cols[0].x, y, { maxWidth: cols[0].w - 2 })
      doc.text(c.dimension || '', cols[1].x, y, { maxWidth: cols[1].w - 2 })
      doc.text(String(c.cantidad ?? ''), cols[2].x + cols[2].w, y, { align: 'right' })
      y += 7
    })
    y += 7
  }

  // ── TOTAL ────────────────────────────────────────────────
  if (cotizacion.precio_total > 0) {
    if (y > 260) { doc.addPage(); y = 20 }

    // Línea gruesa superior — igual a border-top: 2px solid #111 del print
    setStroke(doc, C.black)
    doc.setLineWidth(0.6)
    doc.line(margin, y, W - margin, y)

    y += 9

    // Etiqueta izquierda en uppercase pequeño — igual a .print-total span
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    setFont(doc, C.greyMid)
    doc.text('TOTAL ESTIMADO DEL PROYECTO', margin, y)

    // Precio grande en azul a la derecha — igual a .print-total strong
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    setFont(doc, C.blue)
    doc.text(clp(cotizacion.precio_total), W - margin, y + 1.5, { align: 'right' })

    y += 16
  }

  // ── FOOTER ───────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages()
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p)
    // Línea gris fina — igual a border-top: 1px solid #eee del print-footer
    setStroke(doc, [238, 238, 238])
    doc.setLineWidth(0.3)
    doc.line(margin, 284, W - margin, 284)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    setFont(doc, [170, 170, 170])
    doc.text('Cotización válida 15 días · Amedida — precisión artesanal, velocidad digital', W / 2, 289, { align: 'center' })
    doc.text(`Página ${p} de ${pageCount}`, W - margin, 289, { align: 'right' })
  }

  const clienteSlug = slug(cotizacion.nombre_cliente || 'cliente')
  const muebleSlug  = slug(cotizacion.mueble_id?.nombre || 'diseno')
  return { doc, filename: `cotizacion_${muebleSlug}_${clienteSlug}.pdf` }
}

// ── exports ──────────────────────────────────────────────

export function generarPDFCotizacion(cotizacion, mueblista) {
  const { doc, filename } = buildDoc(cotizacion, mueblista)
  doc.save(filename)
}

export function generarPDFBase64(cotizacion, mueblista) {
  const { doc, filename } = buildDoc(cotizacion, mueblista)
  return { dataUri: doc.output('datauristring'), filename }
}

// ── helpers ──────────────────────────────────────────────

function sectionTitle(doc, text, y, margin, contentW) {
  // Uppercase pequeño en gris + línea fina — igual a .print-section h2
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  setFont(doc, C.grey)
  doc.text(text.toUpperCase(), margin, y)
  setStroke(doc, C.greyLight)
  doc.setLineWidth(0.3)
  doc.line(margin, y + 2.5, margin + contentW, y + 2.5)
  return y + 9
}

function tableHeader(doc, cols, y, margin, contentW) {
  // Header gris claro con texto oscuro — coherente con el tema light
  setFill(doc, C.tableHdr)
  doc.rect(margin, y - 4, contentW, 7, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  setFont(doc, [40, 40, 45])
  cols.forEach(col => {
    const x = col.align === 'right' ? col.x + col.w : col.x
    doc.text(col.label, x, y, { align: col.align })
  })
  return y + 7
}
