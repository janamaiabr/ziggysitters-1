-- Enable realtime for bookings table
ALTER TABLE bookings REPLICA IDENTITY FULL;

-- Add bookings to realtime publication (will error if already exists, which is fine)
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;