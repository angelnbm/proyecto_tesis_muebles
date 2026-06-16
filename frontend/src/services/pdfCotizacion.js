import { jsPDF } from 'jspdf'

const clp = (n) => `$ ${Math.round(n).toLocaleString('es-CL')}`
const fmt = (d) => new Date(d).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })

// Colores en RGB
const C = {
  black:      [15,  15,  20],
  white:      [255, 255, 255],
  blue:       [59,  130, 246],
  blueDark:   [37,  99,  235],
  grey:       [100, 110, 120],
  greyLight:  [220, 225, 230],
  greyBg:     [245, 247, 249],
  red:        [192, 57,  43],
  green:      [39,  174, 96],
  orange:     [230, 126, 34],
}

const ESTADO_COLOR = {
  'Pendiente':   C.orange,
  'En Proceso':  C.blue,
  'Completado':  C.green,
}

function setFill(doc, rgb)   { doc.setFillColor(...rgb) }
function setStroke(doc, rgb) { doc.setDrawColor(...rgb) }
function setFont(doc, rgb)   { doc.setTextColor(...rgb) }

export function generarPDFCotizacion(cotizacion, nombreMueblista) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = 210
  const margin = 18
  const contentW = W - margin * 2
  let y = 0

  // ── HEADER ──────────────────────────────────────────────
  setFill(doc, C.black)
  doc.rect(0, 0, W, 38, 'F')

  // Logotipo / nombre app
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  setFont(doc, C.white)
  doc.text('Amedida', margin, 17)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  setFont(doc, [160, 170, 180])
  doc.text('Presupuesto de muebles artesanales', margin, 23)

  // Número y fecha (derecha)
  const fechaDoc = fmt(cotizacion.createdAt || new Date())
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  setFont(doc, C.white)
  doc.text('COTIZACIÓN', W - margin, 14, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  setFont(doc, [160, 170, 180])
  doc.text(fechaDoc, W - margin, 20, { align: 'right' })

  // Estado badge
  const estadoColor = ESTADO_COLOR[cotizacion.estado] || C.grey
  setFill(doc, estadoColor)
  doc.roundedRect(W - margin - 32, 25, 32, 8, 2, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  setFont(doc, C.white)
  doc.text(cotizacion.estado.toUpperCase(), W - margin - 16, 30.5, { align: 'center' })

  y = 50

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
  const clienteNombre = cotizacion.nombre_cliente || 'Sin especificar'
  doc.text(clienteNombre, margin, y)
  doc.text(nombreMueblista || 'Mueblista', col2x, y)

  if (cotizacion.email_cliente) {
    y += 5
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    setFont(doc, C.grey)
    doc.text(cotizacion.email_cliente, margin, y)
  }

  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  setFont(doc, C.grey)
  const nombreMueble = cotizacion.mueble_id?.nombre || 'Sin nombre'
  doc.text(`Proyecto: ${nombreMueble}`, margin, y)

  y += 10

  // ── MATERIALES ───────────────────────────────────────────
  if (cotizacion.materiales_resumen?.length > 0) {
    y = sectionTitle(doc, 'MATERIALES', y, margin, contentW)

    const cols = [
      { label: 'Material',   x: margin,              w: contentW * 0.55, align: 'left' },
      { label: 'Planchas',   x: margin + contentW * 0.55, w: contentW * 0.2, align: 'right' },
      { label: 'Subtotal',   x: margin + contentW * 0.75, w: contentW * 0.25, align: 'right' },
    ]

    y = tableHeader(doc, cols, y, margin, contentW)

    cotizacion.materiales_resumen.forEach((m, i) => {
      if (y > 260) { doc.addPage(); y = 20 }
      if (i % 2 === 0) {
        setFill(doc, C.greyBg)
        doc.rect(margin, y - 4, contentW, 7, 'F')
      }
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      setFont(doc, C.black)
      doc.text(m.nombre || '', cols[0].x, y, { maxWidth: cols[0].w - 2 })
      doc.text(String(m.cantidad_planchas ?? ''), cols[1].x + cols[1].w, y, { align: 'right' })
      doc.text(clp(m.subtotal ?? 0), cols[2].x + cols[2].w, y, { align: 'right' })
      y += 7
    })
    y += 4
  }

  // ── LISTA DE CORTES ─────────────────────────────────────
  if (cotizacion.lista_cortes?.length > 0) {
    y = sectionTitle(doc, 'LISTA DE CORTES', y, margin, contentW)

    const cols = [
      { label: 'Material',   x: margin,              w: contentW * 0.5,  align: 'left' },
      { label: 'Dimensión',  x: margin + contentW * 0.5,  w: contentW * 0.35, align: 'left' },
      { label: 'Cant.',      x: margin + contentW * 0.85, w: contentW * 0.15, align: 'right' },
    ]

    y = tableHeader(doc, cols, y, margin, contentW)

    cotizacion.lista_cortes.forEach((c, i) => {
      if (y > 260) { doc.addPage(); y = 20 }
      if (i % 2 === 0) {
        setFill(doc, C.greyBg)
        doc.rect(margin, y - 4, contentW, 7, 'F')
      }
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      setFont(doc, C.black)
      doc.text(c.material || '', cols[0].x, y, { maxWidth: cols[0].w - 2 })
      doc.text(c.dimension || '', cols[1].x, y, { maxWidth: cols[1].w - 2 })
      doc.text(String(c.cantidad ?? ''), cols[2].x + cols[2].w, y, { align: 'right' })
      y += 7
    })
    y += 4
  }

  // ── TOTAL ────────────────────────────────────────────────
  if (cotizacion.precio_total > 0) {
    if (y > 255) { doc.addPage(); y = 20 }
    setFill(doc, C.black)
    doc.rect(margin, y, contentW, 12, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    setFont(doc, [160, 170, 180])
    doc.text('TOTAL ESTIMADO', margin + 4, y + 7.5)
    doc.setFontSize(12)
    setFont(doc, C.white)
    doc.text(clp(cotizacion.precio_total), W - margin - 4, y + 7.5, { align: 'right' })
    y += 20
  }

  // ── FOOTER ───────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages()
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p)
    setStroke(doc, C.greyLight)
    doc.setLineWidth(0.3)
    doc.line(margin, 284, W - margin, 284)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    setFont(doc, C.grey)
    doc.text('Generado con Amedida', margin, 289)
    doc.text(`Página ${p} de ${pageCount}`, W - margin, 289, { align: 'right' })
  }

  // Nombre del archivo
  const clienteSlug = (cotizacion.nombre_cliente || 'cliente').replace(/\s+/g, '_').toLowerCase()
  const muebleSlug  = (cotizacion.mueble_id?.nombre || 'diseno').replace(/\s+/g, '_').toLowerCase()
  doc.save(`cotizacion_${muebleSlug}_${clienteSlug}.pdf`)
}

// ── helpers ──────────────────────────────────────────────

function sectionTitle(doc, text, y, margin, contentW) {
  setFill(doc, [59, 130, 246])
  doc.rect(margin, y, contentW, 0.8, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  setFont(doc, [59, 130, 246])
  doc.text(text, margin, y - 2)
  return y + 7
}

function tableHeader(doc, cols, y, margin, contentW) {
  setFill(doc, [30, 35, 45])
  doc.rect(margin, y - 4, contentW, 7, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  setFont(doc, [180, 190, 200])
  cols.forEach(col => {
    const x = col.align === 'right' ? col.x + col.w : col.x
    doc.text(col.label, x, y, { align: col.align })
  })
  return y + 7
}
