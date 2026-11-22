drop policy if exists "talkzy_private_broadcast_receive" on realtime.messages;
drop policy if exists "talkzy_private_broadcast_send" on realtime.messages;

create policy "talkzy_private_broadcast_receive"
on realtime.messages
for select
to authenticated
using (
  extension = 'broadcast'
  and (
    realtime.topic() = 'talkzy-world-lucky-bag-notifications'
    or (
      left(realtime.topic(), length('room-arrival-sync-')) = 'room-arrival-sync-'
      or left(realtime.topic(), length('room-mic-reactions-')) = 'room-mic-reactions-'
    )
    and exists (
      select 1 from public.talkzy_rooms r
      where r.id::text = case
        when left(realtime.topic(), length('room-arrival-sync-')) = 'room-arrival-sync-'
          then substring(realtime.topic() from length('room-arrival-sync-') + 1)
        else substring(realtime.topic() from length('room-mic-reactions-') + 1)
      end
      and r.status = 'active'
      and (
        r.owner_id = (select auth.uid())
        or exists (select 1 from public.talkzy_room_members m where m.room_id=r.id and m.user_id=(select auth.uid()))
        or exists (select 1 from public.talkzy_room_admins a where a.room_id=r.id and a.user_id=(select auth.uid()))
        or exists (select 1 from public.talkzy_room_visitors v where v.room_id=r.id and v.user_id=(select auth.uid()) and v.last_seen_at > now() - interval '5 minutes')
      )
    )
  )
);

create policy "talkzy_private_broadcast_send"
on realtime.messages
for insert
to authenticated
with check (
  extension = 'broadcast'
  and (
    (
      realtime.topic() = 'talkzy-world-lucky-bag-notifications'
      and exists (
        select 1 from public.talkzy_lucky_bags b
        where b.id::text = realtime.messages.payload ->> 'id'
          and b.sender_id = (select auth.uid())
          and b.scope = 'world'
          and b.status = 'active'
          and b.created_at > now() - interval '3 minutes'
      )
    )
    or (
      left(realtime.topic(), length('room-arrival-sync-')) = 'room-arrival-sync-'
      and realtime.messages.payload ->> 'userId' = (select auth.uid())::text
      and realtime.messages.payload ->> 'roomId' = substring(realtime.topic() from length('room-arrival-sync-') + 1)
      and exists (
        select 1 from public.talkzy_rooms r
        where r.id::text = substring(realtime.topic() from length('room-arrival-sync-') + 1)
          and r.status = 'active'
          and (
            r.owner_id = (select auth.uid())
            or exists (select 1 from public.talkzy_room_members m where m.room_id=r.id and m.user_id=(select auth.uid()))
            or exists (select 1 from public.talkzy_room_admins a where a.room_id=r.id and a.user_id=(select auth.uid()))
            or exists (select 1 from public.talkzy_room_visitors v where v.room_id=r.id and v.user_id=(select auth.uid()) and v.last_seen_at > now() - interval '5 minutes')
          )
      )
    )
    or (
      left(realtime.topic(), length('room-mic-reactions-')) = 'room-mic-reactions-'
      and realtime.messages.payload ->> 'userId' = (select auth.uid())::text
      and exists (
        select 1 from public.talkzy_room_mic_seats s
        join public.talkzy_rooms r on r.id=s.room_id
        where s.room_id::text = substring(realtime.topic() from length('room-mic-reactions-') + 1)
          and s.user_id = (select auth.uid())
          and r.status = 'active'
      )
    )
  )
);
