-- TALKZY Lucky Bag wallet, escrow, claim, and 3-minute refund.
create extension if not exists pg_cron;
create table if not exists public.talkzy_wallets(user_id uuid primary key references auth.users(id) on delete cascade,balance bigint not null default 0 check(balance>=0),updated_at timestamptz not null default now());
alter table public.talkzy_wallets enable row level security;
drop policy if exists "wallet owner can view" on public.talkzy_wallets;
create policy "wallet owner can view" on public.talkzy_wallets for select to authenticated using ((select auth.uid())=user_id);
grant select on public.talkzy_wallets to authenticated;
create table if not exists public.talkzy_coin_ledger(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,amount bigint not null,balance_after bigint not null,event_type text not null,reference_id uuid,note text,created_at timestamptz not null default now());
alter table public.talkzy_coin_ledger enable row level security;
drop policy if exists "wallet owner sees ledger" on public.talkzy_coin_ledger;
create policy "wallet owner sees ledger" on public.talkzy_coin_ledger for select to authenticated using ((select auth.uid())=user_id);
grant select on public.talkzy_coin_ledger to authenticated;
create table if not exists public.talkzy_lucky_bags(id uuid primary key default gen_random_uuid(),sender_id uuid not null references auth.users(id) on delete restrict,room_id uuid not null references public.talkzy_rooms(id) on delete restrict,scope text not null check(scope in('room','world')),coin_amount_per_bag bigint not null check(coin_amount_per_bag>0),bag_count integer not null check(bag_count between 1 and 99),total_coins bigint not null check(total_coins>0),remaining_coins bigint not null check(remaining_coins>=0),remaining_bags integer not null check(remaining_bags>=0),status text not null default 'active' check(status in('active','claimed','expired','cancelled')),expires_at timestamptz not null default(now()+interval '3 minutes'),created_at timestamptz not null default now(),closed_at timestamptz);
alter table public.talkzy_lucky_bags enable row level security;
drop policy if exists "active lucky bags visible" on public.talkzy_lucky_bags;
create policy "active lucky bags visible" on public.talkzy_lucky_bags for select to authenticated using(status='active' or sender_id=(select auth.uid()));
grant select on public.talkzy_lucky_bags to authenticated;
create table if not exists public.talkzy_lucky_bag_claims(id uuid primary key default gen_random_uuid(),bag_id uuid not null references public.talkzy_lucky_bags(id) on delete cascade,claimer_id uuid not null references auth.users(id) on delete restrict,reward_coins bigint not null check(reward_coins>0),claimed_at timestamptz not null default now(),unique(bag_id,claimer_id));
alter table public.talkzy_lucky_bag_claims enable row level security;
drop policy if exists "claimer and sender can see claims" on public.talkzy_lucky_bag_claims;
create policy "claimer and sender can see claims" on public.talkzy_lucky_bag_claims for select to authenticated using(claimer_id=(select auth.uid()) or exists(select 1 from public.talkzy_lucky_bags b where b.id=bag_id and b.sender_id=(select auth.uid())));
grant select on public.talkzy_lucky_bag_claims to authenticated;

create or replace function public.talkzy_lucky_bag_send(p_room_id uuid,p_scope text,p_coin_amount_per_bag bigint,p_bag_count integer) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare u uuid:=auth.uid(); total bigint; bal bigint; b public.talkzy_lucky_bags;
begin
 if u is null then raise exception 'Login required'; end if;
 if p_scope not in('room','world') or p_coin_amount_per_bag<1 or p_bag_count<1 or p_bag_count>99 or p_coin_amount_per_bag>1000000000 then raise exception 'Invalid amount or quantity'; end if;
 total:=p_coin_amount_per_bag*p_bag_count;
 if p_room_id is null or not exists(select 1 from public.talkzy_rooms where id=p_room_id and status='active') then raise exception 'Room unavailable'; end if;
 if not exists(select 1 from public.talkzy_room_presence where room_id=p_room_id and user_id=u) then raise exception 'You must be inside this room to send a Lucky Bag'; end if;
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

