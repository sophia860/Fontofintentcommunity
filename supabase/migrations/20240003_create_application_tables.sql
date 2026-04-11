-- ─── Application tables ───────────────────────────────────────────────────────
-- writer_applications, journal_applications

-- ─── Writer applications ──────────────────────────────────────────────────────

create table if not exists public.writer_applications (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  email       text        not null,
  bio         text,
  forms       text,        -- e.g. 'poetry, essay'
  sample      text,        -- URL to sample work / website
  statement   text,
  status      text        not null default 'pending'
              check (status in ('pending', 'shortlisted', 'accepted', 'declined')),
  created_at  timestamptz not null default now()
);

alter table public.writer_applications enable row level security;

-- Only admins (service role) can read applications.
-- Unauthenticated inserts are allowed so the public apply form works.
create policy "Anyone can submit a writer application"
  on public.writer_applications for insert
  with check (true);

-- ─── Journal applications ─────────────────────────────────────────────────────

create table if not exists public.journal_applications (
  id                  uuid        primary key default gen_random_uuid(),
  journal_name        text        not null,
  contact_name        text        not null,
  email               text        not null,
  location            text,
  website             text,
  mission_statement   text,
  pays                text,        -- 'yes' / 'no' / 'sometimes'
  reading_status      text,        -- 'open' / 'closed' / 'rolling'
  status              text        not null default 'pending'
                      check (status in ('pending', 'shortlisted', 'accepted', 'declined')),
  created_at          timestamptz not null default now()
);

alter table public.journal_applications enable row level security;

-- Anyone can submit a journal application.
create policy "Anyone can submit a journal application"
  on public.journal_applications for insert
  with check (true);

-- ─── Residency applications ───────────────────────────────────────────────────

create table if not exists public.residency_applications (
  id                  uuid        primary key default gen_random_uuid(),
  journal_name        text        not null,
  contact_name        text        not null,
  email               text        not null,
  mission_statement   text,
  sample_issue_url    text,
  why_now             text,
  status              text        not null default 'pending'
                      check (status in ('pending', 'shortlisted', 'accepted', 'declined')),
  created_at          timestamptz not null default now()
);

alter table public.residency_applications enable row level security;

create policy "Anyone can submit a residency application"
  on public.residency_applications for insert
  with check (true);
