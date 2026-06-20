-- Site Settings runtime configuration
-- Run this script in Supabase SQL Editor.

create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  site_name text not null default 'Giver Recording Studio',
  tagline text,
  logo_url text,
  favicon_url text,
  footer_copyright text,
  footer_text text,
  contact_email text,
  phone_number text,
  facebook_url text,
  instagram_url text,
  twitter_url text,
  youtube_url text,
  tiktok_url text,
  whatsapp_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  updated_by uuid references auth.users(id)
);

create or replace function public.set_site_settings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_site_settings_updated_at on public.site_settings;
create trigger trg_site_settings_updated_at
before update on public.site_settings
for each row
execute function public.set_site_settings_updated_at();

insert into public.site_settings (
  id,
  site_name,
  tagline,
  logo_url,
  favicon_url,
  footer_copyright,
  footer_text,
  contact_email,
  phone_number,
  facebook_url,
  instagram_url,
  twitter_url,
  youtube_url,
  tiktok_url,
  whatsapp_url
)
values (
  1,
  'Giver Recording Studio',
  'Professional music production',
  'https://horizons-cdn.hostinger.com/8376f8c0-710f-4fa1-80c7-c84edc3eaefa/68be90d9445bbceca2aa1bc3d0eb7e0a.jpg',
  '/vite.svg',
  'All Rights Reserved',
  'Professional music production, recording, and mixing services in Lagos, Nigeria.',
  'giverrecords@gmail.com',
  '+2348075388856',
  null,
  'https://instagram.com/giverrecords',
  'https://x.com/giverham',
  null,
  'https://tiktok.com/@giverham',
  'https://wa.me/2348075388856'
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
