-- ─── Improve handle_new_user trigger ─────────────────────────────────────────
-- Populate display_name from OAuth / email metadata on first sign-up so that
-- new users have a usable profile immediately, without a separate onboarding call.

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  _display_name text;
begin
  -- Prefer full_name from OAuth metadata, fall back to the part before @ in email
  _display_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1)
  );

  insert into public.profiles (id, display_name)
  values (new.id, _display_name)
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Trigger already exists from migration 20240001; replace the function body above
-- is sufficient — the trigger binding stays in place.

-- ─── Backfill: create missing profile rows for existing auth users ─────────────
-- Safe to run multiple times thanks to ON CONFLICT DO NOTHING.
insert into public.profiles (id, display_name)
select
  u.id,
  coalesce(
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    split_part(u.email, '@', 1)
  )
from auth.users u
where not exists (
  select 1 from public.profiles p where p.id = u.id
)
on conflict (id) do nothing;
