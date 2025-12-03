-- Make the verification-docs bucket public so admins can view documents via direct URLs
UPDATE storage.buckets 
SET public = true 
WHERE id = 'verification-docs';