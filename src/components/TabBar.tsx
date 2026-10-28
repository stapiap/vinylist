import { NavLink } from 'react-router-dom'
import { GridIcon, HeartIcon, ScanIcon, SearchIcon, SparkIcon } from './Icons'

export function TabBar() {
  return (
    <nav className="tabbar" aria-label="Principal">
      <NavLink to="/" end><GridIcon />Colección</NavLink>
      <NavLink to="/buscar"><SearchIcon />Buscar</NavLink>
      <NavLink to="/escanear" className="scan"><span className="scan__disc"><ScanIcon width={26} height={26} strokeWidth={2.2} /></span>Escanear</NavLink>
      <NavLink to="/para-ti"><SparkIcon />Para ti</NavLink>
      <NavLink to="/deseos"><HeartIcon />Deseos</NavLink>
    </nav>
  )
}
