-- Royal Fruit Crown: private per-user betting history and daily payout leaderboard.
create or replace function public.talkzy_royal_fruit_get_history(
  p_user_id uuid,
  p_limit integer default 20,
  p_offset integer default 0
) returns jsonb
language plpgsql
set search_path=''
as $$
declare result jsonb;
begin
  if coalesce(auth.jwt()->>'role','') <> 'service_role' then
    raise exception 'SERVICE_ROLE_REQUIRED' using errcode='42501';
  end if;
  if p_user_id is null then raise exception 'USER_REQUIRED'; end if;

  select coalesce(jsonb_agg(row_data order by round_number desc),'[]'::jsonb)
    into result
  from (
    select
      r.round_number,
      jsonb_build_object(
        'round_number', r.round_number,
        'played_at', r.started_at,
        'bets', coalesce(b.bets,'[]'::jsonb),
        'winning_fruit', r.winning_fruit,
        'winning_amount', nullif(coalesce(w.amount,0),0)
      ) as row_data
    from public.talkzy_royal_fruit_rounds r
    join (
      select distinct round_id
      from public.talkzy_royal_fruit_bets
      where user_id=p_user_id
    ) mine on mine.round_id=r.id
    left join lateral (
      select jsonb_agg(jsonb_build_object('fruit',x.fruit,'amount',x.amount) order by x.fruit) as bets
      from (
        select fruit, sum(amount)::bigint as amount
        from public.talkzy_royal_fruit_bets
        where round_id=r.id and user_id=p_user_id
        group by fruit
      ) x
    ) b on true
    left join lateral (
      select sum(l.amount)::bigint as amount
      from public.talkzy_coin_ledger l
      where l.user_id=p_user_id
        and l.event_type='fruit_crown_win'
        and l.reference_id=r.id
        and l.amount>0
    ) w on true
    order by r.round_number desc
    limit greatest(1,least(coalesce(p_limit,20),100))
    offset greatest(coalesce(p_offset,0),0)
  ) rows_page;
  return result;
end $$;

revoke all on function public.talkzy_royal_fruit_get_history(uuid,integer,integer) from public,anon,authenticated;
grant execute on function public.talkzy_royal_fruit_get_history(uuid,integer,integer) to service_role;

create or replace function public.talkzy_royal_fruit_get_daily_top_winners(p_limit integer default 10)
returns jsonb
language plpgsql
set search_path=''
as $$
declare result jsonb; ist_day_start timestamptz;
begin
  if coalesce(auth.jwt()->>'role','') <> 'service_role' then
    raise exception 'SERVICE_ROLE_REQUIRED' using errcode='42501';
  end if;

  ist_day_start := ((now() at time zone 'Asia/Kolkata')::date::timestamp at time zone 'Asia/Kolkata');

  select coalesce(jsonb_agg(jsonb_build_object(
    'user_id',ranked.user_id,
    'display_name',ranked.display_name,
    'talkzy_id',ranked.talkzy_id,
    'avatar_url',ranked.avatar_url,
    'coins',ranked.coins,
    'rank',ranked.rank
  ) order by ranked.rank),'[]'::jsonb)
  into result
  from (
    select
      totals.user_id,
      p.display_name,
      p.talkzy_id,
      p.avatar_url,
      totals.coins,
      row_number() over(order by totals.coins desc,totals.first_win_at asc,totals.user_id asc)::integer as rank
    from (
      select l.user_id,sum(l.amount)::bigint as coins,min(l.created_at) as first_win_at
      from public.talkzy_coin_ledger l
      where l.event_type='fruit_crown_win'
        and l.amount>0
        and l.created_at>=ist_day_start
      group by l.user_id
    ) totals
    join public.talkzy_profiles p on p.id=totals.user_id
    order by totals.coins desc,totals.first_win_at asc,totals.user_id asc
    limit greatest(1,least(coalesce(p_limit,10),100))
  ) ranked;
  return result;
end $$;

revoke all on function public.talkzy_royal_fruit_get_daily_top_winners(integer) from public,anon,authenticated;
grant execute on function public.talkzy_royal_fruit_get_daily_top_winners(integer) to service_role;
