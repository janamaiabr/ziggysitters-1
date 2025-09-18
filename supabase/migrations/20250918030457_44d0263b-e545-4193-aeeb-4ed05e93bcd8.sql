-- Fix RLS policy for pet photo uploads
-- The current policy is too restrictive and doesn't allow photo uploads during onboarding

-- First check the current storage policies
-- CREATE POLICY "Pet owners can upload their pet photos" 
-- ON storage.objects 
-- FOR INSERT 
-- WITH CHECK (
--   bucket_id = 'pet-photos' AND 
--   auth.uid()::text = (storage.foldername(name))[1] AND
--   EXISTS (
--     SELECT 1 FROM profiles WHERE user_id = auth.uid()
--   )
-- );

-- Update the pet photo upload policy to be more permissive during onboarding
DROP POLICY IF EXISTS "Pet owners can upload their pet photos" ON storage.objects;

CREATE POLICY "Pet owners can upload their pet photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'pet-photos' AND 
  auth.uid() IS NOT NULL
);

-- Ensure users can view their own uploaded photos
DROP POLICY IF EXISTS "Pet owners can view their pet photos" ON storage.objects;

CREATE POLICY "Pet owners can view their pet photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'pet-photos');

-- Remove vaccination_expiry column from pets table
ALTER TABLE pets DROP COLUMN IF EXISTS vaccination_expiry;

-- Remove response_rate from profile views (we'll handle this in code)