-- Restore Royal Fruit Crown on the shared TALKZY wallet with atomic, idempotent bets and payouts.
alter table public.talkzy_royal_fruit_rounds drop constraint if exists talkzy_royal_fruit_rounds_forced_fruit_check;
alter table public.talkzy_royal_fruit_rounds drop constraint if exists talkzy_royal_fruit_rounds_winning_fruit_check;
alter table public.talkzy_royal_fruit_rounds add constraint talkzy_royal_fruit_rounds_forced_fruit_check
  check (forced_fruit is null or forced_fruit in ('cherry','lemon','orange','peach','watermelon','plum','grapes','apple','mango','cherries','pineapple','strawberry'));
alter table public.talkzy_royal_fruit_rounds add constraint talkzy_royal_fruit_rounds_winning_fruit_check
  check (winning_fruit is null or winning_fruit in ('cherry','lemon','orange','peach','watermelon','plum','grapes','apple','mango','cherries','pineapple','strawberry'));
alter table public.talkzy_royal_fruit_bets drop constraint if exists talkzy_royal_fruit_bets_fruit_check;
alter table public.talkzy_royal_fruit_bets drop constraint if exists talkzy_royal_fruit_bets_amount_check;
alter table public.talkzy_royal_fruit_bets add constraint talkzy_royal_fruit_bets_fruit_check
  check (fruit in ('cherry','lemon','orange','peach','watermelon','plum','grapes','apple','mango','cherries','pineapple','strawberry'));
alter table public.talkzy_royal_fruit_bets add constraint talkzy_royal_fruit_bets_amount_check
  check (amount in (10,100,500,1000,5000,10000,100000));

create or replace function public.talkzy_royal_fruit_place_bet(
  p_user_id uuid, p_fruit text, p_amount bigint, p_request_key text
) returns jsonb language plpgsql set search_path='' as $$
declare r public.talkzy_royal_fruit_rounds; bal bigint; prior public.talkzy_royal_fruit_bets;
begin
  if coalesce(auth.jwt()->>'role','') <> 'service_role' then raise exception 'SERVICE_ROLE_REQUIRED' using errcode='42501'; end if;
  if p_user_id is null then raise exception 'USER_REQUIRED'; end if;
  if p_fruit not in ('apple','mango','orange','grapes','watermelon','cherries','pineapple','strawberry') then raise exception 'INVALID_FRUIT'; end if;
  if p_amount not in (100,500,1000,5000) then raise exception 'INVALID_BET_AMOUNT'; end if;
  if p_request_key is null or length(p_request_key)<12 or length(p_request_key)>100 then raise exception 'INVALID_REQUEST_KEY'; end if;
  select * into prior from public.talkzy_royal_fruit_bets where user_id=p_user_id and request_key=p_request_key;
  if found then
    select balance into bal from public.talkzy_wallets where user_id=p_user_id;
    return jsonb_build_object('accepted',true,'duplicate',true,'round_id',prior.round_id,'balance',coalesce(bal,0));
  end if;
  select * into r from public.talkzy_royal_fruit_rounds where phase='betting' order by round_number desc limit 1 for update;
  if not found or now()>=r.bet_closes_at then raise exception 'BETTING_CLOSED'; end if;
  select * into prior from public.talkzy_royal_fruit_bets where user_id=p_user_id and request_key=p_request_key;
  if found then
    select balance into bal from public.talkzy_wallets where user_id=p_user_id;
    return jsonb_build_object('accepted',true,'duplicate',true,'round_id',prior.round_id,'balance',coalesce(bal,0));
  end if;
  insert into public.talkzy_wallets(user_id,balance) values(p_user_id,0) on conflict(user_id) do nothing;
  select balance into bal from public.talkzy_wallets where user_id=p_user_id for update;
  if bal<p_amount then raise exception 'INSUFFICIENT_COINS'; end if;
  update public.talkzy_wallets set balance=balance-p_amount,updated_at=now() where user_id=p_user_id returning balance into bal;
  insert into public.talkzy_royal_fruit_bets(round_id,user_id,fruit,amount,request_key)
    values(r.id,p_user_id,p_fruit,p_amount,p_request_key);
  insert into public.talkzy_coin_ledger(user_id,amount,balance_after,event_type,reference_id,note)
    values(p_user_id,-p_amount,bal,'fruit_crown_bet',r.id,'Royal Fruit Crown bet: '||p_fruit);
  return jsonb_build_object('accepted',true,'duplicate',false,'round_id',r.id,'balance',bal);
