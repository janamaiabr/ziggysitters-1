import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/contexts/ProfileContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

      // Poll every 3 seconds to keep bookings up to date
      const pollInterval = setInterval(() => {
        fetchBookings();
      }, 3000);

      // Cleanup polling on unmount
      return () => {
        clearInterval(pollInterval);
      };
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
        // Force immediate refresh
        setTimeout(() => fetchBookings(), 500);
        setTimeout(() => fetchBookings(), 1500);
        setTimeout(() => fetchBookings(), 3000);
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

  const handleCompletePayment = async (booking: any) => {
    try {
      setLoading(true);
      console.log('Starting payment for booking:', booking.id);
      
      const { data, error } = await supabase.functions.invoke('create-payment-after-acceptance', {
        body: { booking_id: booking.id }
      });

      // Check for network/server errors first
      if (error) {
        console.error('Payment function error:', error);
        
        // Try to parse the error as JSON (our 400 errors return JSON)
        let errorData = null;
        try {
          // The error might be a FunctionsHttpError with a context property
          if (error.context && typeof error.context === 'object') {
            errorData = error.context;
          }
          // Or it might have the error data directly
          else if (typeof error === 'object' && error.error) {
            errorData = error;
          }
        } catch (e) {
          console.error('Failed to parse error:', e);
        }
        
        // Check if it's a Stripe setup issue
        if (errorData?.error_code === 'SITTER_STRIPE_NOT_ENABLED' || 
            errorData?.error?.includes('hasn\'t completed') ||
            errorData?.error?.includes('payment setup')) {
          toast({
            title: 'Sitter Payment Setup Required',
            description: errorData.error,
            variant: 'destructive',
            duration: 12000,
          });
          await fetchBookings();
          return;
        }
        
        // Use error data if available, otherwise generic message
        const errorMessage = errorData?.error || 
                            error.message || 
                            (typeof error === 'string' ? error : 
                            'Failed to connect to payment service. Please try again.');
        
        toast({
          title: "Payment Error",
          description: errorMessage,
          variant: "destructive",
          duration: 7000,
        });
        return;
      }

      // Check for error in response data (shouldn't happen with new error handling)
      if (data?.error) {
        console.error('Payment error from response:', data);
        toast({
          title: "Cannot Process Payment",
          description: data.error,
          variant: "destructive",
          duration: 10000,
        });
        return;
      }

      console.log('Payment session created:', data);

      if (data?.url) {
        window.open(data.url, '_blank');
        toast({
          title: "Payment Window Opened",
          description: "Complete payment in the new tab to confirm your booking.",
        });
      } else {
        throw new Error('No payment URL received from server');
      }
    } catch (error: any) {
      console.error('Error creating payment:', error);
      toast({
        title: "Payment Error",
        description: error.message || "An unexpected error occurred. Please try again or contact support.",
        variant: "destructive",
        duration: 7000,
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'pending': return 'secondary';
      case 'awaiting_payment': return 'secondary';
      case 'in_progress': return 'default';
      case 'completed': return 'outline';
      case 'cancelled': return 'destructive';
      case 'declined': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusMessage = (booking: any) => {
    if (!profile) return booking.status;

    const isOwner = booking.owner_id === profile.id;
    const isSitter = booking.sitter_id === profile.id;

    switch (booking.status) {
      case 'pending':
        if (isOwner) {
          return 'Waiting for sitter to accept';
        }
        if (isSitter) {
          return 'Action required: Accept or decline';
        }
        return 'Pending';
      
      case 'awaiting_payment':
        if (isOwner) {
          return 'Payment required';
        }
        if (isSitter) {
          return 'Waiting for owner payment';
        }
        return 'Awaiting payment';
      
      case 'confirmed':
        return 'Confirmed';
      
      case 'in_progress':
        return 'In progress';
      
      case 'completed':
        return 'Completed';
      
      case 'cancelled':
        return 'Cancelled';
      
      default:
        return booking.status;
    }
  };

  const [acceptingBookingId, setAcceptingBookingId] = useState<string | null>(null);

  const handleAcceptBooking = async (bookingId: string) => {
    setAcceptingBookingId(bookingId);
    
    try {
      // Check Stripe setup before accepting
      if (profile?.role === 'pet_sitter') {
        const { data: sitterProfile } = await supabase
          .from('profiles')
          .select('stripe_account_id, stripe_account_enabled')
          .eq('id', profile.id)
          .single();

        if (!sitterProfile?.stripe_account_id || !sitterProfile?.stripe_account_enabled) {
          toast({
            title: 'Stripe Setup Required',
            description: 'You must complete your Stripe Connect setup before accepting bookings. Please go to Profile > Payments.',
            variant: 'destructive',
            duration: 7000,
          });
          navigate('/profile?tab=payments');
          return;
        }
      }

      const { data: result, error } = await supabase.rpc('accept_booking', { 
        booking_id: bookingId 
      });

      if (error) throw error;
      
      const response = result as { success: boolean; error?: string; error_code?: string };
      
      if (!response.success) {
        if (response.error_code === 'STRIPE_NOT_CONNECTED' || response.error_code === 'STRIPE_NOT_ENABLED') {
          toast({
            title: 'Stripe Setup Required',
            description: response.error,
            variant: 'destructive',
            duration: 7000,
          });
          navigate('/profile?tab=payments');
          return;
        }

        if (response.error_code === 'STRIPE_UNDER_REVIEW') {
          const goToStripe = async () => {
            try {
              const { data, error } = await supabase.functions.invoke('stripe-connect-login-link');
              if (error) throw error;
              if (data?.url) {
                window.open(data.url, '_blank');
              }
            } catch (err) {
              console.error('Error getting Stripe link:', err);
            }
          };

          toast({
            title: "Account Under Review",
            description: response.error,
            variant: "destructive",
            duration: 10000,
            action: (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={goToStripe}
                className="whitespace-nowrap"
              >
                Go to Stripe
              </Button>
            ),
          });
          return;
        }
        
        throw new Error(response.error || 'Failed to accept booking');
      }

      // Send acceptance notification to owner
      const acceptedBooking = bookings.find(b => b.id === bookingId);
      if (acceptedBooking && acceptedBooking.owner) {
        await supabase.functions.invoke('send-booking-acceptance-email', {
          body: {
            owner_email: acceptedBooking.owner.email,
            owner_name: `${acceptedBooking.owner.first_name} ${acceptedBooking.owner.last_name}`,
            sitter_name: `${profile.first_name} ${profile.last_name}`,
            service_type: acceptedBooking.service_type,
            start_date: acceptedBooking.start_date,
            end_date: acceptedBooking.end_date,
            booking_reference: acceptedBooking.booking_reference,
            total_amount: acceptedBooking.total_amount
          }
        });
      }

      toast({
        title: "Booking Accepted",
        description: "The owner will be notified to complete payment.",
      });

      fetchBookings();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAcceptingBookingId(null);
    }
  };

  const handleDeclineBooking = async (booking) => {
    if (!profile) return;
    
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'declined' })
        .eq('id', booking.id);

      if (error) throw error;

      // Send decline notification to owner
      await supabase.functions.invoke('send-booking-decline-notification', {
        body: {
          owner_email: booking.owner.email,
          owner_name: `${booking.owner.first_name} ${booking.owner.last_name}`,
          sitter_name: `${profile.first_name} ${profile.last_name}`,
          service_type: booking.service_type,
          start_date: booking.start_date,
          end_date: booking.end_date,
          booking_reference: booking.booking_reference,
          total_amount: booking.total_amount
        }
      });

      toast({
        title: "Booking Declined",
        description: "The owner has been notified.",
      });

      fetchBookings();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCancelBooking = async (booking) => {
    if (!profile) return;
    
    try {
      setLoading(true);
      let refundData = null;

      // If booking is confirmed (payment made), process refund
      if (booking.status === 'confirmed') {
        const { data, error } = await supabase.functions.invoke('process-booking-refund', {
          body: { booking_id: booking.id }
        });

        if (error) throw error;
        refundData = data;

        const refundInfo = data?.refund_percentage > 0 
          ? `Refund: ${data.refund_percentage}% ($${data.refund_amount}). Platform fee ($${data.platform_fee_retained}) not refunded.`
          : "No refund issued (cancelled within 24 hours or after start date).";

        toast({
          title: "Booking Cancelled",
          description: refundInfo,
        });
      } else {
        // Just cancel without refund
        const { error } = await supabase
          .from('bookings')
          .update({ status: 'cancelled' })
          .eq('id', booking.id);

        if (error) throw error;

        toast({
          title: "Booking Cancelled",
          description: "The booking has been cancelled.",
        });
      }

      // Send cancellation email with refund info if available
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
          total_amount: booking.total_amount,
          refund_amount: refundData?.refund_amount || 0,
          refund_percentage: refundData?.refund_percentage || 0,
          platform_fee_retained: refundData?.platform_fee_retained || 0,
          was_paid: booking.status === 'confirmed'
        }
      });

      fetchBookings();
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to cancel booking",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase.rpc('update_booking_status', {
        booking_id: bookingId,
        new_status: 'in_progress'
      });

      if (error) throw error;

      toast({
        title: "Service started",
        description: "The booking is now in progress.",
      });

      fetchBookings();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCompleteBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase.rpc('update_booking_status', {
        booking_id: bookingId,
        new_status: 'completed'
      });

      if (error) throw error;

      toast({
        title: "Service completed",
        description: "The booking has been marked as completed. Payout will be processed.",
      });

      // Trigger payout
      await supabase.functions.invoke('process-booking-payout', {
        body: { booking_id: bookingId }
      });

      fetchBookings();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (booking) => {
    navigate(`/booking/${booking.id}`);
  };

  const filteredBookings = bookings.filter(booking => {
    const now = new Date();
    const endDate = new Date(booking.end_date);
    
    switch (activeTab) {
      case 'upcoming':
        return ['pending', 'awaiting_payment', 'confirmed', 'in_progress'].includes(booking.status) && endDate >= now;
      case 'past':
        return booking.status === 'completed' || endDate < now;
      case 'cancelled':
        return booking.status === 'cancelled';
      case 'declined':
        return booking.status === 'declined';
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

        {/* Stripe Setup Warning for Sitters */}
        {profile?.role === 'pet_sitter' && (!profile?.stripe_account_id || !profile?.stripe_account_enabled) && (
          <Card className="mb-6 border-orange-200 bg-orange-50 dark:bg-orange-950/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="text-3xl">⚠️</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                    Complete Your Payment Setup Required
                  </h3>
                  <p className="text-sm text-orange-800 dark:text-orange-200 mb-4">
                    You cannot accept bookings until you complete your Stripe Connect setup. 
                    This ensures you can receive payments for your services.
                  </p>
                  <Button 
                    onClick={() => navigate('/profile?tab=payments')}
                    variant="default"
                    size="sm"
                  >
                    Complete Setup Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'past', label: 'Past Bookings' },
            { id: 'cancelled', label: 'Cancelled' },
            { id: 'declined', label: 'Declined' }
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
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-xl font-semibold">
                            {booking.service_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </h3>
                          <Badge variant={getStatusColor(booking.status)}>
                            {getStatusMessage(booking)}
                          </Badge>
                        </div>
                        
                        {/* Show who you booked with */}
                        <div className="mb-3 pb-3 border-b border-border">
                          {booking.owner_id === profile.id ? (
                            <div className="flex items-center text-sm">
                              <User className="w-4 h-4 mr-2 text-muted-foreground" />
                              <span className="font-medium">Sitter:</span>
                              <span className="ml-2">{booking.sitter?.first_name} {booking.sitter?.last_name}</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-sm">
                              <User className="w-4 h-4 mr-2 text-muted-foreground" />
                              <span className="font-medium">Owner:</span>
                              <span className="ml-2">{booking.owner?.first_name} {booking.owner?.last_name}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <div className="flex items-center mb-2">
                              <CalendarIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                              <span className="font-medium">Dates:</span>
                            </div>
                            <div className="ml-6 text-muted-foreground">
                              {format(new Date(booking.start_date), 'MMM dd, yyyy')} 
                              {booking.start_date !== booking.end_date && (
                                <> - {format(new Date(booking.end_date), 'MMM dd, yyyy')}</>
                              )}
                            </div>
                            {booking.start_time && (
                              <div className="flex items-center mt-2">
                                <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                                <span className="text-muted-foreground">{booking.start_time} - {booking.end_time}</span>
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <div className="flex items-center mb-2">
                              <span className="mr-2">💰</span>
                              <span className="font-medium">Total:</span>
                              <span className="ml-2 text-lg font-semibold">${booking.total_amount}</span>
                            </div>
                            <div className="ml-6 text-xs text-muted-foreground">
                              Ref: {booking.booking_reference}
                            </div>
                          </div>
                        </div>
                        
                        {/* Show address for confirmed bookings */}
                        {booking.status === 'confirmed' && (
                          <div className="mt-3 pt-3 border-t border-border">
                            {booking.owner_id === profile.id && booking.sitter?.address ? (
                              <div className="flex items-start text-sm">
                                <MapPin className="w-4 h-4 mr-2 mt-0.5 text-muted-foreground flex-shrink-0" />
                                <div>
                                  <span className="font-medium">Sitter Location:</span>
                                  <p className="text-muted-foreground">{booking.sitter.address}, {booking.sitter.suburb}, {booking.sitter.city}</p>
                                </div>
                              </div>
                            ) : booking.sitter_id === profile.id && booking.owner?.address ? (
                              <div className="flex items-start text-sm">
                                <MapPin className="w-4 h-4 mr-2 mt-0.5 text-muted-foreground flex-shrink-0" />
                                <div>
                                  <span className="font-medium">Service Location:</span>
                                  <p className="text-muted-foreground">{booking.owner.address}, {booking.owner.suburb}, {booking.owner.city}</p>
                                </div>
                              </div>
                            ) : null}
                          </div>
                        )}
                        
                        {(booking.owner_notes || booking.sitter_notes) && (
                          <div className="mt-3 p-3 bg-muted rounded-lg">
                            <p className="text-sm">
                              <strong>Notes:</strong> {booking.owner_notes || booking.sitter_notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2 lg:items-end w-full">
                        <div className="flex flex-wrap gap-2 w-full">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleViewDetails(booking)}
                            className="flex-1 sm:flex-none sm:min-w-[100px]"
                          >
                            View Details
                          </Button>
                          
                          {/* Sitter Accept/Decline buttons for pending bookings */}
                          {booking.status === 'pending' && booking.sitter_id === profile.id && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => handleAcceptBooking(booking.id)}
                                disabled={acceptingBookingId === booking.id}
                                className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none sm:min-w-[100px]"
                              >
                                {acceptingBookingId === booking.id ? (
                                  <>
                                    <span className="animate-spin mr-2">⏳</span>
                                    Processing...
                                  </>
                                ) : (
                                  'Accept'
                                )}
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                onClick={() => handleDeclineBooking(booking)}
                                disabled={acceptingBookingId === booking.id}
                                className="flex-1 sm:flex-none sm:min-w-[100px]"
                              >
                                Decline
                              </Button>
                            </>
                          )}
                          
                          {(booking.status === 'confirmed' || booking.status === 'in_progress') && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                if (booking.owner_id === profile.id) {
                                  navigate('/daily-reports');
                                } else if (booking.sitter_id === profile.id) {
                                  navigate('/daily-reports');
                                }
                              }}
                              className="flex-1 sm:flex-none sm:min-w-[120px]"
                            >
                              {booking.sitter_id === profile.id ? 'Submit Report' : 'View Reports'}
                            </Button>
                          )}
                          {/* Owner can pay only when status is awaiting_payment (after sitter accepts) */}
                          {booking.owner_id === profile.id && (booking.status === 'awaiting_payment' || booking.status === 'pending') && (
                            <Button 
                              size="sm" 
                              onClick={() => handleCompletePayment(booking)}
                              disabled={booking.status === 'pending'}
                              className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none sm:min-w-[150px] whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <CreditCard className="w-4 h-4 mr-2" />
                              Complete Payment
                            </Button>
                          )}
                          {booking.owner_id === profile.id && (booking.status === 'pending' || booking.status === 'awaiting_payment') && (
                           <Button 
                             variant="destructive" 
                             size="sm" 
                             onClick={() => handleCancelBooking(booking)}
                             disabled={booking.status === 'pending'}
                             className="flex-1 sm:flex-none sm:min-w-[80px] disabled:opacity-50 disabled:cursor-not-allowed"
                           >
                             Cancel
                           </Button>
                         )}
                          {booking.status === 'confirmed' && booking.sitter_id === profile?.id && (
                           <>
                             <Button
                               size="sm"
                               onClick={() => handleStartBooking(booking.id)}
                               className="flex-1 sm:flex-none sm:min-w-[120px]"
                             >
                               Start Service
                             </Button>
                             <Button 
                               variant="destructive" 
                               size="sm" 
                               onClick={() => handleCancelBooking(booking)}
                               className="flex-1 sm:flex-none sm:min-w-[80px]"
                             >
                               Cancel
                             </Button>
                           </>
                         )}
                         {booking.status === 'confirmed' && booking.owner_id === profile?.id && (
                           <Button 
                             variant="destructive" 
                             size="sm" 
                             onClick={() => handleCancelBooking(booking)}
                             className="flex-1 sm:flex-none sm:min-w-[80px]"
                           >
                             Cancel
                           </Button>
                         )}
                         {booking.status === 'in_progress' && booking.sitter_id === profile?.id && (
                           <Button
                             size="sm"
                             onClick={() => handleCompleteBooking(booking.id)}
                             className="flex-1 sm:flex-none sm:min-w-[140px]"
                           >
                             Complete Service
                           </Button>
                         )}
                       </div>
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
    </div>
  );
}