create or replace function public.talkzy_join_room_atomic(
  p_room_id uuid,
  p_user_id uuid,
  p_password_verified boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_room public.talkzy_rooms%rowtype;
begin
  select * into v_room from public.talkzy_rooms where id = p_room_id for update;
  if not found then raise exception 'room_not_found' using errcode = 'P0002'; end if;
  if v_room.status <> 'active' then raise exception 'room_closed' using errcode = '55000'; end if;

  if exists(select 1 from public.talkzy_room_kicklist where room_id=p_room_id and user_id=p_user_id) then
    raise exception 'user_kicked' using errcode = '42501';
  end if;

  if v_room.room_type = 'locked'
     and v_room.owner_id <> p_user_id
     and not exists(select 1 from public.talkzy_room_admins where room_id=p_room_id and user_id=p_user_id)
     and not exists(select 1 from public.talkzy_room_members where room_id=p_room_id and user_id=p_user_id)
     and not coalesce(p_password_verified,false) then
    raise exception 'locked_room_password_required' using errcode = '42501';
  end if;

  insert into public.talkzy_room_members(room_id,user_id,role)
  values(p_room_id,p_user_id,'listener')
  on conflict(room_id,user_id) do nothing;

  delete from public.talkzy_room_visitors where room_id=p_room_id and user_id=p_user_id;

  return jsonb_build_object('joined',true,'room_id',p_room_id,'mode','member');
end;
$$;
revoke all on function public.talkzy_join_room_atomic(uuid,uuid,boolean) from public, anon, authenticated;
grant execute on function public.talkzy_join_room_atomic(uuid,uuid,boolean) to service_role;