create or replace function public.talkzy_create_room_atomic(
  p_owner_id uuid,
  p_room_name text,
  p_description text,
  p_room_type text,
  p_room_dp_url text,
  p_password_hash text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_room public.talkzy_rooms%rowtype;
begin
  if p_owner_id is null then raise exception 'Owner is required' using errcode = '22023'; end if;
  if p_room_name is null or length(btrim(p_room_name)) < 3 or length(btrim(p_room_name)) > 40 then
    raise exception 'Room name must be between 3 and 40 characters' using errcode = '22023';
  end if;
  if length(coalesce(p_description, '')) > 200 then
    raise exception 'Room description is too long' using errcode = '22023';
  end if;
  if p_room_type not in ('public', 'locked') then
    raise exception 'Invalid room type' using errcode = '22023';
  end if;
  if p_room_type = 'locked' and (p_password_hash is null or length(p_password_hash) = 0) then
    raise exception 'Locked rooms require a password hash' using errcode = '22023';
  end if;
  if p_room_type = 'public' and p_password_hash is not null then
    raise exception 'Public rooms cannot have a password hash' using errcode = '22023';
  end if;

  insert into public.talkzy_rooms(owner_id, room_name, description, room_type, room_dp_url)
  values(p_owner_id, btrim(p_room_name), coalesce(p_description, ''), p_room_type, nullif(p_room_dp_url, ''))
  returning * into v_room;

  if p_room_type = 'locked' then
    insert into public.talkzy_room_passwords(room_id, password_hash)
    values(v_room.id, p_password_hash);
  end if;

  return jsonb_build_object('room', to_jsonb(v_room));
end;
$$;
revoke all on function public.talkzy_create_room_atomic(uuid,text,text,text,text,text) from public, anon, authenticated;
grant execute on function public.talkzy_create_room_atomic(uuid,text,text,text,text,text) to service_role;