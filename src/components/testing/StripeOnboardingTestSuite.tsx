import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/contexts/ProfileContext';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  details?: any;
}

interface TestCase {
  id: number;
  name: string;
  description: string;
  test: () => Promise<TestResult>;
}

export default function StripeOnboardingTestSuite() {
  const { user } = useAuth();
  const { profile, refetch } = useProfile();
  const { toast } = useToast();
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [currentTest, setCurrentTest] = useState<string>('');

  const testCases: TestCase[] = [
    {
      id: 1,
      name: "Profile Data Integrity",
      description: "Verify profile has all required fields for Stripe Connect",
      test: async () => {
        const hasBasicInfo = profile?.first_name && profile?.last_name && profile?.phone && profile?.address && profile?.suburb;
        const hasDocuments = profile?.id_document_url && profile?.blue_card_document_url;
        
        return {
          name: "Profile Data Integrity",
          passed: !!hasBasicInfo,
          message: hasBasicInfo ? "Profile has all basic info" : "Missing basic profile information",
          details: {
            first_name: !!profile?.first_name,
            last_name: !!profile?.last_name,
            phone: !!profile?.phone,
            address: !!profile?.address,
            suburb: !!profile?.suburb,
            id_document: !!profile?.id_document_url,
            police_vet: !!profile?.blue_card_document_url,
            hasDocuments
          }
        };
      }
    },
    {
      id: 2,
      name: "Sitter Services Configuration",
      description: "Check if sitter has configured at least one service",
      test: async () => {
        if (profile?.role !== 'pet_sitter') {
          return {
            name: "Sitter Services Configuration",
            passed: true,
            message: "Not a sitter - test skipped"
          };
        }

        const { data: services, error } = await supabase
          .from('sitter_services')
          .select('id, service_type, is_offered')
          .eq('sitter_id', profile.id);

        const hasServices = services && services.length > 0;
        
        return {
          name: "Sitter Services Configuration",
          passed: hasServices,
          message: hasServices ? `${services.length} service(s) configured` : "No services configured",
          details: { services: services || [] }
        };
      }
    },
    {
      id: 3,
      name: "Stripe Account Status",
      description: "Verify Stripe account exists and is properly configured",
      test: async () => {
        const hasStripeAccount = !!profile?.stripe_account_id;
        
        return {
          name: "Stripe Account Status",
          passed: hasStripeAccount,
          message: hasStripeAccount ? `Stripe account: ${profile.stripe_account_id}` : "No Stripe account connected",
          details: {
            stripe_account_id: profile?.stripe_account_id || null,
            stripe_account_enabled: profile?.stripe_account_enabled,
            stripe_onboarding_completed: profile?.stripe_onboarding_completed
          }
        };
      }
    },
    {
      id: 4,
      name: "Stripe Account Status via API",
      description: "Call stripe-connect-account-status function to get real-time status",
      test: async () => {
        if (!profile?.stripe_account_id) {
          return {
            name: "Stripe Account Status via API",
            passed: false,
            message: "No Stripe account to check"
          };
        }

        const { data, error } = await supabase.functions.invoke('stripe-connect-account-status');
        
        if (error) {
          return {
            name: "Stripe Account Status via API",
            passed: false,
            message: `API error: ${error.message}`,
            details: { error }
          };
        }

        return {
          name: "Stripe Account Status via API",
          passed: !!data,
          message: data ? `Connected: ${data.connected}, Enabled: ${data.enabled}, Onboarding: ${data.onboarding_completed}` : "No data returned",
          details: data
        };
      }
    },
    {
      id: 5,
      name: "Onboarding Completion Flag",
      description: "Check if onboarding_completed flag is set correctly in database",
      test: async () => {
        const { data: dbProfile, error } = await supabase
          .from('profiles')
          .select('onboarding_completed, role')
          .eq('user_id', user?.id)
          .maybeSingle();

        if (error) {
          return {
            name: "Onboarding Completion Flag",
            passed: false,
            message: `Database error: ${error.message}`,
            details: { error }
          };
        }

        const contextMatches = profile?.onboarding_completed === dbProfile?.onboarding_completed;

        return {
          name: "Onboarding Completion Flag",
          passed: contextMatches,
          message: contextMatches 
            ? `Onboarding completed: ${dbProfile?.onboarding_completed}` 
            : "Context and DB mismatch!",
          details: {
            database: dbProfile?.onboarding_completed,
            context: profile?.onboarding_completed,
            matches: contextMatches
          }
        };
      }
    },
    {
      id: 6,
      name: "Complete Onboarding Requirements",
      description: "Verify all requirements for onboarding completion are met",
      test: async () => {
        if (profile?.role !== 'pet_sitter') {
          // Pet owner requirements
          const hasBasicInfo = profile?.first_name && profile?.last_name && profile?.phone && profile?.address && profile?.suburb;
          return {
            name: "Complete Onboarding Requirements",
            passed: !!hasBasicInfo,
            message: hasBasicInfo ? "Pet owner requirements met" : "Missing basic info",
            details: { userType: 'pet_owner', hasBasicInfo }
          };
        }

        // Sitter requirements
        const hasBasicInfo = profile?.first_name && profile?.last_name && profile?.phone && profile?.address && profile?.suburb;
        const hasDocuments = profile?.id_document_url && profile?.blue_card_document_url;
        
        const { data: services } = await supabase
          .from('sitter_services')
          .select('id')
          .eq('sitter_id', profile.id)
          .limit(1);
        
        const hasServices = services && services.length > 0;
        const hasStripe = profile?.stripe_account_id && profile?.stripe_onboarding_completed;
        
        const allRequirementsMet = hasBasicInfo && hasDocuments && hasServices && hasStripe;

        return {
          name: "Complete Onboarding Requirements",
          passed: allRequirementsMet,
          message: allRequirementsMet ? "All requirements met!" : "Missing requirements",
          details: {
            hasBasicInfo,
            hasDocuments,
            hasServices,
            hasStripe,
            allRequirementsMet
          }
        };
      }
    },
    {
      id: 7,
      name: "Terms Acceptance",
      description: "Verify user has accepted terms of service",
      test: async () => {
        const { data: dbProfile, error } = await supabase
          .from('profiles')
          .select('terms_accepted')
          .eq('user_id', user?.id)
          .maybeSingle();

        return {
          name: "Terms Acceptance",
          passed: !!dbProfile?.terms_accepted,
          message: dbProfile?.terms_accepted ? "Terms accepted" : "Terms not accepted",
          details: { terms_accepted: dbProfile?.terms_accepted }
        };
      }
    },
    {
      id: 8,
      name: "Onboarding Redirect Logic",
      description: "Check if OnboardingCheck would redirect user",
      test: async () => {
        const hasBasicInfo = profile?.first_name && profile?.last_name && profile?.phone && profile?.address;
        const needsOnboarding = !profile?.onboarding_completed;
        const wouldRedirect = needsOnboarding && !hasBasicInfo;

        return {
          name: "Onboarding Redirect Logic",
          passed: !wouldRedirect,
          message: wouldRedirect ? "Would redirect to onboarding!" : "No redirect needed",
          details: {
            needsOnboarding,
            hasBasicInfo,
            wouldRedirect,
            onboarding_completed: profile?.onboarding_completed
          }
        };
      }
    },
    {
      id: 9,
      name: "Profile Context State",
      description: "Verify ProfileContext state is correct",
      test: async () => {
        const { data: dbProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user?.id)
          .maybeSingle();

        const contextUpToDate = profile?.updated_at === dbProfile?.updated_at;

        return {
          name: "Profile Context State",
          passed: contextUpToDate,
          message: contextUpToDate ? "Context is up to date" : "Context may be stale",
          details: {
            context_updated_at: profile?.updated_at,
            db_updated_at: dbProfile?.updated_at,
            contextUpToDate
          }
        };
      }
    },
    {
      id: 10,
      name: "Stripe Return URL Handling",
      description: "Check URL params for Stripe return states",
      test: async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const stripeSuccess = urlParams.get('stripe_success');
        const stripeRefresh = urlParams.get('stripe_refresh');
        
        const hasStripeParams = stripeSuccess || stripeRefresh;

        return {
          name: "Stripe Return URL Handling",
          passed: !hasStripeParams || stripeSuccess === 'true',
          message: hasStripeParams 
            ? `Stripe return detected: ${stripeSuccess ? 'success' : 'refresh'}`
            : "No Stripe return params",
          details: {
            stripe_success: stripeSuccess,
            stripe_refresh: stripeRefresh,
            current_url: window.location.href
          }
        };
      }
    }
  ];

  const runAllTests = async () => {
    setRunning(true);
    setResults([]);
    
    for (const testCase of testCases) {
      setCurrentTest(testCase.name);
      try {
        const result = await testCase.test();
        setResults(prev => [...prev, result]);
      } catch (error: any) {
        setResults(prev => [...prev, {
          name: testCase.name,
          passed: false,
          message: `Test failed: ${error.message}`,
          details: { error: error.message }
        }]);
      }
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setCurrentTest('');
    setRunning(false);

    const passedCount = results.filter(r => r.passed).length;
    toast({
      title: "Test Suite Complete",
      description: `${passedCount}/${testCases.length} tests passed`,
    });
  };

  const forceCompleteOnboarding = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      await refetch();
      toast({
        title: "Success",
        description: "Onboarding marked as complete"
      });
    }
  };

  const resetOnboarding = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ onboarding_completed: false })
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      await refetch();
      toast({
        title: "Success",
        description: "Onboarding reset"
      });
    }
  };

  const passedTests = results.filter(r => r.passed).length;
  const failedTests = results.filter(r => !r.passed).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Stripe Connect Onboarding Test Suite</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={runAllTests} 
              disabled={running}
            >
              {running ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                'Run All Tests'
              )}
            </Button>
            
            <Button variant="outline" onClick={forceCompleteOnboarding}>
              Force Complete Onboarding
            </Button>
            
            <Button variant="outline" onClick={resetOnboarding}>
              Reset Onboarding
            </Button>
          </div>

          {running && currentTest && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">Running: {currentTest}</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <Badge variant="outline" className="gap-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Passed: {passedTests}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <XCircle className="w-4 h-4 text-red-600" />
                  Failed: {failedTests}
                </Badge>
              </div>

              <div className="space-y-2">
                {results.map((result, index) => (
                  <Card key={index} className={result.passed ? 'border-green-200' : 'border-red-200'}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {result.passed ? (
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium">{result.name}</h4>
                          <p className="text-sm text-muted-foreground">{result.message}</p>
                          {result.details && (
                            <details className="mt-2">
                              <summary className="text-xs cursor-pointer text-muted-foreground hover:text-foreground">
                                Show details
                              </summary>
                              <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
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
            </div>
          )}

          {results.length === 0 && !running && (
            <div className="text-center p-8 text-muted-foreground">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Click "Run All Tests" to start diagnostic tests</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Case Documentation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {testCases.map(tc => (
              <div key={tc.id} className="border-l-2 border-primary pl-3">
                <h4 className="font-medium">Test {tc.id}: {tc.name}</h4>
                <p className="text-sm text-muted-foreground">{tc.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
