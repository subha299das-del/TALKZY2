ALTER TABLE public.talkzy_rooms DROP CONSTRAINT IF EXISTS talkzy_rooms_mic_count_check;
ALTER TABLE public.talkzy_rooms DROP CONSTRAINT IF EXISTS talkzy_rooms_mic_layout_allowed;
ALTER TABLE public.talkzy_rooms ADD CONSTRAINT talkzy_rooms_mic_count_check CHECK (mic_count IN (7,8,10,11,12,14,17));
ALTER TABLE public.talkzy_rooms ADD CONSTRAINT talkzy_rooms_mic_layout_allowed CHECK (mic_layout IN ('seven','eight','ten_couple','ten_standard','eleven','twelve','fourteen','seventeen'));

CREATE OR REPLACE FUNCTION public.talkzy_set_room_mic_count(p_room_id uuid, p_user_id uuid, p_mic_count integer, p_mic_layout text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_owner_id uuid;
  v_status text;
  v_expected_count integer;
BEGIN
  v_expected_count := CASE p_mic_layout
    WHEN 'seven' THEN 7
    WHEN 'eight' THEN 8
    WHEN 'ten_couple' THEN 10
    WHEN 'ten_standard' THEN 10
    WHEN 'eleven' THEN 11
    WHEN 'twelve' THEN 12
    WHEN 'fourteen' THEN 14
    WHEN 'seventeen' THEN 17
    ELSE NULL
  END;

  IF v_expected_count IS NULL OR p_mic_count <> v_expected_count THEN
    RAISE EXCEPTION 'INVALID_MIC_LAYOUT';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(p_room_id::text, 0));

  SELECT owner_id, status
    INTO v_owner_id, v_status
  FROM public.talkzy_rooms
  WHERE id = p_room_id
  FOR UPDATE;

  IF NOT FOUND OR v_status <> 'active' THEN
    RAISE EXCEPTION 'ROOM_NOT_FOUND';
  END IF;

  IF v_owner_id <> p_user_id THEN
    RAISE EXCEPTION 'OWNER_ONLY';
  END IF;

  UPDATE public.talkzy_rooms
  SET mic_count = p_mic_count,
      mic_layout = p_mic_layout
  WHERE id = p_room_id;

  DELETE FROM public.talkzy_room_mic_seats
  WHERE room_id = p_room_id
    AND seat_number > p_mic_count;

  RETURN jsonb_build_object('micCount', p_mic_count, 'micLayout', p_mic_layout);
END;
$function$;