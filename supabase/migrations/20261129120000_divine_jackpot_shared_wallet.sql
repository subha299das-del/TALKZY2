-- Divine Jackpot: server-authoritative spins using the shared TALKZY wallet and coin ledger.
create table if not exists public.talkzy_divine_jackpot_spins (
  id uuid primary key default gen_random_uuid(),
  spin_number bigint generated always as identity unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  bet_amount bigint not null check (bet_amount in (50,100,250,500,1000)),
  reels smallint[] not null check (
    cardinality(reels) = 30
    and reels <@ array[0,1,2,3,4,5,6,7]::smallint[]
  ),
  winning_lines jsonb not null default '[]'::jsonb,
  payout bigint not null default 0 check (payout >= 0),
  request_key text not null,
  created_at timestamptz not null default now(),
  constraint talkzy_divine_jackpot_spins_user_request_unique unique (user_id, request_key)
);

create index if not exists talkzy_divine_jackpot_spins_user_created_idx
  on public.talkzy_divine_jackpot_spins(user_id, created_at desc);
create index if not exists talkzy_divine_jackpot_spins_created_idx
  on public.talkzy_divine_jackpot_spins(created_at desc);

alter table public.talkzy_divine_jackpot_spins enable row level security;
revoke all on public.talkzy_divine_jackpot_spins from public, anon, authenticated;
grant all on public.talkzy_divine_jackpot_spins to service_role;

create or replace function public.talkzy_divine_jackpot_spin(
  p_user_id uuid,
  p_bet_amount bigint,
  p_request_key text
) returns jsonb
language plpgsql
set search_path=''
as $$
declare
  v_balance bigint;
  v_today_wins bigint;
  v_existing public.talkzy_divine_jackpot_spins;
  v_spin public.talkzy_divine_jackpot_spins;
  v_reels smallint[];
  v_lines jsonb := '[]'::jsonb;
  v_total_payout bigint := 0;
  v_line_payout bigint;
  v_multiplier integer;
  v_symbol integer;
  v_count integer;
  v_row integer;
  v_col integer;
  v_offset integer;
