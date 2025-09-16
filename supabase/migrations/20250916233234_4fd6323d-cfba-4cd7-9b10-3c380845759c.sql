-- SECURITY FIX: Restrict public access to pet sitter personal information
-- This addresses the vulnerability where personal data was exposed to the public

-- 1. First, drop the overly permissive public access policy
DROP POLICY IF EXISTS "Public can view limited sitter profile info" ON public.profiles;

-- 2. Recreate the public_sitter_profiles view with only safe, business-relevant information
DROP VIEW IF EXISTS public.public_sitter_profiles;

CREATE VIEW public.public_sitter_profiles AS
SELECT 
    id,
    -- Use only first name + last initial for privacy
    CASE 
        WHEN first_name IS NOT NULL AND last_name IS NOT NULL 
        THEN first_name || ' ' || LEFT(last_name, 1) || '.'
        WHEN first_name IS NOT NULL 
        THEN first_name
        ELSE 'Pet Sitter'
    END AS display_name,
    role,
    -- Only show general location (suburb/city), no specific address
    suburb,
    city,
    bio,
    avatar_url,
    is_verified,
    rating,
    total_reviews,
    response_rate,
    background_check_verified,
    verification_status,
    created_at
FROM profiles
WHERE role = 'pet_sitter' 
    AND is_verified = true 
    AND is_verified IS NOT NULL;

-- 3. Create a secure function to check if a user can access sitter contact details
-- This replaces the existing function with better security
CREATE OR REPLACE FUNCTION public.can_access_sitter_contact_details(sitter_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
    -- Only allow access to contact details if:
    -- 1. User has a confirmed booking with the sitter, OR
    -- 2. User is an admin, OR  
    -- 3. User is the sitter themselves
    SELECT EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.user_id = auth.uid()
        AND (
            -- User is an admin
            p.role = 'admin'
            OR
            -- User is the sitter themselves
            p.id = sitter_profile_id
            OR
            -- User has confirmed booking with this sitter
            EXISTS (
                SELECT 1 FROM bookings b
                WHERE b.sitter_id = sitter_profile_id
                    AND b.owner_id = p.id
                    AND b.status IN ('confirmed', 'in_progress', 'completed')
            )
        )
    );
$$;

-- 4. Create a new policy that only allows contact access for legitimate business needs
CREATE POLICY "Authorized users can access sitter contact info" 
ON public.profiles 
FOR SELECT 
USING (
    -- Users can always see their own profile
    auth.uid() = user_id
    OR
    -- Admins can see all profiles  
    (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'))
    OR
    -- For pet sitters, only allow contact access if user has legitimate business need
    (role = 'pet_sitter' AND is_verified = true AND can_access_sitter_contact_details(id))
);

-- 5. Add RLS policy for the public view (allows anyone to read the safe data)
ALTER VIEW public.public_sitter_profiles SET (security_invoker = off);

-- 6. Create a function for getting safe sitter profile data (used by frontend)
CREATE OR REPLACE FUNCTION public.get_safe_sitter_profiles(limit_count integer DEFAULT 10)
RETURNS TABLE (
    id uuid,
    display_name text,
    role user_role,
    suburb text,
    city text,
    bio text,
    avatar_url text,
    is_verified boolean,
    rating numeric,
    total_reviews integer,
    response_rate integer,
    background_check_verified boolean,
    verification_status verification_status,
    created_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
    SELECT * FROM public_sitter_profiles 
    ORDER BY rating DESC, total_reviews DESC
    LIMIT limit_count;
$$;