-- Services table and policies used by /services page and booking form.
-- Safe to run multiple times.

create extension if not exists pgcrypto;

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  icon text,
  price text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.services enable row level security;

drop policy if exists services_public_read on public.services;
create policy services_public_read
  on public.services
  for select
  to anon, authenticated
  using (true);

drop policy if exists services_authenticated_write on public.services;
create policy services_authenticated_write
  on public.services
  for all
  to authenticated
  using (true)
  with check (true);

create index if not exists idx_services_display_order
  on public.services (display_order asc, created_at desc);

insert into public.services (name, description, icon, price, display_order, is_active)
select *
from (
  values
    ('Recording Session', 'Professional vocal and instrument recording with engineer support.', 'Mic2', 'Contact for pricing', 1, true),
    ('Mixing & Mastering', 'Industry-standard mixing and mastering for release-ready tracks.', 'Sliders', 'Contact for pricing', 2, true),
    ('Custom Beat Production', 'Original, tailored beat production for your project.', 'Music2', 'Contact for pricing', 3, true),
    ('Vocal Editing', 'Pitch correction, timing edits, and vocal cleanup.', 'Wand2', 'Contact for pricing', 4, true),
    ('Playlisting & Arrangement', 'Song structuring and arrangement guidance.', 'ListMusic', 'Contact for pricing', 5, true),
    ('Creative Direction', 'A&R style guidance for cohesive sound and branding.', 'Sparkles', 'Contact for pricing', 6, true)
) as seed(name, description, icon, price, display_order, is_active)
where not exists (select 1 from public.services);
