-- Clear broken document reference for Ma Angelique Bautista
-- The file was deleted from storage but profile still references it
UPDATE profiles 
SET id_document_url = NULL, 
    verification_status = 'pending', 
    verification_documents_uploaded_at = NULL
WHERE id = '59ef0f7b-a671-4c41-be1c-bb12d8353f24';