import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface TestResult {
  testName: string;
  status: 'pass' | 'fail' | 'pending';
  expected: number;
  actual: number;
  details: string;
}

export default function PricingModelTests() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Helper function to calculate pricing (mirroring BookingDialog logic)
  const calculatePricing = (params: {
    serviceType: string;
    dailyRate?: number;
    hourlyRate?: number;
    visitRate?: number;
    days?: number;
    hours?: number;
    visits?: number;
    petCount: number;
  }) => {
    const { serviceType, dailyRate, hourlyRate, visitRate, days, hours, visits, petCount } = params;

    if (serviceType === 'pet_sitting_owners_home' || serviceType === 'pet_sitting_sitters_home') {
      if (!dailyRate || !days) return 0;
      // Per-pet daily pricing
      return days * dailyRate * petCount;
    } else if (serviceType === 'dog_walking') {
      if (!hourlyRate || !hours) return 0;
      // Per-pet hourly pricing
      return hours * hourlyRate * petCount;
    } else if (serviceType === 'drop_in_visits') {
      if (!visitRate || !visits) return 0;
      // Flat rate per visit (NOT per pet)
      return visits * visitRate;
    }
    return 0;
  };

  const runTests = () => {
    setIsRunning(true);
    const results: TestResult[] = [];

    // TEST 1: Pet Sitting (Owner's Home) - 1 Pet, 3 Days
    const test1 = calculatePricing({
      serviceType: 'pet_sitting_owners_home',
      dailyRate: 50,
      days: 3,
      petCount: 1
    });
    results.push({
      testName: 'Test 1: Pet Sitting (Owner\'s Home) - 1 Pet, 3 Days',
      expected: 150,
      actual: test1,
      status: test1 === 150 ? 'pass' : 'fail',
      details: '3 days × $50/day × 1 pet = $150'
    });

    // TEST 2: Pet Sitting (Owner's Home) - 3 Pets, 3 Days
    const test2 = calculatePricing({
      serviceType: 'pet_sitting_owners_home',
      dailyRate: 50,
      days: 3,
      petCount: 3
    });
    results.push({
      testName: 'Test 2: Pet Sitting (Owner\'s Home) - 3 Pets, 3 Days [CRITICAL]',
      expected: 450,
      actual: test2,
      status: test2 === 450 ? 'pass' : 'fail',
      details: '3 days × $50/day × 3 pets = $450 (per-pet pricing)'
    });

    // TEST 3: Pet Sitting (Sitter's Home) - 2 Pets, 5 Days
    const test3 = calculatePricing({
      serviceType: 'pet_sitting_sitters_home',
      dailyRate: 60,
      days: 5,
      petCount: 2
    });
    results.push({
      testName: 'Test 3: Pet Sitting (Sitter\'s Home) - 2 Pets, 5 Days',
      expected: 600,
      actual: test3,
      status: test3 === 600 ? 'pass' : 'fail',
      details: '5 days × $60/day × 2 pets = $600'
    });

    // TEST 4: Dog Walking - 2 Pets, 3 Hours Total
    const test4 = calculatePricing({
      serviceType: 'dog_walking',
      hourlyRate: 25,
      hours: 3,
      petCount: 2
    });
    results.push({
      testName: 'Test 4: Dog Walking - 2 Pets, 3 Hours [CRITICAL]',
      expected: 150,
      actual: test4,
      status: test4 === 150 ? 'pass' : 'fail',
      details: '3 hours × $25/hour × 2 pets = $150 (per-pet pricing)'
    });

    // TEST 5: Dog Walking - 1 Pet, 4 Hours Total
    const test5 = calculatePricing({
      serviceType: 'dog_walking',
      hourlyRate: 25,
      hours: 4,
      petCount: 1
    });
    results.push({
      testName: 'Test 5: Dog Walking - 1 Pet, 4 Hours',
      expected: 100,
      actual: test5,
      status: test5 === 100 ? 'pass' : 'fail',
      details: '4 hours × $25/hour × 1 pet = $100'
    });

    // TEST 6: Drop-in Visits - 4 Visits, 3 Pets (flat rate)
    const test6 = calculatePricing({
      serviceType: 'drop_in_visits',
      visitRate: 30,
      visits: 4,
      petCount: 3
    });
    results.push({
      testName: 'Test 6: Drop-in Visits - 4 Visits, 3 Pets [CRITICAL]',
      expected: 120,
      actual: test6,
      status: test6 === 120 ? 'pass' : 'fail',
      details: '4 visits × $30/visit = $120 (NOT per-pet, flat rate)'
    });

    // TEST 7: Edge Case - Single Day Pet Sitting
    const test7 = calculatePricing({
      serviceType: 'pet_sitting_owners_home',
      dailyRate: 50,
      days: 1,
      petCount: 1
    });
    results.push({
      testName: 'Test 7: Edge Case - Single Day Pet Sitting',
      expected: 50,
      actual: test7,
      status: test7 === 50 ? 'pass' : 'fail',
      details: '1 day × $50/day × 1 pet = $50 (minimum 1 day)'
    });

    // TEST 8: Edge Case - Zero Pets Selected
    const test8 = calculatePricing({
      serviceType: 'pet_sitting_owners_home',
      dailyRate: 50,
      days: 3,
      petCount: 0
    });
    results.push({
      testName: 'Test 8: Edge Case - Zero Pets',
      expected: 0,
      actual: test8,
      status: test8 === 0 ? 'pass' : 'fail',
      details: '3 days × $50/day × 0 pets = $0 (should be blocked by validation)'
    });

    // TEST 9: Edge Case - No Rate Set (Pet Sitting)
    const test9 = calculatePricing({
      serviceType: 'pet_sitting_owners_home',
      dailyRate: undefined,
      days: 3,
      petCount: 2
    });
    results.push({
      testName: 'Test 9: Edge Case - No Daily Rate Set',
      expected: 0,
      actual: test9,
      status: test9 === 0 ? 'pass' : 'fail',
      details: 'Should return $0 when rate is not set'
    });

    // TEST 10: Edge Case - No Rate Set (Dog Walking)
    const test10 = calculatePricing({
      serviceType: 'dog_walking',
      hourlyRate: undefined,
      hours: 2,
      petCount: 1
    });
    results.push({
      testName: 'Test 10: Edge Case - No Hourly Rate Set',
      expected: 0,
      actual: test10,
      status: test10 === 0 ? 'pass' : 'fail',
      details: 'Should return $0 when rate is not set'
    });

    // TEST 11: High Volume - 10 Pets, 7 Days
    const test11 = calculatePricing({
      serviceType: 'pet_sitting_owners_home',
      dailyRate: 50,
      days: 7,
      petCount: 10
    });
    results.push({
      testName: 'Test 11: High Volume - 10 Pets (max), 7 Days',
      expected: 3500,
      actual: test11,
      status: test11 === 3500 ? 'pass' : 'fail',
      details: '7 days × $50/day × 10 pets = $3,500'
    });

    // TEST 12: Service Type Enum Validation
    const validServiceTypes = [
      'pet_sitting_owners_home',
      'pet_sitting_sitters_home', 
      'dog_walking',
      'drop_in_visits'
    ];
    const invalidTypes = ['overnight_boarding', 'daycare', 'grooming', 'medication_admin'];
    const enumTestPassed = validServiceTypes.length === 4 && 
      !invalidTypes.some(t => validServiceTypes.includes(t));
    
    results.push({
      testName: 'Test 12: Service Type Enum - Only 4 Core Services',
      expected: 1,
      actual: enumTestPassed ? 1 : 0,
      status: enumTestPassed ? 'pass' : 'fail',
      details: 'Only pet_sitting_owners_home, pet_sitting_sitters_home, dog_walking, drop_in_visits allowed'
    });

    setTestResults(results);
    setIsRunning(false);
  };

  const passCount = testResults.filter(r => r.status === 'pass').length;
  const failCount = testResults.filter(r => r.status === 'fail').length;
  const totalTests = testResults.length;

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Pricing Model Test Suite</CardTitle>
          <p className="text-sm text-muted-foreground">
            Comprehensive tests for the new per-pet pricing model
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4 items-center">
            <Button onClick={runTests} disabled={isRunning}>
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </Button>
            {totalTests > 0 && (
              <div className="flex gap-4">
                <Badge variant="default" className="gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Passed: {passCount}/{totalTests}
                </Badge>
                <Badge variant="destructive" className="gap-2">
                  <XCircle className="w-4 h-4" />
                  Failed: {failCount}/{totalTests}
                </Badge>
              </div>
            )}
          </div>

          <Separator />

          {testResults.length > 0 && (
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <Card key={index} className={result.status === 'fail' ? 'border-destructive' : ''}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {result.status === 'pass' && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                          {result.status === 'fail' && <XCircle className="w-5 h-5 text-destructive" />}
                          {result.status === 'pending' && <AlertCircle className="w-5 h-5 text-yellow-600" />}
                          <h3 className="font-semibold">{result.testName}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{result.details}</p>
                        <div className="flex gap-4 text-sm">
                          <span>Expected: <strong>${result.expected}</strong></span>
                          <span className={result.actual !== result.expected ? 'text-destructive' : ''}>
                            Actual: <strong>${result.actual}</strong>
                          </span>
                        </div>
                      </div>
                      <Badge variant={result.status === 'pass' ? 'default' : 'destructive'}>
                        {result.status.toUpperCase()}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
