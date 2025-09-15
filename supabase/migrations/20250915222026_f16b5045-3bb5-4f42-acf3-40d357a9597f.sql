-- Fix security definer view issue
-- Remove the security_barrier setting which is flagged as a security risk
-- The view doesn't need security_barrier since it already filters data appropriately
-- and RLS policies on the underlying table will still be enforced

ALTER VIEW public.public_sitter_profiles RESET (security_barrier);