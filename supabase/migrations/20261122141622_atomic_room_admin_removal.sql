create or replace function public.talkzy_remove_room_admin_atomic(
  p_room_id uuid,
  p_actor_id uuid,
  p_target_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_room public.talkzy_rooms%rowtype;
  v_deleted integer;
begin
  if p_room_id is null or p_actor_id is null or p_target_id is null then
    raise exception 'Room, actor and target are required' using errcode='22023';
  end if;

  select * into v_room from public.talkzy_rooms where id=p_room_id for update;
  if not found then raise exception 'ROOM_NOT_FOUND' using errcode='P0002'; end if;
  if v_room.status <> 'active' then raise exception 'ROOM_CLOSED' using errcode='55000'; end if;
  if v_room.owner_id <> p_actor_id then
    raise exception 'Only the original room creator can remove administrators' using errcode='42501';
  end if;
  if p_target_id = v_room.owner_id then
    raise exception 'The room creator cannot be removed as an administrator' using errcode='22023';
  end if;

  delete from public.talkzy_room_admins
  where room_id=p_room_id and user_id=p_target_id;

  get diagnostics v_deleted = row_count;

  return pg_catalog.jsonb_build_object('admin_removed',v_deleted>0,'room_id',p_room_id,'user_id',p_target_id);
end;
$function$;

revoke all on function public.talkzy_remove_room_admin_atomic(uuid,uuid,uuid) from public;
revoke all on function public.talkzy_remove_room_admin_atomic(uuid,uuid,uuid) from anon,authenticated;
grant execute on function public.talkzy_remove_room_admin_atomic(uuid,uuid,uuid) to service_role;
