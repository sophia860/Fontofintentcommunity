-- ─── Core tables ─────────────────────────────────────────────────────────────
-- writings, journals, callouts, submissions
-- These are the primary content tables for the Garden ecosystem.

-- ─── Writings ─────────────────────────────────────────────────────────────────

create table if not exists public.writings (
  id            uuid        primary key default gen_random_uuid(),
  author_id     uuid        not null references auth.users(id) on delete cascade,
  title         text        not null default 'Untitled',
  body          text        not null default '',
  state         text        not null default 'seed'
                            check (state in ('seed', 'sprout', 'bloom')),
  tags          text[]      not null default '{}',
  word_count    integer     default 0,
  in_bloom_pool boolean     not null default false,
  scouted       boolean     not null default false,
  replay_data   jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.writings enable row level security;

-- Writers can read their own writings.
create policy "Writers can read their own writings"
  on public.writings for select
  using (auth.uid() = author_id);

-- Writers can insert their own writings.
create policy "Writers can insert their own writings"
  on public.writings for insert
  with check (auth.uid() = author_id);

-- Writers can update their own writings.
create policy "Writers can update their own writings"
  on public.writings for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

-- Writers can delete their own writings.
create policy "Writers can delete their own writings"
  on public.writings for delete
  using (auth.uid() = author_id);

-- Journals can read bloom-pool writings (for scouting).
create policy "Journals can read bloom pool"
  on public.writings for select
  using (in_bloom_pool = true and state = 'bloom');

-- Keep updated_at current.
create or replace function public.handle_writing_updated_at()
returns trigger language plpgsql security definer as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger on_writing_updated
  before update on public.writings
  for each row execute procedure public.handle_writing_updated_at();

-- ─── Journals ─────────────────────────────────────────────────────────────────

create table if not exists public.journals (
  id                  uuid        primary key default gen_random_uuid(),
  owner_id            uuid        references auth.users(id) on delete set null,
  name                text        not null,
  slug                text        unique,
  description         text,
  looking_for         text,       -- pipe-separated: "forms|themes"
  publish_frequency   text,
  website             text,
  instagram           text,
  location            text,
  mission_statement   text,
  pays                boolean     not null default false,
  pay_note            text,
  status              text        not null default 'active'
                                  check (status in ('active', 'pre_launch', 'inactive', 'closed')),
  is_public           boolean     not null default true,
  garden_partner      boolean     not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.journals enable row level security;

-- Anyone can read public journals.
create policy "Public journals are viewable by everyone"
  on public.journals for select
  using (is_public = true);

-- Owners can manage their journal row.
create policy "Owners can insert their journal"
  on public.journals for insert
  with check (auth.uid() = owner_id);

create policy "Owners can update their journal"
  on public.journals for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- ─── Callouts ─────────────────────────────────────────────────────────────────
-- Site-wide announcements, open calls, residencies, edition notices.

create table if not exists public.callouts (
  id          uuid        primary key default gen_random_uuid(),
  type        text        not null default 'announcement'
              check (type in ('open_call', 'residency', 'announcement', 'edition')),
  label       text        not null default '',
  title       text        not null,
  body        text        not null default '',
  urgent      boolean     not null default false,
  active      boolean     not null default true,
  sort_order  integer     not null default 0,
  link        text,
  created_at  timestamptz not null default now()
);

alter table public.callouts enable row level security;

-- Anyone can read active callouts.
create policy "Active callouts are public"
  on public.callouts for select
  using (active = true);

-- ─── Submissions ──────────────────────────────────────────────────────────────
-- A writer submitting a bloom-pool piece to a journal.

create table if not exists public.submissions (
  id          uuid        primary key default gen_random_uuid(),
  writing_id  uuid        not null references public.writings(id) on delete cascade,
  journal_id  uuid        not null references public.journals(id) on delete cascade,
  author_id   uuid        not null references auth.users(id) on delete cascade,
  status      text        not null default 'pending'
              check (status in ('pending', 'under_review', 'accepted', 'declined', 'withdrawn')),
  note        text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.submissions enable row level security;

-- Authors can see their own submissions.
create policy "Authors can read their own submissions"
  on public.submissions for select
  using (auth.uid() = author_id);

-- Journal owners can see submissions to their journal.
create policy "Journal owners can read submissions to their journal"
  on public.submissions for select
  using (
    exists (
      select 1 from public.journals j
      where j.id = journal_id
        and j.owner_id = auth.uid()
    )
  );

-- Authors can create submissions.
create policy "Authors can create submissions"
  on public.submissions for insert
  with check (auth.uid() = author_id);

-- Authors can withdraw (update) their own submissions.
create policy "Authors can update their own submissions"
  on public.submissions for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);
