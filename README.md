# Surcos

La colección de vinilos de la familia, en el celular de todos. Sin membresías.

Es una **PWA**: se abre desde un enlace, se instala en la pantalla de inicio de iPhone y Android, y funciona sin internet.

## Qué hace (v0.1)

- Escanea el código de barras o busca a mano; elige tu edición exacta.
- Portada, canciones y datos de Discogs (respaldo: MusicBrainz).
- Calificación de 5 estrellas **con medias estrellas**.
- Filtros por género, década y calificación; orden por artista, título o año.
- Estado del disco y la funda, ubicación, datos de compra, notas.
- Aviso de "ya lo tienen" al escanear.
- Lista de deseos. Respaldo en archivo.

Las siguientes versiones están en [ROADMAP.md](ROADMAP.md).

## Correrla en tu computadora

```bash
npm install
cp .env.example .env   # pon tu token de Discogs (gratis) en VITE_DISCOGS_TOKEN
npm run dev
```

Abre la dirección que imprime (normalmente http://localhost:5173). Para probar la cámara desde el celular en la misma red: `npm run dev -- --host` y abre la IP que muestra. La cámara solo funciona en `localhost` o con `https`.

Sin token de Discogs la app sigue funcionando con MusicBrainz, pero sin géneros ni lista de canciones.

## Publicarla gratis

Cualquier hospedaje de sitios estáticos sirve (Vercel, Netlify, Cloudflare Pages):

```bash
npm run build   # genera la carpeta dist/
```

Configura las variables de `.env.example` en el panel del hospedaje. Al abrir el enlace en el celular, "Agregar a pantalla de inicio" instala la app.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compila para producción |
| `npm test` | Pruebas unitarias |
| `npm run lint` | Revisión de tipos |

## Estructura

```
src/
  api/        Discogs, MusicBrainz, y la búsqueda con respaldo
  components/ Estrellas, tarjetas, barra inferior, íconos
  lib/        Filtros, calificaciones, perfil
  pages/      Colección, Buscar, Escanear, Álbum, Deseos, Ajustes
  db.ts       Base local (IndexedDB)
  types.ts    Tipos de datos
supabase/
  schema.sql  Esquema de la nube familiar (v0.2)
```

## Fuentes de datos y licencias

- Discogs API: uso personal; parte de los datos está bajo sus términos de la API.
- MusicBrainz y Cover Art Archive: datos abiertos.
