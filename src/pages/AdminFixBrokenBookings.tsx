import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface BrokenBooking {
  id: string;
  booking_reference: string;
  service_type: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  status: string;
  created_at: string;
  owner: {
    first_name: string;
    last_name: string;
    email: string;
  };
  sitter: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    stripe_account_id: string | null;
    stripe_account_enabled: boolean | null;
  };
}

export default function AdminFixBrokenBookings() {
  const { toast } = useToast();
  const [brokenBookings, setBrokenBookings] = useState<BrokenBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [fixing, setFixing] = useState<string | null>(null);

  const findBrokenBookings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_reference,
          service_type,
          start_date,
          end_date,
          total_amount,
          status,
          created_at,
          owner:profiles!bookings_owner_id_fkey(
            first_name, last_name, email
          ),
          sitter:profiles!bookings_sitter_id_fkey(
            id, first_name, last_name, email, 
            stripe_account_id, stripe_account_enabled
          )
        `)
        .eq('status', 'awaiting_payment')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter for bookings where sitter doesn't have Stripe properly configured
      const broken = data.filter((booking: any) => {
        return !booking.sitter?.stripe_account_id || 
               !booking.sitter?.stripe_account_enabled;
      });

      setBrokenBookings(broken);
      
      toast({
        title: 'Scan Complete',
        description: `Found ${broken.length} broken bookings that need attention.`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fixBooking = async (bookingId: string, action: 'cancel' | 'notify') => {
    setFixing(bookingId);
    try {
      if (action === 'cancel') {
        // Cancel the booking
        const { error } = await supabase
          .from('bookings')
          .update({ 
            status: 'cancelled',
            sitter_notes: 'Auto-cancelled: Sitter payment setup incomplete'
          })
          .eq('id', bookingId);

        if (error) throw error;

        toast({
          title: 'Booking Cancelled',
          description: 'The booking has been cancelled. Customer should be notified.',
        });
      } else {
        // Send notification to sitter
        const booking = brokenBookings.find(b => b.id === bookingId);
        if (!booking) return;

        await supabase.functions.invoke('send-police-vet-reminder', {
          body: {
            email: booking.sitter.email,
            sitter_name: `${booking.sitter.first_name} ${booking.sitter.last_name}`,
            subject: 'URGENT: Complete Stripe Setup to Receive Bookings',
          },
        });

        toast({
          title: 'Notification Sent',
          description: 'The sitter has been notified to complete their Stripe setup.',
        });
      }

      // Refresh the list
      findBrokenBookings();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setFixing(null);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Fix Broken Bookings</h1>
          <p className="text-muted-foreground">
            Identify and fix bookings stuck in "awaiting_payment" because sitter hasn't completed Stripe setup
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Diagnostic Tool</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>What this tool does:</strong>
              </p>
              <ul className="text-sm text-blue-800 dark:text-blue-200 mt-2 space-y-1 list-disc list-inside">
                <li>Finds all bookings in "awaiting_payment" status</li>
                <li>Checks if the sitter has completed Stripe Connect setup</li>
                <li>Identifies bookings that can never be paid (broken state)</li>
                <li>Provides options to cancel or notify the sitter</li>
              </ul>
            </div>

            <Button 
              onClick={findBrokenBookings} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                'Scan for Broken Bookings'
              )}
            </Button>
          </CardContent>
        </Card>

        {brokenBookings.length > 0 && (
          <div className="space-y-4">
            <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <p className="font-semibold text-orange-900 dark:text-orange-100">
                  Found {brokenBookings.length} broken bookings
                </p>
              </div>
            </div>

            {brokenBookings.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">
                            {booking.service_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </h3>
                          <Badge variant="destructive">Broken - Payment Impossible</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Ref: {booking.booking_reference}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">${booking.total_amount}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(booking.created_at), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium mb-1">Pet Owner:</p>
                        <p className="text-muted-foreground">
                          {booking.owner.first_name} {booking.owner.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">{booking.owner.email}</p>
                      </div>
                      <div>
                        <p className="font-medium mb-1">Sitter (Problem):</p>
                        <p className="text-muted-foreground">
                          {booking.sitter.first_name} {booking.sitter.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">{booking.sitter.email}</p>
                      </div>
                    </div>

                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded p-3">
                      <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">
                        ❌ Stripe Setup Issue:
                      </p>
                      <p className="text-xs text-red-800 dark:text-red-200">
                        {!booking.sitter.stripe_account_id && 'No Stripe account connected'}
                        {booking.sitter.stripe_account_id && !booking.sitter.stripe_account_enabled && 'Stripe account not enabled/completed'}
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => fixBooking(booking.id, 'cancel')}
                        disabled={fixing === booking.id}
                      >
                        {fixing === booking.id ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Cancelling...
                          </>
                        ) : (
                          <>
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel Booking
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fixBooking(booking.id, 'notify')}
                        disabled={fixing === booking.id}
                      >
                        {fixing === booking.id ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Notifying...
                          </>
                        ) : (
                          'Notify Sitter'
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && brokenBookings.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <p className="text-lg font-semibold mb-2">No Broken Bookings Found</p>
              <p className="text-sm text-muted-foreground">
                All "awaiting_payment" bookings have sitters with proper Stripe setup.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
