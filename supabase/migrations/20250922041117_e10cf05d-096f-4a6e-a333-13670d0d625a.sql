-- Clean up inconsistent verification data where users have is_verified=true but verification_status=pending
UPDATE public.profiles 
SET verification_status = 'verified'
WHERE is_verified = true AND verification_status = 'pending';