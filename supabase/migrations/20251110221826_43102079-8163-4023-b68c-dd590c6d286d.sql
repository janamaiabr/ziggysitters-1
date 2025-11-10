-- Update golden badge congratulations trigger information
UPDATE email_templates
SET trigger = 'Automatic - When admin approves police vet verification'
WHERE template_key = 'golden_badge_congratulations';