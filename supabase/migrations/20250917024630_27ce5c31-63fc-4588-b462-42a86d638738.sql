-- Add verification document columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS id_document_url text,
ADD COLUMN IF NOT EXISTS blue_card_document_url text,
ADD COLUMN IF NOT EXISTS verification_documents_uploaded_at timestamp with time zone;