CREATE OR REPLACE FUNCTION public.talkzy_clear_room_messages_atomic(
  p_room_id uuid,
  p_actor_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_room public.talkzy_rooms%rowtype;
  v_images jsonb := '[]'::jsonb;
  v_count integer := 0;
BEGIN
  IF p_room_id IS NULL OR p_actor_id IS NULL THEN
    RAISE EXCEPTION 'ROOM_AND_ACTOR_REQUIRED' USING errcode='22023';
  END IF;

  SELECT * INTO v_room
  FROM public.talkzy_rooms
  WHERE id=p_room_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'ROOM_NOT_FOUND' USING errcode='P0002';
  END IF;
  IF v_room.status <> 'active' THEN
    RAISE EXCEPTION 'ROOM_CLOSED' USING errcode='55000';
  END IF;
  IF v_room.owner_id <> p_actor_id
     AND NOT EXISTS (
       SELECT 1 FROM public.talkzy_room_admins
       WHERE room_id=p_room_id AND user_id=p_actor_id
     ) THEN
    RAISE EXCEPTION 'ONLY_ROOM_OWNER_OR_ADMIN' USING errcode='42501';
  END IF;

  WITH deleted AS (
    DELETE FROM public.talkzy_room_messages
    WHERE room_id=p_room_id
    RETURNING sender_id,image_url
  )
  SELECT count(*),
         coalesce(
           jsonb_agg(jsonb_build_object('sender_id',sender_id,'image_url',image_url))
             FILTER (WHERE image_url IS NOT NULL),
           '[]'::jsonb
         )
  INTO v_count,v_images
  FROM deleted;

  RETURN jsonb_build_object('cleared',true,'deleted_count',v_count,'images',v_images);
END;
$function$;

REVOKE ALL ON FUNCTION public.talkzy_clear_room_messages_atomic(uuid,uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.talkzy_clear_room_messages_atomic(uuid,uuid) TO service_role;
