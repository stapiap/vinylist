import { StarPath } from './Icons'
import { starFill } from '../lib/rating'

interface Props {
  /** 1 a 10, o undefined. */
  value?: number
  onChange?: (rating: number | undefined) => void
  size?: 'sm' | 'md'
}

/**
 * Cinco estrellas con medias. Tocar la mitad izquierda de una estrella da media
 * estrella; la derecha, la estrella completa. Tocar de nuevo la misma calificación la quita.
 */
export function StarRating({ value, onChange, size = 'md' }: Props) {
  const interactive = Boolean(onChange)
  const px = size === 'sm' ? 16 : 40
  const pick = (r: number) => onChange?.(value === r ? undefined : r)
  return (
    <div className={`stars ${size === 'sm' ? 'stars--sm' : ''}`} role={interactive ? 'group' : undefined} aria-label={interactive ? 'Calificación' : undefined}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = starFill(value, i)
        const width = fill === 'full' ? '100%' : fill === 'half' ? '50%' : '0%'
        return (
          <div className="star" key={i}>
            <svg width={px} height={px} viewBox="0 0 24 24" fill="none" stroke="#6B6157" strokeWidth={1.5} strokeLinejoin="round" aria-hidden="true"><StarPath /></svg>
            <div className="star__fill" style={{ width }}>
              <svg width={px} height={px} viewBox="0 0 24 24" fill="var(--accent)" stroke="var(--accent)" strokeWidth={1.5} strokeLinejoin="round" aria-hidden="true"><StarPath /></svg>
            </div>
            {interactive && (
              <>
                <button type="button" aria-label={`${i - 0.5} estrellas`} aria-pressed={value === i * 2 - 1} onClick={() => pick(i * 2 - 1)} />
                <button type="button" aria-label={`${i} estrellas`} aria-pressed={value === i * 2} onClick={() => pick(i * 2)} />
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
