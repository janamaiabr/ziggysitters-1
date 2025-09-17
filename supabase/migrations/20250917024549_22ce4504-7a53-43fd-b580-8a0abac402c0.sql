-- Create storage bucket for verification documents
INSERT INTO storage.buckets (id, name, public) VALUES ('verification-docs', 'verification-docs', false);

-- Create policies for verification documents
CREATE POLICY "Users can upload their own verification documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'verification-docs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own verification documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'verification-docs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all verification documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'verification-docs' 
  AND is_admin()
);

-- Add verification document columns to profiles table
ALTER TABLE profiles 
ADD COLUMN id_document_url text,
ADD COLUMN blue_card_document_url text,
ADD COLUMN verification_documents_uploaded_at timestamp with time zone;