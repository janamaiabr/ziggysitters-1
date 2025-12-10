import BookingTracker from '@/components/admin/BookingTracker';

export default function AdminBookings() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Booking Management</h1>
        <p className="text-muted-foreground">Track and manage all platform bookings</p>
      </div>
      <BookingTracker />
    </div>
  );
}
