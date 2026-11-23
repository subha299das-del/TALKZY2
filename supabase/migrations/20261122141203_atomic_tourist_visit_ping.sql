create or replace function public.talkzy_room_visitor_ping_atomic(
  p_room_id uuid,
  p_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_room public.talkzy_rooms%rowtype;
  v_now timestamptz := pg_catalog.clock_timestamp();
  v_last_seen timestamptz;
begin
  if p_room_id is null or p_user_id is null then
    raise exception 'Room and user are required' using errcode = '22023';
  end if;

  select * into v_room
  from public.talkzy_rooms
  where id = p_room_id
  for update;

  if not found then
    raise exception 'ROOM_NOT_FOUND' using errcode = 'P0002';
  end if;
  if v_room.status <> 'active' then
    raise exception 'ROOM_CLOSED' using errcode = '55000';
  end if;

  if exists (
    select 1 from public.talkzy_room_kicklist
    where room_id = p_room_id and user_id = p_user_id
  ) then
    raise exception 'USER_KICKED' using errcode = '42501';
  end if;

  update public.talkzy_room_visitors
  set last_seen_at = v_now
  where room_id = p_room_id
    and user_id = p_user_id
    and last_seen_at > v_now - interval '5 minutes'
  returning last_seen_at into v_last_seen;

  if v_last_seen is null then
    raise exception 'VISIT_EXPIRED' using errcode = '42501';
  end if;

  return pg_catalog.jsonb_build_object(
    'active', true,
    'last_seen_at', v_last_seen
  );
end;
$function$;

revoke all on function public.talkzy_room_visitor_ping_atomic(uuid, uuid) from public;
revoke all on function public.talkzy_room_visitor_ping_atomic(uuid, uuid) from anon, authenticated;
grant execute on function public.talkzy_room_visitor_ping_atomic(uuid, uuid) to service_role;
