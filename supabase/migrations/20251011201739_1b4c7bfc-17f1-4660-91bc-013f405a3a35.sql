-- Add penalty tracking columns to bookings table
-- These columns track when penalties are applied for incomplete daily reports

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS penalty_amount NUMERIC DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS penalty_applied BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS penalty_applied_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS penalty_reason TEXT;

-- Add index for faster queries on penalty status
CREATE INDEX IF NOT EXISTS idx_bookings_penalty_applied 
ON bookings(penalty_applied) 
WHERE penalty_applied = true;

-- Add comments for documentation
COMMENT ON COLUMN bookings.penalty_amount IS '15% penalty amount applied when daily reports are incomplete';
COMMENT ON COLUMN bookings.penalty_applied IS 'Whether a penalty has been applied for incomplete reports';
COMMENT ON COLUMN bookings.penalty_applied_at IS 'Timestamp when penalty was applied';
COMMENT ON COLUMN bookings.penalty_reason IS 'Reason for penalty (e.g., incomplete daily reports)';