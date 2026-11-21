-- Protect profile date of birth and enforce per-user chat cutoffs at the database layer.
create table if not exists public.talkzy_profile_private (
  user_id uuid primary key references auth.users(id) on delete cascade,
  date_of_birth date
);
alter table public.talkzy_profile_private enable row level security;
revoke all on public.talkzy_profile_private from public, anon, authenticated;
grant select, insert, update on public.talkzy_profile_private to authenticated;
drop policy if exists "Users can view own private profile" on public.talkzy_profile_private;
drop policy if exists "Users can insert own private profile" on public.talkzy_profile_private;
drop policy if exists "Users can update own private profile" on public.talkzy_profile_private;
create policy "Users can view own private profile" on public.talkzy_profile_private for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can insert own private profile" on public.talkzy_profile_private for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update own private profile" on public.talkzy_profile_private for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
insert into public.talkzy_profile_private(user_id, date_of_birth) select id, date_of_birth from public.talkzy_profiles where date_of_birth is not null on conflict (user_id) do update set date_of_birth = excluded.date_of_birth;
alter table public.talkzy_profiles drop column if exists date_of_birth;
revoke all on public.talkzy_profiles from public, anon, authenticated;
grant select, insert, update on public.talkzy_profiles to authenticated;
drop policy if exists "room participants and visitors can read room messages" on public.talkzy_room_messages;
create policy "room participants and visitors can read room messages" on public.talkzy_room_messages for select to authenticated using (
  exists (select 1 from public.talkzy_rooms r where r.id = talkzy_room_messages.room_id and r.status = 'active' and (r.owner_id = (select auth.uid()) or exists (select 1 from public.talkzy_room_members m where m.room_id = r.id and m.user_id = (select auth.uid())) or exists (select 1 from public.talkzy_room_visitors v where v.room_id = r.id and v.user_id = (select auth.uid())))
  and not exists (select 1 from public.talkzy_room_chat_clears c where c.room_id = talkzy_room_messages.room_id and c.user_id = (select auth.uid()) and c.cleared_at >= talkzy_room_messages.created_at)
);