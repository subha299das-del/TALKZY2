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
  select mic_count into v_mic_count from public.talkzy_rooms where id=p_room_id and status='active' for update;
  if not found then raise exception 'ROOM_NOT_FOUND'; end if;
  if p_seat_number < 1 or p_seat_number > v_mic_count then raise exception 'INVALID_SEAT'; end if;
  select coalesce((select c.seat_closed from public.talkzy_room_mic_controls c where c.room_id=p_room_id and c.seat_number=p_seat_number),false),
         coalesce((select c.mic_closed from public.talkzy_room_mic_controls c where c.room_id=p_room_id and c.seat_number=p_seat_number),false)
  into v_seat_closed,v_mic_closed;
  if v_seat_closed then raise exception 'SEAT_CLOSED'; end if;
  select is_muted into v_previous_muted from public.talkzy_room_mic_seats where room_id=p_room_id and user_id=p_user_id for update;
  if exists(select 1 from public.talkzy_room_mic_seats where room_id=p_room_id and seat_number=p_seat_number and user_id<>p_user_id) then raise exception 'SEAT_TAKEN'; end if;
  delete from public.talkzy_room_mic_seats where room_id=p_room_id and user_id=p_user_id;
  insert into public.talkzy_room_mic_seats(room_id,seat_number,user_id,is_muted)
  values(p_room_id,p_seat_number,p_user_id,(coalesce(v_previous_muted,false) or v_mic_closed))
  returning * into v_seat;
  return v_seat;
end
$function$;

create or replace function public.talkzy_set_mic_mute_atomic(
  p_room_id uuid,p_user_id uuid,p_is_muted boolean
)
returns public.talkzy_room_mic_seats
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_seat public.talkzy_room_mic_seats;
  v_status text;
  v_mic_closed boolean := false;
begin
  if p_is_muted is null then raise exception 'INVALID_MUTE_STATE'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_room_id::text, 0));
  select status into v_status from public.talkzy_rooms where id=p_room_id for update;
  if not found or v_status <> 'active' then raise exception 'ROOM_CLOSED'; end if;
  select * into v_seat from public.talkzy_room_mic_seats where room_id=p_room_id and user_id=p_user_id for update;
  if not found then raise exception 'NOT_ON_MIC'; end if;
  select coalesce((select c.mic_closed from public.talkzy_room_mic_controls c where c.room_id=p_room_id and c.seat_number=v_seat.seat_number),false)
  into v_mic_closed;
  if v_mic_closed and not p_is_muted then raise exception 'MIC_CLOSED'; end if;
  update public.talkzy_room_mic_seats set is_muted=p_is_muted,updated_at=pg_catalog.now()
  where room_id=p_room_id and user_id=p_user_id returning * into v_seat;
  return v_seat;
end
$function$;

revoke all on function public.talkzy_set_mic_mute_atomic(uuid,uuid,boolean) from public,anon,authenticated;
grant execute on function public.talkzy_set_mic_mute_atomic(uuid,uuid,boolean) to service_role;