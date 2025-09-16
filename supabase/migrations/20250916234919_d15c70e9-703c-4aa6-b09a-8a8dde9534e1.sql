-- Fix infinite recursion by dropping ALL existing policies on profiles table first

-- Drop ALL existing policies on profiles table
DO $$
DECLARE
    policy_name text;
BEGIN
    FOR policy_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', policy_name);
    END LOOP;
END $$;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.can_access_sitter_contact_details(uuid);
DROP FUNCTION IF EXISTS public.can_access_sitter_contact_safe(uuid);

-- Create new is_admin function that uses auth.uid() directly without querying profiles
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = auth.uid() 
      AND email = 'admin@ziggysitters.com'
  );
$$;

-- Create simple non-recursive policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Admins can update verification status" 
ON public.profiles 
FOR UPDATE 
USING (is_admin())
WITH CHECK (is_admin());

-- Public sitter profiles for search (basic info only)
CREATE POLICY "Public can view verified sitter basic info" 
ON public.profiles 
FOR SELECT 
USING (
  role IN ('pet_sitter', 'both') 
  AND is_verified = true
);