import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  details?: any;
}

export default function SitterServiceTests() {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [currentTest, setCurrentTest] = useState<string>('');

  const runTests = async () => {
    setRunning(true);
    setResults([]);
    const testResults: TestResult[] = [];

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to run tests');
        setRunning(false);
        return;
      }

      // Get profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        toast.error('Profile not found');
        setRunning(false);
        return;
      }

      // Test 1: Check for duplicate services
      setCurrentTest('Test 1: Checking for duplicate services...');
      const { data: allServices, error: servicesError } = await supabase
        .from('sitter_services')
        .select('id, service_type, hourly_rate, daily_rate, overnight_rate')
        .eq('sitter_id', profile.id);

      if (servicesError) {
        testResults.push({
          name: 'Duplicate Services Check',
          passed: false,
          message: 'Error fetching services',
          details: servicesError
        });
      } else {
        const serviceTypes = allServices?.map(s => s.service_type) || [];
        const uniqueTypes = new Set(serviceTypes);
        const hasDuplicates = serviceTypes.length !== uniqueTypes.size;

        testResults.push({
          name: 'Duplicate Services Check',
          passed: !hasDuplicates,
          message: hasDuplicates 
            ? `Found ${serviceTypes.length - uniqueTypes.size} duplicate service(s)` 
            : 'No duplicate services found',
          details: { total: serviceTypes.length, unique: uniqueTypes.size, services: allServices }
        });
      }

      // Test 2: Check if drop-in visits exists and has rates
      setCurrentTest('Test 2: Checking drop-in visits service...');
      const dropInService = allServices?.find(s => s.service_type === 'drop_in_visits');
      
      if (!dropInService) {
        testResults.push({
          name: 'Drop-in Visits Service',
          passed: false,
          message: 'Drop-in visits service not found',
          details: null
        });
      } else {
        const hasRate = dropInService.hourly_rate || dropInService.daily_rate || dropInService.overnight_rate;
        testResults.push({
          name: 'Drop-in Visits Service',
          passed: !!hasRate,
          message: hasRate 
            ? `Drop-in visits found with rates: ${JSON.stringify({ hourly: dropInService.hourly_rate, daily: dropInService.daily_rate, overnight: dropInService.overnight_rate })}`
            : 'Drop-in visits service exists but has NO RATES set',
          details: dropInService
        });
      }

      // Test 3: Try to create a new service with rates
      setCurrentTest('Test 3: Testing service save with rates...');
      const testServiceData = {
        sitter_id: profile.id,
        service_type: 'drop_in_visits' as const,
        hourly_rate: 25,
        daily_rate: null,
        overnight_rate: null,
        description: 'Test service - automated test',
        experience_years: 1,
        max_pets: 1,
        has_fenced_yard: false,
        accepted_pet_species: ['dog' as const],
        accepted_pet_sizes: ['small' as const],
        allows_senior_pets: true,
        allows_puppies: true,
        is_offered: true
      };

      const { data: savedService, error: saveError } = await supabase
        .from('sitter_services')
        .upsert([testServiceData], { onConflict: 'sitter_id,service_type' })
        .select()
        .single();

      if (saveError) {
        testResults.push({
          name: 'Service Save Test',
          passed: false,
          message: 'Failed to save test service',
          details: saveError
        });
      } else {
        testResults.push({
          name: 'Service Save Test',
          passed: savedService.hourly_rate === 25,
          message: savedService.hourly_rate === 25
            ? 'Service saved correctly with hourly_rate = 25'
            : `Service saved but hourly_rate is ${savedService.hourly_rate} instead of 25`,
          details: savedService
        });
      }

      // Test 4: Verify the service was actually saved
      setCurrentTest('Test 4: Verifying saved service...');
      const { data: verifyService } = await supabase
        .from('sitter_services')
        .select('*')
        .eq('sitter_id', profile.id)
        .eq('service_type', 'drop_in_visits')
        .single();

      testResults.push({
        name: 'Service Persistence Test',
        passed: verifyService?.hourly_rate === 25,
        message: verifyService?.hourly_rate === 25
          ? 'Service persisted correctly in database'
          : `Service not persisted correctly. Found hourly_rate: ${verifyService?.hourly_rate}`,
        details: verifyService
      });

      // Test 5: Test undefined vs null handling
      setCurrentTest('Test 5: Testing undefined/null rate handling...');
      const testUndefinedData = {
        sitter_id: profile.id,
        service_type: 'drop_in_visits' as const,
        hourly_rate: 30,
        daily_rate: undefined, // undefined should not override existing value
        overnight_rate: null,  // null should explicitly set to null
        description: 'Testing undefined vs null',
        experience_years: 1,
        max_pets: 1,
        has_fenced_yard: false,
        accepted_pet_species: ['dog' as const],
        accepted_pet_sizes: ['small' as const],
        allows_senior_pets: true,
        allows_puppies: true,
        is_offered: true
      };

      const { data: undefinedTest, error: undefinedError } = await supabase
        .from('sitter_services')
        .upsert([testUndefinedData], { onConflict: 'sitter_id,service_type' })
        .select()
        .single();

      testResults.push({
        name: 'Undefined/Null Handling',
        passed: !undefinedError && undefinedTest?.hourly_rate === 30,
        message: undefinedError 
          ? 'Error during undefined/null test'
          : `Hourly rate updated to 30: ${undefinedTest?.hourly_rate === 30}`,
        details: undefinedTest
      });

      // Test 6: Check unique constraint
      setCurrentTest('Test 6: Testing unique constraint...');
      const duplicateData = {
        sitter_id: profile.id,
        service_type: 'drop_in_visits' as const,
        hourly_rate: 35,
        description: 'Duplicate test',
        experience_years: 1,
        max_pets: 1,
        has_fenced_yard: false,
        accepted_pet_species: ['dog' as const],
        accepted_pet_sizes: ['small' as const],
        allows_senior_pets: true,
        allows_puppies: true,
        is_offered: true
      };

      // Try to insert (not upsert) - should fail due to unique constraint
      const { error: duplicateError } = await supabase
        .from('sitter_services')
        .insert([duplicateData]);

      testResults.push({
        name: 'Unique Constraint Test',
        passed: !!duplicateError && duplicateError.code === '23505',
        message: duplicateError 
          ? 'Unique constraint working - duplicate insert blocked'
          : 'WARNING: Unique constraint not working - duplicate was allowed',
        details: duplicateError
      });

    } catch (error) {
      console.error('Test error:', error);
      toast.error('Test suite failed');
    }

    setResults(testResults);
    setCurrentTest('');
    setRunning(false);
    
    const passed = testResults.filter(r => r.passed).length;
    const total = testResults.length;
    toast.success(`Tests completed: ${passed}/${total} passed`);
  };

  const getStatusIcon = (passed: boolean) => {
    return passed ? (
      <CheckCircle2 className="w-5 h-5 text-green-600" />
    ) : (
      <XCircle className="w-5 h-5 text-red-600" />
    );
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-4xl mx-auto space-y-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🧪 Sitter Service Rate Saving Tests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <h3 className="font-semibold">What This Tests:</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Checks for duplicate service entries (should be prevented by unique constraint)</li>
                <li>Verifies drop-in visits service exists and has rates saved</li>
                <li>Tests saving a new service with rates</li>
                <li>Verifies the service persists correctly in the database</li>
                <li>Tests undefined vs null value handling</li>
                <li>Confirms unique constraint is working</li>
              </ul>
            </div>

            <div className="p-3 bg-blue-100 rounded border border-blue-300 text-sm">
              <strong>Note:</strong> This will test your current profile's services and may modify your drop-in visits service during testing.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Test Controls</span>
              <Button onClick={runTests} disabled={running}>
                {running ? 'Running Tests...' : 'Run All Tests'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {running && currentTest && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4 animate-spin" />
                <span>{currentTest}</span>
              </div>
            )}

            {results.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>Test Results</span>
                  <span className="text-muted-foreground">
                    {results.filter(r => r.passed).length} / {results.length} passed
                  </span>
                </div>

                {results.map((result, index) => (
                  <Card key={index} className={result.passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {getStatusIcon(result.passed)}
                        <div className="flex-1 space-y-1">
                          <div className="font-medium">{result.name}</div>
                          <div className="text-sm text-muted-foreground">{result.message}</div>
                          {result.details && (
                            <details className="text-xs">
                              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                View Details
                              </summary>
                              <pre className="mt-2 p-2 bg-background rounded border overflow-x-auto">
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
      </div>
    </div>
  );
}
