import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Mail, CheckCircle2 } from 'lucide-react';

export default function SendTestEmail() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('test-7oq8f48y2@srv1.mail-tester.com');
  const [result, setResult] = useState<any>(null);

  const handleSendTestEmail = async () => {
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }

    setLoading(true);
    setResult(null);
    
    try {
      console.log('Sending test email to:', email);
      const { data, error } = await supabase.functions.invoke('send-test-email', {
        body: { to: email }
      });
      
      console.log('Function response:', { data, error });
      
      if (error) {
        console.error('Error sending test email:', error);
        toast.error(`Failed to send test email: ${error.message}`);
        setResult({ success: false, error: error.message });
        return;
      }
      
      setResult(data);
      toast.success(`Test email sent to ${email}!`);
    } catch (error: any) {
      console.error('Caught error:', error);
      toast.error(`Error: ${error.message || 'Unknown error'}`);
      setResult({ success: false, error: error.message || 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Deliverability Test
            </CardTitle>
            <CardDescription>
              Send a test email to check deliverability and spam scoring
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Test Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="test@mail-tester.com"
                disabled={loading}
              />
              <p className="text-sm text-muted-foreground">
                Use <a href="https://www.mail-tester.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">mail-tester.com</a> to get a unique test address and analyze deliverability
              </p>
            </div>
            
            <Button 
              onClick={handleSendTestEmail}
              disabled={loading}
              className="w-full"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Test Email
            </Button>

            {result && (
              <Card className={result.success ? 'border-green-500/20 bg-green-500/5' : 'border-destructive/20 bg-destructive/5'}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    {result.success ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-green-700 dark:text-green-400">Email Sent Successfully!</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Test email has been sent to {email}
                          </p>
                          {result.messageId && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Message ID: {result.messageId}
                            </p>
                          )}
                          <div className="mt-4 p-3 bg-background rounded border">
                            <p className="text-sm font-medium mb-2">Next Steps:</p>
                            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                              <li>Go to <a href="https://www.mail-tester.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">mail-tester.com</a></li>
                              <li>Click "Then check your score" button</li>
                              <li>Review your spam score and recommendations</li>
                            </ol>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div>
                        <h3 className="font-semibold text-destructive">Failed to Send</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {result.error || 'Unknown error occurred'}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  About Email Deliverability Testing
                </h3>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>
                    This tool sends a properly formatted email from ZiggySitters to help you diagnose deliverability issues.
                  </p>
                  <p className="font-medium text-foreground mt-3">Common Issues:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>SPF/DKIM/DMARC authentication not configured</li>
                    <li>Domain reputation issues</li>
                    <li>Missing reverse DNS (PTR) records</li>
                    <li>Content triggers spam filters</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
