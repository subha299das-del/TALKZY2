insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'talkzy-room-chat',
  'talkzy-room-chat',
  false,
  10485760,
  array['image/jpeg','image/png','image/webp','image/heic']::text[]
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "TALKZY users upload private room chat photos"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'talkzy-room-chat'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and (storage.foldername(name))[2] = 'rooms'
  and (storage.foldername(name))[3] ~ '^[0-9a-fA-F-]{36}$'
  and (storage.foldername(name))[4] = 'messages'
  and (
    exists (
      select 1 from public.talkzy_rooms r
      where r.id::text = (storage.foldername(name))[3]
        and r.owner_id = (select auth.uid())
    )
    or exists (
      select 1 from public.talkzy_room_members m
      where m.room_id::text = (storage.foldername(name))[3]
        and m.user_id = (select auth.uid())
    )
    or exists (
      select 1 from public.talkzy_room_admins a
      where a.room_id::text = (storage.foldername(name))[3]
        and a.user_id = (select auth.uid())
    )
    or exists (
      select 1 from public.talkzy_room_visitors v
      where v.room_id::text = (storage.foldername(name))[3]
        and v.user_id = (select auth.uid())
        and v.last_seen_at > now() - interval '5 minutes'
    )
  )
);
