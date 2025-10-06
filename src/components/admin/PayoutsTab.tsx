import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, Clock, CheckCircle } from 'lucide-react';

type BookingWithDetails = {
  id: string;
  booking_reference: string;
  total_amount: number;
  platform_fee: number;
  status: string;
  payment_status: string;
  start_date: string;
  end_date: string;
  sitter: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  owner: {
    id: string;
    first_name: string;
    last_name: string;
  };
};

export default function PayoutsTab() {
  const { toast } = useToast();
  const [completedBookings, setCompletedBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPayouts, setProcessingPayouts] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCompletedBookings();
  }, []);

  const fetchCompletedBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_reference,
          total_amount,
          platform_fee,
          status,
          payment_status,
          start_date,
          end_date,
          sitter:sitter_id (id, first_name, last_name, email),
          owner:owner_id (id, first_name, last_name)
        `)
        .eq('status', 'completed')
        .eq('payment_status', 'paid')
        .order('end_date', { ascending: false });

      if (error) throw error;
      setCompletedBookings(data as any || []);
    } catch (error) {
      console.error('Error fetching completed bookings:', error);
      toast({
        title: "Error",
        description: "Failed to load completed bookings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayout = async (bookingId: string) => {
    setProcessingPayouts(prev => new Set(prev).add(bookingId));
    
    try {
      const { data, error } = await supabase.functions.invoke('process-booking-payout', {
        body: { booking_id: bookingId }
      });

      if (error) throw error;

      toast({
        title: "Payout processed",
        description: data.message || "Payout completed successfully",
      });

      fetchCompletedBookings();
    } catch (error: any) {
      toast({
        title: "Error processing payout",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessingPayouts(prev => {
        const next = new Set(prev);
        next.delete(bookingId);
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p>Loading...</p>
      </div>
    );
  }

  const pendingPayouts = completedBookings.filter(b => b.payment_status === 'paid');
  const processedPayouts = completedBookings.filter(b => b.payment_status === 'paid_out');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Payouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{pendingPayouts.length}</p>
            <p className="text-sm text-muted-foreground">Awaiting payout processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Processed Payouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{processedPayouts.length}</p>
            <p className="text-sm text-muted-foreground">Successfully paid out</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Pending Payouts</h3>
        {pendingPayouts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">No pending payouts</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pendingPayouts.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold">{booking.booking_reference}</h4>
                      <p className="text-sm text-muted-foreground">
                        {booking.sitter.first_name} {booking.sitter.last_name} ({booking.sitter.email})
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {booking.payment_status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total</p>
                      <p className="font-semibold">${booking.total_amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Platform Fee</p>
                      <p className="font-semibold">${booking.platform_fee.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Sitter Payout</p>
                      <p className="font-semibold text-green-600">
                        ${(booking.total_amount - booking.platform_fee).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleProcessPayout(booking.id)}
                    disabled={processingPayouts.has(booking.id)}
                    className="w-full"
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    {processingPayouts.has(booking.id) ? 'Processing...' : 'Process Payout'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Processed Payouts</h3>
        {processedPayouts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-600">No processed payouts yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {processedPayouts.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{booking.booking_reference}</h4>
                      <p className="text-sm text-muted-foreground">
                        {booking.sitter.first_name} {booking.sitter.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        ${(booking.total_amount - booking.platform_fee).toFixed(2)} paid out
                      </p>
                    </div>
                    <Badge variant="default">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Paid Out
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