begin
  if coalesce(auth.jwt()->>'role','') <> 'service_role' then
    raise exception 'SERVICE_ROLE_REQUIRED' using errcode='42501';
  end if;
  if p_user_id is null then raise exception 'USER_REQUIRED'; end if;
  if p_bet_amount not in (50,100,250,500,1000) then raise exception 'INVALID_BET_AMOUNT'; end if;
  if p_request_key is null or length(p_request_key)<12 or length(p_request_key)>100 then
    raise exception 'INVALID_REQUEST_KEY';
  end if;

  insert into public.talkzy_wallets(user_id,balance)
    values(p_user_id,0) on conflict(user_id) do nothing;
  select balance into v_balance
    from public.talkzy_wallets where user_id=p_user_id for update;

  -- A repeated request returns the original result and never charges twice.
  select * into v_existing
    from public.talkzy_divine_jackpot_spins
    where user_id=p_user_id and request_key=p_request_key;
  if found then
    select coalesce(sum(payout),0)::bigint into v_today_wins
      from public.talkzy_divine_jackpot_spins
      where user_id=p_user_id
        and created_at >= ((now() at time zone 'Asia/Kolkata')::date::timestamp at time zone 'Asia/Kolkata');
    return jsonb_build_object(
      'accepted',true,'duplicate',true,'spin_id',v_existing.id,
      'spin_number',v_existing.spin_number,'bet_amount',v_existing.bet_amount,
      'reels',to_jsonb(v_existing.reels),'winning_lines',v_existing.winning_lines,
      'payout',v_existing.payout,'balance',v_balance,'today_wins',v_today_wins
    );
  end if;

  if v_balance < p_bet_amount then raise exception 'INSUFFICIENT_COINS'; end if;

  -- Generate all 30 symbols on the server. The client cannot choose or alter a result.
  select array_agg(
    (pg_catalog.get_byte(pg_catalog.uuid_send(pg_catalog.gen_random_uuid()),0) % 8)::smallint
    order by n
  ) into v_reels
  from generate_series(1,30) as g(n);

  -- Preserve the existing 5-row x 6-column horizontal matching and multiplier rules.
  -- Symbols: Crown 12x, Phoenix 10x, Dragon 9x, Time Relic 8x,
  -- Treasure 7x, God's Eye 6x, Lion 5x, Portal 4x.
  for v_row in 0..4 loop
    v_col := 0;
    while v_col < 6 loop
      v_offset := (v_row * 6) + v_col + 1;
      v_symbol := v_reels[v_offset]::integer;
      v_count := 1;
      while (v_col + v_count) < 6
        and v_reels[v_offset + v_count] = v_symbol::smallint
      loop
        v_count := v_count + 1;
      end loop;

      if v_count >= 3 then
        v_multiplier := (array[12,10,9,8,7,6,5,4])[v_symbol + 1];
        v_line_payout := p_bet_amount * v_multiplier * (v_count - 2);
        v_total_payout := v_total_payout + v_line_payout;
        v_lines := v_lines || jsonb_build_array(jsonb_build_object(
          'row',v_row,'start_col',v_col,'end_col',v_col + v_count - 1,
          'symbol',v_symbol,'count',v_count,'multiplier',v_multiplier,
          'payout',v_line_payout
        ));
        v_col := v_col + v_count;
      else
        v_col := v_col + 1;
      end if;
    end loop;
  end loop;

  update public.talkzy_wallets
    set balance=balance-p_bet_amount, updated_at=now()
    where user_id=p_user_id returning balance into v_balance;

  insert into public.talkzy_divine_jackpot_spins(
    user_id,bet_amount,reels,winning_lines,payout,request_key
  ) values (
    p_user_id,p_bet_amount,v_reels,v_lines,v_total_payout,p_request_key
  ) returning * into v_spin;

  insert into public.talkzy_coin_ledger(
    user_id,amount,balance_after,event_type,reference_id,note
  ) values (
    p_user_id,-p_bet_amount,v_balance,'divine_jackpot_bet',v_spin.id,
    'Divine Jackpot spin #'||v_spin.spin_number||' bet'
  );

  -- The payout is credited as the full return amount, matching Fruit Crown's
  -- shared-wallet settlement rule; the stake is not refunded a second time.
  if v_total_payout > 0 then
    update public.talkzy_wallets
      set balance=balance+v_total_payout,updated_at=now()
      where user_id=p_user_id returning balance into v_balance;
    insert into public.talkzy_coin_ledger(
      user_id,amount,balance_after,event_type,reference_id,note
    ) values (
      p_user_id,v_total_payout,v_balance,'divine_jackpot_win',v_spin.id,
      'Divine Jackpot spin #'||v_spin.spin_number||' payout'
    );
  end if;

  select coalesce(sum(payout),0)::bigint into v_today_wins
    from public.talkzy_divine_jackpot_spins
    where user_id=p_user_id
      and created_at >= ((now() at time zone 'Asia/Kolkata')::date::timestamp at time zone 'Asia/Kolkata');

  return jsonb_build_object(
    'accepted',true,'duplicate',false,'spin_id',v_spin.id,
    'spin_number',v_spin.spin_number,'bet_amount',v_spin.bet_amount,
    'reels',to_jsonb(v_spin.reels),'winning_lines',v_spin.winning_lines,
    'payout',v_spin.payout,'balance',v_balance,'today_wins',v_today_wins
  );
end;
$$;

create or replace function public.talkzy_divine_jackpot_get_state_for_user(p_user_id uuid)
returns jsonb
language plpgsql
set search_path=''
as $$
declare
  v_balance bigint;
  v_today_wins bigint;
