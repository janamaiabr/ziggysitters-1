-- Create daily_reports table for pet sitter updates
CREATE TABLE public.daily_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id uuid NOT NULL,
  sitter_id uuid NOT NULL,
  report_date date NOT NULL,
  photo_urls text[] NOT NULL DEFAULT '{}',
  exercise_duration integer, -- minutes of exercise
  exercise_notes text,
  medication_given boolean DEFAULT false,
  medication_notes text,
  sleep_quality text CHECK (sleep_quality IN ('excellent', 'good', 'fair', 'poor')),
  sleep_notes text,
  time_alone_hours integer, -- hours spent alone
  food_consumption text CHECK (food_consumption IN ('all', 'most', 'some', 'little', 'none')),
  food_notes text,
  general_notes text NOT NULL,
  mood text CHECK (mood IN ('very_happy', 'happy', 'content', 'anxious', 'sad')),
  submitted_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(booking_id, sitter_id, report_date)
);

-- Enable RLS
ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Sitters can create reports for their bookings"
ON public.daily_reports
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM bookings b
    JOIN profiles p ON p.id = b.sitter_id
    WHERE b.id = daily_reports.booking_id
      AND p.user_id = auth.uid()
      AND daily_reports.sitter_id = b.sitter_id
      AND b.status IN ('confirmed', 'in_progress')
  )
);

CREATE POLICY "Sitters can update their own reports"
ON public.daily_reports
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = daily_reports.sitter_id
      AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Sitters and owners can view reports for their bookings"
ON public.daily_reports
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM bookings b
    JOIN profiles p ON (p.id = b.sitter_id OR p.id = b.owner_id)
    WHERE b.id = daily_reports.booking_id
      AND p.user_id = auth.uid()
  )
);

-- Add updated_at trigger
CREATE TRIGGER update_daily_reports_updated_at
BEFORE UPDATE ON public.daily_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update bookings table to track daily report completion
ALTER TABLE public.bookings 
ADD COLUMN daily_reports_completed integer DEFAULT 0,
ADD COLUMN daily_reports_required integer DEFAULT 0;