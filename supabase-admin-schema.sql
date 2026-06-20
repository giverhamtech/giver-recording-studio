-- Supabase schema for admin + app content (assumptions per migration request)

-- Enable required extensions
create extension if not exists pgcrypto;

-- ============
-- admin_users
-- ============
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz default now()
);

-- ============
-- categories
-- ============
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  displayOrder integer,
  categoryImage text,
  created_at timestamptz default now()
);

-- ============
-- productions
-- ============
create table if not exists public.productions (
  id uuid primary key default gen_random_uuid(),
  title text,
  genre text,
  coverImage text,
  created_at timestamptz default now()
);

-- ============
-- beats
-- ============
create table if not exists public.beats (
  id uuid primary key default gen_random_uuid(),
  title text,
  artist text,
  audioFile text,
  coverImage text,
  category text,
  privacy text,
  created_at timestamptz default now()
);

-- ============
-- submissions
-- ============
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  audioFile text,
  created_at timestamptz default now()
);

-- ============
-- featured_items
-- ============
create table if not exists public.featured_items (
  id uuid primary key default gen_random_uuid(),
  title text,
  coverImage text,
  created_at timestamptz default now()
);

-- Insert admin user
insert into public.admin_users (email)
values ('hassanadelajagiver@gmail.com')
on conflict (email) do nothing;

