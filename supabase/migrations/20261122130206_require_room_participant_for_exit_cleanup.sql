create or replace function public.talkzy_room_exit_atomic(
  p_room_id uuid,p_user_id uuid,p_remove_membership boolean default false
)
returns jsonb language plpgsql security definer set search_path = ''
as $function$
declare
  v_room public.talkzy_rooms%rowtype;
  v_music_paths text[] := array[]::text[];
  v_cutoff timestamptz := pg_catalog.clock_timestamp();
begin
  if p_room_id is null or p_user_id is null then
    raise exception 'Room and user are required' using errcode='22023';
  end if;
  select * into v_room from public.talkzy_rooms where id=p_room_id for update;
  if not found then raise exception 'room_not_found' using errcode='P0002'; end if;
  if v_room.status <> 'active' then raise exception 'room_closed' using errcode='55000'; end if;

  if v_room.owner_id <> p_user_id
    and not exists(select 1 from public.talkzy_room_admins where room_id=p_room_id and user_id=p_user_id)
    and not exists(select 1 from public.talkzy_room_members where room_id=p_room_id and user_id=p_user_id)
    and not exists(select 1 from public.talkzy_room_visitors where room_id=p_room_id and user_id=p_user_id and last_seen_at>v_cutoff-interval '5 minutes')
    and not exists(select 1 from public.talkzy_room_presence where room_id=p_room_id and user_id=p_user_id and last_seen_at>v_cutoff-interval '75 seconds') then
    raise exception 'user_not_in_room' using errcode='42501';
  end if;

  if p_remove_membership and v_room.owner_id=p_user_id then
    raise exception 'room_owner_cannot_leave' using errcode='22023';
  end if;

  insert into public.talkzy_room_chat_clears(room_id,user_id,cleared_at)
  values(p_room_id,p_user_id,v_cutoff)
  on conflict(room_id,user_id) do update set cleared_at=excluded.cleared_at;

  select coalesce(array_agg(items.value->>'object_path'),array[]::text[])
  into v_music_paths
  from public.talkzy_room_music_state state
  cross join lateral jsonb_array_elements(
    case when jsonb_typeof(state.queue)='array' then state.queue else '[]'::jsonb end
  ) as items(value)
  where state.room_id=p_room_id and state.user_id=p_user_id
    and jsonb_typeof(items.value)='object'
    and jsonb_typeof(items.value->'object_path')='string'
    and (items.value->>'object_path') like p_user_id::text||'/'||p_room_id::text||'/%'
    and position('..' in items.value->>'object_path')=0;

  delete from public.talkzy_room_mic_seats where room_id=p_room_id and user_id=p_user_id;
  delete from public.talkzy_room_visitors where room_id=p_room_id and user_id=p_user_id;
  delete from public.talkzy_room_presence where room_id=p_room_id and user_id=p_user_id;
  delete from public.talkzy_room_music_state where room_id=p_room_id and user_id=p_user_id;

  if p_remove_membership then
    delete from public.talkzy_room_admins where room_id=p_room_id and user_id=p_user_id;
    delete from public.talkzy_room_members where room_id=p_room_id and user_id=p_user_id;
  end if;

  return jsonb_build_object('left',true,'room_id',p_room_id,'cleared_at',v_cutoff,'music_paths',to_jsonb(v_music_paths));
end
$function$;