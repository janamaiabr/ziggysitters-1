import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Calendar, MapPin, DollarSign, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export default function BookingSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  
  const sessionId = searchParams.get('session_id');
  const bookingRef = searchParams.get('booking_ref');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId || !bookingRef) {
        toast({
          title: 'Missing Information',
          description: 'Session ID or booking reference is missing.',
          variant: 'destructive'
        });
        setIsVerifying(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: { sessionId, bookingReference: bookingRef }
        });

        if (error) throw error;

        if (data?.success) {
          setVerificationSuccess(true);
          setBookingDetails(data.booking);
          toast({
            title: 'Payment Verified',
            description: 'Your booking has been confirmed successfully.'
          });
        }
      } catch (error) {
        console.error('Payment verification failed:', error);
        toast({
          title: 'Verification Failed',
          description: 'Could not verify payment. Please contact support.',
          variant: 'destructive'
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId, bookingRef]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            {isVerifying ? (
              <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
            ) : (
              <CheckCircle className="w-8 h-8 text-green-600" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {isVerifying ? 'Verifying Payment...' : 'Booking Confirmed! 🐾'}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center text-muted-foreground">
            {isVerifying 
              ? 'We are verifying your payment with Stripe. This should only take a moment...'
              : verificationSuccess 
                ? 'Your pet sitting booking has been successfully created and payment processed through Stripe.'
                : 'There was an issue verifying your payment. Please contact support.'
            }
          </div>
          
          {bookingRef && (
            <div className="bg-muted p-4 rounded-lg">
              <div className="text-sm font-medium mb-1">Booking Reference</div>
              <div className="font-mono text-lg">{bookingRef}</div>
              {bookingDetails && (
                <div className="mt-2">
                  <Badge variant={bookingDetails.status === 'confirmed' ? 'default' : 'secondary'}>
                    {bookingDetails.status === 'confirmed' ? '✓ Confirmed' : bookingDetails.status}
                  </Badge>
                  <Badge variant={bookingDetails.paymentStatus === 'paid' ? 'default' : 'secondary'} className="ml-2">
                    💳 {bookingDetails.paymentStatus === 'paid' ? 'Paid via Stripe' : bookingDetails.paymentStatus}
                  </Badge>
                </div>
              )}
            </div>
          )}
          
          <div className="space-y-3">
            <h3 className="font-semibold">What's Next?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                You'll receive a confirmation email shortly
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                Your sitter will be notified and may contact you (90% of payment will go to sitter after admin approval)
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                Check your bookings page for updates
              </li>
            </ul>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button onClick={() => navigate('/bookings')} className="w-full">
              <Calendar className="mr-2 h-4 w-4" />
              View My Bookings
            </Button>
            <Button variant="outline" onClick={() => navigate('/')} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}