create or replace function public.talkzy_lucky_bag_claim(p_bag_id uuid) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare u uuid:=auth.uid(); b public.talkzy_lucky_bags; reward bigint; bal bigint;
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
 if b.sender_id=u then raise exception 'Cannot open your own bag'; end if;
 if b.remaining_bags<=0 or b.remaining_coins<=0 then raise exception 'Bag empty'; end if;
 if b.scope='room' and b.room_id is distinct from(select room_id from public.talkzy_room_presence where user_id=u limit 1) then raise exception 'Enter sender room first'; end if;
 if exists(select 1 from public.talkzy_lucky_bag_claims where bag_id=p_bag_id and claimer_id=u) then raise exception 'Already claimed'; end if;
 if b.remaining_bags=1 then reward:=b.remaining_coins; else reward:=1+floor(random()*(b.remaining_coins-b.remaining_bags+1))::bigint; end if;
 update public.talkzy_lucky_bags set remaining_coins=remaining_coins-reward,remaining_bags=remaining_bags-1,status=case when remaining_bags-1=0 then 'claimed' else 'active' end,closed_at=case when remaining_bags-1=0 then now() else null end where id=p_bag_id;
 insert into public.talkzy_lucky_bag_claims(bag_id,claimer_id,reward_coins) values(p_bag_id,u,reward);
 insert into public.talkzy_wallets(user_id,balance) values(u,0) on conflict do nothing;
 update public.talkzy_wallets set balance=balance+reward,updated_at=now() where user_id=u returning balance into bal;
 insert into public.talkzy_coin_ledger(user_id,amount,balance_after,event_type,reference_id,note) values(u,reward,bal,'lucky_bag_claim',p_bag_id,'Lucky Bag reward');
 return jsonb_build_object('bag_id',p_bag_id,'reward_coins',reward,'balance',bal);
end $$;
revoke all on function public.talkzy_lucky_bag_claim(uuid) from public,anon;
grant execute on function public.talkzy_lucky_bag_claim(uuid) to authenticated;

create or replace function public.talkzy_lucky_bag_expire() returns integer language plpgsql security definer set search_path=public,pg_temp as $$
declare b record; bal bigint; n integer:=0;
begin
 for b in select * from public.talkzy_lucky_bags where status='active' and expires_at<=now() for update skip locked loop
  if b.remaining_coins>0 then
   insert into public.talkzy_wallets(user_id,balance) values(b.sender_id,0) on conflict do nothing;
   update public.talkzy_wallets set balance=balance+b.remaining_coins,updated_at=now() where user_id=b.sender_id returning balance into bal;
   insert into public.talkzy_coin_ledger(user_id,amount,balance_after,event_type,reference_id,note) values(b.sender_id,b.remaining_coins,bal,'lucky_bag_refund',b.id,'Unclaimed Lucky Bag refund');
  end if;
  update public.talkzy_lucky_bags set remaining_coins=0,remaining_bags=0,status='expired',closed_at=now() where id=b.id;
  n:=n+1;
 end loop; return n;
end $$;
revoke all on function public.talkzy_lucky_bag_expire() from public,anon,authenticated;
select cron.unschedule(jobid) from cron.job where jobname='talkzy-lucky-bag-expire';
select cron.schedule('talkzy-lucky-bag-expire','* * * * *','select public.talkzy_lucky_bag_expire();');
do $$ begin
 if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='talkzy_lucky_bags') then alter publication supabase_realtime add table public.talkzy_lucky_bags; end if;
 if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='talkzy_wallets') then alter publication supabase_realtime add table public.talkzy_wallets; end if;
end $$;

-- Query indexes for expiry worker, active room bag cards, and wallet history.
create index if not exists talkzy_lucky_bags_active_expiry_idx on public.talkzy_lucky_bags(status,expires_at);
create index if not exists talkzy_lucky_bags_room_status_expiry_idx on public.talkzy_lucky_bags(room_id,status,expires_at);
create index if not exists talkzy_coin_ledger_user_created_idx on public.talkzy_coin_ledger(user_id,created_at desc);
