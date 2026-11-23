drop policy if exists "TALKZY users upload their own room music" on storage.objects;

create policy "TALKZY room participants upload their own room music"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'talkzy-room-music'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and (storage.foldername(name))[2] ~ '^[0-9a-fA-F-]{36}$'
  and exists (
    select 1
    from public.talkzy_rooms r
    where r.id::text = (storage.foldername(name))[2]
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
