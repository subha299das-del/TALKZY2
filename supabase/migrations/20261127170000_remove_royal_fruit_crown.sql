-- Permanently retire Royal Fruit Crown database objects.
-- Historical migration files remain in place for migration-chain integrity.
-- Shared TALKZY wallet and coin-ledger history are intentionally preserved.
drop function if exists public.talkzy_royal_fruit_place_bet(uuid,text,bigint,text);
drop function if exists public.talkzy_royal_fruit_place_bet(uuid,text,bigint);
drop function if exists public.talkzy_royal_fruit_get_state_for_user(uuid);
drop function if exists public.talkzy_royal_fruit_advance_round();
drop function if exists public.talkzy_royal_fruit_set_forced_result(text);

drop function if exists public.talkzy_fruit_get_state_for_user(uuid);
drop function if exists public.talkzy_fruit_place_bet_service(uuid,text,bigint);
drop function if exists public.talkzy_fruit_set_forced_result(text);
drop function if exists public.talkzy_fruit_advance_round();
drop function if exists public.talkzy_fruit_get_state();
drop function if exists public.talkzy_fruit_place_bet(text,bigint);

drop table if exists public.talkzy_royal_fruit_bets cascade;
drop table if exists public.talkzy_royal_fruit_rounds cascade;
drop table if exists public.talkzy_retired_fruit_bets_archive cascade;
drop table if exists public.talkzy_retired_fruit_rounds_archive cascade;
drop table if exists public.talkzy_fruit_bets cascade;
drop table if exists public.talkzy_fruit_rounds cascade;
