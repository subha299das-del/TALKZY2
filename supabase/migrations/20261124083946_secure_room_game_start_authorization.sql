drop policy if exists "talkzy_room_games_send" on realtime.messages;

create policy "talkzy_room_games_send"
on realtime.messages for insert to authenticated
with check (
  extension = 'broadcast'
  and left(realtime.topic(), length('room-games-')) = 'room-games-'
  and realtime.messages.payload ->> 'roomId' = substring(realtime.topic() from length('room-games-') + 1)
  and realtime.messages.payload ->> 'userId' = (select auth.uid())::text
  and (
    exists (select 1 from public.talkzy_rooms r where r.id::text = substring(realtime.topic() from length('room-games-') + 1) and r.owner_id = (select auth.uid()))
    or exists (select 1 from public.talkzy_room_members m where m.room_id::text = substring(realtime.topic() from length('room-games-') + 1) and m.user_id = (select auth.uid()))
    or exists (select 1 from public.talkzy_room_admins a where a.room_id::text = substring(realtime.topic() from length('room-games-') + 1) and a.user_id = (select auth.uid()))
    or exists (select 1 from public.talkzy_room_visitors v where v.room_id::text = substring(realtime.topic() from length('room-games-') + 1) and v.user_id = (select auth.uid()) and v.last_seen_at > now() - interval '5 minutes')
  )
  and (
    realtime.messages.payload ->> 'type' <> 'start_game'
    or exists (select 1 from public.talkzy_rooms r where r.id::text = substring(realtime.topic() from length('room-games-') + 1) and r.owner_id = (select auth.uid()))
    or exists (select 1 from public.talkzy_room_admins a where a.room_id::text = substring(realtime.topic() from length('room-games-') + 1) and a.user_id = (select auth.uid()))
  )
  and (
    realtime.messages.payload ->> 'type' <> 'lobby_state'
    or coalesce(realtime.messages.payload ->> 'stage','lobby') <> 'play'
    or exists (select 1 from public.talkzy_rooms r where r.id::text = substring(realtime.topic() from length('room-games-') + 1) and r.owner_id = (select auth.uid()))
    or exists (select 1 from public.talkzy_room_admins a where a.room_id::text = substring(realtime.topic() from length('room-games-') + 1) and a.user_id = (select auth.uid()))
  )
  and (
    realtime.messages.payload ->> 'type' not in ('create_lobby','join_game','lobby_state','game_state','game_started')
    or realtime.messages.payload ->> 'gameName' in ('Brainstorm','Truth and Dare')
    or exists (select 1 from public.talkzy_room_mic_seats s where s.room_id::text = substring(realtime.topic() from length('room-games-') + 1) and s.user_id = (select auth.uid()))
  )
);