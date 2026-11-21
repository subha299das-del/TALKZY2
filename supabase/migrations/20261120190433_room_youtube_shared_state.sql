-- Shared YouTube room player state; backend service-role only.
create table if not exists public.talkzy_room_youtube_state (
  room_id uuid primary key references public.talkzy_rooms(id) on delete cascade,
  video_id text,
  queue jsonb not null default '[]'::jsonb,
  is_playing boolean not null default false,
  current_time_seconds double precision not null default 0,
  updated_by uuid,
  updated_at timestamptz not null default now(),
  constraint talkzy_room_youtube_queue_is_array check (jsonb_typeof(queue)='array'),
  constraint talkzy_room_youtube_queue_max_10 check (jsonb_array_length(queue)<=10),
  constraint talkzy_room_youtube_video_id_format check (video_id is null or video_id ~ '^[A-Za-z0-9_-]{11}$')
);
alter table public.talkzy_room_youtube_state enable row level security;
revoke all on public.talkzy_room_youtube_state from public,anon,authenticated;
grant all on public.talkzy_room_youtube_state to service_role;