DROP POLICY IF EXISTS "TALKZY users delete their own room music uploads" ON storage.objects;
CREATE POLICY "TALKZY users delete their own room music uploads"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'talkzy-room-music'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);
