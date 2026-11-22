alter table public.talkzy_rooms
drop constraint if exists talkzy_rooms_owner_id_key;

alter policy "Room access read"
on public.talkzy_rooms
using (
  (
    (status = 'active' and room_type = 'public')
    or owner_id = (select auth.uid())
    or (
      status = 'active'
      and (
        exists (
          select 1 from public.talkzy_room_members m
          where m.room_id = talkzy_rooms.id
            and m.user_id = (select auth.uid())
        )
        or exists (
          select 1 from public.talkzy_room_admins a
          where a.room_id = talkzy_rooms.id
            and a.user_id = (select auth.uid())
        )
        or exists (
          select 1 from public.talkzy_room_visitors v
          where v.room_id = talkzy_rooms.id
            and v.user_id = (select auth.uid())
            and v.last_seen_at > now() - interval '5 minutes'
        )
      )
    )
  )
);

drop policy if exists "Active room visitors can read their room" on public.talkzy_rooms;
