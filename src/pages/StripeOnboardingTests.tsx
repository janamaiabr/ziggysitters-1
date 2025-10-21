import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import StripeOnboardingTestSuite from '@/components/testing/StripeOnboardingTestSuite';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function StripeOnboardingTests() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-4xl mx-auto space-y-6">
        <Card className="bg-amber-50 border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ⚠️ Stripe Connect Onboarding Diagnostic Tool
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <h3 className="font-semibold">Known Issues Being Tested:</h3>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li><strong>Loading Screen Stuck:</strong> Stripe Connect URL may not open or user closes tab</li>
                <li><strong>Re-Onboarding After Completion:</strong> onboarding_completed flag not being set properly</li>
                <li><strong>Stripe Setup Not Saved:</strong> Race condition between webhook and user return</li>
                <li><strong>"Complete Setup" Loop:</strong> Profile confirm doesn't trigger completion check</li>
                <li><strong>Terms Re-Prompt:</strong> Terms acceptance check causing redirect back to onboarding</li>
              </ol>
            </div>

            <div className="space-y-2 text-sm">
              <h3 className="font-semibold">What This Tool Does:</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Validates all profile data required for Stripe Connect</li>
                <li>Checks database vs. context state synchronization</li>
                <li>Verifies Stripe account status via API calls</li>
                <li>Tests onboarding completion logic</li>
                <li>Identifies redirect loop conditions</li>
                <li>Provides detailed diagnostics for each issue</li>
              </ul>
            </div>

            <div className="p-3 bg-amber-100 rounded border border-amber-300 text-sm">
              <strong>Access:</strong> Visit <code className="bg-white px-1 py-0.5 rounded">/stripe-onboarding-tests</code>
            </div>
          </CardContent>
        </Card>

        <StripeOnboardingTestSuite />
      </div>
    </div>
  );
}
