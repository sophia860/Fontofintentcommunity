-- ─── Editions shop ────────────────────────────────────────────────────────────
-- editions, edition_variants, orders, decrement_stock RPC

-- ─── Editions ─────────────────────────────────────────────────────────────────

create table if not exists public.editions (
  id                  uuid        primary key default gen_random_uuid(),
  title               text        not null,
  author              text        not null,
  author_location     text,
  illustrator         text,
  date_written_start  text,
  date_written_end    text,
  published           text,
  description         text        not null default '',
  pages               integer,
  print_run           integer,
  isbn                text,
  cover_image_url     text,
  status              text        not null default 'forthcoming'
                      check (status in ('available', 'sold_out', 'forthcoming', 'pre_order')),
  sort_order          integer     not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.editions enable row level security;

create policy "Editions are publicly readable"
  on public.editions for select
  using (true);

create or replace function public.handle_edition_updated_at()
returns trigger language plpgsql security definer as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger on_edition_updated
  before update on public.editions
  for each row execute procedure public.handle_edition_updated_at();

-- ─── Edition variants ─────────────────────────────────────────────────────────
-- Each edition has 1-N purchasable variants (chapbook, signed giclée, original).

create table if not exists public.edition_variants (
  id            uuid        primary key default gen_random_uuid(),
  edition_id    uuid        not null references public.editions(id) on delete cascade,
  label         text        not null,                  -- e.g. 'Chapbook', 'Signed Giclée'
  price_cents   integer     not null,                  -- price in pence (GBP)
  currency      text        not null default 'GBP',
  stock         integer,                               -- null = unlimited
  sold_count    integer     not null default 0,
  sort_order    integer     not null default 0,
  created_at    timestamptz not null default now()
);

alter table public.edition_variants enable row level security;

create policy "Edition variants are publicly readable"
  on public.edition_variants for select
  using (true);

-- ─── Orders ───────────────────────────────────────────────────────────────────

create table if not exists public.orders (
  id                uuid        primary key default gen_random_uuid(),
  variant_id        uuid        not null references public.edition_variants(id),
  buyer_email       text,
  buyer_name        text,
  quantity          integer     not null default 1,
  amount_cents      integer     not null,
  currency          text        not null default 'GBP',
  status            text        not null default 'pending'
                    check (status in ('pending', 'paid', 'failed', 'refunded')),
  paypal_order_id   text,
  paypal_capture_id text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table public.orders enable row level security;

-- Edge functions use the service role; anon users can insert pending orders.
create policy "Anyone can insert a pending order"
  on public.orders for insert
  with check (status = 'pending');

-- Buyers can read their own orders (matched by paypal_order_id session; fine for anon flow).
create policy "Service role can update orders"
  on public.orders for update
  using (auth.role() = 'service_role');

create or replace function public.handle_order_updated_at()
returns trigger language plpgsql security definer as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger on_order_updated
  before update on public.orders
  for each row execute procedure public.handle_order_updated_at();

-- ─── decrement_stock RPC ──────────────────────────────────────────────────────
-- Called by the capture edge function after a successful payment.
-- No-ops safely if stock is already 0 or null (unlimited).

create or replace function public.decrement_stock(variant_id uuid, qty int)
returns void
language plpgsql security definer as $$
begin
  update public.edition_variants
  set
    stock      = case when stock is null then null else greatest(stock - qty, 0) end,
    sold_count = sold_count + qty
  where id = variant_id
    and (stock is null or stock >= qty);
end;
$$;
