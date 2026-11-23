-- SECURITY DEFINER seat assignment accepts a user ID, so it must only be callable by the trusted backend.
REVOKE ALL ON FUNCTION public.talkzy_take_mic_seat(uuid, integer, uuid)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.talkzy_take_mic_seat(uuid, integer, uuid)
  TO service_role;
