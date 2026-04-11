-- ─── RPCs ─────────────────────────────────────────────────────────────────────
-- get_my_profile   — returns the signed-in user's profile row from public.users view
-- get_tag_patterns — returns the top-N tags for a given user's writings

-- ─── get_my_profile ───────────────────────────────────────────────────────────
-- Called by useGardenAuth to hydrate the gardenUser profile.
-- Mirrors the shape expected by the GardenUser interface in useGardenAuth.ts:
--   id, auth_id, email, display_name, first_name, last_name, bio, role, tier,
--   profile_image_url, is_anonymous, has_completed_onboarding, created_at

create or replace function public.get_my_profile()
returns table (
  id                      uuid,
  auth_id                 uuid,
  email                   text,
  display_name            text,
  first_name              text,
  last_name               text,
  bio                     text,
  role                    text,
  tier                    text,
  profile_image_url       text,
  is_anonymous            boolean,
  has_completed_onboarding boolean,
  created_at              timestamptz
)
language plpgsql security definer as $$
declare
  _user auth.users;
begin
  -- Fetch current auth user
  select * into _user from auth.users where id = auth.uid() limit 1;
  if not found then return; end if;

  return query
    select
      p.id                                              as id,
      p.id                                              as auth_id,
      coalesce(_user.email, '')                         as email,
      p.display_name                                    as display_name,
      null::text                                        as first_name,
      null::text                                        as last_name,
      p.short_bio                                       as bio,
      p.role                                            as role,
      'free'::text                                      as tier,
      p.avatar_url                                      as profile_image_url,
      false                                             as is_anonymous,
      (p.display_name is not null)                      as has_completed_onboarding,
      p.created_at                                      as created_at
    from public.profiles p
    where p.id = auth.uid()
    limit 1;
end;
$$;

-- ─── get_tag_patterns ─────────────────────────────────────────────────────────
-- Returns the top-6 tags across all writings for a given user, ordered by frequency.
-- WriterDashboard falls back to client-side computation if this RPC is unavailable,
-- so this is an optional optimisation; it still needs to exist for the RPC call.

create or replace function public.get_tag_patterns(uid uuid)
returns table (tag text, count bigint)
language sql security definer as $$
  select
    unnested_tag                  as tag,
    count(*)                      as count
  from (
    select unnest(w.tags) as unnested_tag
    from public.writings w
    where w.author_id = uid
  ) sub
  group by unnested_tag
  order by count desc
  limit 6;
$$;
