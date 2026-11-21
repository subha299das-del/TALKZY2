grant select on public.talkzy_room_visitors to authenticated;
drop policy if exists "users can read their own room visitor sessions" on public.talkzy_room_visitors;
create policy "users can read their own room visitor sessions"
on public.talkzy_room_visitors for select to authenticated
using (user_id = (select auth.uid()));
