-- ─── Marketplace tables ────────────────────────────────────────────────────────
-- artists, bids, collaborations, mood_boards, issue_builders
-- Extends the Garden ecosystem with the Page Gallery revenue flywheel.

-- ─── legacy_garden_id on profiles ─────────────────────────────────────────────
-- Allows mapping old thepagegalleryjournal.com user records to new profiles.

alter table public.profiles
  add column if not exists legacy_garden_id text;

-- ─── Artists ──────────────────────────────────────────────────────────────────
-- Garden members who accept commissions for cover design, illustration, etc.

create table if not exists public.artists (
  id             uuid        primary key default gen_random_uuid(),
  user_id        uuid        not null references public.profiles(id) on delete cascade,
  bio            text,
  portfolio_url  text,
  specialism     text,                    -- e.g. 'Cover design, typographic composition'
  tags           text[]      not null default '{}',
  rate_cents     integer     not null default 0,   -- starting bid / minimum rate
  is_accepting   boolean     not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table public.artists enable row level security;

-- Anyone can read artist profiles.
create policy "Artists are publicly viewable"
  on public.artists for select
  using (true);

-- Artists can create their own profile.
create policy "Artists can insert their own profile"
  on public.artists for insert
  with check (auth.uid() = user_id);

-- Artists can update their own profile.
create policy "Artists can update their own profile"
  on public.artists for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Artists can delete their own profile.
create policy "Artists can delete their own profile"
  on public.artists for delete
  using (auth.uid() = user_id);

-- Keep updated_at current.
create or replace function public.handle_artist_updated_at()
returns trigger language plpgsql security definer as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger on_artist_updated
  before update on public.artists
  for each row execute procedure public.handle_artist_updated_at();

-- ─── Bids ─────────────────────────────────────────────────────────────────────
-- Writers or artists bid on a piece of work (poem or artwork).

create table if not exists public.bids (
  id           uuid        primary key default gen_random_uuid(),
  writing_id   uuid        references public.writings(id) on delete cascade,
  artist_id    uuid        references public.artists(id) on delete cascade,
  bidder_id    uuid        not null references public.profiles(id) on delete cascade,
  amount_cents integer     not null,
  message      text,
  status       text        not null default 'open'
               check (status in ('open', 'accepted', 'declined', 'withdrawn')),
  created_at   timestamptz not null default now(),
  -- At least one of writing_id / artist_id must be set.
  constraint bids_has_subject check (writing_id is not null or artist_id is not null)
);

alter table public.bids enable row level security;

-- Bidders can see their own bids.
create policy "Bidders can read their own bids"
  on public.bids for select
  using (auth.uid() = bidder_id);

-- Writing authors can see bids on their work.
create policy "Writing authors can read bids on their writings"
  on public.bids for select
  using (
    writing_id is not null and
    exists (
      select 1 from public.writings w
      where w.id = writing_id
        and w.author_id = auth.uid()
        and w.in_bloom_pool = true
    )
  );

-- Artists can see bids placed on them.
create policy "Artists can read bids targeting them"
  on public.bids for select
  using (
    artist_id is not null and
    exists (
      select 1 from public.artists a
      where a.id = artist_id
        and a.user_id = auth.uid()
    )
  );

-- Authenticated writers can place bids.
create policy "Authenticated users can place bids"
  on public.bids for insert
  with check (auth.uid() = bidder_id);

-- Bidders can update (e.g. withdraw) their own bids.
create policy "Bidders can update their own bids"
  on public.bids for update
  using (auth.uid() = bidder_id)
  with check (auth.uid() = bidder_id);

-- ─── Collaborations ───────────────────────────────────────────────────────────
-- A formal collaboration proposal between a writer and an artist.

create table if not exists public.collaborations (
  id                  uuid        primary key default gen_random_uuid(),
  writer_id           uuid        not null references public.profiles(id) on delete cascade,
  artist_id           uuid        not null references public.artists(id) on delete cascade,
  project_type        text        not null default 'cover'
                      check (project_type in ('cover', 'illustration', 'print', 'other')),
  message             text,
  status              text        not null default 'proposed'
                      check (status in ('proposed', 'accepted', 'declined', 'completed', 'cancelled')),
  agreed_price_cents  integer,
  payment_reference   text,       -- PayPal order / escrow ID once payment is initiated
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.collaborations enable row level security;

-- Writers can see their own collaboration requests.
create policy "Writers can read their own collaborations"
  on public.collaborations for select
  using (auth.uid() = writer_id);

-- Artists can see collaboration requests sent to them.
create policy "Artists can read collaborations sent to them"
  on public.collaborations for select
  using (
    exists (
      select 1 from public.artists a
      where a.id = artist_id
        and a.user_id = auth.uid()
    )
  );

-- Writers can propose new collaborations.
create policy "Writers can propose collaborations"
  on public.collaborations for insert
  with check (auth.uid() = writer_id);

-- Either party can update status (accept / decline / complete).
create policy "Parties can update collaboration status"
  on public.collaborations for update
  using (
    auth.uid() = writer_id or
    exists (
      select 1 from public.artists a
      where a.id = artist_id
        and a.user_id = auth.uid()
    )
  );

-- Keep updated_at current.
create or replace function public.handle_collaboration_updated_at()
returns trigger language plpgsql security definer as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger on_collaboration_updated
  before update on public.collaborations
  for each row execute procedure public.handle_collaboration_updated_at();

-- ─── Mood Boards ──────────────────────────────────────────────────────────────
-- Pinterest-style boards for saving poems, artwork, and images.

create table if not exists public.mood_boards (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references public.profiles(id) on delete cascade,
  name       text        not null default 'My Board',
  is_public  boolean     not null default false,
  items      jsonb       not null default '[]',  -- [{type,id,layout}]
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.mood_boards enable row level security;

-- Public boards are viewable by everyone.
create policy "Public mood boards are viewable by everyone"
  on public.mood_boards for select
  using (is_public = true);

-- Users can see their own boards (including private ones).
create policy "Users can view their own mood boards"
  on public.mood_boards for select
  using (auth.uid() = user_id);

-- Users can create mood boards.
create policy "Users can create mood boards"
  on public.mood_boards for insert
  with check (auth.uid() = user_id);

-- Users can update their own mood boards.
create policy "Users can update their own mood boards"
  on public.mood_boards for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Users can delete their own mood boards.
create policy "Users can delete their own mood boards"
  on public.mood_boards for delete
  using (auth.uid() = user_id);

-- Keep updated_at current.
create or replace function public.handle_mood_board_updated_at()
returns trigger language plpgsql security definer as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger on_mood_board_updated
  before update on public.mood_boards
  for each row execute procedure public.handle_mood_board_updated_at();

-- ─── Issue Builders ───────────────────────────────────────────────────────────
-- Arena drag-and-drop issue builder state, one row per journal issue in progress.

create table if not exists public.issue_builders (
  id                   uuid        primary key default gen_random_uuid(),
  editor_id            uuid        not null references public.profiles(id) on delete cascade,
  title                text        not null default 'Untitled Issue',
  layout               jsonb       not null default '[]',  -- drag-drop positions
  published_edition_id uuid,       -- will reference editions once that table is migrated
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

alter table public.issue_builders enable row level security;

-- Editors can see their own issue builders.
create policy "Editors can read their own issue builders"
  on public.issue_builders for select
  using (auth.uid() = editor_id);

-- Editors can create issue builders.
create policy "Editors can create issue builders"
  on public.issue_builders for insert
  with check (auth.uid() = editor_id);

-- Editors can update their own issue builders.
create policy "Editors can update their own issue builders"
  on public.issue_builders for update
  using (auth.uid() = editor_id)
  with check (auth.uid() = editor_id);

-- Editors can delete their own issue builders.
create policy "Editors can delete their own issue builders"
  on public.issue_builders for delete
  using (auth.uid() = editor_id);

-- Keep updated_at current.
create or replace function public.handle_issue_builder_updated_at()
returns trigger language plpgsql security definer as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger on_issue_builder_updated
  before update on public.issue_builders
  for each row execute procedure public.handle_issue_builder_updated_at();
