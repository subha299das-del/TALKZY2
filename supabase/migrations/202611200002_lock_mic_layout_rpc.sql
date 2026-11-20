-- Restrict the SECURITY DEFINER microphone-layout RPC to the backend service role.
REVOKE ALL ON FUNCTION public.talkzy_set_room_mic_count(uuid, uuid, integer, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.talkzy_set_room_mic_count(uuid, uuid, integer, text)
  TO service_role;
