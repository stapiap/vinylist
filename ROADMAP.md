# Versiones de Surcos

## v0.1 · Primera versión (esta)
- [x] Escanear código de barras con la cámara, o escribirlo a mano.
- [x] Buscar por artista, título o número de catálogo (discos sin código).
- [x] Datos y portada de Discogs, con MusicBrainz y Cover Art Archive de respaldo.
- [x] Elegir la edición exacta cuando un código tiene varias.
- [x] Aviso de "ya lo tienen" al escanear.
- [x] Calificación de 5 estrellas con medias estrellas.
- [x] Buscar y filtrar por género, década, calificación; ordenar por artista, título, año.
- [x] Ficha del álbum: canciones, estado del disco y la funda, ubicación, compra, notas.
- [x] Lista de deseos (por ahora en este celular).
- [x] Funciona sin internet (PWA, portadas guardadas).
- [x] Respaldo y restauración en archivo.
- [x] "Escuchar en Spotify" en la ficha, en deseos y en resultados: abre la app de Spotify, sin cuenta ni clave; el enlace es exacto cuando MusicBrainz conoce el álbum y, si no, una búsqueda.
- [x] "Para ti": sugerencias según calificaciones y compras, con la razón de cada una (más discos de tus favoritos, artistas parecidos vía ListenBrainz). Se calcula en el celular, sin cuenta, y se guarda 30 días.

## v0.2 · La nube familiar
- [ ] Inicio de sesión (correo con enlace mágico) y grupo familiar con invitación.
- [ ] Sincronización con Supabase: una colección compartida, varios celulares.
- [ ] Calificación de cada familiar y promedio familiar.
- [ ] Lista de deseos compartida; el apartado para regalo se oculta a quien lo quiere.
- [ ] Función en Supabase para llamar a Discogs sin exponer el token.
- [ ] Importar colección desde Discogs y CLZ (CSV).

## v0.3 · El chat
- [ ] Chatbot con Claude: recomendaciones, comparaciones, imprescindibles.
- [ ] "Para ti" con Claude: reordena y explica mejor las sugerencias de la v0.1 (una llamada al día, guardada en la nube para toda la familia).
- [ ] Búsqueda web limitada a sitios confiables, siempre con fuentes.
- [ ] Dónde comprar: Discogs Marketplace, Mercado Libre, Amazon MX, tiendas que tú apruebes.
- [ ] Conoce la colección: "ya lo tienes" / "te falta".

## v0.4 · Extras
- [ ] Valor aproximado con precios de Discogs.
- [ ] Búsqueda por foto de la portada.
- [ ] Vista "hojear la caja".
- [ ] Diario de escucha y "¿qué pongo hoy?".
- [ ] Préstamos.
- [ ] Estadísticas de la colección.
