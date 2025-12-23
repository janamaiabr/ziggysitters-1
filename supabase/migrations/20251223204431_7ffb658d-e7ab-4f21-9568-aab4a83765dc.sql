-- Update the handle_new_user function to NOT set a default role
-- Users should select their role during onboarding
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_role_value user_role := NULL;
BEGIN
  -- Only assign admin role for admin@ziggysitters.com
  IF NEW.email = 'admin@ziggysitters.com' THEN
    user_role_value := 'admin';
  END IF;
  
  -- Insert profile WITHOUT a role (user will select during onboarding)
  -- Only admin users get a role automatically
  INSERT INTO public.profiles (
    user_id, 
    first_name, 
    last_name, 
    email,
    role
  )
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email,
    COALESCE(user_role_value, 'pet_owner') -- Keep pet_owner as DB default but we'll handle role selection in the app
  );
  
  -- Only insert into user_roles table for admin users
  IF user_role_value = 'admin' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, user_role_value)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$function$;