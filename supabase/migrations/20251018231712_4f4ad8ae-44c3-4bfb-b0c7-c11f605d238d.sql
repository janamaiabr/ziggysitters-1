-- Fix security definer view warning
-- The public_sitter_profiles view should use SECURITY INVOKER to respect RLS policies

ALTER VIEW public_sitter_profiles SET (security_invoker = on);