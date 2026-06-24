-- Adds a single source-of-truth featured flag to songs.
-- Safe to run multiple times.

alter table public.songs
  add column if not exists is_featured boolean not null default false;

-- Backfill from legacy featured column when it exists.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'songs'
      and column_name = 'featured'
  ) then
    execute $q$
      update public.songs
      set is_featured = coalesce(featured, false)
      where is_featured is distinct from coalesce(featured, false)
    $q$;
  end if;
end $$;

create index if not exists idx_songs_is_featured_public
  on public.songs (is_featured, privacy, created_at desc);
