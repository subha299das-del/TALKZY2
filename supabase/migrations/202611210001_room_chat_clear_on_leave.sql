-- Keep room chat history cleared per-user after leaving a room.
-- Shared messages remain untouched for all other participants.
create table if not exists public.talkzy_room_chat_clears (
  room_id uuid not null references public.talkzy_rooms(id) on delete cascade,
  user_id uuid not null,
  cleared_at timestamptz not null default now(),
  primary key (room_id, user_id)
);
alter table public.talkzy_room_chat_clears enable row level security;
grant select on public.talkzy_room_chat_clears to authenticated;
drop policy if exists "Users can read own room chat clear markers" on public.talkzy_room_chat_clears;
create policy "Users can read own room chat clear markers"
on public.talkzy_room_chat_clears for select to authenticated
using (user_id = auth.uid());
