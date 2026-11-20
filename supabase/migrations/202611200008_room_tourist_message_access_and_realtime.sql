drop policy if exists "room participants can read room approval settings" on public.talkzy_room_settings;
create policy "room participants and visitors can read room approval settings"
on public.talkzy_room_settings for select to authenticated
using (exists (
  select 1 from public.talkzy_rooms r where r.id = room_id and r.status = 'active'
  and (
    r.owner_id = (select auth.uid())
    or exists (select 1 from public.talkzy_room_members m where m.room_id = r.id and m.user_id = (select auth.uid()))
    or exists (select 1 from public.talkzy_room_visitors v where v.room_id = r.id and v.user_id = (select auth.uid()))
  )
));

grant select on public.talkzy_room_messages to authenticated;
drop policy if exists "room participants and visitors can read room messages" on public.talkzy_room_messages;
create policy "room participants and visitors can read room messages"
on public.talkzy_room_messages for select to authenticated
using (exists (
  select 1 from public.talkzy_rooms r where r.id = room_id and r.status = 'active'
  and (
    r.owner_id = (select auth.uid())
    or exists (select 1 from public.talkzy_room_members m where m.room_id = r.id and m.user_id = (select auth.uid()))
    or exists (select 1 from public.talkzy_room_visitors v where v.room_id = r.id and v.user_id = (select auth.uid()))
  )
));
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'talkzy_room_messages') then
    alter publication supabase_realtime add table public.talkzy_room_messages;
  end if;
end $$;
