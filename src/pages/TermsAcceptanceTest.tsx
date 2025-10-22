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
          <li><strong>Terms popup should NOT appear again</strong> (this was the bug)</li>
          <li>If you manually go to /onboarding later, terms should still not appear</li>
        </ol>

        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>Fix Applied:</strong> Using sessionStorage flag to track terms acceptance during signup,
            plus 500ms delay before database update to ensure profile exists. This prevents the race condition
            that caused duplicate terms popups.
          </p>
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Technical Details:</strong> The issue was that Auth.tsx accepted terms and saved to DB,
            but Onboarding.tsx loaded before the DB update completed. Now sessionStorage immediately flags
            that terms were accepted, preventing the duplicate popup.
          </p>
        </div>
      </div>
    </div>
  );
}
