-- Explicit RLS policies for songs so spotlight updates persist without disabling RLS.
-- Safe to run multiple times.

alter table public.songs enable row level security;

drop policy if exists songs_public_read on public.songs;
create policy songs_public_read
  on public.songs
  for select
  to public
  using (privacy = 'public');

drop policy if exists songs_authenticated_insert on public.songs;
create policy songs_authenticated_insert
  on public.songs
  for insert
  to authenticated
  with check (true);

drop policy if exists songs_authenticated_update on public.songs;
create policy songs_authenticated_update
  on public.songs
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists songs_authenticated_delete on public.songs;
create policy songs_authenticated_delete
  on public.songs
  for delete
  to authenticated
  using (true);