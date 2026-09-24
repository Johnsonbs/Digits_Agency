-- Digit's Agency — accounts, leaderboard, and access-control schema.
-- Run this once in Supabase Dashboard -> SQL Editor -> New query -> Run.

-- 1) Profiles: one row per signed-up user, extending auth.users.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  access_tier text not null default 'restricted' check (access_tier in ('restricted', 'full')),
  coins integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Anyone (including guests, who never sign in) can read all profiles — this
-- table has nothing private in it (no email/password, just username/role/
-- tier/coins), and the leaderboard needs to be viewable by guests too, not
-- just account holders. No direct UPDATE policy is defined on purpose:
-- coins/role/access_tier must never be settable straight from the client (a
-- kid could open devtools and set coins to 999999 otherwise). All writes to
-- those fields go through the SECURITY DEFINER functions below.
create policy "profiles_select_public"
  on public.profiles for select
  to anon, authenticated
  using (true);

-- Turns on live updates so the leaderboard refreshes itself without a
-- page reload whenever anyone's coins change.
alter publication supabase_realtime add table public.profiles;

create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- 2) Auto-create a profile row whenever someone signs up.
-- Expects the signup call to pass { data: { username: '...' } }.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', 'Player-' || substr(new.id::text, 1, 6))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3) Case progress: one JSON blob per user per theme, mirroring the shape
-- already used in localStorage today. Fully owner-writable — this only
-- controls "where you left off", not what content you're allowed to reach.
-- The actual access gate is profiles.access_tier / profiles.role, which
-- users can never write to directly.
create table if not exists public.case_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  theme_id text not null,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, theme_id)
);

alter table public.case_progress enable row level security;

create policy "case_progress_select_own"
  on public.case_progress for select
  to authenticated
  using (auth.uid() = user_id);

create policy "case_progress_insert_own"
  on public.case_progress for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "case_progress_update_own"
  on public.case_progress for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 4) Award coins safely. Callable by any signed-in user, but it can only
-- increment the CALLER's own balance by a bounded amount — never set an
-- absolute value, never touch another user's row. This isn't airtight
-- (a determined kid could still call it repeatedly to farm coins) but it
-- blocks the trivial "set my coins to 999999" devtools trick, which is a
-- proportionate bar for a kids' leaderboard with no real stakes.
create or replace function public.award_coins(p_amount integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_balance integer;
begin
  if p_amount is null or p_amount < 1 or p_amount > 100 then
    raise exception 'invalid coin amount';
  end if;

  update public.profiles
  set coins = coins + p_amount
  where id = auth.uid()
  returning coins into new_balance;

  return new_balance;
end;
$$;

grant execute on function public.award_coins(integer) to authenticated;

-- 5) Admin-only: grant or revoke full access for a specific user.
create or replace function public.set_user_access(p_user_id uuid, p_access_tier text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_access_tier not in ('restricted', 'full') then
    raise exception 'invalid access tier';
  end if;

  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    raise exception 'only an admin can change access levels';
  end if;

  update public.profiles set access_tier = p_access_tier where id = p_user_id;
end;
$$;

grant execute on function public.set_user_access(uuid, text) to authenticated;

-- 6) After you've signed up in the app once, run this to make your own
-- account the admin (replace the email with your real login email):
-- update public.profiles set role = 'admin', access_tier = 'full'
--   where id = (select id from auth.users where email = 'you@example.com');
