-- Update sitters to be verified with ratings and better data for display
UPDATE profiles 
SET 
  is_verified = true,
  rating = CASE 
    WHEN id = 'c021a381-a5d7-4d65-a4e1-73de1cfec7dd' THEN 4.9
    WHEN id = 'edc3044b-fa5a-4314-8449-dae3a65bfd9a' THEN 4.7
    ELSE 4.5
  END,
  total_reviews = CASE 
    WHEN id = 'c021a381-a5d7-4d65-a4e1-73de1cfec7dd' THEN 23
    WHEN id = 'edc3044b-fa5a-4314-8449-dae3a65bfd9a' THEN 18
    ELSE 12
  END,
  bio = CASE 
    WHEN id = 'c021a381-a5d7-4d65-a4e1-73de1cfec7dd' THEN 'Passionate animal lover with 5+ years of experience caring for pets. Your furry friends will be in safe hands!'
    WHEN id = 'edc3044b-fa5a-4314-8449-dae3a65bfd9a' THEN 'Professional pet sitter offering reliable care in Auckland. Specializing in dogs and cats with flexible scheduling.'
    ELSE 'Dedicated pet care provider committed to giving your pets the love and attention they deserve.'
  END,
  suburb = CASE 
    WHEN id = 'c021a381-a5d7-4d65-a4e1-73de1cfec7dd' THEN 'Ponsonby'
    WHEN id = 'edc3044b-fa5a-4314-8449-dae3a65bfd9a' THEN 'Mount Eden'
    ELSE 'Grey Lynn'
  END,
  response_rate = 95
WHERE role IN ('pet_sitter', 'both');