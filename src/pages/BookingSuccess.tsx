import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { metaPixel } from "@/lib/metaPixel";
import { useAuth } from "@/hooks/useAuth";
import PostBookingEmailVerification from "@/components/booking/PostBookingEmailVerification";

const BookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | 'pending'>('pending');
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [emailVerified, setEmailVerified] = useState(true);
  const [userFirstName, setUserFirstName] = useState('');
  
  const sessionId = searchParams.get('session_id');
  const bookingRef = searchParams.get('booking_ref');
  const bookingId = searchParams.get('booking_id'); // Legacy support

  // Check if user's email is verified
  useEffect(() => {
    const checkEmailVerified = async () => {
      if (!user?.id) return;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('email_verified, first_name, role')
        .eq('user_id', user.id)
        .maybeSingle();
      
      // Only show email verification prompt for pet owners who haven't verified
      if (profile && profile.role === 'pet_owner' && !profile.email_verified) {
        setEmailVerified(false);
        setUserFirstName(profile.first_name || '');
      }
    };
    
    checkEmailVerified();
  }, [user?.id]);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        console.error('Missing session_id');
        setPaymentStatus('failed');
        setIsVerifying(false);
        toast({
          title: "Invalid Payment Link",
          description: "No payment session found. Please try booking again.",
          variant: "destructive"
        });
        return;
      }

      try {
        // Determine booking_id - prioritize URL parameter, then lookup by reference
        let actualBookingId = bookingId;
        
        if (!actualBookingId && bookingRef) {
          console.log('Looking up booking by reference:', bookingRef);
          const { data: booking, error: lookupError } = await supabase
            .from('bookings')
            .select('id')
            .eq('booking_reference', bookingRef)
            .maybeSingle();
          
          if (lookupError || !booking) {
            console.error('Could not find booking with reference:', bookingRef, lookupError);
            setPaymentStatus('failed');
            setIsVerifying(false);
            toast({
              title: "Booking Not Found",
              description: "Could not find your booking. Please contact support with reference: " + bookingRef,
              variant: "destructive"
            });
            return;
          }
          
          actualBookingId = booking.id;
          console.log('Found booking ID:', actualBookingId);
        }

        if (!actualBookingId) {
          console.error('No booking_id available');
          setPaymentStatus('failed');
          setIsVerifying(false);
          toast({
            title: "Booking Error",
            description: "Could not identify your booking. Please contact support.",
            variant: "destructive"
          });
          return;
        }

        console.log('Verifying payment for booking:', actualBookingId, 'session:', sessionId);

        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: {
            session_id: sessionId,
            booking_id: actualBookingId
          }
        });

        if (error) throw error;

        if (data?.success) {
          setPaymentStatus('success');
          
          // Track purchase completion
          metaPixel.trackPurchase(data.amount || 0, 'NZD');
          
          // Show email verification prompt for unverified pet owners
          if (!emailVerified) {
            setShowEmailVerification(true);
          }
          
          toast({
            title: "Payment Successful!",
            description: "Your booking has been confirmed.",
          });
        } else {
          setPaymentStatus('failed');
          toast({
            title: "Payment Verification Failed",
            description: data?.error || "Unable to verify payment status.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setPaymentStatus('failed');
        toast({
          title: "Verification Error",
          description: "Failed to verify payment. Please contact support.",
          variant: "destructive"
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId, bookingId, bookingRef, emailVerified]);

  const handleViewBookings = () => {
    // Add a timestamp to force a hard navigation and refresh
    navigate('/bookings?refresh=' + Date.now());
  };

  const handleEmailVerified = () => {
    setShowEmailVerification(false);
    setEmailVerified(true);
    toast({
      title: "Email Verified!",
      description: "You'll now receive booking updates via email.",
    });
  };

  const handleSkipVerification = () => {
    setShowEmailVerification(false);
  };

  if (isVerifying) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <Card>
          <CardHeader className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <CardTitle>Verifying Payment</CardTitle>
            <CardDescription>
              Please wait while we confirm your payment...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md space-y-4">
      <Card>
        <CardHeader className="text-center">
          {paymentStatus === 'success' ? (
            <>
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
              <CardTitle className="text-green-600">Payment Successful! 🎉</CardTitle>
              <CardDescription>
                Your booking has been confirmed and the pet sitter has been notified.
              </CardDescription>
            </>
          ) : (
            <>
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto" />
              <CardTitle className="text-red-600">Payment Failed</CardTitle>
              <CardDescription>
                There was an issue processing your payment. Please try again or contact support.
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentStatus === 'success' && (
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4 space-y-3 text-left">
              <h3 className="font-semibold text-green-800 dark:text-green-200 text-base">📋 What happens next?</h3>
              <div className="space-y-2 text-sm text-green-700 dark:text-green-300">
                <p className="flex items-start gap-2">
                  <span className="flex-shrink-0 mt-0.5">📧</span>
                  <span>Your sitter will receive an <strong>email notification right now</strong></span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="flex-shrink-0 mt-0.5">⏰</span>
                  <span>Expected response time: <strong>within 2-4 hours</strong></span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="flex-shrink-0 mt-0.5">🔄</span>
                  <span>If no response in 24h, <strong>we'll follow up automatically</strong></span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="flex-shrink-0 mt-0.5">💬</span>
                  <span>You can also message your sitter directly from <strong>My Bookings</strong></span>
                </p>
              </div>
            </div>
          )}
          
          <Button onClick={handleViewBookings} className="w-full">
            View My Bookings
          </Button>
          
          {paymentStatus === 'failed' && (
            <Button 
              variant="outline" 
              onClick={() => navigate('/bookings')}
              className="w-full"
            >
              Try Payment Again
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Email verification prompt for pet owners */}
      {showEmailVerification && user && paymentStatus === 'success' && (
        <PostBookingEmailVerification
          userId={user.id}
          email={user.email || ''}
          firstName={userFirstName}
          onVerified={handleEmailVerified}
          onSkip={handleSkipVerification}
        />
      )}
    </div>
  );
};

export default BookingSuccess;