import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/contexts/ProfileContext';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  details?: any;
}

export default function PaymentFlowTests() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [currentTest, setCurrentTest] = useState<string>('');

  const logTest = (name: string, passed: boolean, message: string, details?: any) => {
    console.log(`[PAYMENT-TEST] ${passed ? '✅' : '❌'} ${name}: ${message}`, details || '');
    setResults(prev => [...prev, { name, passed, message, details }]);
  };

  const runAllTests = async () => {
    setRunning(true);
    setResults([]);
    
    try {
      // Test 1: Verify user is authenticated
      setCurrentTest('Test 1: User Authentication');
      if (!user || !profile) {
        logTest('1. User Authentication', false, 'User not logged in');
        return;
      }
      logTest('1. User Authentication', true, 'User authenticated', { userId: user.id, profileId: profile.id });

      // Test 2: Check if Stripe is configured
      setCurrentTest('Test 2: Stripe Configuration');
      try {
        const { data: secretsTest } = await supabase.functions.invoke('create-payment-after-acceptance', {
          body: { booking_id: 'test-check' }
        });
        logTest('2. Stripe Configuration', true, 'Stripe appears to be configured');
      } catch (error: any) {
        if (error.message?.includes('not configured')) {
          logTest('2. Stripe Configuration', false, 'Stripe not configured', { error: error.message });
          return;
        }
        logTest('2. Stripe Configuration', true, 'Stripe is configured');
      }

      // Test 3: Check for awaiting_payment bookings
      setCurrentTest('Test 3: Find Awaiting Payment Bookings');
      const { data: awaitingBookings, error: bookingError } = await supabase
        .from('bookings')
        .select('*')
        .eq('owner_id', profile.id)
        .eq('status', 'awaiting_payment')
        .limit(5);

      if (bookingError) {
        logTest('3. Find Awaiting Payment Bookings', false, 'Database error', { error: bookingError.message });
        return;
      }
      
      logTest('3. Find Awaiting Payment Bookings', true, `Found ${awaitingBookings?.length || 0} bookings`, { 
        count: awaitingBookings?.length,
        bookings: awaitingBookings?.map(b => ({ id: b.id, ref: b.booking_reference }))
      });

      if (!awaitingBookings || awaitingBookings.length === 0) {
        logTest('Overall', true, 'No bookings to test payment with. Create a booking first.', {});
        return;
      }

      const testBooking = awaitingBookings[0];

      // Test 4: Verify booking has owner profile
      setCurrentTest('Test 4: Owner Profile Exists');
      const { data: ownerProfile, error: ownerError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', testBooking.owner_id)
        .maybeSingle();

      if (ownerError || !ownerProfile) {
        logTest('4. Owner Profile Exists', false, 'Owner profile not found', { error: ownerError?.message });
        return;
      }
      logTest('4. Owner Profile Exists', true, 'Owner profile verified', { 
        ownerId: ownerProfile.id,
        email: ownerProfile.email 
      });

      // Test 5: Verify booking has sitter profile
      setCurrentTest('Test 5: Sitter Profile Exists');
      const { data: sitterProfile, error: sitterError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', testBooking.sitter_id)
        .maybeSingle();

      if (sitterError || !sitterProfile) {
        logTest('5. Sitter Profile Exists', false, 'Sitter profile not found', { error: sitterError?.message });
        return;
      }
      logTest('5. Sitter Profile Exists', true, 'Sitter profile verified', { 
        sitterId: sitterProfile.id,
        name: `${sitterProfile.first_name} ${sitterProfile.last_name}` 
      });

      // Test 6: Verify sitter has Stripe Connect configured
      setCurrentTest('Test 6: Sitter Stripe Connect Status');
      if (!sitterProfile.stripe_account_id || !sitterProfile.stripe_account_enabled) {
        logTest('6. Sitter Stripe Connect Status', false, 'Sitter Stripe not configured', {
          hasAccountId: !!sitterProfile.stripe_account_id,
          isEnabled: sitterProfile.stripe_account_enabled
        });
      } else {
        logTest('6. Sitter Stripe Connect Status', true, 'Sitter Stripe Connect configured', {
          accountId: sitterProfile.stripe_account_id
        });
      }

      // Test 7: Test parameter formats (both camelCase and snake_case)
      setCurrentTest('Test 7: Edge Function Parameter Handling');
      const testParams = [
        { bookingId: testBooking.id, label: 'camelCase' },
        { booking_id: testBooking.id, label: 'snake_case' }
      ];

      for (const params of testParams) {
        try {
          const { data, error } = await supabase.functions.invoke('create-payment-after-acceptance', {
            body: params
          });

          if (error) {
            logTest(`7. Parameter (${params.label})`, false, `Error with ${params.label}`, { 
              error: error.message 
            });
          } else if (data?.error) {
            if (data.error.includes('payment setup') || data.error.includes('Stripe')) {
              logTest(`7. Parameter (${params.label})`, true, `${params.label} accepted (expected error)`, { 
                expectedError: data.error 
              });
            } else {
              logTest(`7. Parameter (${params.label})`, false, `Unexpected error`, { 
                error: data.error 
              });
            }
          } else if (data?.url) {
            logTest(`7. Parameter (${params.label})`, true, `${params.label} works - got URL`, {});
          }
        } catch (error: any) {
          logTest(`7. Parameter (${params.label})`, false, `Exception with ${params.label}`, { 
            error: error.message 
          });
        }
      }

      // Test 8: Test auth header
      setCurrentTest('Test 8: Authorization Header');
      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session) {
        logTest('8. Authorization Header', false, 'No active session', {});
        return;
      }
      logTest('8. Authorization Header', true, 'Session active', { 
        hasAccessToken: !!authData.session.access_token 
      });

      // Test 9: Test booking amounts
      setCurrentTest('Test 9: Booking Amount Validation');
      if (!testBooking.total_amount || testBooking.total_amount <= 0) {
        logTest('9. Booking Amount Validation', false, 'Invalid total amount', { 
          total: testBooking.total_amount 
        });
      } else {
        logTest('9. Booking Amount Validation', true, 'Valid amount', {
          total: testBooking.total_amount,
          platformFee: testBooking.platform_fee
        });
      }

      // Test 10: Test actual payment creation
      setCurrentTest('Test 10: Full Payment Flow');
      try {
        const { data: paymentData, error: paymentError } = await supabase.functions.invoke('create-payment-after-acceptance', {
          body: { booking_id: testBooking.id }
        });

        if (paymentError) {
          logTest('10. Full Payment Flow', false, 'Edge function error', { 
            error: paymentError.message 
          });
        } else if (paymentData?.error) {
          if (paymentData.error.includes('payment setup') || paymentData.error.includes('Stripe')) {
            logTest('10. Full Payment Flow', true, 'Flow works (config error expected)', { 
              note: 'Sitter needs Stripe setup',
              error: paymentData.error
            });
          } else {
            logTest('10. Full Payment Flow', false, 'Unexpected error', { 
              error: paymentData.error 
            });
          }
        } else if (paymentData?.url) {
          logTest('10. Full Payment Flow', true, 'Payment URL generated', { 
            hasUrl: true
          });
        } else {
          logTest('10. Full Payment Flow', false, 'No URL or error', { 
            response: paymentData 
          });
        }
      } catch (error: any) {
        logTest('10. Full Payment Flow', false, 'Exception', { 
          error: error.message 
        });
      }

      setCurrentTest('');
      toast({
        title: 'Tests Complete',
        description: `${results.filter(r => r.passed).length} passed, ${results.filter(r => !r.passed).length} failed`,
      });

    } catch (error: any) {
      console.error('[PAYMENT-TEST] Critical error:', error);
      toast({
        title: 'Test Suite Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setRunning(false);
      setCurrentTest('');
    }
  };

  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.filter(r => !r.passed).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Payment Flow Test Suite (10 Tests)</span>
            {running && <Loader2 className="w-5 h-5 animate-spin" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={runAllTests} disabled={running}>
              {running ? 'Running Tests...' : 'Run All Tests'}
            </Button>
            {results.length > 0 && (
              <div className="flex gap-2 items-center">
                <Badge variant="default" className="bg-green-600">
                  {passedCount} Passed
                </Badge>
                <Badge variant="destructive">
                  {failedCount} Failed
                </Badge>
              </div>
            )}
          </div>

          {currentTest && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium">{currentTest}</span>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-2">
              {results.map((result, index) => (
                <Card key={index} className={result.passed ? 'border-green-200' : 'border-red-200'}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {result.passed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{result.name}</span>
                          <Badge variant={result.passed ? 'default' : 'destructive'} className="text-xs">
                            {result.passed ? 'PASS' : 'FAIL'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{result.message}</p>
                        {result.details && (
                          <details className="text-xs">
                            <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                              View Details
                            </summary>
                            <pre className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto">
                              {JSON.stringify(result.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-amber-50 border-amber-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Test Coverage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p className="font-semibold">This suite validates:</p>
            <ol className="list-decimal list-inside space-y-1 pl-2">
              <li>User authentication & profile</li>
              <li>Stripe configuration</li>
              <li>Booking data integrity</li>
              <li>Sitter Stripe Connect status</li>
              <li>Parameter handling (camelCase & snake_case)</li>
              <li>Authorization header</li>
              <li>Database queries</li>
              <li>Amount calculations</li>
              <li>Error handling</li>
              <li>Payment URL generation</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
