import SEOHead from '@/components/seo/SEOHead';
import TermsAcceptanceTest from '@/components/testing/TermsAcceptanceTest';

export default function TermsAcceptanceTestPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <SEOHead
        title="Terms Acceptance Test | ZiggySitters"
        description="Test suite to verify terms of service acceptance flow"
        canonical="/test-terms-acceptance"
      />
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Terms Acceptance Test</h1>
        <p className="text-muted-foreground">
          This test verifies that the terms of service popup only appears once during signup
          and doesn't show again in the onboarding flow.
        </p>
      </div>

      <TermsAcceptanceTest />

      <div className="mt-8 p-6 bg-muted/50 rounded-lg max-w-3xl mx-auto">
        <h3 className="font-semibold mb-3">How to Test Manually:</h3>
        <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
          <li>Sign out if currently logged in</li>
          <li>Go to /auth and click "Sign Up" tab</li>
          <li>Enter email and password, click "Create Account"</li>
          <li>Terms popup should appear - accept it</li>
          <li>After signup completes, you'll be redirected to /welcome or /onboarding</li>
          <li>Terms popup should NOT appear again in onboarding</li>
          <li>If terms popup appears twice (in auth and onboarding), the bug exists</li>
        </ol>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Fix Applied:</strong> When user accepts terms during signup, the system now saves 
            terms_accepted=true to the database. This prevents the terms popup from appearing again 
            during onboarding.
          </p>
        </div>
      </div>
    </div>
  );
}
