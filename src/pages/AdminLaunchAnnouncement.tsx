import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/contexts/ProfileContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Rocket, ArrowLeft, Send, CheckCircle2, AlertCircle, Clock, Sparkles, Mail } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AdminNav } from '@/components/admin/AdminNav';

export default function AdminLaunchAnnouncement() {
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
    if (!confirm('Are you sure you want to send the launch announcement to ALL users? This cannot be undone.')) {
      return;
    }

    setSending(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke('send-launch-announcement', {
        body: {},
      });

      if (error) throw error;

      setResults(data);
      
      toast({
        title: "Launch Announcement Sent! 🚀",
        description: `Successfully sent ${data.emails_sent} launch emails`,
      });
    } catch (error: any) {
      console.error('Error sending launch announcement:', error);
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

          <Card className="border-primary/20">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-purple-500/10">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Rocket className="h-7 w-7 text-primary" />
                Send Launch Announcement
              </CardTitle>
              <CardDescription className="text-base">
                Send a beautiful launch announcement email to all registered users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 mt-6">
              <Alert className="border-primary/30 bg-primary/5">
                <Sparkles className="h-4 w-4 text-primary" />
                <AlertTitle>Platform Launch Email</AlertTitle>
                <AlertDescription>
                  This will send a professionally designed email to all users (excluding test accounts) 
                  announcing that ZiggySitters is officially live and ready for use. The email is customized 
                  based on user role (pet owner vs pet sitter).
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Email Highlights:
                </h3>
                <div className="grid gap-3">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">🎨 Beautiful Design</h4>
                    <p className="text-sm text-muted-foreground">
                      Gradient headers, professional layout, responsive design that looks great on all devices
                    </p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">🎯 Role-Specific Content</h4>
                    <p className="text-sm text-muted-foreground">
                      Personalized messaging for pet owners (find sitters) and pet sitters (accept bookings)
                    </p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">✨ Value Propositions</h4>
                    <p className="text-sm text-muted-foreground">
                      Highlights key features: verified sitters, secure payments, real-time updates, daily reports
                    </p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">🚀 Clear Call-to-Action</h4>
                    <p className="text-sm text-muted-foreground">
                      Direct buttons to dashboard (sitters) or find sitters page (owners) to drive engagement
                    </p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">💡 Quick Start Tips</h4>
                    <p className="text-sm text-muted-foreground">
                      Step-by-step guidance to help users get started immediately
                    </p>
                  </div>
                </div>
              </div>

              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  This email will be sent to ALL users in the system (excluding test accounts). 
                  Make sure you're ready to go live before sending. This action cannot be undone.
                </AlertDescription>
              </Alert>

              <Button 
                onClick={sendEmails}
                disabled={sending}
                size="lg"
                className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
              >
                {sending ? (
                  <>
                    <Clock className="h-5 w-5 mr-2 animate-spin" />
                    Sending Launch Emails...
                  </>
                ) : (
                  <>
                    <Rocket className="h-5 w-5 mr-2" />
                    Send Launch Announcement to All Users
                  </>
                )}
              </Button>

              {results && (
                <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle>🎉 Launch Announcement Sent Successfully!</AlertTitle>
                  <AlertDescription>
                    <div className="mt-2 space-y-2">
                      <p><strong>Total Users:</strong> {results.total_users}</p>
                      <p><strong>Emails Sent:</strong> {results.emails_sent}</p>
                      
                      {results.results && results.results.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-semibold mb-2">Detailed Results:</h4>
                          <div className="space-y-1 max-h-64 overflow-y-auto">
                            {results.results.map((result: any, index: number) => (
                              <div 
                                key={index}
                                className={`text-xs p-2 rounded ${
                                  result.status === 'sent' 
                                    ? 'bg-green-100 dark:bg-green-900/20' 
                                    : 'bg-red-100 dark:bg-red-900/20'
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
