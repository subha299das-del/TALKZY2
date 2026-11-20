-- Ensure Supabase Realtime events are enabled for room settings and mic occupancy.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'talkzy_rooms'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.talkzy_rooms;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'talkzy_room_mic_seats'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.talkzy_room_mic_seats;
  END IF;
END $$;
