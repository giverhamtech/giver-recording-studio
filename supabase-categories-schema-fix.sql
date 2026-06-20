-- Categories schema alignment migration
-- Purpose: align legacy categories schema with app code used in CategoryManager.

create extension if not exists pgcrypto;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  display_order integer not null default 0,
  category_image text,
  visible boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.categories
  add column if not exists description text,
  add column if not exists display_order integer not null default 0,
  add column if not exists category_image text,
  add column if not exists visible boolean not null default true,
  add column if not exists created_at timestamptz not null default now();

-- Backfill from legacy columns if they exist.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'categories' and column_name = 'display_Order'
  ) then
    execute 'update public.categories set display_order = coalesce(display_order, "display_Order", 0)';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'categories' and column_name = 'category_Image'
  ) then
    execute 'update public.categories set category_image = coalesce(category_image, "category_Image")';
  end if;
end $$;

create index if not exists idx_categories_display_order on public.categories (display_order, created_at desc);
create index if not exists idx_categories_visible on public.categories (visible);
create unique index if not exists idx_categories_name_unique on public.categories (lower(name));

alter table public.categories enable row level security;

drop policy if exists categories_read_all on public.categories;
create policy categories_read_all
  on public.categories
  for select
  to anon, authenticated
  using (true);

drop policy if exists categories_insert_authenticated on public.categories;
create policy categories_insert_authenticated
  on public.categories
  for insert
  to authenticated
  with check (true);

drop policy if exists categories_update_authenticated on public.categories;
create policy categories_update_authenticated
  on public.categories
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists categories_delete_authenticated on public.categories;
create policy categories_delete_authenticated
  on public.categories
  for delete
  to authenticated
  using (true);
