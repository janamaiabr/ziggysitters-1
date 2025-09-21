import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Calendar as CalendarIcon, Clock, MapPin, Star, User, Phone, Mail, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function Bookings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  useEffect(() => {
    if (profile) {
      fetchBookings();
      
      // Check for payment success in URL params
      const paymentStatus = searchParams.get('payment');
      const sessionId = searchParams.get('session_id');
      const bookingId = searchParams.get('booking_id');
      
      if (paymentStatus === 'success' && sessionId && bookingId) {
        verifyPaymentAndUpdateBooking(sessionId, bookingId);
        // Clean up URL params
        setSearchParams({});
      }
    }
  }, [profile, searchParams]);

  const verifyPaymentAndUpdateBooking = async (sessionId: string, bookingId: string) => {
    try {
      console.log('Verifying payment for session:', sessionId, 'booking:', bookingId);
      
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: {
          session_id: sessionId,
          booking_id: bookingId
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Payment Successful!",
          description: "Your booking has been confirmed.",
        });
        // Refresh bookings to show updated status
        fetchBookings();
      } else {
        toast({
          title: "Payment Verification Failed",
          description: data?.error || "Unable to verify payment status.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      toast({
        title: "Verification Error",
        description: "Failed to verify payment. Please contact support.",
        variant: "destructive"
      });
    }
  };

  const fetchBookings = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id, 
          service_type, 
          start_date, 
          end_date, 
          start_time,
          end_time,
          total_amount, 
          status,
          payment_status,
          owner_notes,
          sitter_notes,
          special_instructions,
          created_at,
          owner_id,
          sitter_id,
          stripe_payment_intent_id,
          booking_reference,
          owner:profiles!owner_id(id, first_name, last_name, email, phone, address, suburb, city),
          sitter:profiles!sitter_id(id, first_name, last_name, email, phone, address, suburb, city, avatar_url)
        `)
        .or(`owner_id.eq.${profile.id},sitter_id.eq.${profile.id}`)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setBookings(data);
        
        // Check for refunded payments periodically
        checkRefundStatus();
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkRefundStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('check-refund-status');
      if (error) {
        console.error('Error checking refund status:', error);
      } else if (data?.updatedBookings > 0) {
        // Refresh bookings if any were updated
        fetchBookings();
      }
    } catch (error) {
      console.error('Error checking refund status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'pending': return 'secondary';
      case 'completed': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const handleCancelBooking = async (booking) => {
    if (!profile) return;
    
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', booking.id);

      if (error) throw error;

      // Send cancellation email
      const isOwner = booking.owner_id === profile.id;
      const recipient = isOwner ? booking.sitter : booking.owner;
      
      await supabase.functions.invoke('send-booking-cancellation', {
        body: {
          recipient_email: recipient.email,
          recipient_name: `${recipient.first_name} ${recipient.last_name}`,
          cancelled_by_name: `${profile.first_name} ${profile.last_name}`,
          cancelled_by_type: isOwner ? 'owner' : 'sitter',
          service_type: booking.service_type,
          start_date: booking.start_date,
          end_date: booking.end_date,
          booking_reference: booking.booking_reference,
          total_amount: booking.total_amount
        }
      });

      fetchBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
    }
  };

  const handleCompletePayment = async (booking) => {
    try {
      console.log('Creating payment session for booking:', booking.id);
      
      const { data, error } = await supabase.functions.invoke('complete-booking-payment', {
        body: { booking_id: booking.id }
      });

      console.log('Payment session response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data?.url) {
        console.log('Redirecting to Stripe checkout:', data.url);
        window.open(data.url, '_blank');
      } else {
        throw new Error('No checkout URL received from payment service');
      }
    } catch (error) {
      console.error('Error creating payment session:', error);
      toast({
        title: "Payment Error", 
        description: `Failed to create payment session: ${error.message || 'Please try again.'}`,
        variant: "destructive"
      });
    }
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsDialog(true);
  };

  const filteredBookings = bookings.filter(booking => {
    const now = new Date();
    const endDate = new Date(booking.end_date);
    
    switch (activeTab) {
      case 'upcoming':
        return ['pending', 'confirmed'].includes(booking.status) && endDate >= now;
      case 'past':
        return booking.status === 'completed' || endDate < now;
      case 'cancelled':
        return booking.status === 'cancelled';
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
          <p className="text-muted-foreground">Manage your pet care bookings</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'past', label: 'Past Bookings' },
            { id: 'cancelled', label: 'Cancelled' }
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Bookings List */}
        <div className="space-y-6">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center text-2xl">
                        {booking.service_type.includes('dog') ? '🐕' : booking.service_type.includes('cat') ? '🐱' : '🐾'}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold">
                            {booking.service_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </h3>
                          <Badge variant={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <CalendarIcon className="w-4 h-4 mr-2" />
                            {format(new Date(booking.start_date), 'MMM dd, yyyy')}
                          </div>
                          {booking.start_time && (
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-2" />
                              {booking.start_time}
                            </div>
                          )}
                          <div className="flex items-center">
                            <span className="mr-2">💰</span>
                            ${booking.total_amount}
                          </div>
                        </div>
                        
                        {(booking.owner_notes || booking.sitter_notes) && (
                          <div className="mt-3 p-3 bg-muted rounded-lg">
                            <p className="text-sm">
                              <strong>Notes:</strong> {booking.owner_notes || booking.sitter_notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                     <div className="flex flex-col space-y-2 lg:items-end">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewDetails(booking)}>
                            View Details
                          </Button>
                          {booking.status === 'confirmed' && booking.owner_id === profile.id && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => navigate('/daily-reports')}
                            >
                              View Reports
                            </Button>
                          )}
                          {booking.status === 'pending' && booking.owner_id === profile.id && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => handleCompletePayment(booking)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CreditCard className="w-4 h-4 mr-2" />
                                Complete Payment
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={async () => {
                                  try {
                                    // For testing: mark this specific booking as paid
                                    const { error } = await supabase
                                      .from('bookings')
                                      .update({ 
                                        status: 'confirmed',
                                        payment_status: 'paid'
                                      })
                                      .eq('id', booking.id);
                                    
                                    if (error) throw error;
                                    
                                    toast({
                                      title: "Status Updated!",
                                      description: "Booking has been confirmed"
                                    });
                                    fetchBookings();
                                  } catch (error) {
                                    console.error('Error updating booking:', error);
                                    toast({
                                      title: "Error",
                                      description: "Failed to update booking status",
                                      variant: "destructive"
                                    });
                                  }
                                }}
                              >
                                Mark as Paid
                              </Button>
                            </>
                          )}
                         {booking.status === 'pending' && (
                           <Button 
                             variant="destructive" 
                             size="sm" 
                             onClick={() => handleCancelBooking(booking)}
                           >
                             Cancel
                           </Button>
                         )}
                       </div>
                      
                      {/* Show sitter address if booking is confirmed and user is owner */}
                      {booking.status === 'confirmed' && booking.owner_id === profile.id && booking.sitter?.address && (
                        <div className="text-sm text-muted-foreground">
                          <MapPin className="w-3 h-3 inline mr-1" />
                          Sitter: {booking.sitter.address}, {booking.sitter.suburb}, {booking.sitter.city}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No bookings found</h3>
                <p className="text-muted-foreground mb-6">
                  {activeTab === 'upcoming' 
                    ? "You don't have any upcoming bookings."
                    : activeTab === 'past'
                    ? "You don't have any past bookings."
                    : "You don't have any cancelled bookings."
                  }
                </p>
                {activeTab === 'upcoming' && (
                  <Button onClick={() => window.location.href = '/find-sitters'}>
                    Find Sitters
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Booking Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Service Information</h4>
                  <p><strong>Service:</strong> {selectedBooking.service_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                  <p><strong>Reference:</strong> {selectedBooking.booking_reference}</p>
                  <p><strong>Date:</strong> {format(new Date(selectedBooking.start_date), 'MMM dd, yyyy')} - {format(new Date(selectedBooking.end_date), 'MMM dd, yyyy')}</p>
                  {selectedBooking.start_time && (
                    <p><strong>Time:</strong> {selectedBooking.start_time} - {selectedBooking.end_time}</p>
                  )}
                  <p><strong>Amount:</strong> ${selectedBooking.total_amount}</p>
                  <p><strong>Status:</strong> <Badge variant={getStatusColor(selectedBooking.status)}>{selectedBooking.status}</Badge></p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Contact Information</h4>
                  {selectedBooking.owner_id === profile.id ? (
                    // Show sitter info to owner
                    <div>
                      <p><strong>Sitter:</strong> {selectedBooking.sitter?.first_name} {selectedBooking.sitter?.last_name}</p>
                      {selectedBooking.status === 'confirmed' && (
                        <>
                          <p><strong>Email:</strong> {selectedBooking.sitter?.email}</p>
                          <p><strong>Phone:</strong> {selectedBooking.sitter?.phone}</p>
                          <p><strong>Address:</strong> {selectedBooking.sitter?.address}, {selectedBooking.sitter?.suburb}, {selectedBooking.sitter?.city}</p>
                        </>
                      )}
                    </div>
                  ) : (
                    // Show owner info to sitter
                    <div>
                      <p><strong>Owner:</strong> {selectedBooking.owner?.first_name} {selectedBooking.owner?.last_name}</p>
                      {selectedBooking.status === 'confirmed' && (
                        <>
                          <p><strong>Email:</strong> {selectedBooking.owner?.email}</p>
                          <p><strong>Phone:</strong> {selectedBooking.owner?.phone}</p>
                          <p><strong>Address:</strong> {selectedBooking.owner?.address}, {selectedBooking.owner?.suburb}, {selectedBooking.owner?.city}</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {selectedBooking.special_instructions && (
                <div>
                  <h4 className="font-medium mb-2">Special Instructions</h4>
                  <p className="text-muted-foreground bg-muted p-3 rounded">{selectedBooking.special_instructions}</p>
                </div>
              )}
              
              {(selectedBooking.owner_notes || selectedBooking.sitter_notes) && (
                <div>
                  <h4 className="font-medium mb-2">Notes</h4>
                  {selectedBooking.owner_notes && (
                    <p className="text-sm mb-2"><strong>Owner notes:</strong> {selectedBooking.owner_notes}</p>
                  )}
                  {selectedBooking.sitter_notes && (
                    <p className="text-sm"><strong>Sitter notes:</strong> {selectedBooking.sitter_notes}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}