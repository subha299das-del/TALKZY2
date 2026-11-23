create or replace function public.talkzy_lucky_bag_expire()
returns integer
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_bag record;
  v_refund bigint;
  v_balance bigint;
  v_count integer := 0;
begin
  for v_bag in
    select * from public.talkzy_lucky_bags
    where status='active' and expires_at <= now()
    for update skip locked
  loop
    if v_bag.remaining_coins > 0 then
      insert into public.talkzy_wallets(user_id,balance)
      values(v_bag.sender_id,0) on conflict(user_id) do nothing;
      update public.talkzy_wallets
      set balance=balance+v_bag.remaining_coins,updated_at=now()
      where user_id=v_bag.sender_id returning balance into v_balance;
      insert into public.talkzy_coin_ledger(user_id,amount,balance_after,event_type,reference_id,note)
      values(v_bag.sender_id,v_bag.remaining_coins,v_balance,'lucky_bag_refund',v_bag.id,
        'Unclaimed lucky bag coins refunded after 3 minutes');
      v_refund := v_bag.remaining_coins;
    else
      v_refund := 0;
    end if;
    update public.talkzy_lucky_bags
    set remaining_coins=0,remaining_bags=0,status='expired',closed_at=now()
    where id=v_bag.id;
    v_count := v_count+1;
  end loop;
  return v_count;
end
$function$;

create or replace function public.talkzy_set_room_mic_count(
  p_room_id uuid,p_user_id uuid,p_mic_count integer,p_mic_layout text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_owner_id uuid;
  v_status text;
  v_expected_count integer;
begin
  v_expected_count := case p_mic_layout
    when 'seven' then 7
    when 'eight' then 8
    when 'ten_couple' then 10
    when 'ten_standard' then 10
    when 'eleven' then 11
    when 'twelve' then 12
    when 'fourteen' then 14
    when 'seventeen' then 17
    else null
  end;

  if v_expected_count is null or p_mic_count <> v_expected_count then
    raise exception 'INVALID_MIC_LAYOUT';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_room_id::text, 0));
  select owner_id,status into v_owner_id,v_status
  from public.talkzy_rooms where id=p_room_id for update;

  if not found or v_status <> 'active' then raise exception 'ROOM_NOT_FOUND'; end if;
  if v_owner_id <> p_user_id then raise exception 'OWNER_ONLY'; end if;

  update public.talkzy_rooms
  set mic_count=p_mic_count,mic_layout=p_mic_layout
  where id=p_room_id;
  delete from public.talkzy_room_mic_seats
  where room_id=p_room_id and seat_number>p_mic_count;

  return jsonb_build_object('micCount',p_mic_count,'micLayout',p_mic_layout);
end
$function$;

create or replace function public.talkzy_take_mic_seat(
  p_room_id uuid,p_seat_number integer,p_user_id uuid
)
returns public.talkzy_room_mic_seats
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_seat public.talkzy_room_mic_seats;
  v_mic_count integer;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_room_id::text, 0));
  select mic_count into v_mic_count
  from public.talkzy_rooms
  where id=p_room_id and status='active';

  if not found then raise exception 'ROOM_NOT_FOUND'; end if;
  if p_seat_number < 1 or p_seat_number > v_mic_count then raise exception 'INVALID_SEAT'; end if;
  if exists(
    select 1 from public.talkzy_room_mic_seats
    where room_id=p_room_id and seat_number=p_seat_number and user_id<>p_user_id
  ) then raise exception 'SEAT_TAKEN'; end if;

  delete from public.talkzy_room_mic_seats where room_id=p_room_id and user_id=p_user_id;
  insert into public.talkzy_room_mic_seats(room_id,seat_number,user_id,is_muted)
  values(p_room_id,p_seat_number,p_user_id,false)
  returning * into v_seat;
  return v_seat;
end
$function$;

create or replace function public.talkzy_wallet_credit_service(
  p_user_id uuid,p_amount bigint,p_reference_id uuid,p_note text default 'Wallet credit'
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_balance bigint;
  v_existing public.talkzy_coin_ledger;
begin
  if p_user_id is null or p_reference_id is null then
    raise exception 'User and payment reference required';
  end if;
  if p_amount<=0 or p_amount>1000000000000 then raise exception 'Invalid credit amount'; end if;

  select * into v_existing from public.talkzy_coin_ledger
  where user_id=p_user_id and event_type='wallet_credit' and reference_id=p_reference_id;
  if found then
    return jsonb_build_object('credited',false,'duplicate',true,
      'balance',v_existing.balance_after,'ledger_id',v_existing.id);
  end if;

  insert into public.talkzy_wallets(user_id,balance) values(p_user_id,0)
  on conflict(user_id) do nothing;
  update public.talkzy_wallets set balance=balance+p_amount,updated_at=now()
  where user_id=p_user_id returning balance into v_balance;
  insert into public.talkzy_coin_ledger(user_id,amount,balance_after,event_type,reference_id,note)
  values(p_user_id,p_amount,v_balance,'wallet_credit',p_reference_id,p_note);
  return jsonb_build_object('credited',true,'duplicate',false,'balance',v_balance);
end
$function$;

create or replace function public.sync_room_creator_identity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  creator_talkzy_id text;
  creator_country text;
begin
  if tg_table_name = 'talkzy_profiles' then
    update public.talkzy_rooms
    set room_talkzy_id=new.talkzy_id,country_name=new.country
    where owner_id=new.id;
    return new;
  end if;

  select p.talkzy_id,p.country
  into creator_talkzy_id,creator_country
  from public.talkzy_profiles p
  where p.id=new.owner_id;

  if not found or creator_talkzy_id is null then
    raise exception 'Room creator TALKZY profile is missing.';
  end if;

  new.room_talkzy_id:=creator_talkzy_id;
  new.country_name:=creator_country;
  return new;
end
$function$;
