-- Security fix: Remove policy that exposes sensitive sitter data
-- The public_sitters view already provides safe data for search
-- This policy was allowing authenticated users to see email, phone, address, etc.

DROP POLICY IF EXISTS "Users can search verified sitters (non-sensitive only)" ON profiles;

-- Also remove redundant policy (newer one covers this)
DROP POLICY IF EXISTS "Booked users can view sitter contact" ON profiles;

-- Explanation of remaining policies:
-- 1. Users can view their own profile (auth.uid() = user_id)
-- 2. Booked users can view sitter contact details - allows access to sensitive data ONLY for:
--    - Users with confirmed bookings with that sitter
--    - The profile owner themselves
--    - Admins
-- 3. Sitters can view owner profiles for their bookings
-- 4. Public search uses public_sitters view (no RLS policy needed)