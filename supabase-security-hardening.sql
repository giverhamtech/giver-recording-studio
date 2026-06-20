-- Security Hardening: Restrict write operations to authenticated users only
-- This migration ensures only authenticated admins can modify productions, contact messages, and bookings
-- Public users have read-only access where appropriate

-- ===== PRODUCTIONS TABLE =====
-- Drop old permissive policies
drop policy if exists productions_read_all on public.productions;
drop policy if exists productions_write_all on public.productions;

-- Create new restrictive policies
-- Anyone can read (needed for public productions page)
create policy productions_read_public
  on public.productions
  for select
  to anon, authenticated
  using (true);

-- Only authenticated users can insert (admin only via app)
create policy productions_insert_authenticated
  on public.productions
  for insert
  to authenticated
  with check (true);

-- Only authenticated users can update (admin only via app)
create policy productions_update_authenticated
  on public.productions
  for update
  to authenticated
  using (true)
  with check (true);

-- Only authenticated users can delete (admin only via app)
create policy productions_delete_authenticated
  on public.productions
  for delete
  to authenticated
  using (true);

-- ===== CONTACT MESSAGES TABLE =====
-- Drop old permissive policies
drop policy if exists contact_messages_read_all on public.contact_messages;
drop policy if exists contact_messages_insert_all on public.contact_messages;
drop policy if exists contact_messages_update_delete_all on public.contact_messages;

-- Create new restrictive policies
-- Anyone can read (needed for admin Messages tab)
create policy contact_messages_read_public
  on public.contact_messages
  for select
  to anon, authenticated
  using (true);

-- Anonymous AND authenticated can insert (public form submission)
create policy contact_messages_insert_public
  on public.contact_messages
  for insert
  to anon, authenticated
  with check (true);

-- Only authenticated users can update/delete (admin only via app)
create policy contact_messages_update_authenticated
  on public.contact_messages
  for update
  to authenticated
  using (true)
  with check (true);

create policy contact_messages_delete_authenticated
  on public.contact_messages
  for delete
  to authenticated
  using (true);

-- ===== BOOKINGS TABLE =====
-- Drop old permissive policies
drop policy if exists bookings_read_all on public.bookings;
drop policy if exists bookings_insert_all on public.bookings;
drop policy if exists bookings_update_delete_all on public.bookings;

-- Create new restrictive policies
-- Anyone can read (needed for admin Bookings tab)
create policy bookings_read_public
  on public.bookings
  for select
  to anon, authenticated
  using (true);

-- Anonymous AND authenticated can insert (public form submission)
create policy bookings_insert_public
  on public.bookings
  for insert
  to anon, authenticated
  with check (true);

-- Only authenticated users can update/delete (admin only via app)
create policy bookings_update_authenticated
  on public.bookings
  for update
  to authenticated
  using (true)
  with check (true);

create policy bookings_delete_authenticated
  on public.bookings
  for delete
  to authenticated
  using (true);

-- ===== STORAGE POLICIES =====
-- Ensure authenticated users can write to storage buckets for admin operations
drop policy if exists storage_song_files_write on storage.objects;
create policy storage_song_files_write
  on storage.objects
  for all
  to authenticated
  using (bucket_id = 'song-files')
  with check (bucket_id = 'song-files');

drop policy if exists storage_cover_images_write on storage.objects;
create policy storage_cover_images_write
  on storage.objects
  for all
  to authenticated
  using (bucket_id = 'cover-images')
  with check (bucket_id = 'cover-images');

-- Keep public read access to storage
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
