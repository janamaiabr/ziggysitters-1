import StripeOnboardingTestSuite from '@/components/testing/StripeOnboardingTestSuite';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function StripeOnboardingTests() {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-4xl mx-auto space-y-6">
        <Card className="bg-amber-50 border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ⚠️ Stripe Connect Onboarding Diagnostic Tool (20 Tests)
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
                <li><strong>Data Loss:</strong> User information not persisting between onboarding steps</li>
                <li><strong>State Sync Issues:</strong> Context and database getting out of sync</li>
              </ol>
            </div>

            <div className="space-y-2 text-sm">
              <h3 className="font-semibold">Test Coverage (20 Tests):</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li><strong>Tests 1-10:</strong> Profile integrity, Stripe status, completion flags, redirect logic</li>
                <li><strong>Tests 11-15:</strong> Data persistence at each onboarding step (profile, services, pets, documents, Stripe)</li>
                <li><strong>Tests 16-18:</strong> Loop prevention checks (onboarding flags, terms acceptance, completion requirements)</li>
                <li><strong>Tests 19-20:</strong> Race condition detection (context freshness, webhook sync)</li>
              </ul>
            </div>

            <div className="p-3 bg-amber-100 rounded border border-amber-300 text-sm">
              <strong>How to Use:</strong> Run all tests to get a complete diagnostic. Failed tests will show detailed error information to help identify the root cause of onboarding issues.
            </div>
          </CardContent>
        </Card>

        <StripeOnboardingTestSuite />
      </div>
    </div>
  );
}
