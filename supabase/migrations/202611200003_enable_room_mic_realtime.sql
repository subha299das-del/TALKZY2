-- Enable Supabase Realtime events for room settings and microphone occupancy.
ALTER PUBLICATION supabase_realtime ADD TABLE public.talkzy_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.talkzy_room_mic_seats;
