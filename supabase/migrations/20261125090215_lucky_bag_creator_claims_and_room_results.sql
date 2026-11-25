-- Lucky Bag v2: creator claims, quantity up to 100, and public room claim results.
alter table public.talkzy_lucky_bags drop constraint if exists talkzy_lucky_bags_bag_count_check;
alter table public.talkzy_lucky_bags add constraint talkzy_lucky_bags_bag_count_check check (bag_count between 1 and 100);

create or replace function public.talkzy_lucky_bag_send(p_room_id uuid,p_scope text,p_coin_amount_per_bag bigint,p_bag_count integer)
returns jsonb language plpgsql security definer set search_path = '' as $function$
declare u uuid:=auth.uid(); total bigint; bal bigint; b public.talkzy_lucky_bags;
begin
 if u is null then raise exception 'Login required'; end if;
 if p_scope not in ('room','world') or p_coin_amount_per_bag<1 or p_bag_count<1 or p_bag_count>100 or p_coin_amount_per_bag>1000000000 then raise exception 'Invalid amount or quantity'; end if;
 total:=p_coin_amount_per_bag*p_bag_count;
 if p_room_id is null or not exists(select 1 from public.talkzy_rooms where id=p_room_id and status='active') then raise exception 'Room unavailable'; end if;
 if not exists(select 1 from public.talkzy_room_presence where room_id=p_room_id and user_id=u and last_seen_at>now()-interval '75 seconds') then raise exception 'You must be inside this room to send a Lucky Bag'; end if;
 insert into public.talkzy_wallets(user_id,balance) values(u,0) on conflict do nothing;
 select balance into bal from public.talkzy_wallets where user_id=u for update;
 if bal<total then raise exception 'Insufficient coins'; end if;
 update public.talkzy_wallets set balance=balance-total,updated_at=now() where user_id=u returning balance into bal;
 insert into public.talkzy_lucky_bags(sender_id,room_id,scope,coin_amount_per_bag,bag_count,total_coins,remaining_coins,remaining_bags) values(u,p_room_id,p_scope,p_coin_amount_per_bag,p_bag_count,total,total,p_bag_count) returning * into b;
 insert into public.talkzy_coin_ledger(user_id,amount,balance_after,event_type,reference_id,note) values(u,-total,bal,'lucky_bag_send',b.id,p_scope||' bag sent');
 return jsonb_build_object('bag_id',b.id,'total_coins',total,'balance',bal,'expires_at',b.expires_at);
end $function$;
revoke all on function public.talkzy_lucky_bag_send(uuid,text,bigint,integer) from public,anon;
grant execute on function public.talkzy_lucky_bag_send(uuid,text,bigint,integer) to authenticated;

create or replace function public.talkzy_lucky_bag_claim(p_bag_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $function$
declare u uuid:=auth.uid(); b public.talkzy_lucky_bags; reward bigint; bal bigint; winner_name text;
begin
 if u is null then raise exception 'Login required'; end if;
 select * into b from public.talkzy_lucky_bags where id=p_bag_id for update;
 if not found then raise exception 'Bag not found'; end if;
 if b.status<>'active' then raise exception 'Bag is no longer active'; end if;
 if b.expires_at<=now() then
  if b.remaining_coins>0 then
   insert into public.talkzy_wallets(user_id,balance) values(b.sender_id,0) on conflict do nothing;
   update public.talkzy_wallets set balance=balance+b.remaining_coins,updated_at=now() where user_id=b.sender_id returning balance into bal;
   insert into public.talkzy_coin_ledger(user_id,amount,balance_after,event_type,reference_id,note) values(b.sender_id,b.remaining_coins,bal,'lucky_bag_refund',b.id,'Expired Lucky Bag refund');
  end if;
  update public.talkzy_lucky_bags set remaining_coins=0,remaining_bags=0,status='expired',closed_at=now() where id=b.id;
  return jsonb_build_object('expired',true,'message','Expired Lucky Bag has been refunded');
 end if;
 -- Creator may claim one of the shares like every other room participant.
 if b.remaining_bags<=0 or b.remaining_coins<=0 then raise exception 'Bag empty'; end if;
 if b.scope='room' and not exists(select 1 from public.talkzy_room_presence p where p.room_id=b.room_id and p.user_id=u and p.last_seen_at>now()-interval '75 seconds') then raise exception 'Enter sender room first'; end if;
 if exists(select 1 from public.talkzy_lucky_bag_claims where bag_id=p_bag_id and claimer_id=u) then raise exception 'Already claimed'; end if;
 if b.remaining_bags=1 then reward:=b.remaining_coins; else reward:=1+floor(random()*(b.remaining_coins-b.remaining_bags+1))::bigint; end if;
 update public.talkzy_lucky_bags set remaining_coins=remaining_coins-reward,remaining_bags=remaining_bags-1,status=case when remaining_bags-1=0 then 'claimed' else 'active' end,closed_at=case when remaining_bags-1=0 then now() else null end where id=p_bag_id;
 insert into public.talkzy_lucky_bag_claims(bag_id,claimer_id,reward_coins) values(p_bag_id,u,reward);
 insert into public.talkzy_wallets(user_id,balance) values(u,0) on conflict do nothing;
 update public.talkzy_wallets set balance=balance+reward,updated_at=now() where user_id=u returning balance into bal;
 insert into public.talkzy_coin_ledger(user_id,amount,balance_after,event_type,reference_id,note) values(u,reward,bal,'lucky_bag_claim',p_bag_id,'Lucky Bag reward');
 select coalesce(display_name,'TALKZY User') into winner_name from public.talkzy_profiles where id=u;
 insert into public.talkzy_room_messages(room_id,sender_id,message_type,message_text)
 values(b.room_id,u,'text','🎁 '||coalesce(winner_name,'TALKZY User')||' received '||to_char(reward,'FM999,999,999,999,999,999,990')||' gold coins from the Lucky Bag!');
 return jsonb_build_object('bag_id',b.id,'reward_coins',reward,'balance',bal);
end $function$;
revoke all on function public.talkzy_lucky_bag_claim(uuid) from public,anon;
grant execute on function public.talkzy_lucky_bag_claim(uuid) to authenticated;