end $$;
revoke all on function public.talkzy_royal_fruit_place_bet(uuid,text,bigint,text) from public,anon,authenticated;
grant execute on function public.talkzy_royal_fruit_place_bet(uuid,text,bigint,text) to service_role;

create or replace function public.talkzy_royal_fruit_get_state_for_user(p_user_id uuid)
returns jsonb language plpgsql set search_path='' as $$
declare r public.talkzy_royal_fruit_rounds; bal bigint; my_bets jsonb; leaders jsonb; history jsonb;
begin
  if coalesce(auth.jwt()->>'role','') <> 'service_role' then raise exception 'SERVICE_ROLE_REQUIRED' using errcode='42501'; end if;
  select * into r from public.talkzy_royal_fruit_rounds where phase in ('betting','drawing','result') order by round_number desc limit 1;
  select coalesce((select w.balance from public.talkzy_wallets w where w.user_id=p_user_id),0) into bal;
  select coalesce(jsonb_agg(jsonb_build_object('fruit',b.fruit,'amount',b.total) order by b.fruit),'[]'::jsonb)
    into my_bets from (select fruit,sum(amount)::bigint total from public.talkzy_royal_fruit_bets where round_id=r.id and user_id=p_user_id group by fruit) b;
  select coalesce(jsonb_agg(x.item order by x.total desc),'[]'::jsonb) into leaders from (
    select jsonb_build_object('user_id',b.user_id,'display_name',p.display_name,'avatar_url',p.avatar_url,'coins',sum(b.amount*case b.fruit
      when 'apple' then 5 when 'mango' then 5 when 'orange' then 5 when 'grapes' then 40
      when 'watermelon' then 5 when 'cherries' then 25 when 'pineapple' then 15 when 'strawberry' then 10
      else 0 end)) item,
      sum(b.amount*case b.fruit when 'apple' then 5 when 'mango' then 5 when 'orange' then 5
      when 'grapes' then 40 when 'watermelon' then 5 when 'cherries' then 25
      when 'pineapple' then 15 when 'strawberry' then 10 else 0 end) total
    from public.talkzy_royal_fruit_bets b join public.talkzy_profiles p on p.id=b.user_id
    where b.round_id=r.id and b.fruit=r.winning_fruit
    group by b.user_id,p.display_name,p.avatar_url order by total desc limit 3
  ) x;
  select coalesce(jsonb_agg(jsonb_build_object('fruit',h.winning_fruit) order by h.round_number desc),'[]'::jsonb)
    into history from (select winning_fruit,round_number from public.talkzy_royal_fruit_rounds
      where phase in ('result','completed') and winning_fruit is not null order by round_number desc limit 6) h;
  return jsonb_build_object(
    'round',case when r.id is null then null else jsonb_build_object('id',r.id,'number',r.round_number,'phase',r.phase,
      'started_at',r.started_at,'bet_closes_at',r.bet_closes_at,'animation_ends_at',r.animation_ends_at,
      'result_ends_at',r.result_ends_at,'winning_fruit',r.winning_fruit) end,
    'balance',coalesce(bal,0),'my_bets',my_bets,'leaders',leaders,'history',history);
end $$;
revoke all on function public.talkzy_royal_fruit_get_state_for_user(uuid) from public,anon,authenticated;
grant execute on function public.talkzy_royal_fruit_get_state_for_user(uuid) to service_role;

