import { NavLink } from 'react-router-dom'
import { GridIcon, HeartIcon, ScanIcon, SearchIcon } from './Icons'

export function TabBar() {
  return (
    <nav className="tabbar" aria-label="Principal">
      <NavLink to="/" end><GridIcon />Colección</NavLink>
      <NavLink to="/buscar"><SearchIcon />Buscar</NavLink>
      <NavLink to="/escanear" className="scan" aria-label="Escanear disco"><ScanIcon width={28} height={28} strokeWidth={2.2} /></NavLink>
      <NavLink to="/deseos"><HeartIcon />Deseos</NavLink>
    </nav>
  )
}
