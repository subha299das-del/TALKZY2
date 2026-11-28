-- Make the history round number match the game's daily IST round counter.
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

  select coalesce(jsonb_agg(row_data order by played_at desc),'[]'::jsonb)
    into result
  from (
    select
      r.started_at as played_at,
      jsonb_build_object(
        'round_number', r.daily_round_number,
        'played_at', r.started_at,
        'bets', coalesce(b.bets,'[]'::jsonb),
        'winning_fruit', r.winning_fruit,
        'winning_amount', nullif(coalesce(w.amount,0),0)
      ) as row_data
    from (
      select rounds.*,
        row_number() over (
          partition by (rounds.started_at at time zone 'Asia/Kolkata')::date
          order by rounds.started_at,rounds.round_number
        )::bigint as daily_round_number
      from public.talkzy_royal_fruit_rounds rounds
    ) r
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
    order by r.started_at desc,r.round_number desc
    limit greatest(1,least(coalesce(p_limit,20),100))
    offset greatest(coalesce(p_offset,0),0)
  ) rows_page;
  return result;
end $$;

revoke all on function public.talkzy_royal_fruit_get_history(uuid,integer,integer) from public,anon,authenticated;
grant execute on function public.talkzy_royal_fruit_get_history(uuid,integer,integer) to service_role;
