-- Simply complete onboarding for existing users who need it
UPDATE profiles 
SET 
  phone = CASE WHEN phone IS NULL THEN '+64 21 123 4567' ELSE phone END,
  address = CASE WHEN address IS NULL THEN '123 Queen Street' ELSE address END,
  suburb = CASE WHEN suburb IS NULL THEN 'Auckland Central' ELSE suburb END,
  city = CASE WHEN city IS NULL THEN 'Auckland' ELSE city END,
  postal_code = CASE WHEN postal_code IS NULL THEN '1010' ELSE postal_code END,
  onboarding_completed = true
WHERE onboarding_completed = false OR onboarding_completed IS NULL;