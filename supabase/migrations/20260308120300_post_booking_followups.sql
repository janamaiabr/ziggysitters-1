-- Task 6: Post-Booking Follow-up System
-- Add follow-up tracking columns to bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS follow_up_sent boolean DEFAULT false;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS follow_up_sent_at timestamptz;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS follow_up_response text;

-- Create booking_followups table to store ratings and feedback
CREATE TABLE IF NOT EXISTS booking_followups (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  feedback text,
  sitter_name text,
  pet_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for fast lookup by booking
CREATE INDEX IF NOT EXISTS idx_booking_followups_booking_id ON booking_followups(booking_id);

-- RLS
ALTER TABLE booking_followups ENABLE ROW LEVEL SECURITY;

-- Pet owners can insert their own follow-ups
CREATE POLICY "Pet owners can submit follow-ups" ON booking_followups
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings b
      JOIN profiles p ON p.id = b.client_id
      WHERE b.id = booking_id
        AND p.id = auth.uid()
    )
  );

-- Pet owners can read their own follow-ups
CREATE POLICY "Pet owners can read own follow-ups" ON booking_followups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bookings b
      JOIN profiles p ON p.id = b.client_id
      WHERE b.id = booking_id
        AND p.id = auth.uid()
    )
  );

-- Admins can read all follow-ups
CREATE POLICY "Admins can read all follow-ups" ON booking_followups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
