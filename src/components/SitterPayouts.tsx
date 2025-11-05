import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, CheckCircle, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

type PayoutBooking = {
  id: string;
  booking_reference: string;
  total_amount: number;
  platform_fee: number;
  status: string;
  payment_status: string;
  start_date: string;
  end_date: string;
  penalty_amount: number;
  owner: {
    first_name: string;
    last_name: string;
  };
};

interface SitterPayoutsProps {
  sitterId: string;
}

export default function SitterPayouts({ sitterId }: SitterPayoutsProps) {
  const [payouts, setPayouts] = useState<PayoutBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayouts();
  }, [sitterId]);

  const fetchPayouts = async () => {
    try {
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .eq('sitter_id', sitterId)
        .eq('status', 'completed')
        .in('payment_status', ['paid', 'paid_out'])
        .order('end_date', { ascending: false });

      if (bookingsError) throw bookingsError;

      if (!bookingsData || bookingsData.length === 0) {
        setPayouts([]);
        return;
      }

      // Fetch owner profiles separately
      const ownerIds = [...new Set(bookingsData.map(b => b.owner_id))];
      const { data: ownersData, error: ownersError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', ownerIds);

      if (ownersError) throw ownersError;

      // Map owners to bookings
      const ownersMap = new Map(ownersData?.map(o => [o.id, o]) || []);
      const payoutsWithOwners = bookingsData.map(booking => ({
        ...booking,
        owner: ownersMap.get(booking.owner_id) || { first_name: 'Unknown', last_name: 'Owner' }
      }));

      setPayouts(payoutsWithOwners as any);
    } catch (error) {
      console.error('Error fetching payouts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const pendingPayouts = payouts.filter(b => b.payment_status === 'paid');
  const completedPayouts = payouts.filter(b => b.payment_status === 'paid_out');

  const calculateNetPayout = (booking: PayoutBooking) => {
    return booking.total_amount - booking.platform_fee - (booking.penalty_amount || 0);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{pendingPayouts.length}</p>
                <p className="text-sm text-muted-foreground">Pending Payouts</p>
                <p className="text-xs text-muted-foreground">Processing by admin</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{completedPayouts.length}</p>
                <p className="text-sm text-muted-foreground">Completed Payouts</p>
                <p className="text-xs text-muted-foreground">Transferred to your account</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Payouts */}
      {pendingPayouts.length > 0 && (
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold">Pending Payouts</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Automatically processed daily. Funds will be transferred to your Stripe account.
            </p>
          </div>
          {pendingPayouts.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold">{booking.booking_reference}</h4>
                    <p className="text-sm text-muted-foreground">
                      {booking.owner.first_name} {booking.owner.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(booking.start_date), 'MMM d')} - {format(new Date(booking.end_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    <Clock className="w-3 h-3 mr-1" />
                    Processing
                  </Badge>
                </div>

                {/* Earnings Breakdown */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Booking Total</span>
                    <span className="font-medium">${booking.total_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Platform Fee (10%)</span>
                    <span className="font-medium">${booking.platform_fee.toFixed(2)}</span>
                  </div>
                  {booking.penalty_amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Report Penalty</span>
                      <span className="font-medium">${booking.penalty_amount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-semibold">You'll Receive</span>
                    <span className="font-bold text-lg text-primary">
                      ${calculateNetPayout(booking).toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Completed Payouts */}
      {completedPayouts.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold">Completed Payouts</h3>
          {completedPayouts.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">{booking.booking_reference}</h4>
                    <p className="text-sm text-muted-foreground">
                      {booking.owner.first_name} {booking.owner.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(booking.start_date), 'MMM d')} - {format(new Date(booking.end_date), 'MMM d, yyyy')}
                    </p>
                    <p className="text-sm font-semibold text-green-600 mt-2">
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      ${calculateNetPayout(booking).toFixed(2)} paid
                    </p>
                  </div>
                  <Badge>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Paid Out
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {payouts.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <DollarSign className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No payouts yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Complete bookings to start earning
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
