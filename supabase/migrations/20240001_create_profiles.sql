-- ─── Profiles table ─────────────────────────────────────────────────────────
-- Public writer/editor/journal profiles keyed to auth.users.
-- Supabase recommends keeping public profile data separate from the auth schema
-- and syncing it when a new user signs up via a trigger.

create table if not exists public.profiles (
  id               uuid        primary key references auth.users(id) on delete cascade,
  display_name     text,
  slug             text        unique,
  avatar_url       text,
  short_bio        text,
  full_bio         text,
  location         text,
  website          text,
  instagram        text,
  genres           text[]      default '{}',
  themes           text[]      default '{}',
  publication_history text,
  is_public        boolean     not null default true,
  role             text        not null default 'writer'
                               check (role in ('writer', 'editor', 'journal', 'admin')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ─── Row-Level Security ───────────────────────────────────────────────────────

alter table public.profiles enable row level security;

-- Anyone can read public profiles.
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (is_public = true);

-- Signed-in users can always read their own profile (even if is_public = false).
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Users can insert their own profile row.
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Users can update only their own profile row.
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ─── Keep updated_at current ─────────────────────────────────────────────────

create or replace function public.handle_profile_updated_at()
returns trigger language plpgsql security definer as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger on_profile_updated
  before update on public.profiles
  for each row execute procedure public.handle_profile_updated_at();

-- ─── Auto-create a profile row when a new user signs up ──────────────────────

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
