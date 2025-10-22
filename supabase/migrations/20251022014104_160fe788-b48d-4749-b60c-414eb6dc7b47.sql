-- Remove duplicate entries from sitter_services table
-- Keep only the most recent entry for each (sitter_id, service_type) combination
DELETE FROM public.sitter_services
WHERE id NOT IN (
  SELECT DISTINCT ON (sitter_id, service_type) id
  FROM public.sitter_services
  ORDER BY sitter_id, service_type, updated_at DESC
);

-- Now add the unique constraint
ALTER TABLE public.sitter_services 
ADD CONSTRAINT sitter_services_sitter_id_service_type_key 
UNIQUE (sitter_id, service_type);