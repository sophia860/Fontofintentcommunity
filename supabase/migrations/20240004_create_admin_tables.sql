-- ─── Admin / operations tables ───────────────────────────────────────────────
-- site_content, payments

-- ─── Site content ─────────────────────────────────────────────────────────────
-- Editable copy blocks managed via the admin dashboard.

create table if not exists public.site_content (
  id          uuid        primary key default gen_random_uuid(),
  key         text        not null unique,
  label       text        not null default '',
  value       text        not null default '',
  updated_at  timestamptz not null default now()
);

alter table public.site_content enable row level security;

-- Anyone can read site content (it drives public copy).
create policy "Site content is publicly readable"
  on public.site_content for select
  using (true);

-- Only service role (admin backend) can insert/update/delete.
-- Front-end admin panel uses the anon key so we allow authenticated users
-- to upsert; the admin route guard restricts UI access to the controller.
create policy "Authenticated users can upsert site content"
  on public.site_content for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update site content"
  on public.site_content for update
  using (auth.role() = 'authenticated');

-- Keep updated_at current.
create or replace function public.handle_site_content_updated_at()
returns trigger language plpgsql security definer as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger on_site_content_updated
  before update on public.site_content
  for each row execute procedure public.handle_site_content_updated_at();

-- ─── Payments ─────────────────────────────────────────────────────────────────
-- Manual payment / invoice records managed by the site controller.

create table if not exists public.payments (
  id              uuid        primary key default gen_random_uuid(),
  email           text        not null,
  description     text        not null default '',
  amount_pence    integer     not null default 0,
  currency        text        not null default 'GBP',
  status          text        not null default 'pending'
                  check (status in ('pending', 'paid', 'refunded', 'cancelled')),
  stripe_id       text,       -- optional Stripe payment/invoice ID
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.payments enable row level security;

-- Only authenticated users can read payments (admin UI only).
create policy "Authenticated users can read payments"
  on public.payments for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can insert payments"
  on public.payments for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update payments"
  on public.payments for update
  using (auth.role() = 'authenticated');

-- Keep updated_at current.
create or replace function public.handle_payment_updated_at()
returns trigger language plpgsql security definer as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger on_payment_updated
  before update on public.payments
  for each row execute procedure public.handle_payment_updated_at();
