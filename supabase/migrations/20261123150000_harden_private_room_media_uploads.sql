-- Keep room chat images private and ensure uploads match the live room permissions.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'talkzy-room-chat',
  'talkzy-room-chat',
  false,
  10485760,
  array['image/jpeg','image/png','image/webp','image/heic']
)
on conflict (id) do update set
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "TALKZY users upload private room chat photos" on storage.objects;
create policy "TALKZY users upload private room chat photos"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'talkzy-room-chat'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and (storage.foldername(name))[2] = 'rooms'
  and (storage.foldername(name))[3] ~ '^[0-9a-fA-F-]{36}$'
  and (storage.foldername(name))[4] = 'messages'
  and exists (
    select 1
    from public.talkzy_rooms r
    where r.id::text = (storage.foldername(name))[3]
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
        or (
          exists (
            select 1 from public.talkzy_room_visitors v
            where v.room_id = r.id
              and v.user_id = (select auth.uid())
              and v.last_seen_at > now() - interval '5 minutes'
          )
          and coalesce((
            select s.tourists_send_pic
            from public.talkzy_room_settings s
            where s.room_id = r.id
          ), false)
        )
      )
      and not exists (
        select 1 from public.talkzy_room_kicklist k
        where k.room_id = r.id and k.user_id = (select auth.uid())
      )
  )
);

-- A private music upload must belong to the authenticated user and an active room
-- in which that user currently has owner, admin, member, or valid tourist access.
drop policy if exists "TALKZY users upload their own room music" on storage.objects;
drop policy if exists "TALKZY room participants upload their own room music" on storage.objects;
create policy "TALKZY room participants upload their own room music"
on storage.objects for insert to authenticated
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
      and not exists (
        select 1 from public.talkzy_room_kicklist k
        where k.room_id = r.id and k.user_id = (select auth.uid())
      )
  )
);
