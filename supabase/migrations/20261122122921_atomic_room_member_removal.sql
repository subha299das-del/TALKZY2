create or replace function public.talkzy_remove_room_member_atomic(
  p_room_id uuid,p_actor_id uuid,p_target_id uuid
)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  v_room public.talkzy_rooms%rowtype;
  v_queue jsonb := '[]'::jsonb;
  v_paths text[] := array[]::text[];
  v_target_is_admin boolean := false;
begin
  if p_room_id is null or p_actor_id is null or p_target_id is null then
    raise exception 'Room, actor and target are required' using errcode = '22023';
  end if;
  select * into v_room from public.talkzy_rooms where id=p_room_id for update;
  if not found then raise exception 'Room not found' using errcode = 'P0002'; end if;
  if v_room.status <> 'active' then raise exception 'Room is closed' using errcode = '55000'; end if;
  if p_target_id=v_room.owner_id then raise exception 'The room owner cannot be removed' using errcode = '22023'; end if;
  if p_actor_id <> v_room.owner_id and not exists (
    select 1 from public.talkzy_room_admins a where a.room_id=p_room_id and a.user_id=p_actor_id
  ) then raise exception 'Only the owner or a room admin can remove members' using errcode = '42501'; end if;
  select exists(select 1 from public.talkzy_room_admins a where a.room_id=p_room_id and a.user_id=p_target_id)
  into v_target_is_admin;
  if v_target_is_admin and p_actor_id <> v_room.owner_id then
    raise exception 'Only the room owner can remove another room administrator' using errcode = '42501';
  end if;
  select coalesce(ms.queue,'[]'::jsonb) into v_queue from public.talkzy_room_music_state ms
  where ms.room_id=p_room_id and ms.user_id=p_target_id;
  select coalesce(array_agg(item->>'object_path'),array[]::text[]) into v_paths
  from jsonb_array_elements(v_queue) as elements(item)
  where jsonb_typeof(item)='object'
    and jsonb_typeof(item->'object_path')='string'
    and (item->>'object_path') like (p_target_id::text || '/' || p_room_id::text || '/%')
    and position('..' in item->>'object_path')=0;
  insert into public.talkzy_room_chat_clears(room_id,user_id,cleared_at)
  values(p_room_id,p_target_id,now())
  on conflict(room_id,user_id) do update set cleared_at=excluded.cleared_at;
  delete from public.talkzy_room_members where room_id=p_room_id and user_id=p_target_id;
  delete from public.talkzy_room_admins where room_id=p_room_id and user_id=p_target_id;
  delete from public.talkzy_room_mic_seats where room_id=p_room_id and user_id=p_target_id;
  delete from public.talkzy_room_visitors where room_id=p_room_id and user_id=p_target_id;
  delete from public.talkzy_room_presence where room_id=p_room_id and user_id=p_target_id;
  delete from public.talkzy_room_music_state where room_id=p_room_id and user_id=p_target_id;
  return jsonb_build_object('removed',true,'music_paths',to_jsonb(v_paths));
end;
$$;
revoke all on function public.talkzy_remove_room_member_atomic(uuid,uuid,uuid) from public,anon,authenticated;
grant execute on function public.talkzy_remove_room_member_atomic(uuid,uuid,uuid) to service_role;
