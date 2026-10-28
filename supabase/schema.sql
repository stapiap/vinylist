-- VinyList · esquema de la nube familiar (Supabase / Postgres).
-- Se aplica en la versión 0.2, cuando se active la sincronización.
-- Ejecutar en el editor SQL del proyecto de Supabase.

create extension if not exists "pgcrypto";

-- Una familia = un grupo que comparte la colección.
create table if not exists families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists family_members (
  family_id uuid not null references families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  role text not null default 'editor' check (role in ('owner', 'editor', 'viewer')),
  primary key (family_id, user_id)
);

create table if not exists albums (
  id uuid primary key,
  family_id uuid not null references families(id) on delete cascade,
  title text not null,
  artist text not null,
  year int,
  label text,
  catalog_number text,
  country text,
  genres text[] not null default '{}',
  styles text[] not null default '{}',
  format text,
  barcode text,
  cover_url text,
  thumb_url text,
  tracklist jsonb not null default '[]',
  discogs_id bigint,
  musicbrainz_id text,
  media_condition text,
  sleeve_condition text,
  location text,
  purchase_date date,
  purchase_price numeric,
  purchase_place text,
  notes text,
  added_by uuid references auth.users(id),
  added_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists albums_family_idx on albums(family_id);
create index if not exists albums_barcode_idx on albums(family_id, barcode);
create index if not exists albums_discogs_idx on albums(family_id, discogs_id);

-- Cada familiar califica por su lado (1 a 10 = medias estrellas).
create table if not exists ratings (
  album_id uuid not null references albums(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating smallint not null check (rating between 1 and 10),
  updated_at timestamptz not null default now(),
  primary key (album_id, user_id)
);

create table if not exists wishlist (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  title text not null,
  artist text not null,
  year int,
  cover_url text,
  discogs_id bigint,
  wanted_by uuid not null references auth.users(id),
  reserved_by uuid references auth.users(id),
  added_at timestamptz not null default now()
);

-- Seguridad por fila: solo ves lo de tu familia.
alter table families enable row level security;
alter table family_members enable row level security;
alter table albums enable row level security;
alter table ratings enable row level security;
alter table wishlist enable row level security;

create or replace function is_member(fid uuid) returns boolean language sql stable as $$
  select exists (select 1 from family_members where family_id = fid and user_id = auth.uid())
$$;

create or replace function can_edit(fid uuid) returns boolean language sql stable as $$
  select exists (select 1 from family_members where family_id = fid and user_id = auth.uid() and role in ('owner', 'editor'))
$$;

create policy "ver familia" on families for select using (is_member(id));
create policy "ver miembros" on family_members for select using (is_member(family_id));
create policy "ver discos" on albums for select using (is_member(family_id));
create policy "editar discos" on albums for all using (can_edit(family_id)) with check (can_edit(family_id));
create policy "ver calificaciones" on ratings for select using (exists (select 1 from albums a where a.id = album_id and is_member(a.family_id)));
create policy "mi calificacion" on ratings for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "ver deseos" on wishlist for select using (is_member(family_id));
create policy "editar deseos" on wishlist for all using (can_edit(family_id)) with check (can_edit(family_id));

-- Nota: el "apartado para regalo" se oculta a quien lo quiere desde la app
-- (la columna reserved_by se filtra en la consulta cuando wanted_by = auth.uid()).
