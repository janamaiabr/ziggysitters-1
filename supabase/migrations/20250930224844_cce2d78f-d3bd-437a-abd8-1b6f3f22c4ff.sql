-- Drop existing policies
DROP POLICY IF EXISTS "Users can upload their own verification docs" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own verification docs" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own verification docs" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own verification docs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all verification docs" ON storage.objects;

-- Allow authenticated users to upload verification documents (filename starts with their user_id)
CREATE POLICY "Users can upload their own verification docs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'verification-docs' 
  AND (storage.filename(name) LIKE (auth.uid()::text || '-%'))
);

-- Allow users to view their own verification documents
CREATE POLICY "Users can view their own verification docs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'verification-docs' 
  AND (storage.filename(name) LIKE (auth.uid()::text || '-%'))
);

-- Allow users to update their own verification documents
CREATE POLICY "Users can update their own verification docs"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'verification-docs' 
  AND (storage.filename(name) LIKE (auth.uid()::text || '-%'))
);

-- Allow users to delete their own verification documents
CREATE POLICY "Users can delete their own verification docs"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'verification-docs' 
  AND (storage.filename(name) LIKE (auth.uid()::text || '-%'))
);

-- Allow admins to view all verification documents
CREATE POLICY "Admins can view all verification docs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'verification-docs' 
  AND public.is_admin()
);