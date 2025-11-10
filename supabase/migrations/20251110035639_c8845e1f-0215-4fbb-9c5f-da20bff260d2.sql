-- Fix the handle_new_user function to use metadata from signup instead of hardcoded 'User'
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_role user_role := 'pet_owner';
BEGIN
  -- Assign admin role for admin@ziggysitters.com
  IF NEW.email = 'admin@ziggysitters.com' THEN
    user_role := 'admin';
  END IF;
  
  -- Insert profile using names from metadata (provided during signup), or fallback to temporary values
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
    user_role
  );
  
  -- Also insert into user_roles table for security
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$function$;