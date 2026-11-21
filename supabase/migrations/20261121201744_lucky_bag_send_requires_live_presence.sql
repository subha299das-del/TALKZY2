create or replace function public.talkzy_lucky_bag_send(p_room_id uuid,p_scope text,p_coin_amount_per_bag bigint,p_bag_count integer) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare u uuid:=auth.uid(); total bigint; bal bigint; b public.talkzy_lucky_bags;
begin
 if u is null then raise exception 'Login required'; end if;
 if p_scope not in('room','world') or p_coin_amount_per_bag<1 or p_bag_count<1 or p_bag_count>99 or p_coin_amount_per_bag>1000000000 then raise exception 'Invalid amount or quantity'; end if;
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
end $$;
revoke all on function public.talkzy_lucky_bag_send(uuid,text,bigint,integer) from public,anon;
grant execute on function public.talkzy_lucky_bag_send(uuid,text,bigint,integer) to authenticated;