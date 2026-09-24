-- Patch: widen profiles read access so guests (who never sign in) can view
-- the leaderboard too, not just account holders. Safe because this table
-- holds nothing private — no email/password, just username/role/tier/coins.
-- Run this once in the Supabase SQL Editor.

drop policy if exists "profiles_select_all_authenticated" on public.profiles;

create policy "profiles_select_public"
  on public.profiles for select
  to anon, authenticated
  using (true);

-- Turns on live updates so the leaderboard refreshes itself without a
-- page reload whenever anyone's coins change.
alter publication supabase_realtime add table public.profiles;
