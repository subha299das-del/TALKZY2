create or replace function public.talkzy_update_room_music_atomic(
  p_room_id uuid,
  p_user_id uuid,
  p_state jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_room public.talkzy_rooms%rowtype;
  v_now timestamptz := pg_catalog.clock_timestamp();
  v_queue jsonb;
  v_index integer;
  v_time numeric;
  v_volume numeric;
  v_repeat text;
begin
  if p_room_id is null or p_user_id is null or pg_catalog.jsonb_typeof(p_state) is distinct from 'object' then
    raise exception 'Invalid room music state' using errcode = '22023';
  end if;

  select * into v_room from public.talkzy_rooms where id=p_room_id for update;
  if not found then raise exception 'ROOM_NOT_FOUND' using errcode='P0002'; end if;
  if v_room.status <> 'active' then raise exception 'ROOM_CLOSED' using errcode='55000'; end if;

  if exists(select 1 from public.talkzy_room_kicklist where room_id=p_room_id and user_id=p_user_id) then
    raise exception 'USER_KICKED' using errcode='42501';
  end if;

  if v_room.owner_id <> p_user_id
    and not exists(select 1 from public.talkzy_room_admins where room_id=p_room_id and user_id=p_user_id)
    and not exists(select 1 from public.talkzy_room_members where room_id=p_room_id and user_id=p_user_id)
    and not exists(select 1 from public.talkzy_room_visitors where room_id=p_room_id and user_id=p_user_id and last_seen_at>v_now-interval '5 minutes') then
    raise exception 'NOT_IN_ROOM' using errcode='42501';
  end if;

  v_queue := p_state->'queue';
  if pg_catalog.jsonb_typeof(v_queue) is distinct from 'array' or pg_catalog.jsonb_array_length(v_queue)>20 then
    raise exception 'INVALID_MUSIC_QUEUE' using errcode='22023';
  end if;

  if exists (
    select 1 from pg_catalog.jsonb_array_elements(v_queue) as entry(item)
    where pg_catalog.jsonb_typeof(entry.item) is distinct from 'object'
      or pg_catalog.jsonb_typeof(entry.item->'object_path') is distinct from 'string'
      or pg_catalog.jsonb_typeof(entry.item->'title') is distinct from 'string'
      or (entry.item->>'object_path') not like p_user_id::text || '/' || p_room_id::text || '/%'
      or pg_catalog.strpos(entry.item->>'object_path','..')>0
      or pg_catalog.length(entry.item->>'object_path')>500
      or pg_catalog.length(pg_catalog.btrim(entry.item->>'title')) not between 1 and 120
  ) then
    raise exception 'INVALID_MUSIC_ITEM' using errcode='22023';
  end if;

  v_index := (p_state->>'current_index')::integer;
  v_time := (p_state->>'current_time_seconds')::numeric;
  v_volume := (p_state->>'volume')::numeric;
  v_repeat := p_state->>'repeat_mode';

  if v_index is null or v_time is null or v_volume is null
    or v_index<0
    or (pg_catalog.jsonb_array_length(v_queue)>0 and v_index>=pg_catalog.jsonb_array_length(v_queue))
    or (pg_catalog.jsonb_array_length(v_queue)=0 and v_index<>0)
    or v_time<0 or v_time>86400
    or v_volume<0 or v_volume>1
    or v_repeat not in ('off','one','all')
    or pg_catalog.jsonb_typeof(p_state->'shuffle') is distinct from 'boolean'
    or pg_catalog.jsonb_typeof(p_state->'is_playing') is distinct from 'boolean' then
    raise exception 'INVALID_MUSIC_STATE' using errcode='22023';
  end if;

  insert into public.talkzy_room_music_state(
    room_id,user_id,queue,current_index,is_playing,current_time_seconds,
    repeat_mode,shuffle,volume,updated_at
  )
  values(
    p_room_id,p_user_id,v_queue,v_index,
    (p_state->>'is_playing')::boolean and pg_catalog.jsonb_array_length(v_queue)>0,
    v_time,v_repeat,(p_state->>'shuffle')::boolean,v_volume,v_now
  )
  on conflict(room_id,user_id) do update set
    queue=excluded.queue,
    current_index=excluded.current_index,
    is_playing=excluded.is_playing,
    current_time_seconds=excluded.current_time_seconds,
    repeat_mode=excluded.repeat_mode,
    shuffle=excluded.shuffle,
    volume=excluded.volume,
    updated_at=excluded.updated_at;

  return pg_catalog.jsonb_build_object('saved',true,'updated_at',v_now);
end;
$function$;

revoke all on function public.talkzy_update_room_music_atomic(uuid,uuid,jsonb) from public;
revoke all on function public.talkzy_update_room_music_atomic(uuid,uuid,jsonb) from anon,authenticated;
grant execute on function public.talkzy_update_room_music_atomic(uuid,uuid,jsonb) to service_role;
