-- Retire the original Royal Fruit Crown implementation.
-- Keep the general coin ledger intact for financial audit history.
drop function if exists public.talkzy_fruit_get_state_for_user(uuid);
drop function if exists public.talkzy_fruit_place_bet_service(uuid,text,bigint);
drop function if exists public.talkzy_fruit_set_forced_result(text);
drop function if exists public.talkzy_fruit_advance_round();
drop function if exists public.talkzy_fruit_get_state();
drop function if exists public.talkzy_fruit_place_bet(text,bigint);
drop table if exists public.talkzy_fruit_bets;
drop table if exists public.talkzy_fruit_rounds;
