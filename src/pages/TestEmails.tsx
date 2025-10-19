import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function TestEmails() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleTestEmails = async () => {
    setLoading(true);
    setResults(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('test-all-emails');
      
      if (error) {
        console.error('Error testing emails:', error);
        toast.error('Failed to send test emails');
        return;
      }
      
      setResults(data);
      toast.success('Test emails sent! Check janamaia@gmail.com');
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Test All Email Templates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              This will send all email templates to janamaia@gmail.com for testing.
            </p>
            
            <Button 
              onClick={handleTestEmails}
              disabled={loading}
              className="w-full"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send All Test Emails
            </Button>

            {results && (
              <div className="mt-6">
                <h3 className="font-semibold mb-4">Results:</h3>
                <div className="space-y-2">
                  {results.results?.map((result: any, index: number) => (
                    <div 
                      key={index}
                      className={`p-3 rounded-lg ${
                        result.success 
                          ? 'bg-green-500/10 border border-green-500/20' 
                          : 'bg-red-500/10 border border-red-500/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{result.email}</span>
                        <span className={result.success ? 'text-green-500' : 'text-red-500'}>
                          {result.success ? '✓ PASS' : '✗ FAIL'}
                        </span>
                      </div>
                      {result.error && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {result.error.message || JSON.stringify(result.error)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="font-semibold">
                    Summary: {results.passed} passed, {results.failed} failed
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {results.message}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
