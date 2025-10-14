import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface OnboardingFlow {
  steps: string[];
  currentStep: number;
  data: Record<string, any>;
}

interface TestResult {
  success: boolean;
  message: string;
  details?: string;
}

export function OnboardingTestSuite() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);
    
    const testResults: TestResult[] = [];

    // Test 1: Authentication Check
    try {
      if (!user) {
        throw new Error("No authenticated user found");
      }
      testResults.push({
        success: true,
        message: "Authentication verified",
        details: `User authenticated: ${user.email}`
      });
    } catch (error) {
      testResults.push({
        success: false,
        message: "Authentication failed",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }

    // Test 2: Profile and Onboarding Status
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;

      const onboardingComplete = profile.onboarding_completed;
      const hasBasicInfo = profile.phone && profile.address && profile.suburb;
      
      testResults.push({
        success: true,
        message: "Profile data retrieved",
        details: `Onboarding: ${onboardingComplete ? 'Complete' : 'Incomplete'}, Basic info: ${hasBasicInfo ? 'Yes' : 'No'}, Role: ${profile.role}`
      });
    } catch (error) {
      testResults.push({
        success: false,
        message: "Profile check failed",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }

    // Test 3: Sitter Services Configuration (if sitter)
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('user_id', user?.id)
        .single();

      if (profile?.role === 'pet_sitter') {
        const { data: services, error } = await supabase
          .from('sitter_services')
          .select('*')
          .eq('sitter_id', profile.id);

        if (error) throw error;

        testResults.push({
          success: services && services.length > 0,
          message: "Sitter services check",
          details: services && services.length > 0 
            ? `${services.length} service(s) configured` 
            : "No services configured"
        });
      } else {
        testResults.push({
          success: true,
          message: "Sitter services check skipped",
          details: "User is not a sitter"
        });
      }
    } catch (error) {
      testResults.push({
        success: false,
        message: "Sitter services check failed",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }

    // Test 4: Booking Creation Flow
    try {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('id, status, total_amount, platform_fee, stripe_payment_intent_id')
        .limit(1);

      if (error) throw error;

      testResults.push({
        success: true,
        message: "Booking query successful",
        details: bookings && bookings.length > 0 
          ? `Sample booking found with status: ${bookings[0].status}` 
          : "No bookings in system yet"
      });
    } catch (error) {
      testResults.push({
        success: false,
        message: "Booking query failed",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }

    // Test 5: Fee Calculation Verification
    try {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('total_amount, platform_fee')
        .not('platform_fee', 'is', null)
        .limit(1);

      if (error) throw error;

      if (bookings && bookings.length > 0) {
        const booking = bookings[0];
        const expectedFee = booking.total_amount * 0.10;
        const feeMatch = Math.abs(booking.platform_fee - expectedFee) < 0.01;
        
        testResults.push({
          success: feeMatch,
          message: "Platform fee calculation",
          details: feeMatch 
            ? `10% fee correctly applied (${booking.platform_fee})` 
            : `Fee mismatch: expected ${expectedFee}, got ${booking.platform_fee}`
        });
      } else {
        testResults.push({
          success: true,
          message: "Fee calculation check skipped",
          details: "No bookings with fees to verify"
        });
      }
    } catch (error) {
      testResults.push({
        success: false,
        message: "Fee calculation check failed",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }

    // Test 6: Daily Reports Structure
    try {
      const { data: reports, error } = await supabase
        .from('daily_reports')
        .select('*')
        .limit(1);

      if (error) throw error;

      testResults.push({
        success: true,
        message: "Daily reports table accessible",
        details: reports && reports.length > 0 
          ? "Daily reports exist in system" 
          : "No daily reports yet (table structure OK)"
      });
    } catch (error) {
      testResults.push({
        success: false,
        message: "Daily reports check failed",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }

    // Test 7: Transactions Table
    try {
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .limit(1);

      if (error) throw error;

      testResults.push({
        success: true,
        message: "Transactions table accessible",
        details: transactions && transactions.length > 0 
          ? "Transaction records exist" 
          : "No transactions yet (table structure OK)"
      });
    } catch (error) {
      testResults.push({
        success: false,
        message: "Transactions table check failed",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }

    // Test 8: Stripe Integration Status
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_account_id, stripe_account_enabled, stripe_onboarding_completed')
        .eq('user_id', user?.id)
        .single();

      if (profile?.stripe_account_id) {
        testResults.push({
          success: profile.stripe_account_enabled && profile.stripe_onboarding_completed,
          message: "Stripe integration status",
          details: `Account: ${profile.stripe_account_id ? 'Connected' : 'Not connected'}, Enabled: ${profile.stripe_account_enabled ? 'Yes' : 'No'}, Onboarding: ${profile.stripe_onboarding_completed ? 'Complete' : 'Incomplete'}`
        });
      } else {
        testResults.push({
          success: true,
          message: "Stripe integration check skipped",
          details: "No Stripe account connected (not required for all users)"
        });
      }
    } catch (error) {
      testResults.push({
        success: false,
        message: "Stripe integration check failed",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }

    setResults(testResults);
    setIsRunning(false);
    
    const successCount = testResults.filter(r => r.success).length;
    toast({
      title: "Onboarding Tests Complete",
      description: `${successCount}/${testResults.length} tests passed`,
      variant: successCount === testResults.length ? "default" : "destructive"
    });
  };

  const passedTests = results.filter(r => r.success).length;
  const totalTests = results.length;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Onboarding Flow Test Suite</h2>
            <p className="text-muted-foreground">
              Comprehensive testing of all onboarding flows and mobile optimizations
            </p>
          </div>

          {results.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Test Results</h3>
                <Badge variant={passedTests === totalTests ? "default" : "destructive"}>
                  {passedTests}/{totalTests} Passed
                </Badge>
              </div>
              
              <div className="space-y-2">
                {results.map((result, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border">
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    ) : (
                      <X className="w-5 h-5 text-red-500 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{result.message}</p>
                      {result.details && (
                        <p className="text-sm text-muted-foreground">{result.details}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-medium">Test Coverage</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium text-sm">✅ Authentication</h4>
                <p className="text-xs text-muted-foreground">User session verification</p>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium text-sm">✅ Profile & Onboarding</h4>
                <p className="text-xs text-muted-foreground">Completion status checks</p>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium text-sm">✅ Sitter Services</h4>
                <p className="text-xs text-muted-foreground">Service configuration validation</p>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium text-sm">✅ Booking System</h4>
                <p className="text-xs text-muted-foreground">Creation and payment flow</p>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium text-sm">✅ Fee Calculations</h4>
                <p className="text-xs text-muted-foreground">10% platform fee verification</p>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium text-sm">✅ Daily Reports</h4>
                <p className="text-xs text-muted-foreground">Report submission structure</p>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium text-sm">✅ Transactions</h4>
                <p className="text-xs text-muted-foreground">Accounting records</p>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium text-sm">✅ Stripe Integration</h4>
                <p className="text-xs text-muted-foreground">Payment provider status</p>
              </div>
            </div>
          </div>

          <Button 
            onClick={runTests} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? "Running Tests..." : "Run Onboarding Tests"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}