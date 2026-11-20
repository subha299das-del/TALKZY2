drop policy if exists "talkzy_rooms_user_upload_own_folder" on storage.objects;
create policy "talkzy_rooms_user_upload_own_folder" on storage.objects for insert to authenticated
with check (bucket_id = 'talkzy-rooms' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "talkzy_rooms_user_select_own_folder" on storage.objects;
create policy "talkzy_rooms_user_select_own_folder" on storage.objects for select to authenticated
using (bucket_id = 'talkzy-rooms' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "talkzy_rooms_user_update_own_folder" on storage.objects;
create policy "talkzy_rooms_user_update_own_folder" on storage.objects for update to authenticated
using (bucket_id = 'talkzy-rooms' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'talkzy-rooms' and (storage.foldername(name))[1] = (select auth.uid())::text);
