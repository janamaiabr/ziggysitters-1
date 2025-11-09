-- Create email templates table for customizable email content
CREATE TABLE IF NOT EXISTS public.email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key text NOT NULL UNIQUE,
  template_name text NOT NULL,
  subject text NOT NULL,
  html_content text NOT NULL,
  description text,
  variables jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Only admins can manage email templates
CREATE POLICY "Admins can view email templates"
  ON public.email_templates
  FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can insert email templates"
  ON public.email_templates
  FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update email templates"
  ON public.email_templates
  FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete email templates"
  ON public.email_templates
  FOR DELETE
  USING (is_admin());

-- Add trigger for updated_at
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default email templates with current content
INSERT INTO public.email_templates (template_key, template_name, subject, html_content, description, variables) VALUES
('welcome_email', 'Welcome Email', 'Welcome to ZiggySitters!', '<h1>Welcome to ZiggySitters! 🐾</h1><p>Thanks for signing up! We''re excited to have you join our community of pet lovers.</p>', 'Sent when a new user signs up', '["firstName", "role"]'::jsonb),
('booking_notification', 'New Booking Request', 'New Booking Request from {ownerName}', '<h1>New Booking Request</h1><p>You have a new booking request for {serviceName}.</p><p><strong>Dates:</strong> {startDate} to {endDate}</p>', 'Sent to sitters when they receive a booking request', '["ownerName", "serviceName", "startDate", "endDate"]'::jsonb),
('booking_acceptance', 'Booking Accepted', 'Your Booking Has Been Accepted!', '<h1>Great News!</h1><p>{sitterName} has accepted your booking request.</p>', 'Sent to owners when their booking is accepted', '["sitterName", "startDate", "endDate"]'::jsonb),
('booking_decline', 'Booking Declined', 'Booking Request Update', '<h1>Booking Update</h1><p>Unfortunately, the sitter is not available for your requested dates.</p>', 'Sent to owners when their booking is declined', '["sitterName"]'::jsonb),
('payment_confirmation', 'Payment Confirmed', 'Payment Received - Booking Confirmed', '<h1>Payment Confirmed</h1><p>Your payment has been received and your booking is now confirmed!</p>', 'Sent after successful payment', '["bookingReference", "amount"]'::jsonb),
('daily_report_email', 'Daily Pet Report', 'Daily Report: {petName} - {reportDate}', '<h1>Daily Report for {petName}</h1><p>Here''s today''s update from your pet sitter.</p>', 'Sent to owners with daily pet care updates', '["petName", "reportDate", "sitterName"]'::jsonb),
('daily_report_reminder', 'Daily Report Reminder', 'Reminder: Submit Daily Report', '<h1>Daily Report Reminder</h1><p>Please don''t forget to submit today''s daily report for your booking.</p>', 'Reminder sent to sitters to submit daily reports', '["bookingReference"]'::jsonb),
('payout_success', 'Payout Processed', 'Payout of ${amount} Processed', '<h1>Payout Processed</h1><p>Your payout of ${amount} has been successfully processed to your Stripe account.</p>', 'Sent when a sitter receives a payout', '["amount", "bookingReference"]'::jsonb),
('document_upload_reminder', 'Document Upload Reminder', 'Complete Your Profile - Upload ID Document', '<h1>Complete Your Sitter Profile</h1><p>To get verified and start accepting bookings, please upload your ID document.</p>', 'Reminder to upload verification documents', '["firstName"]'::jsonb),
('verification_update', 'Verification Status Update', 'Your Verification Status Has Been Updated', '<h1>Verification Update</h1><p>Your sitter profile verification status has been updated.</p>', 'Sent when admin updates verification status', '["status"]'::jsonb),
('stripe_reonboarding', 'Stripe Account Action Required', 'Action Required: Update Your Stripe Account', '<h1>Stripe Account Update Required</h1><p>Your Stripe account requires additional information or updates.</p>', 'Sent when Stripe account needs attention', '["firstName"]'::jsonb),
('penalty_notification', 'Penalty Applied', 'Penalty Applied to Booking', '<h1>Penalty Notification</h1><p>A penalty has been applied to your booking due to incomplete daily reports.</p>', 'Sent when a penalty is applied for missing reports', '["penaltyAmount", "reason"]'::jsonb);
