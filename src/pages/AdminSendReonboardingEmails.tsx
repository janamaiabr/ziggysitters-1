import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/contexts/ProfileContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Mail, ArrowLeft, Send, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AdminNav } from '@/components/admin/AdminNav';

export default function AdminSendReonboardingEmails() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<any>(null);

  // Redirect non-admins
  if (profile?.role !== 'admin') {
    navigate('/');
    return null;
  }

  const sendEmails = async () => {
    setSending(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke('send-stripe-reonboarding-notification', {
        body: {},
      });

      if (error) throw error;

      setResults(data);
      
      toast({
        title: "Emails Sent Successfully",
        description: `Sent ${data.emails_sent} re-onboarding emails to verified sitters`,
      });
    } catch (error: any) {
      console.error('Error sending emails:', error);
      toast({
        title: "Error Sending Emails",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <AdminNav />
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Admin Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-6 w-6" />
              Send Stripe Re-onboarding Emails
            </CardTitle>
            <CardDescription>
              Send email notifications to all verified sitters who need to complete Stripe re-onboarding for live mode
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                This will send emails to all verified sitters who haven't completed their Stripe Connect onboarding 
                in LIVE mode. Make sure the system is in live mode before sending these emails.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <h3 className="font-semibold">Email Content Summary:</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Notifies sitters that Ziggy Sitters is now processing real payments</li>
                <li>Explains that Stripe re-onboarding is required to accept bookings</li>
                <li>Provides step-by-step instructions with direct link to payment setup</li>
                <li>Mentions 1-2 business day verification timeline</li>
                <li>Professional HTML email with clear action buttons</li>
              </ul>
            </div>

            <Button 
              onClick={sendEmails}
              disabled={sending}
              size="lg"
              className="w-full"
            >
              {sending ? (
                <>
                  <Clock className="h-5 w-5 mr-2 animate-spin" />
                  Sending Emails...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  Send Re-onboarding Emails
                </>
              )}
            </Button>

            {results && (
              <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle>Email Campaign Complete</AlertTitle>
                <AlertDescription>
                  <div className="mt-2 space-y-2">
                    <p><strong>Total Verified Sitters:</strong> {results.total_sitters}</p>
                    <p><strong>Emails Sent:</strong> {results.emails_sent}</p>
                    
                    {results.results && results.results.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-semibold mb-2">Results:</h4>
                        <div className="space-y-1 max-h-64 overflow-y-auto">
                          {results.results.map((result: any, index: number) => (
                            <div 
                              key={index}
                              className={`text-xs p-2 rounded ${
                                result.status === 'sent' 
                                  ? 'bg-green-100 dark:bg-green-900/20' 
                                  : result.status === 'failed'
                                  ? 'bg-red-100 dark:bg-red-900/20'
                                  : 'bg-gray-100 dark:bg-gray-800'
                              }`}
                            >
                              <strong>{result.name}</strong> ({result.email}) - {result.status}
                              {result.error && <span className="text-red-600"> - {result.error}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}
