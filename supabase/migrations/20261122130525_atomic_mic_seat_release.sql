create or replace function public.talkzy_leave_mic_seat_atomic(
  p_room_id uuid,
  p_user_id uuid,
  p_expected_seat_number integer default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_status text;
  v_removed integer := 0;
  v_seat_number integer;
begin
  if p_room_id is null or p_user_id is null then
    raise exception 'ROOM_AND_USER_REQUIRED' using errcode='22023';
  end if;

  if p_expected_seat_number is not null
    and (p_expected_seat_number < 1 or p_expected_seat_number > 17) then
    raise exception 'INVALID_SEAT' using errcode='22023';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_room_id::text, 0)
  );

  select status into v_status
  from public.talkzy_rooms
  where id = p_room_id
  for update;

  if not found then raise exception 'ROOM_NOT_FOUND'; end if;
  if v_status <> 'active' then raise exception 'ROOM_CLOSED'; end if;

  if p_expected_seat_number is null then
    delete from public.talkzy_room_mic_seats
    where room_id = p_room_id and user_id = p_user_id
    returning seat_number into v_seat_number;
    get diagnostics v_removed = row_count;
  else
    delete from public.talkzy_room_mic_seats
    where room_id = p_room_id
      and user_id = p_user_id
      and seat_number = p_expected_seat_number
    returning seat_number into v_seat_number;
    get diagnostics v_removed = row_count;
  end if;

  return pg_catalog.jsonb_build_object(
    'success', true,
    'removed', v_removed > 0,
    'seat_number', v_seat_number
  );
end
$function$;

revoke all on function public.talkzy_leave_mic_seat_atomic(uuid, uuid, integer) from public, anon, authenticated;
grant execute on function public.talkzy_leave_mic_seat_atomic(uuid, uuid, integer) to service_role;
