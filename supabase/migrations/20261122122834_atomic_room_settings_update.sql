create or replace function public.talkzy_update_room_settings_atomic(
  p_room_id uuid,
  p_user_id uuid,
  p_room_patch jsonb,
  p_approval jsonb,
  p_write_password boolean,
  p_password_hash text,
  p_delete_password boolean
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_room public.talkzy_rooms%rowtype;
  v_settings public.talkzy_room_settings%rowtype;
  v_has_settings boolean := false;
begin
  if p_room_patch is null or jsonb_typeof(p_room_patch) <> 'object'
     or p_approval is null or jsonb_typeof(p_approval) <> 'object' then
    raise exception 'Invalid room settings payload' using errcode = '22023';
  end if;
  if (p_room_patch - array['room_name','description','room_dp_url','room_type']) <> '{}'::jsonb then
    raise exception 'Unsupported room field' using errcode = '22023';
  end if;
  if (p_approval - array['tourists_on_mic','tourists_send_text','tourists_send_pic']) <> '{}'::jsonb then
    raise exception 'Unsupported approval setting' using errcode = '22023';
  end if;
  if exists (select 1 from jsonb_each(p_approval) e where jsonb_typeof(e.value) <> 'boolean') then
    raise exception 'Approval settings must be boolean' using errcode = '22023';
  end if;
  select * into v_room from public.talkzy_rooms where id = p_room_id for update;
  if not found then raise exception 'Room not found' using errcode = 'P0002'; end if;
  if v_room.owner_id <> p_user_id then raise exception 'Only the original room owner can change settings' using errcode = '42501'; end if;
  if v_room.status <> 'active' then raise exception 'Room is closed' using errcode = '55000'; end if;
  if p_write_password and (p_password_hash is null or length(p_password_hash) = 0) then
    raise exception 'A valid password hash is required' using errcode = '22023';
  end if;
  if p_write_password and p_delete_password then raise exception 'Conflicting password operations' using errcode = '22023'; end if;
  if p_room_patch <> '{}'::jsonb then
    update public.talkzy_rooms
    set room_name = case when p_room_patch ? 'room_name' then p_room_patch->>'room_name' else room_name end,
        description = case when p_room_patch ? 'description' then p_room_patch->>'description' else description end,
        room_dp_url = case when p_room_patch ? 'room_dp_url' then p_room_patch->>'room_dp_url' else room_dp_url end,
        room_type = case when p_room_patch ? 'room_type' then p_room_patch->>'room_type' else room_type end
    where id = p_room_id returning * into v_room;
  end if;
  if p_write_password then
    insert into public.talkzy_room_passwords(room_id,password_hash) values(p_room_id,p_password_hash)
    on conflict(room_id) do update set password_hash=excluded.password_hash;
  elsif p_delete_password then
    delete from public.talkzy_room_passwords where room_id=p_room_id;
  end if;
  if p_approval <> '{}'::jsonb then
    insert into public.talkzy_room_settings(room_id,tourists_on_mic,tourists_send_text,tourists_send_pic,updated_at)
    values(p_room_id,coalesce((p_approval->>'tourists_on_mic')::boolean,true),
      coalesce((p_approval->>'tourists_send_text')::boolean,true),
      coalesce((p_approval->>'tourists_send_pic')::boolean,false),now())
    on conflict(room_id) do update set
      tourists_on_mic=case when p_approval ? 'tourists_on_mic' then (p_approval->>'tourists_on_mic')::boolean else public.talkzy_room_settings.tourists_on_mic end,
      tourists_send_text=case when p_approval ? 'tourists_send_text' then (p_approval->>'tourists_send_text')::boolean else public.talkzy_room_settings.tourists_send_text end,
      tourists_send_pic=case when p_approval ? 'tourists_send_pic' then (p_approval->>'tourists_send_pic')::boolean else public.talkzy_room_settings.tourists_send_pic end,
      updated_at=now();
    select * into v_settings from public.talkzy_room_settings where room_id=p_room_id;
    v_has_settings := found;
    if v_has_settings and v_settings.tourists_on_mic=false then
      delete from public.talkzy_room_mic_seats s
      where s.room_id=p_room_id and exists (
        select 1 from public.talkzy_room_visitors v
        where v.room_id=s.room_id and v.user_id=s.user_id
      );
    end if;
  else
    select * into v_settings from public.talkzy_room_settings where room_id=p_room_id;
    v_has_settings := found;
  end if;
  return jsonb_build_object(
    'room',jsonb_build_object('id',v_room.id,'owner_id',v_room.owner_id,'room_name',v_room.room_name,
      'description',v_room.description,'room_dp_url',v_room.room_dp_url,'room_type',v_room.room_type),
    'settings',case when v_has_settings then to_jsonb(v_settings)
      else jsonb_build_object('tourists_on_mic',true,'tourists_send_text',true,'tourists_send_pic',false) end
  );
end;
$$;
revoke all on function public.talkzy_update_room_settings_atomic(uuid,uuid,jsonb,jsonb,boolean,text,boolean) from public,anon,authenticated;
grant execute on function public.talkzy_update_room_settings_atomic(uuid,uuid,jsonb,jsonb,boolean,text,boolean) to service_role;
