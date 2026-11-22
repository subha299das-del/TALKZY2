-- Room administrators must receive the same room-scoped message and approval-setting reads
-- as members. Backend APIs use the service role, but client Realtime and settings
-- subscriptions are governed by these authenticated-user RLS policies.

drop policy if exists "room participants and visitors can read room messages" on public.talkzy_room_messages;
create policy "room participants and visitors can read room messages"
on public.talkzy_room_messages
for select to authenticated
using (
  exists (
    select 1
    from public.talkzy_rooms r
    where r.id = talkzy_room_messages.room_id
      and r.status = 'active'
      and (
        r.owner_id = (select auth.uid())
        or exists (
          select 1 from public.talkzy_room_members m
          where m.room_id = r.id and m.user_id = (select auth.uid())
        )
        or exists (
          select 1 from public.talkzy_room_admins a
          where a.room_id = r.id and a.user_id = (select auth.uid())
        )
        or exists (
          select 1 from public.talkzy_room_visitors v
          where v.room_id = r.id
            and v.user_id = (select auth.uid())
            and v.last_seen_at > now() - interval '5 minutes'
        )
      )
  )
  and not exists (
    select 1 from public.talkzy_room_chat_clears c
    where c.room_id = talkzy_room_messages.room_id
      and c.user_id = (select auth.uid())
      and c.cleared_at >= talkzy_room_messages.created_at
  )
);

drop policy if exists "room participants and visitors can read room approval settings" on public.talkzy_room_settings;
create policy "room participants and visitors can read room approval settings"
on public.talkzy_room_settings
for select to authenticated
using (
  exists (
    select 1
    from public.talkzy_rooms r
    where r.id = talkzy_room_settings.room_id
      and r.status = 'active'
      and (
        r.owner_id = (select auth.uid())
        or exists (
          select 1 from public.talkzy_room_members m
          where m.room_id = r.id and m.user_id = (select auth.uid())
        )
        or exists (
          select 1 from public.talkzy_room_admins a
          where a.room_id = r.id and a.user_id = (select auth.uid())
        )
        or exists (
          select 1 from public.talkzy_room_visitors v
          where v.room_id = r.id
            and v.user_id = (select auth.uid())
            and v.last_seen_at > now() - interval '5 minutes'
        )
      )
  )
);
