import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, Play, DollarSign } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  message: string;
  duration?: number;
}

export default function PaymentTestSuite() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const { toast } = useToast();

  const updateResult = (name: string, status: TestResult['status'], message: string, duration?: number) => {
    setResults(prev => {
      const existing = prev.find(r => r.name === name);
      if (existing) {
        return prev.map(r => r.name === name ? { ...r, status, message, duration } : r);
      }
      return [...prev, { name, status, message, duration }];
    });
  };

  const runTest = async (
    name: string,
    testFn: () => Promise<void>
  ): Promise<boolean> => {
    const startTime = Date.now();
    updateResult(name, 'running', 'Running...');
    
    try {
      await testFn();
      const duration = Date.now() - startTime;
      updateResult(name, 'passed', 'Test passed', duration);
      return true;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      updateResult(name, 'failed', error.message || 'Test failed', duration);
      return false;
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setResults([]);
    
    try {
      // Test 1: Verify user is authenticated
      await runTest('1. User Authentication Check', async () => {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw new Error(`Auth error: ${error.message}`);
        if (!user) throw new Error('No user logged in. Please log in first.');
        console.log('[PAYMENT-TEST] User authenticated:', user.email);
      });

      // Test 2: Check if user has profile
      await runTest('2. User Profile Verification', async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not found');

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw new Error(`Profile fetch error: ${error.message}`);
        if (!profile) throw new Error('No profile found');
        console.log('[PAYMENT-TEST] Profile found:', profile.email);
      });

      // Test 3: Find a test booking in awaiting_payment status
      let testBooking: any = null;
      await runTest('3. Find Awaiting Payment Booking', async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not found');

        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        const { data: bookings, error } = await supabase
          .from('bookings')
          .select(`
            *,
            owner:profiles!owner_id(user_id, email, first_name, last_name, phone),
            sitter:profiles!sitter_id(stripe_account_id, stripe_account_enabled, first_name, last_name)
          `)
          .eq('owner_id', profile?.id)
          .eq('status', 'awaiting_payment')
          .limit(1);

        if (error) throw new Error(`Booking fetch error: ${error.message}`);
        if (!bookings || bookings.length === 0) {
          throw new Error('No bookings in awaiting_payment status. Please accept a booking first.');
        }

        testBooking = bookings[0];
        console.log('[PAYMENT-TEST] Test booking:', testBooking.booking_reference);
      });

      // Test 4: Verify sitter has Stripe account
      await runTest('4. Sitter Stripe Account Verification', async () => {
        if (!testBooking) throw new Error('No test booking available');
        
        if (!testBooking.sitter.stripe_account_id) {
          throw new Error('Sitter does not have a Stripe account ID');
        }
        if (!testBooking.sitter.stripe_account_enabled) {
          throw new Error('Sitter Stripe account is not enabled');
        }
        console.log('[PAYMENT-TEST] Sitter Stripe account verified:', testBooking.sitter.stripe_account_id);
      });

      // Test 5: Test payment edge function with valid data
      await runTest('5. Payment Edge Function - Valid Request', async () => {
        if (!testBooking) throw new Error('No test booking available');

        const { data, error } = await supabase.functions.invoke('create-payment-after-acceptance', {
          body: { bookingId: testBooking.id }
        });

        if (error) throw new Error(`Edge function error: ${error.message}`);
        if (!data || !data.url) throw new Error('No checkout URL returned');
        
        console.log('[PAYMENT-TEST] Payment session created:', data.url);
      });

      // Test 6: Test with invalid booking ID
      await runTest('6. Payment Edge Function - Invalid Booking ID', async () => {
        const { error } = await supabase.functions.invoke('create-payment-after-acceptance', {
          body: { bookingId: '00000000-0000-0000-0000-000000000000' }
        });

        if (!error) throw new Error('Expected error for invalid booking ID');
        console.log('[PAYMENT-TEST] Correctly rejected invalid booking ID');
      });

      // Test 7: Test with missing booking ID
      await runTest('7. Payment Edge Function - Missing Booking ID', async () => {
        const { error } = await supabase.functions.invoke('create-payment-after-acceptance', {
          body: {}
        });

        if (!error) throw new Error('Expected error for missing booking ID');
        console.log('[PAYMENT-TEST] Correctly rejected missing booking ID');
      });

      // Test 8: Verify booking has correct metadata
      await runTest('8. Booking Metadata Verification', async () => {
        if (!testBooking) throw new Error('No test booking available');

        const { data: booking, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', testBooking.id)
          .single();

        if (error) throw new Error(`Failed to fetch booking: ${error.message}`);
        if (!booking.total_amount || booking.total_amount <= 0) {
          throw new Error('Invalid total amount');
        }
        if (!booking.platform_fee || booking.platform_fee < 0) {
          throw new Error('Invalid platform fee');
        }
        
        console.log('[PAYMENT-TEST] Booking metadata valid:', {
          total: booking.total_amount,
          fee: booking.platform_fee
        });
      });

      // Test 9: Verify booking status transitions
      await runTest('9. Booking Status Validation', async () => {
        if (!testBooking) throw new Error('No test booking available');

        // Verify current status
        const { data: booking } = await supabase
          .from('bookings')
          .select('status')
          .eq('id', testBooking.id)
          .single();

        if (booking?.status !== 'awaiting_payment') {
          throw new Error(`Unexpected status: ${booking?.status}. Expected: awaiting_payment`);
        }
        
        console.log('[PAYMENT-TEST] Booking status is correct: awaiting_payment');
      });

      // Test 10: Simulate complete payment flow (dry run)
      await runTest('10. Complete Payment Flow Simulation', async () => {
        if (!testBooking) throw new Error('No test booking available');

        // Step 1: Verify booking exists
        const { data: booking1, error: error1 } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', testBooking.id)
          .single();

        if (error1 || !booking1) throw new Error('Booking not found in step 1');

        // Step 2: Create payment session
        const { data: paymentData, error: error2 } = await supabase.functions.invoke(
          'create-payment-after-acceptance',
          { body: { bookingId: testBooking.id } }
        );

        if (error2) throw new Error(`Payment creation failed: ${error2.message}`);
        if (!paymentData?.url) throw new Error('No checkout URL in step 2');

        // Step 3: Verify stripe_checkout_session_id was saved
        const { data: booking3, error: error3 } = await supabase
          .from('bookings')
          .select('stripe_checkout_session_id')
          .eq('id', testBooking.id)
          .single();

        if (error3) throw new Error('Failed to verify session ID in step 3');
        if (!booking3?.stripe_checkout_session_id) {
          throw new Error('Stripe checkout session ID not saved');
        }

        console.log('[PAYMENT-TEST] Complete flow validated:', {
          bookingId: testBooking.id,
          sessionId: booking3.stripe_checkout_session_id,
          checkoutUrl: paymentData.url
        });
      });

      toast({
        title: 'All Tests Completed',
        description: `Completed ${results.length} tests. Check results below.`,
      });

    } catch (error: any) {
      console.error('[PAYMENT-TEST] Test suite error:', error);
      toast({
        title: 'Test Suite Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'running':
        return <Clock className="h-5 w-5 text-blue-600 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      passed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      running: 'bg-blue-100 text-blue-800',
      pending: 'bg-gray-100 text-gray-800',
    };
    return <Badge className={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  const passedCount = results.filter(r => r.status === 'passed').length;
  const failedCount = results.filter(r => r.status === 'failed').length;
  const totalTests = results.length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-primary" />
                Payment System Test Suite
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Comprehensive testing for booking payment functionality
              </p>
            </div>
            <Button
              onClick={runAllTests}
              disabled={isRunning}
              size="lg"
              className="gap-2"
            >
              <Play className="h-5 w-5" />
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Summary */}
          {totalTests > 0 && (
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold">{totalTests}</div>
                <div className="text-sm text-muted-foreground">Total Tests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{passedCount}</div>
                <div className="text-sm text-muted-foreground">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{failedCount}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
            </div>
          )}

          {/* Test Results */}
          <div className="space-y-3">
            {results.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Click "Run All Tests" to start testing the payment system</p>
              </div>
            ) : (
              results.map((result, index) => (
                <Card key={index} className={`
                  ${result.status === 'passed' ? 'border-green-200 bg-green-50' : ''}
                  ${result.status === 'failed' ? 'border-red-200 bg-red-50' : ''}
                  ${result.status === 'running' ? 'border-blue-200 bg-blue-50' : ''}
                `}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        {getStatusIcon(result.status)}
                        <div className="flex-1">
                          <div className="font-semibold mb-1">{result.name}</div>
                          <div className="text-sm text-muted-foreground">{result.message}</div>
                          {result.duration && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Completed in {result.duration}ms
                            </div>
                          )}
                        </div>
                      </div>
                      {getStatusBadge(result.status)}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Instructions */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-3">Test Prerequisites:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>You must be logged in as a pet owner</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>You must have at least one booking in "awaiting_payment" status</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>The sitter must have completed Stripe Connect onboarding</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Stripe API keys must be configured in environment variables</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
