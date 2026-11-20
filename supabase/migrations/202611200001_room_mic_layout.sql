-- TALKZY room microphone layout support
-- Run this migration in the Supabase SQL Editor before deploying the updated app/server.

ALTER TABLE public.talkzy_rooms
  ADD COLUMN IF NOT EXISTS mic_layout text NOT NULL DEFAULT 'eight';

-- The room's selected layout determines the seat count. Keep the database
-- allow-list aligned with the mobile selector (including 15 and 16 seats).
DO $$
DECLARE
  constraint_row record;
BEGIN
  FOR constraint_row IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.talkzy_rooms'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%mic_count%'
  LOOP
    EXECUTE format('ALTER TABLE public.talkzy_rooms DROP CONSTRAINT %I', constraint_row.conname);
  END LOOP;
END $$;

ALTER TABLE public.talkzy_rooms
  ADD CONSTRAINT talkzy_rooms_mic_count_allowed
  CHECK (mic_count IN (7, 8, 10, 11, 12, 14, 15, 16, 17));

ALTER TABLE public.talkzy_rooms
  DROP CONSTRAINT IF EXISTS talkzy_rooms_mic_layout_allowed;

ALTER TABLE public.talkzy_rooms
  ADD CONSTRAINT talkzy_rooms_mic_layout_allowed
  CHECK (mic_layout IN (
    'seven', 'eight', 'ten_couple', 'ten_standard',
    'eleven', 'twelve', 'fourteen', 'fifteen',
    'sixteen', 'seventeen'
  ));

-- Existing rooms retain their current count and default to the familiar
-- eight-seat layout unless their count maps to a known existing layout.
UPDATE public.talkzy_rooms
SET mic_layout = CASE mic_count
  WHEN 7 THEN 'seven'
  WHEN 10 THEN 'ten_standard'
  WHEN 11 THEN 'eleven'
  WHEN 12 THEN 'twelve'
  WHEN 14 THEN 'fourteen'
  WHEN 17 THEN 'seventeen'
  ELSE 'eight'
END
WHERE mic_layout = 'eight' AND mic_count <> 8;

-- Realtime room UPDATE events are already consumed by the mobile client.
