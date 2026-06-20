-- Site Settings runtime configuration
-- Run this script in Supabase SQL Editor.

create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  site_name text not null default 'Giver Recording Studio',
  tagline text,
  logo_url text,
  favicon_url text,
  updated_at timestamptz not null default timezone('utc', now()),
  updated_by uuid references auth.users(id)
);

insert into public.site_settings (id, site_name, tagline, logo_url, favicon_url)
values (
  1,
  'Giver Recording Studio',
  'Professional music production',
  'https://horizons-cdn.hostinger.com/8376f8c0-710f-4fa1-80c7-c84edc3eaefa/68be90d9445bbceca2aa1bc3d0eb7e0a.jpg',
  '/vite.svg'
)
on conflict (id) do nothing;

alter table public.site_settings enable row level security;

drop policy if exists site_settings_public_read on public.site_settings;
create policy site_settings_public_read
on public.site_settings
for select
using (true);

drop policy if exists site_settings_admin_insert on public.site_settings;
create policy site_settings_admin_insert
on public.site_settings
for insert
to authenticated
with check (
  exists (
    select 1
    from public.admin_users au
    where au.id = auth.uid()
       or lower(au.email) = lower(coalesce(auth.jwt()->>'email', ''))
  )
);

drop policy if exists site_settings_admin_update on public.site_settings;
create policy site_settings_admin_update
on public.site_settings
for update
to authenticated
using (
  exists (
    select 1
    from public.admin_users au
    where au.id = auth.uid()
       or lower(au.email) = lower(coalesce(auth.jwt()->>'email', ''))
  )
)
with check (
  exists (
    select 1
    from public.admin_users au
    where au.id = auth.uid()
       or lower(au.email) = lower(coalesce(auth.jwt()->>'email', ''))
  )
);

drop policy if exists site_settings_admin_delete on public.site_settings;
create policy site_settings_admin_delete
on public.site_settings
for delete
to authenticated
using (
  exists (
    select 1
    from public.admin_users au
    where au.id = auth.uid()
       or lower(au.email) = lower(coalesce(auth.jwt()->>'email', ''))
  )
);

insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

drop policy if exists site_assets_public_read on storage.objects;
create policy site_assets_public_read
on storage.objects
for select
using (bucket_id = 'site-assets');

drop policy if exists site_assets_admin_insert on storage.objects;
create policy site_assets_admin_insert
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'site-assets'
  and exists (
    select 1
    from public.admin_users au
    where au.id = auth.uid()
       or lower(au.email) = lower(coalesce(auth.jwt()->>'email', ''))
  )
);

drop policy if exists site_assets_admin_update on storage.objects;
create policy site_assets_admin_update
on storage.objects
for update
to authenticated
using (
  bucket_id = 'site-assets'
  and exists (
    select 1
    from public.admin_users au
    where au.id = auth.uid()
       or lower(au.email) = lower(coalesce(auth.jwt()->>'email', ''))
  )
)
with check (
  bucket_id = 'site-assets'
  and exists (
    select 1
    from public.admin_users au
    where au.id = auth.uid()
       or lower(au.email) = lower(coalesce(auth.jwt()->>'email', ''))
  )
);

drop policy if exists site_assets_admin_delete on storage.objects;
create policy site_assets_admin_delete
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'site-assets'
  and exists (
    select 1
    from public.admin_users au
    where au.id = auth.uid()
       or lower(au.email) = lower(coalesce(auth.jwt()->>'email', ''))
  )
);
