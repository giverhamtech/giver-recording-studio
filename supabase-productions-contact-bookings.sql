-- Productions, Contact Messages, and Bookings runtime schema setup
-- Run in Supabase SQL Editor with a role that can manage schema and policies.

create extension if not exists pgcrypto;

-- Ensure storage buckets used by productions media exist.
insert into storage.buckets (id, name, public)
values ('song-files', 'song-files', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('cover-images', 'cover-images', true)
on conflict (id) do nothing;

-- Reaffirm storage policies for production media uploads and reads.
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

-- Productions table
create table if not exists public.productions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  cover_image text,
  audio_file text,
  video_url text,
  featured boolean not null default false,
  visibility text not null default 'public' check (visibility in ('public', 'private')),
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.productions
  add column if not exists description text,
  add column if not exists cover_image text,
  add column if not exists audio_file text,
  add column if not exists video_url text,
  add column if not exists featured boolean not null default false,
  add column if not exists visibility text not null default 'public',
  add column if not exists display_order integer not null default 0,
  add column if not exists created_at timestamptz not null default now();

alter table public.productions
  drop constraint if exists productions_visibility_check;
alter table public.productions
  add constraint productions_visibility_check check (visibility in ('public', 'private'));

create index if not exists idx_productions_visibility on public.productions (visibility);
create index if not exists idx_productions_display_order on public.productions (display_order, created_at desc);

alter table public.productions enable row level security;

drop policy if exists productions_read_all on public.productions;
create policy productions_read_all
  on public.productions
  for select
  to anon, authenticated
  using (true);

drop policy if exists productions_write_all on public.productions;
create policy productions_write_all
  on public.productions
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- Contact messages table
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  created_at timestamptz not null default now(),
  status text not null default 'unread' check (status in ('unread', 'read'))
);

alter table public.contact_messages
  add column if not exists name text,
  add column if not exists email text,
  add column if not exists subject text,
  add column if not exists message text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists status text not null default 'unread';

update public.contact_messages
set status = 'unread'
where status is null;

alter table public.contact_messages
  drop constraint if exists contact_messages_status_check;
alter table public.contact_messages
  add constraint contact_messages_status_check check (status in ('unread', 'read'));

create index if not exists idx_contact_messages_created_at on public.contact_messages (created_at desc);
create index if not exists idx_contact_messages_status on public.contact_messages (status);

alter table public.contact_messages enable row level security;

drop policy if exists contact_messages_read_all on public.contact_messages;
create policy contact_messages_read_all
  on public.contact_messages
  for select
  to anon, authenticated
  using (true);

drop policy if exists contact_messages_insert_all on public.contact_messages;
create policy contact_messages_insert_all
  on public.contact_messages
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists contact_messages_update_delete_all on public.contact_messages;
create policy contact_messages_update_delete_all
  on public.contact_messages
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- Bookings table
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  email text not null,
  phone text,
  preferred_date date,
  service_type text,
  message text,
  created_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'completed'))
);

alter table public.bookings
  add column if not exists client_name text,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists preferred_date date,
  add column if not exists service_type text,
  add column if not exists message text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists status text not null default 'pending';

update public.bookings
set status = 'pending'
where status is null;

alter table public.bookings
  drop constraint if exists bookings_status_check;
alter table public.bookings
  add constraint bookings_status_check check (status in ('pending', 'confirmed', 'completed'));

create index if not exists idx_bookings_created_at on public.bookings (created_at desc);
create index if not exists idx_bookings_status on public.bookings (status);

alter table public.bookings enable row level security;

drop policy if exists bookings_read_all on public.bookings;
create policy bookings_read_all
  on public.bookings
  for select
  to anon, authenticated
  using (true);

drop policy if exists bookings_insert_all on public.bookings;
create policy bookings_insert_all
  on public.bookings
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists bookings_update_delete_all on public.bookings;
create policy bookings_update_delete_all
  on public.bookings
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- Optional compatibility view for legacy booking_requests reads.
create or replace view public.booking_requests as
select
  id,
  client_name as name,
  email,
  phone,
  service_type,
  preferred_date,
  message,
  status,
  created_at as created
from public.bookings;
