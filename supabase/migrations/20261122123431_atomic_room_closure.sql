create or replace function public.talkzy_close_room_atomic(p_room_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_room public.talkzy_rooms%rowtype;
  v_music_paths text[] := array[]::text[];
  v_closed_at timestamptz := clock_timestamp();
begin
  select * into v_room from public.talkzy_rooms where id = p_room_id for update;
  if not found then raise exception 'room_not_found' using errcode = 'P0002'; end if;
  if v_room.status = 'closed' then
    return jsonb_build_object('closed', true, 'room_id', p_room_id, 'already_closed', true, 'music_paths', '[]'::jsonb);
  end if;

  update public.talkzy_rooms set status = 'closed', closed_at = v_closed_at where id = p_room_id;

  select coalesce(array_agg(items.value->>'object_path'), array[]::text[])
  into v_music_paths
  from public.talkzy_room_music_state state
  cross join lateral jsonb_array_elements(
    case when jsonb_typeof(state.queue) = 'array' then state.queue else '[]'::jsonb end
  ) as items(value)
  where state.room_id = p_room_id
    and jsonb_typeof(items.value) = 'object'
    and jsonb_typeof(items.value->'object_path') = 'string'
    and (items.value->>'object_path') like state.user_id::text || '/' || p_room_id::text || '/%'
    and position('..' in items.value->>'object_path') = 0;

  delete from public.talkzy_room_music_state where room_id = p_room_id;
  delete from public.talkzy_room_youtube_state where room_id = p_room_id;
  delete from public.talkzy_room_mic_seats where room_id = p_room_id;
  delete from public.talkzy_room_presence where room_id = p_room_id;
  delete from public.talkzy_room_visitors where room_id = p_room_id;

  return jsonb_build_object('closed', true, 'room_id', p_room_id, 'already_closed', false, 'closed_at', v_closed_at, 'music_paths', to_jsonb(v_music_paths));
end;
$$;
revoke all on function public.talkzy_close_room_atomic(uuid) from public, anon, authenticated;
grant execute on function public.talkzy_close_room_atomic(uuid) to service_role;
