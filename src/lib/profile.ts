/** Nombre de quien usa este celular, hasta que exista inicio de sesión con la nube. */
const KEY = 'vinylist.profileName'

export function getProfileName(): string {
  try {
    return localStorage.getItem(KEY) || 'Yo'
  } catch {
    return 'Yo'
  }
}

export function setProfileName(name: string): void {
  try {
    localStorage.setItem(KEY, name.trim() || 'Yo')
  } catch {
    // Sin almacenamiento disponible; se queda en memoria.
  }
}
