-- Add support for multiple ID documents
-- First, add new column for multiple documents
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS id_document_urls text[] DEFAULT '{}';

-- Migrate existing single document to array (if exists)
UPDATE profiles 
SET id_document_urls = ARRAY[id_document_url]
WHERE id_document_url IS NOT NULL AND id_document_url != '';

-- Keep id_document_url for backward compatibility but it will be deprecated
COMMENT ON COLUMN profiles.id_document_url IS 'DEPRECATED: Use id_document_urls array instead';