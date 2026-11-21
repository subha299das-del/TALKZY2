-- Persist room-owner/admin microphone seat controls and sync them through Realtime.
CREATE TABLE IF NOT EXISTS public.talkzy_room_mic_controls (
  room_id uuid NOT NULL REFERENCES public.talkzy_rooms(id) ON DELETE CASCADE,
  seat_number integer NOT NULL CHECK (seat_number BETWEEN 1 AND 17),
  seat_closed boolean NOT NULL DEFAULT false,
  mic_closed boolean NOT NULL DEFAULT false,
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (room_id, seat_number)
);
ALTER TABLE public.talkzy_room_mic_controls ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.talkzy_room_mic_controls TO authenticated;
DROP POLICY IF EXISTS "Room participants can read mic controls" ON public.talkzy_room_mic_controls;
CREATE POLICY "Room participants can read mic controls"
ON public.talkzy_room_mic_controls FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.talkzy_rooms r WHERE r.id = talkzy_room_mic_controls.room_id AND r.owner_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.talkzy_room_presence p WHERE p.room_id = talkzy_room_mic_controls.room_id AND p.user_id = auth.uid())
);
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public'
      AND tablename = 'talkzy_room_mic_controls'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.talkzy_room_mic_controls;
  END IF;
END $$;
