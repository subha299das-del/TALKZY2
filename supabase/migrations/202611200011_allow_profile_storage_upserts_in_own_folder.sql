drop policy if exists "talkzy_profiles_authenticated_select_own_folder" on storage.objects;
create policy "talkzy_profiles_authenticated_select_own_folder"
on storage.objects for select to authenticated
using (bucket_id = 'talkzy-profiles' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "talkzy_profiles_authenticated_update_own_folder" on storage.objects;
create policy "talkzy_profiles_authenticated_update_own_folder"
on storage.objects for update to authenticated
using (bucket_id = 'talkzy-profiles' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'talkzy-profiles' and (storage.foldername(name))[1] = (select auth.uid())::text);
