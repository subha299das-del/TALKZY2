create or replace function public.talkzy_set_room_member_role_atomic(
  p_room_id uuid,
  p_actor_id uuid,
  p_target_id uuid,
  p_role text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_room public.talkzy_rooms%rowtype;
  v_member public.talkzy_room_members%rowtype;
begin
  if p_room_id is null or p_actor_id is null or p_target_id is null
    or p_role not in ('listener','speaker') then
    raise exception 'Invalid room member role request' using errcode='22023';
  end if;

  select * into v_room from public.talkzy_rooms where id=p_room_id for update;
  if not found then raise exception 'ROOM_NOT_FOUND' using errcode='P0002'; end if;
  if v_room.status <> 'active' then raise exception 'ROOM_CLOSED' using errcode='55000'; end if;

  if v_room.owner_id <> p_actor_id
    and not exists(select 1 from public.talkzy_room_admins where room_id=p_room_id and user_id=p_actor_id) then
    raise exception 'Only the owner or a room admin can manage speakers' using errcode='42501';
  end if;

  if p_target_id = v_room.owner_id then
    raise exception 'The room creator role cannot be changed' using errcode='22023';
  end if;

  update public.talkzy_room_members
  set role=p_role
  where room_id=p_room_id and user_id=p_target_id
  returning * into v_member;

  if not found then raise exception 'ROOM_MEMBER_NOT_FOUND' using errcode='P0002'; end if;

  return pg_catalog.jsonb_build_object(
    'member',pg_catalog.jsonb_build_object(
      'room_id',v_member.room_id,
      'user_id',v_member.user_id,
      'role',v_member.role
    )
  );
end;
$function$;

revoke all on function public.talkzy_set_room_member_role_atomic(uuid,uuid,uuid,text) from public;
revoke all on function public.talkzy_set_room_member_role_atomic(uuid,uuid,uuid,text) from anon,authenticated;
grant execute on function public.talkzy_set_room_member_role_atomic(uuid,uuid,uuid,text) to service_role;
