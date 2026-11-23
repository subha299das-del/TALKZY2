create or replace function public.talkzy_visit_room_atomic(
  p_room_id uuid,
  p_user_id uuid,
  p_verified_password_hash text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_room public.talkzy_rooms%rowtype;
  v_password_hash text;
  v_now timestamptz := clock_timestamp();
begin
  if p_room_id is null or p_user_id is null then
    raise exception 'Room and user are required' using errcode = '22023';
  end if;

  select * into v_room
  from public.talkzy_rooms
  where id = p_room_id
  for update;

  if not found then
    raise exception 'room_not_found' using errcode = 'P0002';
  end if;

  if v_room.status <> 'active' then
    raise exception 'room_closed' using errcode = '55000';
  end if;

  if exists (
    select 1 from public.talkzy_room_kicklist
    where room_id = p_room_id and user_id = p_user_id
  ) then
    raise exception 'user_kicked' using errcode = '42501';
  end if;

  if v_room.owner_id = p_user_id
     or exists (
       select 1 from public.talkzy_room_admins
       where room_id = p_room_id and user_id = p_user_id
     )
     or exists (
       select 1 from public.talkzy_room_members
       where room_id = p_room_id and user_id = p_user_id
     ) then
    delete from public.talkzy_room_visitors
    where room_id = p_room_id and user_id = p_user_id;

    return jsonb_build_object(
      'visited', true,
      'mode', 'member',
      'room_id', p_room_id
    );
  end if;

  if v_room.room_type = 'locked' then
    select password_hash into v_password_hash
    from public.talkzy_room_passwords
    where room_id = p_room_id;

    if v_password_hash is null
       or p_verified_password_hash is null
       or p_verified_password_hash is distinct from v_password_hash then
      raise exception 'locked_room_password_required' using errcode = '42501';
    end if;
  end if;

  insert into public.talkzy_room_visitors (
    room_id, user_id, visited_at, last_seen_at
  )
  values (p_room_id, p_user_id, v_now, v_now)
  on conflict (room_id, user_id)
  do update set visited_at = excluded.visited_at,
                last_seen_at = excluded.last_seen_at;

  return jsonb_build_object(
    'visited', true,
    'mode', 'tourist',
    'room_id', p_room_id
  );
end;
$function$;

revoke all on function public.talkzy_visit_room_atomic(uuid, uuid, text) from public;
revoke all on function public.talkzy_visit_room_atomic(uuid, uuid, text) from anon, authenticated;
grant execute on function public.talkzy_visit_room_atomic(uuid, uuid, text) to service_role;
