-- Royal Fruit Crown: adopt the exact Canva fruit set and payout multipliers.
-- Legacy fruit IDs remain accepted by historical table constraints so existing records are preserved.
alter table public.talkzy_fruit_rounds drop constraint if exists talkzy_fruit_rounds_winning_fruit_check;
alter table public.talkzy_fruit_rounds drop constraint if exists talkzy_fruit_rounds_forced_fruit_check;
alter table public.talkzy_fruit_bets drop constraint if exists talkzy_fruit_bets_fruit_check;
alter table public.talkzy_fruit_rounds add constraint talkzy_fruit_rounds_winning_fruit_check check (winning_fruit is null or winning_fruit in ('cherry','lemon','orange','peach','watermelon','plum','grapes','apple','pear','strawberry'));
alter table public.talkzy_fruit_rounds add constraint talkzy_fruit_rounds_forced_fruit_check check (forced_fruit is null or forced_fruit in ('cherry','lemon','orange','peach','watermelon','plum','grapes','apple','pear','strawberry'));
alter table public.talkzy_fruit_bets add constraint talkzy_fruit_bets_fruit_check check (fruit in ('cherry','lemon','orange','peach','watermelon','plum','grapes','apple','pear','strawberry'));

create or replace function public.talkzy_fruit_place_bet(p_fruit text,p_amount bigint)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare u uuid:=auth.uid(); r public.talkzy_fruit_rounds; bal bigint;
begin
 if u is null then raise exception 'AUTH_REQUIRED' using errcode='42501'; end if;
 if p_fruit not in ('cherry','lemon','orange','peach','watermelon','plum','grapes','apple','pear','strawberry') then raise exception 'INVALID_FRUIT'; end if;
 if p_amount not in (10,100,1000,10000,100000) then raise exception 'INVALID_BET_AMOUNT'; end if;
 select * into r from public.talkzy_fruit_rounds where phase='betting' order by round_number desc limit 1 for update;
 if not found or now()>=r.bet_closes_at then raise exception 'BETTING_CLOSED'; end if;
 insert into public.talkzy_wallets(user_id,balance) values(u,0) on conflict(user_id) do nothing;
 select balance into bal from public.talkzy_wallets where user_id=u for update;
 if bal<p_amount then raise exception 'INSUFFICIENT_COINS'; end if;
 update public.talkzy_wallets set balance=balance-p_amount,updated_at=now() where user_id=u returning balance into bal;
 insert into public.talkzy_fruit_bets(round_id,user_id,fruit,amount) values(r.id,u,p_fruit,p_amount);
 insert into public.talkzy_coin_ledger(user_id,amount,balance_after,event_type,reference_id,note) values(u,-p_amount,bal,'fruit_crown_bet',r.id,'Royal Fruit Crown bet: '||p_fruit);
 return jsonb_build_object('accepted',true,'round_id',r.id,'balance',bal);
end $$;
revoke all on function public.talkzy_fruit_place_bet(text,bigint) from public,anon;
grant execute on function public.talkzy_fruit_place_bet(text,bigint) to authenticated;

create or replace function public.talkzy_fruit_get_state()
returns jsonb language plpgsql security definer set search_path=''
as $$
declare u uuid:=auth.uid(); r public.talkzy_fruit_rounds; bal bigint; my_bets jsonb; leaders jsonb;
begin
 if u is null then raise exception 'AUTH_REQUIRED' using errcode='42501'; end if;
 select * into r from public.talkzy_fruit_rounds where phase in ('betting','drawing','result') order by round_number desc limit 1;
 select coalesce(w.balance,0) into bal from public.talkzy_wallets w where w.user_id=u;
 select coalesce(jsonb_agg(jsonb_build_object('fruit',b.fruit,'amount',b.amount) order by b.created_at),'[]'::jsonb) into my_bets from public.talkzy_fruit_bets b where b.round_id=r.id and b.user_id=u;
 select coalesce(jsonb_agg(x.item order by x.total desc),'[]'::jsonb) into leaders from (
  select jsonb_build_object('user_id',b.user_id,'display_name',p.display_name,'avatar_url',p.avatar_url,'coins',sum(b.amount*case b.fruit when 'cherry' then 5 when 'lemon' then 5 when 'orange' then 5 when 'peach' then 40 when 'watermelon' then 5 when 'plum' then 25 when 'grapes' then 15 when 'apple' then 10 when 'pear' then 5 when 'strawberry' then 25 end)) item,
  sum(b.amount*case b.fruit when 'cherry' then 5 when 'lemon' then 5 when 'orange' then 5 when 'peach' then 40 when 'watermelon' then 5 when 'plum' then 25 when 'grapes' then 15 when 'apple' then 10 when 'pear' then 5 when 'strawberry' then 25 end) total
  from public.talkzy_fruit_bets b join public.talkzy_profiles p on p.id=b.user_id where b.round_id=r.id and b.fruit=r.winning_fruit group by b.user_id,p.display_name,p.avatar_url order by total desc limit 3
 ) x;
 return jsonb_build_object('round',case when r.id is null then null else jsonb_build_object('id',r.id,'number',r.round_number,'phase',r.phase,'started_at',r.started_at,'bet_closes_at',r.bet_closes_at,'animation_ends_at',r.animation_ends_at,'result_ends_at',r.result_ends_at,'winning_fruit',r.winning_fruit) end,'balance',coalesce(bal,0),'my_bets',my_bets,'leaders',leaders);
