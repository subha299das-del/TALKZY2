-- Retire the original Royal Fruit Crown implementation without deleting its history.
-- Preserve old rounds and bets as private archive tables; keep the general coin ledger intact.
drop function if exists public.talkzy_fruit_get_state_for_user(uuid);
drop function if exists public.talkzy_fruit_place_bet_service(uuid,text,bigint);
drop function if exists public.talkzy_fruit_set_forced_result(text);
drop function if exists public.talkzy_fruit_advance_round();
drop function if exists public.talkzy_fruit_get_state();
drop function if exists public.talkzy_fruit_place_bet(text,bigint);

alter table if exists public.talkzy_fruit_bets
  rename to talkzy_retired_fruit_bets_archive;
alter table if exists public.talkzy_fruit_rounds
  rename to talkzy_retired_fruit_rounds_archive;

revoke all on public.talkzy_retired_fruit_bets_archive,
  public.talkzy_retired_fruit_rounds_archive from public, anon, authenticated;
grant select on public.talkzy_retired_fruit_bets_archive,
  public.talkzy_retired_fruit_rounds_archive to service_role;
