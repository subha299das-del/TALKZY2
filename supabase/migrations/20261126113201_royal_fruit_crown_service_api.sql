create or replace function public.talkzy_fruit_place_bet_service(p_user_id uuid,p_fruit text,p_amount bigint)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare r public.talkzy_fruit_rounds; bal bigint;
begin
 if coalesce(auth.role(),'')<>'service_role' then raise exception 'SERVICE_ROLE_REQUIRED' using errcode='42501'; end if;
 if p_user_id is null then raise exception 'USER_REQUIRED'; end if;
 if p_fruit not in ('cherry','plum','orange','watermelon','pear','strawberry','lemon','grapes') then raise exception 'INVALID_FRUIT'; end if;
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
  select jsonb_build_object('user_id',b.user_id,'display_name',p.display_name,'avatar_url',p.avatar_url,'coins',sum(b.amount*case b.fruit when 'cherry' then 5 when 'plum' then 5 when 'orange' then 5 when 'watermelon' then 40 when 'pear' then 5 when 'strawberry' then 25 when 'lemon' then 15 when 'grapes' then 10 end)) item,
  sum(b.amount*case b.fruit when 'cherry' then 5 when 'plum' then 5 when 'orange' then 5 when 'watermelon' then 40 when 'pear' then 5 when 'strawberry' then 25 when 'lemon' then 15 when 'grapes' then 10 end) total
  from public.talkzy_fruit_bets b join public.talkzy_profiles p on p.id=b.user_id where b.round_id=r.id and b.fruit=r.winning_fruit group by b.user_id,p.display_name,p.avatar_url order by total desc limit 3
 ) x;
 select coalesce(jsonb_agg(jsonb_build_object('fruit',h.winning_fruit) order by h.round_number desc),'[]'::jsonb) into history
 from (select winning_fruit,round_number from public.talkzy_fruit_rounds where phase='completed' and winning_fruit is not null order by round_number desc limit 8) h;
 return jsonb_build_object('round',case when r.id is null then null else jsonb_build_object('id',r.id,'number',r.round_number,'phase',r.phase,'started_at',r.started_at,'bet_closes_at',r.bet_closes_at,'animation_ends_at',r.animation_ends_at,'result_ends_at',r.result_ends_at,'winning_fruit',r.winning_fruit) end,'balance',coalesce(bal,0),'my_bets',my_bets,'leaders',leaders,'history',history);
end $$;
revoke all on function public.talkzy_fruit_get_state_for_user(uuid) from public,anon,authenticated;
grant execute on function public.talkzy_fruit_get_state_for_user(uuid) to service_role;