end $$;
revoke all on function public.talkzy_fruit_get_state() from public,anon;
grant execute on function public.talkzy_fruit_get_state() to authenticated;

create or replace function public.talkzy_fruit_advance_round()
returns jsonb language plpgsql security definer set search_path=''
as $$
declare r public.talkzy_fruit_rounds; f text; winner record; bal bigint;
begin
 if coalesce(auth.role(),'')<>'service_role' then raise exception 'SERVICE_ROLE_REQUIRED' using errcode='42501'; end if;
 select * into r from public.talkzy_fruit_rounds where phase in ('betting','drawing','result') order by round_number desc limit 1 for update;
 if not found then insert into public.talkzy_fruit_rounds default values returning * into r;
 elsif r.phase='betting' and now()>=r.bet_closes_at then
  update public.talkzy_fruit_rounds set phase='drawing',animation_ends_at=bet_closes_at+interval '10 seconds' where id=r.id returning * into r;
 elsif r.phase='drawing' and now()>=r.animation_ends_at then
  f:=coalesce(r.forced_fruit,(array['cherry','plum','orange','watermelon','pear','strawberry','lemon','grapes'])[1+floor(random()*8)::int]);
  update public.talkzy_fruit_rounds set phase='result',winning_fruit=f,result_ends_at=now()+interval '5 seconds' where id=r.id returning * into r;
  for winner in select user_id,sum(amount*case fruit when 'cherry' then 5 when 'lemon' then 5 when 'orange' then 5 when 'peach' then 40 when 'watermelon' then 5 when 'plum' then 25 when 'grapes' then 15 when 'apple' then 10 when 'pear' then 5 when 'strawberry' then 25 end)::bigint total from public.talkzy_fruit_bets where round_id=r.id and fruit=f group by user_id loop
   if winner.total>0 then
    insert into public.talkzy_wallets(user_id,balance) values(winner.user_id,0) on conflict(user_id) do nothing;
    update public.talkzy_wallets set balance=balance+winner.total,updated_at=now() where user_id=winner.user_id returning balance into bal;
    insert into public.talkzy_coin_ledger(user_id,amount,balance_after,event_type,reference_id,note) values(winner.user_id,winner.total,bal,'fruit_crown_win',r.id,'Royal Fruit Crown winning payout');
   end if;
  end loop;
 elsif r.phase='result' and now()>=r.result_ends_at then
  update public.talkzy_fruit_rounds set phase='completed' where id=r.id;
  insert into public.talkzy_fruit_rounds default values returning * into r;
 end if;
 return jsonb_build_object('round_id',r.id,'phase',r.phase,'round_number',r.round_number);
end $$;
revoke all on function public.talkzy_fruit_advance_round() from public,anon,authenticated;
grant execute on function public.talkzy_fruit_advance_round() to service_role;

create or replace function public.talkzy_fruit_set_forced_result(p_fruit text)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare r public.talkzy_fruit_rounds;
begin
 if coalesce(auth.role(),'')<>'service_role' then raise exception 'SERVICE_ROLE_REQUIRED' using errcode='42501'; end if;
 if p_fruit not in ('cherry','lemon','orange','peach','watermelon','plum','grapes','apple','pear','strawberry') then raise exception 'INVALID_FRUIT'; end if;
 select * into r from public.talkzy_fruit_rounds where phase in ('betting','drawing') order by round_number desc limit 1 for update;
 if not found then raise exception 'NO_ACTIVE_ROUND'; end if;
 if now()>=r.bet_closes_at then raise exception 'ROUND_LOCKED'; end if;
 update public.talkzy_fruit_rounds set forced_fruit=p_fruit where id=r.id;
 return jsonb_build_object('set',true,'round_id',r.id,'fruit',p_fruit);
end $$;
revoke all on function public.talkzy_fruit_set_forced_result(text) from public,anon,authenticated;
grant execute on function public.talkzy_fruit_set_forced_result(text) to service_role;

