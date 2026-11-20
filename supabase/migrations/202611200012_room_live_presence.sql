create table if not exists public.talkzy_room_presence (
  room_id uuid not null references public.talkzy_rooms(id) on delete cascade,
  user_id uuid not null,
  presence_role text not null default 'member'
    check (presence_role in ('owner', 'admin', 'member', 'tourist')),
  last_seen_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

create index if not exists talkzy_room_presence_last_seen_idx
  on public.talkzy_room_presence (room_id, last_seen_at desc);

alter table public.talkzy_room_presence enable row level security;
revoke all on public.talkzy_room_presence from anon, authenticated;
grant all on public.talkzy_room_presence to service_role;
