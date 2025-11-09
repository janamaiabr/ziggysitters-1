import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Rocket, Mail, CreditCard, Calendar, Users, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { AdminNav } from '@/components/admin/AdminNav';

export default function AdminGoLive() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  
  const [checklist, setChecklist] = useState({
    stripeTestMode: false,
    stripeLiveKeys: false,
    stripeWebhooks: false,
    emailSent: false,
    sittersNotified: false,
    servicesVerified: false,
    calendarsChecked: false,
    paymentsConfigured: false,
  });

  const handleCheckboxChange = (key: keyof typeof checklist) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const sendSitterNotificationEmail = async () => {
    setEmailSending(true);
    try {
      // Get all sitters
      const { data: sitters, error } = await supabase
        .from('profiles')
        .select('email, first_name, last_name')
        .eq('role', 'pet_sitter');

      if (error) throw error;

      if (!sitters || sitters.length === 0) {
        toast({
          title: "No Sitters Found",
          description: "There are no pet sitters to notify.",
          variant: "destructive",
        });
        return;
      }

      // Send email to each sitter
      const emailPromises = sitters.map(sitter =>
        supabase.functions.invoke('send-go-live-notification', {
          body: {
            email: sitter.email,
            firstName: sitter.first_name,
            lastName: sitter.last_name,
          }
        })
      );

      await Promise.all(emailPromises);

      toast({
        title: "Emails Sent!",
        description: `Successfully sent go-live notifications to ${sitters.length} sitters.`,
      });

      setChecklist(prev => ({ ...prev, emailSent: true, sittersNotified: true }));
    } catch (error: any) {
      console.error('Error sending emails:', error);
      toast({
        title: "Email Error",
        description: error.message || "Failed to send notification emails.",
        variant: "destructive",
      });
    } finally {
      setEmailSending(false);
    }
  };

  const allTasksComplete = Object.values(checklist).every(v => v === true);

  return (
    <div>
      <AdminNav />
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Rocket className="w-8 h-8 text-primary" />
                Go-Live Checklist
              </h1>
              <p className="text-muted-foreground mt-2">
                Complete all tasks before launching to production
              </p>
            </div>
          </div>

        {/* Progress Alert */}
        {allTasksComplete ? (
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              All tasks complete! Your platform is ready to go live.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {Object.values(checklist).filter(v => v).length} of {Object.values(checklist).length} tasks completed
            </AlertDescription>
          </Alert>
        )}

        {/* Stripe Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Stripe Configuration
            </CardTitle>
            <CardDescription>
              Switch from test mode to live mode and configure webhooks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="stripeTestMode"
                checked={checklist.stripeTestMode}
                onCheckedChange={() => handleCheckboxChange('stripeTestMode')}
              />
              <div className="space-y-1">
                <label htmlFor="stripeTestMode" className="text-sm font-medium cursor-pointer">
                  Verify Stripe is currently in test mode
                </label>
                <p className="text-sm text-muted-foreground">
                  Check Stripe dashboard to confirm test mode is active
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="stripeLiveKeys"
                checked={checklist.stripeLiveKeys}
                onCheckedChange={() => handleCheckboxChange('stripeLiveKeys')}
              />
              <div className="space-y-1">
                <label htmlFor="stripeLiveKeys" className="text-sm font-medium cursor-pointer">
                  Update Stripe secret keys to live mode
                </label>
                <p className="text-sm text-muted-foreground">
                  Replace test keys with live keys in Supabase Edge Functions secrets
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://dashboard.stripe.com/apikeys', '_blank')}
                  className="mt-2"
                >
                  Open Stripe API Keys
                </Button>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="stripeWebhooks"
                checked={checklist.stripeWebhooks}
                onCheckedChange={() => handleCheckboxChange('stripeWebhooks')}
              />
              <div className="space-y-1">
                <label htmlFor="stripeWebhooks" className="text-sm font-medium cursor-pointer">
                  Configure Stripe webhooks for production
                </label>
                <p className="text-sm text-muted-foreground">
                  Set up webhook endpoints pointing to your production URL
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://dashboard.stripe.com/webhooks', '_blank')}
                  className="mt-2"
                >
                  Configure Webhooks
                </Button>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="paymentsConfigured"
                checked={checklist.paymentsConfigured}
                onCheckedChange={() => handleCheckboxChange('paymentsConfigured')}
              />
              <div className="space-y-1">
                <label htmlFor="paymentsConfigured" className="text-sm font-medium cursor-pointer">
                  Test live payment flow
                </label>
                <p className="text-sm text-muted-foreground">
                  Make a test booking with live Stripe keys to verify everything works
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sitter Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Notify Sitters
            </CardTitle>
            <CardDescription>
              Send emails to all sitters to update their profiles before launch
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="emailSent"
                checked={checklist.emailSent}
                onCheckedChange={() => handleCheckboxChange('emailSent')}
              />
              <div className="space-y-1 flex-1">
                <label htmlFor="emailSent" className="text-sm font-medium cursor-pointer">
                  Send go-live notification to all sitters
                </label>
                <p className="text-sm text-muted-foreground">
                  Email all sitters asking them to:
                  • Complete their profile
                  • Configure their services and rates
                  • Update their availability calendar
                  • Upload verification documents
                </p>
                <Button
                  onClick={sendSitterNotificationEmail}
                  disabled={emailSending || checklist.emailSent}
                  className="mt-2"
                >
                  {emailSending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Emails to All Sitters
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="sittersNotified"
                checked={checklist.sittersNotified}
                onCheckedChange={() => handleCheckboxChange('sittersNotified')}
              />
              <div className="space-y-1">
                <label htmlFor="sittersNotified" className="text-sm font-medium cursor-pointer">
                  Confirm all sitters have been notified
                </label>
                <p className="text-sm text-muted-foreground">
                  Wait for email delivery confirmations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Final Verification
            </CardTitle>
            <CardDescription>
              Verify all sitters have updated their profiles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="servicesVerified"
                checked={checklist.servicesVerified}
                onCheckedChange={() => handleCheckboxChange('servicesVerified')}
              />
              <div className="space-y-1">
                <label htmlFor="servicesVerified" className="text-sm font-medium cursor-pointer">
                  All sitters have configured their services
                </label>
                <p className="text-sm text-muted-foreground">
                  Check that each sitter has set up their rates and services
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/admin')}
                  className="mt-2"
                >
                  Review Sitters
                </Button>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="calendarsChecked"
                checked={checklist.calendarsChecked}
                onCheckedChange={() => handleCheckboxChange('calendarsChecked')}
              />
              <div className="space-y-1">
                <label htmlFor="calendarsChecked" className="text-sm font-medium cursor-pointer">
                  Sitter calendars are up to date
                </label>
                <p className="text-sm text-muted-foreground">
                  Verify sitters have marked their availability
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Launch Button */}
        {allTasksComplete && (
          <Card className="border-green-500">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto" />
                <h3 className="text-2xl font-bold">Ready to Launch!</h3>
                <p className="text-muted-foreground">
                  All pre-launch tasks are complete. Your platform is ready to go live.
                </p>
                <Button size="lg" className="mt-4">
                  <Rocket className="w-5 h-5 mr-2" />
                  Deploy to Production
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      </div>
    </div>
  );
}