create or replace function public.talkzy_fruit_place_bet_service(p_user_id uuid,p_fruit text,p_amount bigint)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare r public.talkzy_fruit_rounds; bal bigint;
begin
 if coalesce(auth.role(),'')<>'service_role' then raise exception 'SERVICE_ROLE_REQUIRED' using errcode='42501'; end if;
 if p_user_id is null then raise exception 'USER_REQUIRED'; end if;
 if p_fruit not in ('cherry','lemon','orange','peach','watermelon','plum','grapes','apple','pear','strawberry') then raise exception 'INVALID_FRUIT'; end if;
 if p_amount not in (10,100,1000,10000,100000) then raise exception 'INVALID_BET_AMOUNT'; end if;
 select * into r from public.talkzy_fruit_rounds where phase='betting' order by round_number desc limit 1 for update;
 if not found or now()>=r.bet_closes_at then raise exception 'BETTING_CLOSED'; end if;
 insert into public.talkzy_wallets(user_id,balance) values(p_user_id,0) on conflict(user_id) do nothing;
 select balance into bal from public.talkzy_wallets where user_id=p_user_id for update;
 if bal<p_amount then raise exception 'INSUFFICIENT_COINS'; end if;
 update public.talkzy_wallets set balance=balance-p_amount,updated_at=now() where user_id=p_user_id returning balance into bal;
 insert into public.talkzy_fruit_bets(round_id,user_id,fruit,amount) values(r.id,p_user_id,p_fruit,p_amount);
 insert into public.talkzy_coin_ledger(user_id,amount,balance_after,event_type,reference_id,note) values(p_user_id,-p_amount,bal,'fruit_crown_bet',r.id,'Royal Fruit Crown bet: '||p_fruit);
 return jsonb_build_object('accepted',true,'round_id',r.id,'balance',bal);
end $$;
revoke all on function public.talkzy_fruit_place_bet_service(uuid,text,bigint) from public,anon,authenticated;
grant execute on function public.talkzy_fruit_place_bet_service(uuid,text,bigint) to service_role;

create or replace function public.talkzy_fruit_get_state_for_user(p_user_id uuid)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare r public.talkzy_fruit_rounds; bal bigint; my_bets jsonb; leaders jsonb; history jsonb;
begin
 if coalesce(auth.role(),'')<>'service_role' then raise exception 'SERVICE_ROLE_REQUIRED' using errcode='42501'; end if;
 select * into r from public.talkzy_fruit_rounds where phase in ('betting','drawing','result') order by round_number desc limit 1;
 select coalesce(w.balance,0) into bal from public.talkzy_wallets w where w.user_id=p_user_id;
 select coalesce(jsonb_agg(jsonb_build_object('fruit',b.fruit,'amount',b.amount) order by b.created_at),'[]'::jsonb) into my_bets from public.talkzy_fruit_bets b where b.round_id=r.id and b.user_id=p_user_id;
 select coalesce(jsonb_agg(x.item order by x.total desc),'[]'::jsonb) into leaders from (
  select jsonb_build_object('user_id',b.user_id,'display_name',p.display_name,'avatar_url',p.avatar_url,'coins',sum(b.amount*case b.fruit when 'cherry' then 5 when 'lemon' then 5 when 'orange' then 5 when 'peach' then 40 when 'watermelon' then 5 when 'plum' then 25 when 'grapes' then 15 when 'apple' then 10 when 'pear' then 5 when 'strawberry' then 25 end)) item,
  sum(b.amount*case b.fruit when 'cherry' then 5 when 'lemon' then 5 when 'orange' then 5 when 'peach' then 40 when 'watermelon' then 5 when 'plum' then 25 when 'grapes' then 15 when 'apple' then 10 when 'pear' then 5 when 'strawberry' then 25 end) total
  from public.talkzy_fruit_bets b join public.talkzy_profiles p on p.id=b.user_id where b.round_id=r.id and b.fruit=r.winning_fruit group by b.user_id,p.display_name,p.avatar_url order by total desc limit 3
 ) x;
 select coalesce(jsonb_agg(jsonb_build_object('fruit',h.winning_fruit) order by h.round_number desc),'[]'::jsonb) into history
 from (select winning_fruit,round_number from public.talkzy_fruit_rounds where phase='completed' and winning_fruit is not null order by round_number desc limit 8) h;
 return jsonb_build_object('round',case when r.id is null then null else jsonb_build_object('id',r.id,'number',r.round_number,'phase',r.phase,'started_at',r.started_at,'bet_closes_at',r.bet_closes_at,'animation_ends_at',r.animation_ends_at,'result_ends_at',r.result_ends_at,'winning_fruit',r.winning_fruit) end,'balance',coalesce(bal,0),'my_bets',my_bets,'leaders',leaders,'history',history);
end $$;
revoke all on function public.talkzy_fruit_get_state_for_user(uuid) from public,anon,authenticated;
grant execute on function public.talkzy_fruit_get_state_for_user(uuid) to service_role;

