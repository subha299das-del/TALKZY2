-- Ensure one accepted tap can be retried safely without charging twice.
alter table public.talkzy_royal_fruit_bets
  add column if not exists request_key text;

update public.talkzy_royal_fruit_bets
set request_key = 'legacy-' || id::text
where request_key is null;

alter table public.talkzy_royal_fruit_bets
  alter column request_key set not null;

create unique index if not exists talkzy_royal_fruit_bets_user_request_key
  on public.talkzy_royal_fruit_bets(user_id, request_key);

drop function if exists public.talkzy_royal_fruit_place_bet(uuid,text,bigint);

create or replace function public.talkzy_royal_fruit_place_bet(
  p_user_id uuid,
  p_fruit text,
  p_amount bigint,
  p_request_key text
)
returns jsonb
language plpgsql
set search_path=''
as $$
declare
  r public.talkzy_royal_fruit_rounds;
  bal bigint;
  prior public.talkzy_royal_fruit_bets;
begin
  if coalesce(auth.jwt()->>'role','') <> 'service_role' then
    raise exception 'SERVICE_ROLE_REQUIRED' using errcode='42501';
  end if;
  if p_user_id is null then raise exception 'USER_REQUIRED'; end if;
  if p_fruit not in ('cherry','lemon','orange','peach','watermelon','plum','grapes','apple') then
    raise exception 'INVALID_FRUIT';
  end if;
  if p_amount not in (10,100,1000,10000,100000) then raise exception 'INVALID_BET_AMOUNT'; end if;
  if p_request_key is null or length(p_request_key) < 12 or length(p_request_key) > 100 then
    raise exception 'INVALID_REQUEST_KEY';
  end if;

  -- Fast replay path: a retry of an accepted tap never debits the wallet again.
  select * into prior
  from public.talkzy_royal_fruit_bets
  where user_id=p_user_id and request_key=p_request_key;
  if found then
    select balance into bal from public.talkzy_wallets where user_id=p_user_id;
    return jsonb_build_object('accepted',true,'duplicate',true,'round_id',prior.round_id,'balance',coalesce(bal,0));
  end if;

  select * into r
  from public.talkzy_royal_fruit_rounds
  where phase='betting'
  order by round_number desc
  limit 1
  for update;
  if not found or now() >= r.bet_closes_at then raise exception 'BETTING_CLOSED'; end if;

  -- Recheck after taking the round lock to serialize concurrent retries.
  select * into prior
  from public.talkzy_royal_fruit_bets
  where user_id=p_user_id and request_key=p_request_key;
  if found then
    select balance into bal from public.talkzy_wallets where user_id=p_user_id;
    return jsonb_build_object('accepted',true,'duplicate',true,'round_id',prior.round_id,'balance',coalesce(bal,0));
  end if;

  insert into public.talkzy_wallets(user_id,balance)
  values(p_user_id,0) on conflict(user_id) do nothing;
  select balance into bal
  from public.talkzy_wallets
  where user_id=p_user_id
  for update;
  if bal < p_amount then raise exception 'INSUFFICIENT_COINS'; end if;

  update public.talkzy_wallets
  set balance=balance-p_amount, updated_at=now()
  where user_id=p_user_id
  returning balance into bal;

  insert into public.talkzy_royal_fruit_bets(round_id,user_id,fruit,amount,request_key)
  values(r.id,p_user_id,p_fruit,p_amount,p_request_key);

  insert into public.talkzy_coin_ledger(user_id,amount,balance_after,event_type,reference_id,note)
  values(p_user_id,-p_amount,bal,'fruit_crown_bet',r.id,'Royal Fruit Crown bet: '||p_fruit);

  return jsonb_build_object('accepted',true,'duplicate',false,'round_id',r.id,'balance',bal);
end
$$;

revoke all on function public.talkzy_royal_fruit_place_bet(uuid,text,bigint,text) from public,anon,authenticated;
grant execute on function public.talkzy_royal_fruit_place_bet(uuid,text,bigint,text) to service_role;
