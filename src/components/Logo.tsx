import { useId } from 'react'

/**
 * El logo de VinyList: la funda cuadrada con el disco saliendo, y el nombre.
 * Los colores salen de las variables --logo-*; en modo oscuro solo cambian la sombra y el canto claro del disco.
 * `size` es la altura del símbolo en píxeles; el nombre se escala con él.
 */
export function Logo({ size = 24, wordmark = true, className = '' }: { size?: number; wordmark?: boolean; className?: string }) {
  const clip = useId()
  return (
    <span className={`logo ${className}`.trim()} style={{ fontSize: size }} role="img" aria-label="VinyList">
      <svg className="logo__sym" viewBox="0 0 144 100" aria-hidden="true">
        <defs>
          <clipPath id={clip}><rect x="0" y="0" width="100" height="100" rx="2.5" /></clipPath>
        </defs>
        <rect x="0" y="0" width="100" height="100" rx="2.5" fill="var(--logo-funda)" />
        <rect x="0" y="0" width="2.2" height="100" rx="1" fill="#000" fillOpacity="0.16" />
        <rect x="97.6" y="0" width="2.4" height="100" fill="var(--logo-boca)" />
        <g clipPath={`url(#${clip})`}><circle cx="97.6" cy="52.6" r="48" fill="var(--logo-sombra)" /></g>
        {/* El disco, con el detalle justo para verse como vinilo en chico. */}
        <g transform="translate(47.2 2) scale(0.96)">
          <circle cx="50" cy="50" r="50" fill="var(--logo-disco)" />
          <circle cx="50" cy="50" r="47.9" fill="none" strokeWidth="4.2" stroke="var(--logo-borde)" />
          <path d="M17.16 41.2 A34 34 0 0 1 41.2 17.16" fill="none" strokeWidth="4.2" strokeOpacity="0.6" strokeLinecap="round" stroke="var(--logo-surco)" />
          <path d="M82.84 58.8 A34 34 0 0 1 58.8 82.84" fill="none" strokeWidth="4.2" strokeOpacity="0.6" strokeLinecap="round" stroke="var(--logo-surco)" />
          <circle cx="50" cy="50" r="17" fill="var(--logo-etiqueta)" />
          <circle cx="50" cy="50" r="2.9" fill="var(--logo-agujero)" />
        </g>
      </svg>
      {wordmark && <span className="logo__wm">VinyList</span>}
    </span>
  )
}
