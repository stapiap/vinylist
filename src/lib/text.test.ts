import { describe, expect, it } from 'vitest'
import { albumKey, decadeLabel, isVariousArtists, looksLikeCompilation, tagLabel } from './text'

describe('texto', () => {
  it('la llave de un álbum ignora la edición entre paréntesis y los acentos', () => {
    expect(albumKey('Fleetwood Mac', 'Rumours (2011 Remaster)')).toBe(albumKey('Fleetwood Mac (2)', 'Rumours'))
    expect(albumKey('Café Tacvba', 'Avalancha de Éxitos')).toBe('cafe tacvba|avalancha de exitos')
    expect(albumKey('Oasis', "(What's the Story) Morning Glory?")).not.toBe('oasis|')
  })
  it('reconoce todas las formas de "varios artistas"', () => {
    for (const v of ['Various', 'Various Artists', 'Varios', 'Varios Artistas', 'V/A', 'VA', 'Unknown Artist']) expect(isVariousArtists(v)).toBe(true)
    expect(isVariousArtists('Various Lights')).toBe(false)
  })
  it('muestra géneros en español y estilos de MusicBrainz con mayúsculas', () => {
    expect(tagLabel('Electronic')).toBe('Electrónica')
    expect(tagLabel('Folk, World, & Country')).toBe('Folk y música del mundo')
    expect(tagLabel('soft rock')).toBe('Soft Rock')
    expect(tagLabel('rock en español')).toBe('Rock En Español')
    expect(tagLabel('Soft Rock')).toBe('Soft Rock')
  })
  it('nombra las décadas sin anglicismos', () => {
    expect(decadeLabel(1970)).toBe('años 70')
    expect(decadeLabel(2010)).toBe('años 2010')
  })
  it('detecta recopilaciones por el título', () => {
    expect(looksLikeCompilation('Greatest Hits')).toBe(true)
    expect(looksLikeCompilation('Lo mejor de Juan Gabriel')).toBe(true)
    expect(looksLikeCompilation('Tusk')).toBe(false)
  })
})
