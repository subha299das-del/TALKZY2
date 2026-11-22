create or replace function public.talkzy_send_room_message_atomic(p_room_id uuid,p_user_id uuid,p_message_type text,p_message_text text,p_image_path text)
returns public.talkzy_room_messages language plpgsql security definer set search_path = ''
as $function$
declare
  v_owner_id uuid;
  v_status text;
  v_is_participant boolean := false;
  v_is_tourist boolean := false;
  v_tourist_text boolean := true;
  v_tourist_image boolean := false;
  v_message public.talkzy_room_messages;
begin
  if p_room_id is null or p_user_id is null then raise exception 'ROOM_AND_USER_REQUIRED' using errcode='22023'; end if;
  if p_message_type not in ('text','image') then raise exception 'INVALID_MESSAGE_TYPE' using errcode='22023'; end if;
  if p_message_type='text' and (p_message_text is null or pg_catalog.length(pg_catalog.btrim(p_message_text))<1 or pg_catalog.length(p_message_text)>1000) then raise exception 'INVALID_MESSAGE_TEXT' using errcode='22023'; end if;
  if p_message_type='image' and (
    p_image_path is null
    or p_image_path not like p_user_id::text||'/rooms/'||p_room_id::text||'/messages/%'
    or pg_catalog.length(p_image_path)>500
    or pg_catalog.strpos(p_image_path,'..')>0
    or p_image_path !~* E'\\.(jpg|jpeg|png|webp|heic)$'
  ) then raise exception 'INVALID_IMAGE_PATH' using errcode='22023'; end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_room_id::text,0));
  select owner_id,status into v_owner_id,v_status from public.talkzy_rooms where id=p_room_id for update;
  if not found then raise exception 'ROOM_NOT_FOUND' using errcode='P0002'; end if;
  if v_status <> 'active' then raise exception 'ROOM_CLOSED' using errcode='55000'; end if;

  v_is_participant := v_owner_id=p_user_id
    or exists(select 1 from public.talkzy_room_admins where room_id=p_room_id and user_id=p_user_id)
    or exists(select 1 from public.talkzy_room_members where room_id=p_room_id and user_id=p_user_id);
  if not v_is_participant then
    select exists(select 1 from public.talkzy_room_visitors where room_id=p_room_id and user_id=p_user_id and last_seen_at>pg_catalog.now()-interval '5 minutes') into v_is_tourist;
    if not v_is_tourist then raise exception 'NOT_IN_ROOM' using errcode='42501'; end if;
    select coalesce((select tourists_send_text from public.talkzy_room_settings where room_id=p_room_id),true),
           coalesce((select tourists_send_pic from public.talkzy_room_settings where room_id=p_room_id),false)
    into v_tourist_text,v_tourist_image;
    if p_message_type='text' and not v_tourist_text then raise exception 'TOURIST_TEXT_DISABLED' using errcode='42501'; end if;
    if p_message_type='image' and not v_tourist_image then raise exception 'TOURIST_IMAGE_DISABLED' using errcode='42501'; end if;
  end if;

  insert into public.talkzy_room_messages(room_id,sender_id,message_type,message_text,image_url)
  values(p_room_id,p_user_id,p_message_type,case when p_message_type='text' then p_message_text else '' end,
    case when p_message_type='image' then p_image_path else null end)
  returning * into v_message;
  return v_message;
end
$function$;
revoke all on function public.talkzy_send_room_message_atomic(uuid,uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.talkzy_send_room_message_atomic(uuid,uuid,text,text,text) to service_role;
