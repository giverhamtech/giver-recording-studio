-- Runtime compatibility fixes for admin uploads, submissions, and founder profile
-- Run in Supabase SQL Editor with a role that can manage schema, policies, and storage.

create extension if not exists pgcrypto;

-- Founder profile table expected by parts of the frontend.
create table if not exists public.founder_profile (
  id uuid primary key default gen_random_uuid(),
  founder_name text,
  founder_image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.founder_profile enable row level security;

drop policy if exists founder_profile_read_all on public.founder_profile;
create policy founder_profile_read_all
  on public.founder_profile
  for select
  to anon, authenticated
  using (true);

drop policy if exists founder_profile_write_all on public.founder_profile;
create policy founder_profile_write_all
  on public.founder_profile
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- Keep a single default founder row available.
insert into public.founder_profile (founder_name)
select 'Giver Recording Studio Founder'
where not exists (select 1 from public.founder_profile);

-- Compatibility view for legacy artistSubmissions references.
create or replace view public."artistSubmissions" as
select
  id,
  artist_name as "artistName",
  email,
  title as "songTitle",
  category as genre,
  cover_image as "coverImage",
  audio_file as "audioFile",
  status,
  message,
  created_at as created
from public.artist_uploads;

-- Storage buckets expected by the app.
insert into storage.buckets (id, name, public)
values ('song-files', 'song-files', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('cover-images', 'cover-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('featured-images', 'featured-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Public read for media files.
drop policy if exists storage_song_files_read on storage.objects;
create policy storage_song_files_read
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'song-files');

drop policy if exists storage_cover_images_read on storage.objects;
create policy storage_cover_images_read
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'cover-images');

drop policy if exists storage_featured_images_read on storage.objects;
create policy storage_featured_images_read
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'featured-images');

drop policy if exists storage_avatars_read on storage.objects;
create policy storage_avatars_read
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'avatars');

-- Allow uploads/updates/deletes from anon/authenticated for current app behavior.
drop policy if exists storage_song_files_write on storage.objects;
create policy storage_song_files_write
  on storage.objects
  for all
  to anon, authenticated
  using (bucket_id = 'song-files')
  with check (bucket_id = 'song-files');

drop policy if exists storage_cover_images_write on storage.objects;
create policy storage_cover_images_write
  on storage.objects
  for all
  to anon, authenticated
  using (bucket_id = 'cover-images')
  with check (bucket_id = 'cover-images');

drop policy if exists storage_featured_images_write on storage.objects;
create policy storage_featured_images_write
  on storage.objects
  for all
  to anon, authenticated
  using (bucket_id = 'featured-images')
  with check (bucket_id = 'featured-images');

drop policy if exists storage_avatars_write on storage.objects;
create policy storage_avatars_write
  on storage.objects
  for all
  to anon, authenticated
  using (bucket_id = 'avatars')
  with check (bucket_id = 'avatars');
