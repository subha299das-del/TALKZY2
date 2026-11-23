create or replace function public.talkzy_kick_room_member_atomic(
  p_room_id uuid,
  p_actor_id uuid,
  p_target_id uuid,
  p_reason text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_room public.talkzy_rooms%rowtype;
  v_music_paths text[] := array[]::text[];
  v_cutoff timestamptz := clock_timestamp();
begin
  select * into v_room from public.talkzy_rooms where id = p_room_id for update;
  if not found then raise exception 'room_not_found' using errcode = 'P0002'; end if;
  if v_room.status <> 'active' then raise exception 'room_closed' using errcode = '55000'; end if;
  if v_room.owner_id <> p_actor_id then raise exception 'room_owner_only' using errcode = '42501'; end if;
  if p_target_id = v_room.owner_id then raise exception 'room_owner_cannot_be_kicked' using errcode = '22023'; end if;

  insert into public.talkzy_room_kicklist (room_id, user_id, kicked_by, reason)
  values (p_room_id, p_target_id, p_actor_id, left(coalesce(p_reason, ''), 200))
  on conflict (room_id, user_id)
  do update set kicked_by = excluded.kicked_by, reason = excluded.reason, created_at = clock_timestamp();

  insert into public.talkzy_room_chat_clears (room_id, user_id, cleared_at)
  values (p_room_id, p_target_id, v_cutoff)
  on conflict (room_id, user_id) do update set cleared_at = excluded.cleared_at;

  select coalesce(array_agg(items.value->>'object_path'), array[]::text[])
  into v_music_paths
  from public.talkzy_room_music_state state
  cross join lateral jsonb_array_elements(
    case when jsonb_typeof(state.queue) = 'array' then state.queue else '[]'::jsonb end
  ) as items(value)
  where state.room_id = p_room_id and state.user_id = p_target_id
    and jsonb_typeof(items.value) = 'object'
    and jsonb_typeof(items.value->'object_path') = 'string'
    and (items.value->>'object_path') like p_target_id::text || '/' || p_room_id::text || '/%'
    and position('..' in items.value->>'object_path') = 0;

  delete from public.talkzy_room_members where room_id = p_room_id and user_id = p_target_id;
  delete from public.talkzy_room_admins where room_id = p_room_id and user_id = p_target_id;
  delete from public.talkzy_room_visitors where room_id = p_room_id and user_id = p_target_id;
  delete from public.talkzy_room_mic_seats where room_id = p_room_id and user_id = p_target_id;
  delete from public.talkzy_room_presence where room_id = p_room_id and user_id = p_target_id;
  delete from public.talkzy_room_music_state where room_id = p_room_id and user_id = p_target_id;

  return jsonb_build_object('kicked', true, 'room_id', p_room_id, 'user_id', p_target_id,
    'cleared_at', v_cutoff, 'music_paths', to_jsonb(v_music_paths));
end;
$$;
revoke all on function public.talkzy_kick_room_member_atomic(uuid, uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.talkzy_kick_room_member_atomic(uuid, uuid, uuid, text) to service_role;