create or replace function public.talkzy_royal_fruit_advance_round()
returns jsonb language plpgsql set search_path='' as $$
declare r public.talkzy_royal_fruit_rounds; f text; winner record; bal bigint;
begin
  if coalesce(auth.jwt()->>'role','') <> 'service_role' then raise exception 'SERVICE_ROLE_REQUIRED' using errcode='42501'; end if;
  select * into r from public.talkzy_royal_fruit_rounds where phase in ('betting','drawing','result') order by round_number desc limit 1 for update;
  if not found then
    insert into public.talkzy_royal_fruit_rounds default values returning * into r;
  elsif r.phase='betting' and now()>=r.bet_closes_at then
    update public.talkzy_royal_fruit_rounds set phase='drawing',animation_ends_at=bet_closes_at+interval '10 seconds'
      where id=r.id returning * into r;
  elsif r.phase='drawing' and now()>=r.animation_ends_at then
    f:=coalesce(r.forced_fruit,(array['apple','mango','orange','grapes','watermelon','cherries','pineapple','strawberry'])[1+floor(random()*8)::int]);
    update public.talkzy_royal_fruit_rounds set phase='result',winning_fruit=f,result_ends_at=now()+interval '5 seconds'
      where id=r.id returning * into r;
    for winner in
      select user_id,sum(amount*case fruit when 'apple' then 5 when 'mango' then 5 when 'orange' then 5
        when 'grapes' then 40 when 'watermelon' then 5 when 'cherries' then 25
        when 'pineapple' then 15 when 'strawberry' then 10 else 0 end)::bigint total
      from public.talkzy_royal_fruit_bets where round_id=r.id and fruit=f group by user_id
    loop
      if winner.total>0 then
        insert into public.talkzy_wallets(user_id,balance) values(winner.user_id,0) on conflict(user_id) do nothing;
        update public.talkzy_wallets set balance=balance+winner.total,updated_at=now()
          where user_id=winner.user_id returning balance into bal;
        insert into public.talkzy_coin_ledger(user_id,amount,balance_after,event_type,reference_id,note)
          values(winner.user_id,winner.total,bal,'fruit_crown_win',r.id,'Royal Fruit Crown winning payout');
      end if;
    end loop;
  elsif r.phase='result' and now()>=r.result_ends_at then
    update public.talkzy_royal_fruit_rounds set phase='completed' where id=r.id;
    insert into public.talkzy_royal_fruit_rounds default values returning * into r;
  end if;
  return jsonb_build_object('round_id',r.id,'phase',r.phase,'round_number',r.round_number);
end $$;
revoke all on function public.talkzy_royal_fruit_advance_round() from public,anon,authenticated;
grant execute on function public.talkzy_royal_fruit_advance_round() to service_role;

create or replace function public.talkzy_royal_fruit_set_forced_result(p_fruit text)
returns jsonb language plpgsql set search_path='' as $$
declare r public.talkzy_royal_fruit_rounds;
begin
  if coalesce(auth.jwt()->>'role','') <> 'service_role' then raise exception 'SERVICE_ROLE_REQUIRED' using errcode='42501'; end if;
  if p_fruit not in ('apple','mango','orange','grapes','watermelon','cherries','pineapple','strawberry') then raise exception 'INVALID_FRUIT'; end if;
  select * into r from public.talkzy_royal_fruit_rounds where phase='betting' order by round_number desc limit 1 for update;
  if not found or now()>=r.bet_closes_at then raise exception 'ROUND_LOCKED'; end if;
  update public.talkzy_royal_fruit_rounds set forced_fruit=p_fruit where id=r.id;
  return jsonb_build_object('set',true,'round_id',r.id,'fruit',p_fruit);
end $$;
revoke all on function public.talkzy_royal_fruit_set_forced_result(text) from public,anon,authenticated;
grant execute on function public.talkzy_royal_fruit_set_forced_result(text) to service_role;

-- Start the first round only when there is no live round.
insert into public.talkzy_royal_fruit_rounds(phase,started_at,bet_closes_at)
select 'betting',now(),now()+interval '37 seconds'
where not exists (select 1 from public.talkzy_royal_fruit_rounds where phase in ('betting','drawing','result'));
