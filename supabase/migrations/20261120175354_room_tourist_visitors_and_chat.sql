create table if not exists public.talkzy_room_visitors (
  room_id uuid not null references public.talkzy_rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  visited_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  primary key (room_id, user_id)
);
create index if not exists talkzy_room_visitors_room_idx on public.talkzy_room_visitors(room_id, last_seen_at desc);
alter table public.talkzy_room_visitors enable row level security;
revoke all on public.talkzy_room_visitors from anon, authenticated;
grant all on public.talkzy_room_visitors to service_role;

create table if not exists public.talkzy_room_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.talkzy_rooms(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  message_type text not null default 'text' check (message_type in ('text','image')),
  message_text text not null default '',
  image_url text,
  created_at timestamptz not null default now(),
  check (
    (message_type = 'text' and length(trim(message_text)) between 1 and 1000 and image_url is null)
    or (message_type = 'image' and image_url is not null and message_text = '')
  )
);
create index if not exists talkzy_room_messages_room_created_idx on public.talkzy_room_messages(room_id, created_at desc);
alter table public.talkzy_room_messages enable row level security;
revoke all on public.talkzy_room_messages from anon, authenticated;
grant all on public.talkzy_room_messages to service_role;
