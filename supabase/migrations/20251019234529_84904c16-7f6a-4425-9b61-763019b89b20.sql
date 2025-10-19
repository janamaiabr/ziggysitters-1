-- Update handle_new_user to work without names from signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_role user_role := 'pet_owner';
BEGIN
  -- Assign admin role for admin@ziggysitters.com
  IF NEW.email = 'admin@ziggysitters.com' THEN
    user_role := 'admin';
  END IF;
  
  -- Insert profile with email only, names will be collected during onboarding
  INSERT INTO public.profiles (
    user_id, 
    first_name, 
    last_name, 
    email,
    role
  )
  VALUES (
    NEW.id, 
    'User', -- Temporary first name, will be updated during onboarding
    '', -- Empty last name, will be updated during onboarding
    NEW.email,
    user_role
  );
  
  -- Also insert into user_roles table for security
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;