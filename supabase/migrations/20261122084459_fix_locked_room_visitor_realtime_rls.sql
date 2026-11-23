create policy "Users can read their own live room presence"
on public.talkzy_room_presence
for select
to authenticated
using (user_id = (select auth.uid()));

create policy "Active room visitors can read their room"
on public.talkzy_rooms
for select
to authenticated
using (
  status = 'active'
  and exists (
    select 1
    from public.talkzy_room_visitors v
    where v.room_id = talkzy_rooms.id
      and v.user_id = (select auth.uid())
      and v.last_seen_at > now() - interval '5 minutes'
  )
);
