-- Drop and recreate the upload policy with a more flexible pattern
DROP POLICY IF EXISTS "Users can upload their own profile photos" ON storage.objects;

-- Create a more flexible policy that allows users to upload files with their user ID in the filename
CREATE POLICY "Users can upload their own profile photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'profile-photos' 
  AND (
    -- Allow files that start with user ID
    name LIKE (auth.uid()::text || '%')
    OR
    -- Allow files in user ID folder
    auth.uid()::text = (storage.foldername(name))[1]
  )
);