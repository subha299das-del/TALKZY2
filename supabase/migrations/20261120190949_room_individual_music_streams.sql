create table if not exists public.talkzy_room_music_state (
  room_id uuid not null references public.talkzy_rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  queue jsonb not null default '[]'::jsonb,
  current_index integer not null default 0,
  is_playing boolean not null default false,
  current_time_seconds double precision not null default 0,
  updated_at timestamptz not null default now(),
  primary key (room_id, user_id),
  constraint talkzy_room_music_queue_is_array check (jsonb_typeof(queue) = 'array'),
  constraint talkzy_room_music_queue_max_20 check (jsonb_array_length(queue) <= 20),
  constraint talkzy_room_music_index_nonnegative check (current_index >= 0),
  constraint talkzy_room_music_time_nonnegative check (current_time_seconds >= 0 and current_time_seconds <= 86400)
);
alter table public.talkzy_room_music_state enable row level security;
revoke all on public.talkzy_room_music_state from anon, authenticated;
grant all on public.talkzy_room_music_state to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'talkzy-room-music',
  'talkzy-room-music',
  false,
  20971520,
  array['audio/mpeg','audio/mp3','audio/mp4','audio/aac','audio/wav','audio/x-wav','audio/ogg','audio/flac','audio/x-m4a']
)
on conflict (id) do update set
  public = false,
  file_size_limit = 20971520,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "TALKZY users upload their own room music" on storage.objects;
create policy "TALKZY users upload their own room music"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'talkzy-room-music'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
