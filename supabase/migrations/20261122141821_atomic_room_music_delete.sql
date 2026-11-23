create or replace function public.talkzy_delete_room_music_atomic(
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
  v_queue jsonb := '[]'::jsonb;
  v_paths text[] := array[]::text[];
begin
  if p_room_id is null or p_user_id is null then
    raise exception 'Room and user are required' using errcode='22023';
  end if;

  select * into v_room from public.talkzy_rooms where id=p_room_id for update;
  if not found then raise exception 'ROOM_NOT_FOUND' using errcode='P0002'; end if;

  select coalesce(queue,'[]'::jsonb) into v_queue
  from public.talkzy_room_music_state
  where room_id=p_room_id and user_id=p_user_id;

  select coalesce(array_agg(item->>'object_path'),array[]::text[]) into v_paths
  from pg_catalog.jsonb_array_elements(v_queue) as entries(item)
  where pg_catalog.jsonb_typeof(item)='object'
    and pg_catalog.jsonb_typeof(item->'object_path')='string'
    and (item->>'object_path') like p_user_id::text||'/'||p_room_id::text||'/%'
    and pg_catalog.strpos(item->>'object_path','..')=0;

  delete from public.talkzy_room_music_state
  where room_id=p_room_id and user_id=p_user_id;

  return pg_catalog.jsonb_build_object(
    'stopped',true,
    'music_paths',pg_catalog.to_jsonb(v_paths)
  );
end;
$function$;

revoke all on function public.talkzy_delete_room_music_atomic(uuid,uuid) from public;
revoke all on function public.talkzy_delete_room_music_atomic(uuid,uuid) from anon,authenticated;
grant execute on function public.talkzy_delete_room_music_atomic(uuid,uuid) to service_role;
