import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

const BookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | 'pending'>('pending');
  
  const sessionId = searchParams.get('session_id');
  const bookingId = searchParams.get('booking_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId || !bookingId) {
        setPaymentStatus('failed');
        setIsVerifying(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: {
            session_id: sessionId,
            booking_id: bookingId
          }
        });

        if (error) throw error;

        if (data?.success) {
          setPaymentStatus('success');
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
  }, [sessionId, bookingId]);

  const handleViewBookings = () => {
    navigate('/bookings');
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
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Card>
        <CardHeader className="text-center">
          {paymentStatus === 'success' ? (
            <>
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
              <CardTitle className="text-green-600">Payment Successful!</CardTitle>
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
        <CardContent className="text-center space-y-4">
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
    </div>
  );
};

export default BookingSuccess;