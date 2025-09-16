-- Update the handle_new_user function to assign admin role for admin@ziggysitters.com
-- This ensures that when the admin user signs up, they automatically get admin privileges

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Determine the role based on email
  DECLARE
    user_role user_role := 'pet_owner';
  BEGIN
    -- Assign admin role for admin@ziggysitters.com
    IF NEW.email = 'admin@ziggysitters.com' THEN
      user_role := 'admin';
    END IF;
    
    -- Insert profile with appropriate role
    INSERT INTO public.profiles (
      user_id, 
      first_name, 
      last_name, 
      email,
      role
    )
    VALUES (
      NEW.id, 
      COALESCE(NEW.raw_user_meta_data->>'first_name', 'Admin'),
      COALESCE(NEW.raw_user_meta_data->>'last_name', 'User'),
      NEW.email,
      user_role
    );
    
    RETURN NEW;
  END;
END;
$function$;

-- Also create a specific admin profile entry in case the user already exists
-- This will only insert if the user doesn't already have a profile
INSERT INTO public.profiles (user_id, first_name, last_name, email, role)
SELECT 
  au.id,
  'Admin',
  'User', 
  'admin@ziggysitters.com',
  'admin'::user_role
FROM auth.users au
WHERE au.email = 'admin@ziggysitters.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = au.id
  );

-- Update existing profile to admin if it exists
UPDATE public.profiles 
SET role = 'admin'::user_role
WHERE email = 'admin@ziggysitters.com';