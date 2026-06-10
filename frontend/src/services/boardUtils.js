import { BOARD_CONFIGS } from './cubicacion'

/**
 * Devuelve la config de plancha a usar según el material seleccionado.
 * Lee material.dimensiones (ej. "250x183cm", "183×250") y usa el mayor
 * valor como ancho y el menor como alto.
 * Si el campo está vacío o no parsea, cae en melamina estándar (250×183).
 */
export function parseBoardConfig(material) {
  if (material?.dimensiones) {
    const match = material.dimensiones.match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/i)
    if (match) {
      const a = parseFloat(match[1]), b = parseFloat(match[2])
      return {
        width:  Math.max(a, b),
        height: Math.min(a, b),
        name:   material.nombre || 'Material',
        kerf:   BOARD_CONFIGS.melamina.kerf,
      }
    }
  }
  return BOARD_CONFIGS.melamina
}

/**
 * Retorna advertencias cuando las dimensiones del shape superan
 * los límites de la plancha (con o sin rotación).
 */
export function getDimensionWarnings(shape, boardConfig) {
  if (!shape) return []
  const { width: bw, height: bh } = boardConfig
  const long  = Math.max(bw, bh)
  const short = Math.min(bw, bh)
  const w = Number(shape.width)  || 0
  const h = Number(shape.height) || 0
  const d = Number(shape.depth)  || 0
  const warnings = []

  if (w > long)
    warnings.push(`Ancho ${w} cm supera el largo de plancha (${long} cm)`)
  if (h > long)
    warnings.push(`Alto ${h} cm supera el largo de plancha (${long} cm)`)
  if (d > long)
    warnings.push(`Profundidad ${d} cm supera el largo de plancha (${long} cm)`)
  if (d > 0 && h > 0 && Math.min(d, h) > short)
    warnings.push(`Laterales ${d}×${h} cm: ambas dimensiones superan ${short} cm, la pieza no cabe en la plancha`)
  if (w > 0 && d > 0 && Math.min(w, d) > short)
    warnings.push(`Fondo ${w}×${d} cm: ambas dimensiones superan ${short} cm, la pieza no cabe en la plancha`)

  return warnings
}
