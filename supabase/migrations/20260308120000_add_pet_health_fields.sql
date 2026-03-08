-- Add health and senior care fields to pets table
ALTER TABLE pets ADD COLUMN IF NOT EXISTS is_senior boolean DEFAULT false;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS health_conditions text[] DEFAULT '{}';
ALTER TABLE pets ADD COLUMN IF NOT EXISTS medications jsonb DEFAULT '[]';
-- medications format: [{name, dosage, frequency, instructions}]
ALTER TABLE pets ADD COLUMN IF NOT EXISTS special_needs text;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS emergency_vet_name text;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS emergency_vet_phone text;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS mobility_level text CHECK (mobility_level IN ('full', 'limited', 'assisted', 'minimal'));
ALTER TABLE pets ADD COLUMN IF NOT EXISTS dietary_requirements text;
