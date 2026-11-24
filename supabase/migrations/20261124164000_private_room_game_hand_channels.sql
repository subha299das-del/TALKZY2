drop policy if exists "talkzy_room_games_receive" on realtime.messages;

create policy "talkzy_room_games_receive"
on realtime.messages
for select
to authenticated
using (
  extension = 'broadcast'
  and left(realtime.topic(), length('room-games-')) = 'room-games-'
  and left(realtime.topic(), length('room-games-private-')) <> 'room-games-private-'
  and exists (
    select 1
    from public.talkzy_rooms r
    where r.id::text = substring(realtime.topic() from length('room-games-') + 1)
      and r.status = 'active'
      and (
        r.owner_id = (select auth.uid())
        or exists (select 1 from public.talkzy_room_members m where m.room_id=r.id and m.user_id=(select auth.uid()))
        or exists (select 1 from public.talkzy_room_admins a where a.room_id=r.id and a.user_id=(select auth.uid()))
        or exists (select 1 from public.talkzy_room_visitors v where v.room_id=r.id and v.user_id=(select auth.uid()) and v.last_seen_at > now() - interval '5 minutes')
      )
  )
);

create policy "talkzy_room_game_private_receive"
on realtime.messages
for select
to authenticated
using (
  extension = 'broadcast'
  and left(realtime.topic(), length('room-games-private-')) = 'room-games-private-'
  and exists (
    select 1
    from public.talkzy_rooms r
    where r.id::text = substring(realtime.topic() from length('room-games-private-') + 1 for 36)
      and r.status = 'active'
      and (
        r.owner_id = (select auth.uid())
        or exists (select 1 from public.talkzy_room_members m where m.room_id=r.id and m.user_id=(select auth.uid()))
        or exists (select 1 from public.talkzy_room_admins a where a.room_id=r.id and a.user_id=(select auth.uid()))
        or exists (select 1 from public.talkzy_room_visitors v where v.room_id=r.id and v.user_id=(select auth.uid()) and v.last_seen_at > now() - interval '5 minutes')
      )
      and (
        right(realtime.topic(), length((select auth.uid())::text) + 1) = '-' || (select auth.uid())::text
        or position('-' || (select auth.uid())::text || '-' in substring(realtime.topic() from 57)) > 0
        or r.owner_id = (select auth.uid())
        or exists (select 1 from public.talkzy_room_admins a where a.room_id=r.id and a.user_id=(select auth.uid()))
      )
  )
);

create policy "talkzy_room_game_private_send"
on realtime.messages
for insert
to authenticated
with check (
  extension = 'broadcast'
  and left(realtime.topic(), length('room-games-private-')) = 'room-games-private-'
  and realtime.messages.payload ->> 'userId' = (select auth.uid())::text
  and realtime.messages.payload ->> 'roomId' = substring(realtime.topic() from length('room-games-private-') + 1 for 36)
  and realtime.topic() = 'room-games-private-' ||
    (realtime.messages.payload ->> 'roomId') || '-' ||
    (realtime.messages.payload ->> 'lobbyId') || '-' ||
    (realtime.messages.payload ->> 'recipientId')
  and exists (
    select 1
    from public.talkzy_rooms r
    where r.id::text = realtime.messages.payload ->> 'roomId'
      and r.status = 'active'
      and (
        r.owner_id = (select auth.uid())
        or exists (select 1 from public.talkzy_room_members m where m.room_id=r.id and m.user_id=(select auth.uid()))
        or exists (select 1 from public.talkzy_room_admins a where a.room_id=r.id and a.user_id=(select auth.uid()))
        or exists (select 1 from public.talkzy_room_visitors v where v.room_id=r.id and v.user_id=(select auth.uid()) and v.last_seen_at > now() - interval '5 minutes')
      )
      and (
        right(realtime.messages.payload ->> 'lobbyId', length((select auth.uid())::text) + 1) = '-' || (select auth.uid())::text
        or r.owner_id = (select auth.uid())
        or exists (select 1 from public.talkzy_room_admins a where a.room_id=r.id and a.user_id=(select auth.uid()))
      )
      and (
        r.owner_id::text = realtime.messages.payload ->> 'recipientId'
        or exists (select 1 from public.talkzy_room_members m where m.room_id=r.id and m.user_id::text=realtime.messages.payload ->> 'recipientId')
        or exists (select 1 from public.talkzy_room_admins a where a.room_id=r.id and a.user_id::text=realtime.messages.payload ->> 'recipientId')
        or exists (select 1 from public.talkzy_room_visitors v where v.room_id=r.id and v.user_id::text=realtime.messages.payload ->> 'recipientId' and v.last_seen_at > now() - interval '5 minutes')
      )
  )
);
