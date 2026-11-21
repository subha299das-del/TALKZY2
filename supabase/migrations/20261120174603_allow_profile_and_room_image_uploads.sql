create policy "talkzy_profiles_authenticated_upload_own_folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'talkzy-profiles'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
