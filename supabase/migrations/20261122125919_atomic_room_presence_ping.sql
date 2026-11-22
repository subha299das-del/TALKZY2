create or replace function public.talkzy_room_presence_ping_atomic(
  p_room_id uuid,
  p_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_owner_id uuid;
  v_status text;
  v_role text;
  v_now timestamptz := pg_catalog.now();
begin
  select owner_id,status into v_owner_id,v_status
  from public.talkzy_rooms where id=p_room_id for update;
  if not found then raise exception 'ROOM_NOT_FOUND'; end if;
  if v_status <> 'active' then raise exception 'ROOM_CLOSED'; end if;
  if v_owner_id=p_user_id then
    v_role:='owner';
  elsif exists(select 1 from public.talkzy_room_admins where room_id=p_room_id and user_id=p_user_id) then
    v_role:='admin';
  elsif exists(select 1 from public.talkzy_room_members where room_id=p_room_id and user_id=p_user_id) then
    v_role:='member';
  elsif exists(select 1 from public.talkzy_room_visitors where room_id=p_room_id and user_id=p_user_id and last_seen_at>v_now-interval '5 minutes' for update) then
    v_role:='tourist';
  else
    raise exception 'NOT_IN_ROOM';
  end if;
  insert into public.talkzy_room_presence(room_id,user_id,presence_role,last_seen_at)
  values(p_room_id,p_user_id,v_role,v_now)
  on conflict(room_id,user_id) do update set presence_role=excluded.presence_role,last_seen_at=excluded.last_seen_at;
  if v_role='tourist' then
    update public.talkzy_room_visitors set last_seen_at=v_now where room_id=p_room_id and user_id=p_user_id;
  end if;
  return pg_catalog.jsonb_build_object('active',true,'role',v_role,'last_seen_at',v_now);
end
$function$;

revoke all on function public.talkzy_room_presence_ping_atomic(uuid,uuid) from public,anon,authenticated;
grant execute on function public.talkzy_room_presence_ping_atomic(uuid,uuid) to service_role;