/** Quita acentos y mayúsculas para comparar o buscar. */
export function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

/** Discogs agrega "(2)" a artistas con nombre repetido. */
export function cleanArtist(name: string): string {
  return name.replace(/\s\(\d+\)$/, '').trim()
}

/** Llave estable para saber si dos álbumes son "el mismo" (sin edición). */
export function albumKey(artist: string, title: string): string {
  return `${normalize(cleanArtist(artist))}|${normalize(title).replace(/\s*[([].*?[)\]]\s*$/, '')}`
}

export function artistKey(artist: string): string {
  return normalize(cleanArtist(artist))
}

export function isVariousArtists(artist: string): boolean {
  return /^(various( artists)?|varios( artistas| int[eé]rpretes)?|va|v\/a|unknown artist)$/i.test(cleanArtist(artist).trim())
}

/** Géneros de Discogs (en inglés) con nombre en español. */
const TAG_ES: Record<string, string> = {
  electronic: 'Electrónica',
  classical: 'Clásica',
  latin: 'Música latina',
  'funk / soul': 'Funk y soul',
  'folk, world, & country': 'Folk y música del mundo',
  'stage & screen': 'Cine y teatro',
  "children's": 'Infantil',
  'non-music': 'No musical',
  'brass & military': 'Bandas',
  'hip hop': 'Hip hop',
  'hip-hop': 'Hip hop',
}

/** Nombre para mostrar de un género o estilo (MusicBrainz los manda en minúsculas). */
export function tagLabel(raw: string): string {
  const es = TAG_ES[normalize(raw)]
  if (es) return es
  return raw === raw.toLowerCase() ? raw.replace(/(^|[\s/-])\p{L}/gu, (m) => m.toUpperCase()) : raw
}

/** "años 70", "años 2010". */
export function decadeLabel(decade: number): string {
  return `años ${decade >= 2000 ? decade : String(decade).slice(2)}`
}

/** Recopilaciones y discos en vivo valen menos como sugerencia de "siguiente disco". */
export function looksLikeCompilation(title: string): boolean {
  return /(greatest hits|best of|very best|anthology|collection|grandes [eé]xitos|lo mejor de|live at|en vivo|in concert|box set)/i.test(title)
}
