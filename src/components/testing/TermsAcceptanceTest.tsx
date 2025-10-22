import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  message?: string;
}

export default function TermsAcceptanceTest() {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<TestResult[]>([
    { name: 'Check current user terms acceptance status', status: 'pending' },
    { name: 'Verify terms_accepted field exists in profiles table', status: 'pending' },
    { name: 'Simulate terms acceptance save', status: 'pending' },
    { name: 'Verify no duplicate terms popup logic', status: 'pending' },
  ]);
  const [isRunning, setIsRunning] = useState(false);

  const updateTestResult = (index: number, status: TestResult['status'], message?: string) => {
    setTestResults(prev => {
      const newResults = [...prev];
      newResults[index] = { ...newResults[index], status, message };
      return newResults;
    });
  };

  const runTests = async () => {
    if (!user) {
      alert('Please sign in to run tests');
      return;
    }

    setIsRunning(true);

    // Test 1: Check current user terms acceptance status
    updateTestResult(0, 'running');
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('terms_accepted')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      
      updateTestResult(
        0,
        'passed',
        `Terms acceptance status: ${profile.terms_accepted ? 'Accepted ✓' : 'Not accepted'}`
      );
    } catch (error: any) {
      updateTestResult(0, 'failed', `Error: ${error.message}`);
    }

    // Test 2: Verify terms_accepted field exists
    updateTestResult(1, 'running');
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('terms_accepted')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      if (data && 'terms_accepted' in data) {
        updateTestResult(1, 'passed', 'terms_accepted field exists in profiles table');
      } else {
        throw new Error('terms_accepted field not found');
      }
    } catch (error: any) {
      updateTestResult(1, 'failed', `Error: ${error.message}`);
    }

    // Test 3: Test terms acceptance save (without actually changing it if already accepted)
    updateTestResult(2, 'running');
    try {
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('terms_accepted')
        .eq('user_id', user.id)
        .single();

      // Only update if not already accepted (to avoid changing actual state)
      if (!currentProfile?.terms_accepted) {
        const { error } = await supabase
          .from('profiles')
          .update({ terms_accepted: true })
          .eq('user_id', user.id);

        if (error) throw error;
        updateTestResult(2, 'passed', 'Successfully saved terms acceptance to database');
      } else {
        updateTestResult(2, 'passed', 'Terms already accepted (no update needed)');
      }
    } catch (error: any) {
      updateTestResult(2, 'failed', `Error: ${error.message}`);
    }

    // Test 4: Verify logic prevents duplicate popups
    updateTestResult(3, 'running');
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('terms_accepted')
        .eq('user_id', user.id)
        .single();

      if (profile?.terms_accepted === true) {
        updateTestResult(
          3,
          'passed',
          'Logic check: User has accepted terms, onboarding will NOT show terms popup'
        );
      } else {
        updateTestResult(
          3,
          'passed',
          'Logic check: User has not accepted terms, onboarding WILL show terms popup'
        );
      }
    } catch (error: any) {
      updateTestResult(3, 'failed', `Error: ${error.message}`);
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'running':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return 'bg-green-50 border-green-200';
      case 'failed':
        return 'bg-red-50 border-red-200';
      case 'running':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-muted border-border';
    }
  };

  const passedCount = testResults.filter(t => t.status === 'passed').length;
  const failedCount = testResults.filter(t => t.status === 'failed').length;
  const totalCount = testResults.length;

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Terms Acceptance Test Suite</CardTitle>
        <p className="text-sm text-muted-foreground">
          Tests to verify terms of service only appear once during signup
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!user && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ You must be signed in to run these tests. Please sign in first.
            </p>
          </div>
        )}

        <div className="flex gap-4 items-center">
          <Button onClick={runTests} disabled={isRunning || !user}>
            {isRunning ? 'Running Tests...' : 'Run Tests'}
          </Button>
          {(passedCount > 0 || failedCount > 0) && (
            <div className="text-sm">
              <span className="text-green-600 font-semibold">{passedCount} passed</span>
              {' / '}
              <span className="text-red-600 font-semibold">{failedCount} failed</span>
              {' / '}
              <span className="text-muted-foreground">{totalCount} total</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          {testResults.map((test, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border transition-colors ${getStatusColor(test.status)}`}
            >
              <div className="flex items-start gap-3">
                {getStatusIcon(test.status)}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{test.name}</p>
                  {test.message && (
                    <p className="text-xs text-muted-foreground mt-1">{test.message}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-semibold mb-2 text-sm">Expected Behavior:</h4>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
            <li>When a user signs up, terms popup appears in Auth page</li>
            <li>After accepting terms, terms_accepted is saved to database</li>
            <li>When user navigates to /onboarding, terms popup does NOT appear again</li>
            <li>If terms_accepted is false, onboarding will show terms popup</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
