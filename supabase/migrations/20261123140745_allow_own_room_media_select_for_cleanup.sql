DROP POLICY IF EXISTS "TALKZY users read their own room music uploads" ON storage.objects;
CREATE POLICY "TALKZY users read their own room music uploads"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'talkzy-room-music'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

DROP POLICY IF EXISTS "TALKZY users read their own private room chat photos" ON storage.objects;
CREATE POLICY "TALKZY users read their own private room chat photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'talkzy-room-chat'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  AND (storage.foldername(name))[2] = 'rooms'
  AND (storage.foldername(name))[3] ~ '^[0-9a-fA-F-]{36}$'
  AND (storage.foldername(name))[4] = 'messages'
);
