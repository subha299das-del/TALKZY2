-- Daily Royal Fruit Crown counters reset at midnight India Standard Time.
create or replace function public.talkzy_royal_fruit_get_state_for_user(p_user_id uuid)
returns jsonb language plpgsql set search_path='' as $$
declare
  r public.talkzy_royal_fruit_rounds;
  bal bigint;
  my_bets jsonb;
  leaders jsonb;
  history jsonb;
  today_wins bigint;
  daily_round_number bigint;
  ist_day_start timestamptz;
begin
  if coalesce(auth.jwt()->>'role','') <> 'service_role' then
    raise exception 'SERVICE_ROLE_REQUIRED' using errcode='42501';
  end if;

  ist_day_start := ((now() at time zone 'Asia/Kolkata')::date::timestamp at time zone 'Asia/Kolkata');

  select * into r
  from public.talkzy_royal_fruit_rounds
  where phase in ('betting','drawing','result')
  order by round_number desc limit 1;

  select coalesce((select w.balance from public.talkzy_wallets w where w.user_id=p_user_id),0)
    into bal;

  select coalesce(sum(l.amount),0)::bigint
    into today_wins
  from public.talkzy_coin_ledger l
  where l.user_id=p_user_id
    and l.event_type='fruit_crown_win'
    and l.created_at >= ist_day_start
    and l.amount > 0;

  select count(*)::bigint into daily_round_number
  from public.talkzy_royal_fruit_rounds
  where started_at >= ist_day_start;

  select coalesce(jsonb_agg(jsonb_build_object('fruit',b.fruit,'amount',b.total) order by b.fruit),'[]'::jsonb)
    into my_bets
  from (
    select fruit,sum(amount)::bigint total
    from public.talkzy_royal_fruit_bets
    where round_id=r.id and user_id=p_user_id
    group by fruit
  ) b;

  select coalesce(jsonb_agg(x.item order by x.total desc),'[]'::jsonb) into leaders
  from (
    select jsonb_build_object(
      'user_id',b.user_id,
      'display_name',p.display_name,
      'avatar_url',p.avatar_url,
      'coins',sum(b.amount*case b.fruit
        when 'apple' then 5 when 'mango' then 5 when 'orange' then 5 when 'grapes' then 40
        when 'watermelon' then 5 when 'cherries' then 25 when 'pineapple' then 15 when 'strawberry' then 10
        else 0 end)
    ) item,
    sum(b.amount*case b.fruit
      when 'apple' then 5 when 'mango' then 5 when 'orange' then 5
      when 'grapes' then 40 when 'watermelon' then 5 when 'cherries' then 25
      when 'pineapple' then 15 when 'strawberry' then 10 else 0 end) total
    from public.talkzy_royal_fruit_bets b
    join public.talkzy_profiles p on p.id=b.user_id
    where b.round_id=r.id and b.fruit=r.winning_fruit
    group by b.user_id,p.display_name,p.avatar_url
    order by total desc limit 3
  ) x;

  select coalesce(jsonb_agg(jsonb_build_object('fruit',h.winning_fruit) order by h.round_number desc),'[]'::jsonb)
    into history
  from (
    select winning_fruit,round_number
    from public.talkzy_royal_fruit_rounds
    where phase in ('result','completed') and winning_fruit is not null
    order by round_number desc limit 6
  ) h;

  return jsonb_build_object(
    'round',case when r.id is null then null else jsonb_build_object(
      'id',r.id,
      'number',daily_round_number,
      'phase',r.phase,
      'started_at',r.started_at,
      'bet_closes_at',r.bet_closes_at,
      'animation_ends_at',r.animation_ends_at,
      'result_ends_at',r.result_ends_at,
      'winning_fruit',r.winning_fruit
    ) end,
    'daily_round_number',daily_round_number,
    'today_wins',coalesce(today_wins,0),
    'balance',coalesce(bal,0),
    'my_bets',my_bets,
    'leaders',leaders,
    'history',history
  );
end $$;

revoke all on function public.talkzy_royal_fruit_get_state_for_user(uuid) from public,anon,authenticated;
grant execute on function public.talkzy_royal_fruit_get_state_for_user(uuid) to service_role;
