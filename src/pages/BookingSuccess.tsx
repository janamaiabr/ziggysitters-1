import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Calendar, MapPin, DollarSign, ArrowLeft } from 'lucide-react';

export default function BookingSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');
  const bookingRef = searchParams.get('booking_ref');

  useEffect(() => {
    // Here you could verify the payment with Stripe and update the booking status
    // For now, we'll just show the success message
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Booking Confirmed!</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center text-muted-foreground">
            Your pet sitting booking has been successfully created and payment processed.
          </div>
          
          {bookingRef && (
            <div className="bg-muted p-4 rounded-lg">
              <div className="text-sm font-medium mb-1">Booking Reference</div>
              <div className="font-mono text-lg">{bookingRef}</div>
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
                Your sitter will be notified and may contact you
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