begin
  if coalesce(auth.jwt()->>'role','') <> 'service_role' then
    raise exception 'SERVICE_ROLE_REQUIRED' using errcode='42501';
  end if;
  select coalesce((select balance from public.talkzy_wallets where user_id=p_user_id),0)
    into v_balance;
  select coalesce(sum(payout),0)::bigint into v_today_wins
    from public.talkzy_divine_jackpot_spins
    where user_id=p_user_id
      and created_at >= ((now() at time zone 'Asia/Kolkata')::date::timestamp at time zone 'Asia/Kolkata');
  return jsonb_build_object('balance',v_balance,'today_wins',v_today_wins);
end;
$$;

create or replace function public.talkzy_divine_jackpot_get_history(
  p_user_id uuid, p_limit integer, p_offset integer
) returns jsonb
language plpgsql
set search_path=''
as $$
declare v_history jsonb;
begin
  if coalesce(auth.jwt()->>'role','') <> 'service_role' then
    raise exception 'SERVICE_ROLE_REQUIRED' using errcode='42501';
  end if;
  select coalesce(jsonb_agg(row_data order by created_at desc),'[]'::jsonb)
    into v_history
  from (
    select created_at,jsonb_build_object(
      'spin_id',id,'spin_number',spin_number,'bet_amount',bet_amount,
      'payout',payout,'reels',to_jsonb(reels),'winning_lines',winning_lines,
      'created_at',created_at
    ) as row_data
    from public.talkzy_divine_jackpot_spins
    where user_id=p_user_id
    order by created_at desc,spin_number desc
    limit greatest(1,least(coalesce(p_limit,20),100))
    offset greatest(0,coalesce(p_offset,0))
  ) h;
  return v_history;
end;
$$;

create or replace function public.talkzy_divine_jackpot_get_daily_top_winners(p_limit integer)
returns jsonb
language plpgsql
set search_path=''
as $$
declare v_winners jsonb;
begin
  if coalesce(auth.jwt()->>'role','') <> 'service_role' then
    raise exception 'SERVICE_ROLE_REQUIRED' using errcode='42501';
  end if;
  select coalesce(jsonb_agg(jsonb_build_object(
    'rank',ranked.rank,'user_id',ranked.user_id,
    'display_name',coalesce(profile.display_name,'Player'),
    'talkzy_id',profile.talkzy_id,'avatar_url',profile.avatar_url,
    'coins',ranked.coins
  ) order by ranked.coins desc,ranked.user_id),'[]'::jsonb)
  into v_winners
  from (
    select row_number() over(order by sum(spins.payout) desc,spins.user_id)::integer as rank,
      spins.user_id,sum(spins.payout)::bigint as coins
    from public.talkzy_divine_jackpot_spins spins
    where spins.payout>0
      and spins.created_at >= ((now() at time zone 'Asia/Kolkata')::date::timestamp at time zone 'Asia/Kolkata')
    group by spins.user_id
    order by sum(spins.payout) desc,spins.user_id
    limit greatest(1,least(coalesce(p_limit,10),50))
  ) ranked
  join public.talkzy_profiles profile on profile.id=ranked.user_id;
  return v_winners;
end;
$$;

revoke all on function public.talkzy_divine_jackpot_spin(uuid,bigint,text) from public,anon,authenticated;
revoke all on function public.talkzy_divine_jackpot_get_state_for_user(uuid) from public,anon,authenticated;
revoke all on function public.talkzy_divine_jackpot_get_history(uuid,integer,integer) from public,anon,authenticated;
revoke all on function public.talkzy_divine_jackpot_get_daily_top_winners(integer) from public,anon,authenticated;
grant execute on function public.talkzy_divine_jackpot_spin(uuid,bigint,text) to service_role;
grant execute on function public.talkzy_divine_jackpot_get_state_for_user(uuid) to service_role;
grant execute on function public.talkzy_divine_jackpot_get_history(uuid,integer,integer) to service_role;
grant execute on function public.talkzy_divine_jackpot_get_daily_top_winners(integer) to service_role;
