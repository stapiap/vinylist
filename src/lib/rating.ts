/**
 * Las calificaciones se guardan como enteros de 1 a 10
 * y se muestran como 0.5 a 5 estrellas.
 */
export function toStars(rating?: number): number {
  if (!rating) return 0
  return Math.min(10, Math.max(1, Math.round(rating))) / 2
}

export function fromStars(stars: number): number {
  return Math.min(10, Math.max(1, Math.round(stars * 2)))
}

export function formatStars(rating?: number): string {
  if (!rating) return 'Sin calificar'
  const s = toStars(rating)
  return Number.isInteger(s) ? `${s}` : s.toFixed(1)
}

/** Cómo pintar la estrella i (1..5): llena, media o vacía. */
export function starFill(rating: number | undefined, i: number): 'full' | 'half' | 'empty' {
  const r = rating ?? 0
  if (r >= i * 2) return 'full'
  if (r === i * 2 - 1) return 'half'
  return 'empty'
}
