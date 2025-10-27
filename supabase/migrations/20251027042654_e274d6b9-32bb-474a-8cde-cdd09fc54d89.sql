-- Add columns to track report delivery and viewing
ALTER TABLE daily_reports 
ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS viewed_by_owner BOOLEAN DEFAULT FALSE;

-- Create index for querying viewed reports
CREATE INDEX IF NOT EXISTS idx_daily_reports_viewed 
ON daily_reports(viewed_by_owner, booking_id);

-- Add comment explaining the new columns
COMMENT ON COLUMN daily_reports.email_sent_at IS 'Timestamp when the report email was sent to the owner';
COMMENT ON COLUMN daily_reports.viewed_at IS 'Timestamp when the owner first viewed the report';
COMMENT ON COLUMN daily_reports.viewed_by_owner IS 'Whether the owner has viewed this report';
