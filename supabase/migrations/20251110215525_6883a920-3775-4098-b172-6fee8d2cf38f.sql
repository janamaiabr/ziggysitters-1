-- Add trigger column to email_templates
ALTER TABLE email_templates 
ADD COLUMN IF NOT EXISTS trigger TEXT DEFAULT 'Automatic - Sent based on system events';

-- Update existing templates with specific trigger information
UPDATE email_templates
SET trigger = CASE
  WHEN template_key = 'booking_notification' THEN 'Automatic - When a new booking is created'
  WHEN template_key = 'booking_acceptance' THEN 'Automatic - When sitter accepts a booking'
  WHEN template_key = 'booking_decline' THEN 'Automatic - When sitter declines a booking'
  WHEN template_key = 'booking_payment_confirmation' THEN 'Automatic - When payment is completed'
  WHEN template_key = 'booking_cancellation' THEN 'Automatic - When a booking is cancelled'
  WHEN template_key = 'daily_report' THEN 'Automatic - When sitter submits a daily report'
  WHEN template_key = 'payout_success' THEN 'Automatic - When payout is successfully processed'
  WHEN template_key = 'verification_request' THEN 'Automatic - When sitter submits verification documents'
  WHEN template_key = 'verification_update' THEN 'Automatic - When admin updates verification status'
  WHEN template_key = 'welcome' THEN 'Automatic - When new user signs up'
  WHEN template_key LIKE '%reminder%' THEN 'Manual or Scheduled - Admin can trigger or runs on schedule'
  ELSE 'Automatic - Sent based on system events'
END
WHERE trigger IS NULL OR trigger = 'Automatic - Sent based on system events';