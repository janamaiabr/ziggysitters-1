-- Disable Black Friday promo (keep for next year)
UPDATE promo_codes 
SET is_active = false 
WHERE code = 'BLACKFRIDAY50';