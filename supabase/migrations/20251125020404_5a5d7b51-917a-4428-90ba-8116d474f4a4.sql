-- Remove public read access to promo codes
-- Codes will only be validated through the validate_promo_code() function
DROP POLICY IF EXISTS "Anyone can read active promo codes" ON promo_codes;

-- The existing "Admins can manage promo codes" policy remains for admin management
-- Users will validate codes by calling validate_promo_code(code, platform_fee) function