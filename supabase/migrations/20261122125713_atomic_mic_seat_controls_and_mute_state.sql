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
  v_previous_muted boolean := false;
  v_seat_closed boolean := false;
  v_mic_closed boolean := false;
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_room_id::text, 0));
  select mic_count into v_mic_count from public.talkzy_rooms
  where id=p_room_id and status='active' for update;
  if not found then raise exception 'ROOM_NOT_FOUND'; end if;
  if p_seat_number < 1 or p_seat_number > v_mic_count then raise exception 'INVALID_SEAT'; end if;
  select coalesce((select c.seat_closed from public.talkzy_room_mic_controls c where c.room_id=p_room_id and c.seat_number=p_seat_number),false),
         coalesce((select c.mic_closed from public.talkzy_room_mic_controls c where c.room_id=p_room_id and c.seat_number=p_seat_number),false)
  into v_seat_closed,v_mic_closed;
  if v_seat_closed then raise exception 'SEAT_CLOSED'; end if;
  select is_muted into v_previous_muted from public.talkzy_room_mic_seats
  where room_id=p_room_id and user_id=p_user_id for update;
  if exists(select 1 from public.talkzy_room_mic_seats where room_id=p_room_id and seat_number=p_seat_number and user_id<>p_user_id) then
    raise exception 'SEAT_TAKEN';
  end if;
  delete from public.talkzy_room_mic_seats where room_id=p_room_id and user_id=p_user_id;
  insert into public.talkzy_room_mic_seats(room_id,seat_number,user_id,is_muted)
  values(p_room_id,p_seat_number,p_user_id,(coalesce(v_previous_muted,false) or v_mic_closed))
  returning * into v_seat;
  return v_seat;
end
$function$;

create or replace function public.talkzy_control_mic_seat_atomic(
  p_room_id uuid,p_actor_id uuid,p_seat_number integer,p_action text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_owner_id uuid;
  v_status text;
  v_mic_count integer;
  v_control public.talkzy_room_mic_controls;
begin
  if p_action not in ('close_seat','open_seat','close_mic','open_mic') then raise exception 'INVALID_ACTION'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_room_id::text, 0));
  select owner_id,status,mic_count into v_owner_id,v_status,v_mic_count
  from public.talkzy_rooms where id=p_room_id for update;
  if not found then raise exception 'ROOM_NOT_FOUND'; end if;
  if v_status <> 'active' then raise exception 'ROOM_CLOSED'; end if;
  if p_seat_number < 1 or p_seat_number > v_mic_count then raise exception 'INVALID_SEAT'; end if;
  if v_owner_id <> p_actor_id and not exists(select 1 from public.talkzy_room_admins where room_id=p_room_id and user_id=p_actor_id) then
    raise exception 'FORBIDDEN';
  end if;
  insert into public.talkzy_room_mic_controls(room_id,seat_number,seat_closed,mic_closed,updated_by,updated_at)
  values(p_room_id,p_seat_number,p_action='close_seat',p_action='close_mic',p_actor_id,pg_catalog.now())
  on conflict(room_id,seat_number) do update set
    seat_closed=case when p_action='close_seat' then true when p_action='open_seat' then false else public.talkzy_room_mic_controls.seat_closed end,
    mic_closed=case when p_action='close_mic' then true when p_action='open_mic' then false else public.talkzy_room_mic_controls.mic_closed end,
    updated_by=excluded.updated_by,updated_at=excluded.updated_at
  returning * into v_control;
  if p_action='close_seat' then
    delete from public.talkzy_room_mic_seats where room_id=p_room_id and seat_number=p_seat_number;
  elsif p_action='close_mic' then
    update public.talkzy_room_mic_seats set is_muted=true,updated_at=pg_catalog.now()
    where room_id=p_room_id and seat_number=p_seat_number;
  end if;
  return pg_catalog.to_jsonb(v_control);
end
$function$;

revoke all on function public.talkzy_control_mic_seat_atomic(uuid,uuid,integer,text) from public,anon,authenticated;
grant execute on function public.talkzy_control_mic_seat_atomic(uuid,uuid,integer,text) to service_role;