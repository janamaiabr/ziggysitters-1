import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type PayoutIssue = {
  id: string;
  booking_reference: string;
  total_amount: number;
  platform_fee: number;
  payment_status: string;
  status: string;
  sitter_name: string;
  sitter_email: string;
  issue_type: 'no_transaction' | 'no_stripe_transfer' | 'fake_payout';
  issue_description: string;
};

type PendingPayout = {
  id: string;
  booking_reference: string;
  total_amount: number;
  platform_fee: number;
  stripe_fee: number;
  net_payout: number;
  sitter_name: string;
  sitter_email: string;
  owner_name: string;
  end_date: string;
  requires_daily_reports: boolean;
  daily_reports_completed: number;
  daily_reports_required: number;
  penalty_amount: number;
  has_stripe_account: boolean;
};

export default function PayoutMonitoring() {
  const { toast } = useToast();
  const [issues, setIssues] = useState<PayoutIssue[]>([]);
  const [pendingPayouts, setPendingPayouts] = useState<PendingPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPayouts, setProcessingPayouts] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPayoutData();
  }, []);

  const fetchPayoutData = async () => {
    setLoading(true);
    try {
      // Find bookings marked as paid_out but missing proper records
      const { data: paidOutBookings, error: paidOutError } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_reference,
          total_amount,
          platform_fee,
          payment_status,
          status,
          stripe_payment_intent_id,
          sitter:profiles!bookings_sitter_id_fkey(first_name, last_name, email)
        `)
        .eq('payment_status', 'paid_out');

      if (paidOutError) throw paidOutError;

      // Check each paid_out booking for issues
      const foundIssues: PayoutIssue[] = [];
      
      for (const booking of paidOutBookings || []) {
        // Check if transaction record exists with stripe_transfer_id
        const { data: transaction } = await supabase
          .from('transactions')
          .select('id, stripe_transfer_id')
          .eq('booking_id', booking.id)
          .eq('transaction_type', 'payout')
          .maybeSingle();

        const sitterName = `${booking.sitter.first_name} ${booking.sitter.last_name}`;
        
        if (!transaction) {
          foundIssues.push({
            id: booking.id,
            booking_reference: booking.booking_reference,
            total_amount: booking.total_amount,
            platform_fee: booking.platform_fee,
            payment_status: booking.payment_status,
            status: booking.status,
            sitter_name: sitterName,
            sitter_email: booking.sitter.email,
            issue_type: 'no_transaction',
            issue_description: 'Marked as paid_out but no transaction record exists',
          });
        } else if (!transaction.stripe_transfer_id) {
          foundIssues.push({
            id: booking.id,
            booking_reference: booking.booking_reference,
            total_amount: booking.total_amount,
            platform_fee: booking.platform_fee,
            payment_status: booking.payment_status,
            status: booking.status,
            sitter_name: sitterName,
            sitter_email: booking.sitter.email,
            issue_type: 'no_stripe_transfer',
            issue_description: 'Transaction exists but no Stripe transfer ID recorded',
          });
        }
      }

      setIssues(foundIssues);

      // Find legitimate pending payouts (completed bookings with payment)
      const { data: completedBookings, error: completedError } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_reference,
          total_amount,
          platform_fee,
          end_date,
          requires_daily_reports,
          daily_reports_required,
          daily_reports_completed,
          sitter:profiles!bookings_sitter_id_fkey(
            first_name, 
            last_name, 
            email,
            stripe_account_id,
            stripe_account_enabled
          ),
          owner:profiles!bookings_owner_id_fkey(first_name, last_name)
        `)
        .eq('status', 'completed')
        .eq('payment_status', 'paid');

      if (completedError) throw completedError;

      const pending = (completedBookings || []).map(booking => {
        const stripeFee = Math.round((booking.total_amount * 0.029 + 0.30) * 100) / 100;
        let penaltyAmount = 0;
        
        if (booking.requires_daily_reports && 
            booking.daily_reports_completed < booking.daily_reports_required) {
          const totalPenaltyPercentage = 0.15;
          const missedReports = booking.daily_reports_required - booking.daily_reports_completed;
          const penaltyPercentage = (totalPenaltyPercentage / booking.daily_reports_required) * missedReports;
          penaltyAmount = Math.round(booking.total_amount * penaltyPercentage * 100) / 100;
        }
        
        const netPayout = booking.total_amount - booking.platform_fee - stripeFee - penaltyAmount;

        return {
          id: booking.id,
          booking_reference: booking.booking_reference,
          total_amount: booking.total_amount,
          platform_fee: booking.platform_fee,
          stripe_fee: stripeFee,
          net_payout: netPayout,
          sitter_name: `${booking.sitter.first_name} ${booking.sitter.last_name}`,
          sitter_email: booking.sitter.email,
          owner_name: `${booking.owner.first_name} ${booking.owner.last_name}`,
          end_date: booking.end_date,
          requires_daily_reports: booking.requires_daily_reports,
          daily_reports_completed: booking.daily_reports_completed,
          daily_reports_required: booking.daily_reports_required,
          penalty_amount: penaltyAmount,
          has_stripe_account: !!(booking.sitter.stripe_account_id && booking.sitter.stripe_account_enabled),
        };
      });

      setPendingPayouts(pending);
    } catch (error) {
      console.error('Error fetching payout data:', error);
      toast({
        title: "Error",
        description: "Failed to load payout monitoring data",
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

      fetchPayoutData();
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

  const handleFixFakePayout = async (bookingId: string) => {
    if (!confirm('This will reset the booking to "paid" status so it can be properly processed. Continue?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          payment_status: 'paid',
          penalty_applied: false,
          penalty_amount: 0,
          penalty_applied_at: null,
          penalty_reason: null,
        })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "Booking reset",
        description: "Booking has been reset to 'paid' status and is ready for proper payout processing",
      });

      fetchPayoutData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p>Loading payout monitoring data...</p>
      </div>
    );
  }

  const totalIssuesAmount = issues.reduce((sum, issue) => sum + issue.total_amount, 0);
  const totalPendingAmount = pendingPayouts.reduce((sum, p) => sum + p.net_payout, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={issues.length > 0 ? "border-destructive" : ""}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Payment Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-destructive">{issues.length}</p>
            <p className="text-sm text-muted-foreground">
              ${totalIssuesAmount.toFixed(2)} in questionable payouts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              Pending Payouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{pendingPayouts.length}</p>
            <p className="text-sm text-muted-foreground">
              ${totalPendingAmount.toFixed(2)} ready to pay
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {issues.length === 0 ? '✓' : '⚠'}
            </p>
            <p className="text-sm text-muted-foreground">
              {issues.length === 0 ? 'All payouts valid' : 'Issues detected'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Issues Section */}
      {issues.length > 0 && (
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Payment Integrity Issues Detected</AlertTitle>
            <AlertDescription>
              Found {issues.length} booking(s) marked as paid_out but missing proper Stripe records. 
              These may be fake/test payouts that need to be corrected.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Bookings Requiring Review
            </h3>
            {issues.map((issue) => (
              <Card key={issue.id} className="border-destructive">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold flex items-center gap-2">
                        {issue.booking_reference}
                        <Badge variant="destructive">{issue.issue_type.replace('_', ' ')}</Badge>
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Sitter: {issue.sitter_name} ({issue.sitter_email})
                      </p>
                      <p className="text-xs text-destructive mt-2">
                        ⚠ {issue.issue_description}
                      </p>
                    </div>
                    <Badge variant="outline">
                      ${issue.total_amount.toFixed(2)}
                    </Badge>
                  </div>

                  <Button
                    onClick={() => handleFixFakePayout(issue.id)}
                    variant="destructive"
                    className="w-full"
                  >
                    Reset to Paid Status
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Pending Payouts Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Legitimate Pending Payouts ({pendingPayouts.length})
        </h3>
        
        {pendingPayouts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">No pending payouts</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pendingPayouts.map((payout) => (
              <Card key={payout.id} className={!payout.has_stripe_account ? "border-warning" : ""}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="font-semibold flex items-center gap-2">
                        {payout.booking_reference}
                        {!payout.has_stripe_account && (
                          <Badge variant="destructive">No Stripe Account</Badge>
                        )}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Sitter: {payout.sitter_name} ({payout.sitter_email})
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Owner: {payout.owner_name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Ended: {new Date(payout.end_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total</p>
                      <p className="font-semibold">${payout.total_amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Platform Fee</p>
                      <p className="font-semibold">${payout.platform_fee.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Stripe Fee</p>
                      <p className="font-semibold">${payout.stripe_fee.toFixed(2)}</p>
                    </div>
                    {payout.penalty_amount > 0 && (
                      <div>
                        <p className="text-muted-foreground">Penalty</p>
                        <p className="font-semibold text-destructive">
                          -${payout.penalty_amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {payout.daily_reports_completed}/{payout.daily_reports_required} reports
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-muted-foreground">Sitter Receives</p>
                      <p className="font-semibold text-green-600">
                        ${payout.net_payout.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {payout.requires_daily_reports && (
                    <div className="mb-4 p-3 bg-muted rounded-lg text-sm">
                      <p className="font-medium mb-1">Daily Reports:</p>
                      <p className={payout.daily_reports_completed < payout.daily_reports_required ? "text-destructive" : "text-success"}>
                        {payout.daily_reports_completed} of {payout.daily_reports_required} completed
                        {payout.penalty_amount > 0 && ` (${Math.round((payout.penalty_amount / payout.total_amount) * 100)}% penalty applies)`}
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={() => handleProcessPayout(payout.id)}
                    disabled={processingPayouts.has(payout.id) || !payout.has_stripe_account}
                    className="w-full"
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    {processingPayouts.has(payout.id) ? 'Processing...' : 'Process Payout Now'}
                  </Button>
                  
                  {!payout.has_stripe_account && (
                    <p className="text-xs text-destructive text-center mt-2">
                      ⚠ Sitter must complete Stripe Connect onboarding first
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
