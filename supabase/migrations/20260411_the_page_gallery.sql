-- The Page Gallery — core schema migration
-- 2026-04-11

-- ─────────────────────────────────────────────
-- submissions
-- ─────────────────────────────────────────────
create table if not exists public.submissions (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  content         text,
  type            text not null check (type in ('poem', 'essay', 'visual')),
  status          text not null default 'draft'
                    check (status in ('draft', 'submitted', 'under_review', 'accepted', 'published')),
  submitter_id    uuid references auth.users(id) on delete cascade,
  rights_status   text not null default 'pending'
                    check (rights_status in ('retained', 'licensed', 'pending')),
  metadata        jsonb default '{}'::jsonb,
  journal_id      uuid,
  created_at      timestamptz not null default now()
);

alter table public.submissions enable row level security;

-- Writers can read/write their own submissions
create policy "submissions: owner read"
  on public.submissions for select
  using (auth.uid() = submitter_id);

create policy "submissions: owner insert"
  on public.submissions for insert
  with check (auth.uid() = submitter_id);

create policy "submissions: owner update"
  on public.submissions for update
  using (auth.uid() = submitter_id);

create policy "submissions: owner delete"
  on public.submissions for delete
  using (auth.uid() = submitter_id);

-- ─────────────────────────────────────────────
-- editions
-- ─────────────────────────────────────────────
create table if not exists public.editions (
  id                    uuid primary key default gen_random_uuid(),
  title                 text not null,
  slug                  text unique not null,
  type                  text not null default 'chapbook'
                          check (type in ('chapbook', 'digital', 'special', 'boxed_set')),
  edition_size          integer,
  price_cents           integer not null default 0,
  pre_order_price_cents integer,
  current_stock         integer,
  pre_order_filled      integer default 0,
  status                text not null default 'forthcoming'
                          check (status in ('forthcoming', 'pre_order', 'available', 'sold_out')),
  release_date          date,
  metadata              jsonb default '{}'::jsonb,
  created_at            timestamptz not null default now()
);

alter table public.editions enable row level security;

-- Editions are publicly readable
create policy "editions: public read"
  on public.editions for select
  using (true);

-- Only authenticated service role can write editions (managed via Supabase dashboard / admin)
create policy "editions: admin insert"
  on public.editions for insert
  with check (auth.role() = 'service_role');

create policy "editions: admin update"
  on public.editions for update
  using (auth.role() = 'service_role');

-- ─────────────────────────────────────────────
-- memberships
-- ─────────────────────────────────────────────
create table if not exists public.memberships (
  id                      uuid primary key default gen_random_uuid(),
  profile_id              uuid not null references auth.users(id) on delete cascade,
  tier                    text not null check (tier in ('garden', 'circle', 'founding')),
  expires_at              timestamptz,
  perks                   jsonb default '[]'::jsonb,
  stripe_subscription_id  text,
  created_at              timestamptz not null default now()
);

alter table public.memberships enable row level security;

create policy "memberships: owner read"
  on public.memberships for select
  using (auth.uid() = profile_id);

create policy "memberships: service insert"
  on public.memberships for insert
  with check (auth.role() = 'service_role');

create policy "memberships: service update"
  on public.memberships for update
  using (auth.role() = 'service_role');

-- ─────────────────────────────────────────────
-- licensed_journals
-- ─────────────────────────────────────────────
create table if not exists public.licensed_journals (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  owner_id        uuid references auth.users(id) on delete set null,
  annual_fee_cents integer not null default 200000,
  status          text not null default 'active'
                    check (status in ('active', 'suspended', 'cancelled')),
  custom_domain   text,
  branding        jsonb default '{}'::jsonb,
  created_at      timestamptz not null default now()
);

alter table public.licensed_journals enable row level security;

create policy "licensed_journals: owner read"
  on public.licensed_journals for select
  using (auth.uid() = owner_id);

create policy "licensed_journals: service write"
  on public.licensed_journals for insert
  with check (auth.role() = 'service_role');

create policy "licensed_journals: service update"
  on public.licensed_journals for update
  using (auth.role() = 'service_role');

-- ─────────────────────────────────────────────
-- view: available editions with stock info
-- ─────────────────────────────────────────────
create or replace view public.available_editions_with_stock as
select
  e.id,
  e.title,
  e.slug,
  e.type,
  e.edition_size,
  e.price_cents,
  e.pre_order_price_cents,
  e.current_stock,
  e.pre_order_filled,
  e.status,
  e.release_date,
  e.metadata,
  case
    when e.current_stock is not null and e.current_stock <= 10 then true
    else false
  end as is_low_stock,
  case
    when e.edition_size > 0 and e.pre_order_filled is not null
    then round((e.pre_order_filled::numeric / e.edition_size) * 100, 1)
    else null
  end as pre_order_pct
from public.editions e
where e.status in ('available', 'pre_order');
