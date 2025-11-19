import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, RefreshCw, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AffectedSitter {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  stripe_account_id: string;
  stripe_account_enabled: boolean;
  stripe_onboarding_completed: boolean;
  onboarding_completed: boolean;
}

const AdminStripeReset = () => {
  const [affectedSitters, setAffectedSitters] = useState<AffectedSitter[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState<string | null>(null);
  const [sendingEmails, setSendingEmails] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
    fetchAffectedSitters();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      toast({
        title: 'Access Denied',
        description: 'You must be an admin to access this page.',
        variant: 'destructive',
      });
      navigate('/');
    }
  };

  const fetchAffectedSitters = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, stripe_account_id, stripe_account_enabled, stripe_onboarding_completed, onboarding_completed')
        .eq('role', 'pet_sitter')
        .not('stripe_account_id', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAffectedSitters(data || []);
    } catch (error) {
      console.error('Error fetching affected sitters:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch affected sitters.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetSitterStripe = async (sitterId: string, sitterEmail: string) => {
    setResetting(sitterId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          stripe_account_id: null,
          stripe_account_enabled: false,
          stripe_onboarding_completed: false,
        })
        .eq('id', sitterId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Stripe account reset for ${sitterEmail}`,
      });

      fetchAffectedSitters();
    } catch (error) {
      console.error('Error resetting Stripe:', error);
      toast({
        title: 'Error',
        description: 'Failed to reset Stripe account.',
        variant: 'destructive',
      });
    } finally {
      setResetting(null);
    }
  };

  const sendNotificationEmails = async () => {
    setSendingEmails(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-stripe-reset-notification', {
        body: { sitters: affectedSitters }
      });

      if (error) throw error;

      toast({
        title: 'Emails Sent',
        description: `Notification emails sent to ${affectedSitters.length} sitters.`,
      });
    } catch (error) {
      console.error('Error sending emails:', error);
      toast({
        title: 'Error',
        description: 'Failed to send notification emails.',
        variant: 'destructive',
      });
    } finally {
      setSendingEmails(false);
    }
  };

  const resetAllSitters = async () => {
    if (!confirm(`Reset Stripe accounts for all ${affectedSitters.length} sitters? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      const sitterIds = affectedSitters.map(s => s.id);
      const { error } = await supabase
        .from('profiles')
        .update({
          stripe_account_id: null,
          stripe_account_enabled: false,
          stripe_onboarding_completed: false,
        })
        .in('id', sitterIds);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Stripe accounts reset for ${affectedSitters.length} sitters.`,
      });

      fetchAffectedSitters();
    } catch (error) {
      console.error('Error resetting all Stripe accounts:', error);
      toast({
        title: 'Error',
        description: 'Failed to reset Stripe accounts.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Stripe Account Migration Tool</CardTitle>
          <CardDescription>
            These sitters have Stripe accounts from the old platform that need to be reset.
            They will need to re-connect to the new Stripe platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="font-semibold text-lg">{affectedSitters.length} Affected Sitters</p>
              <p className="text-sm text-muted-foreground">
                With old Stripe account IDs that need migration
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={sendNotificationEmails}
                disabled={sendingEmails || affectedSitters.length === 0}
                variant="outline"
              >
                {sendingEmails ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Email to All
                  </>
                )}
              </Button>
              <Button
                onClick={resetAllSitters}
                disabled={affectedSitters.length === 0}
                variant="destructive"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset All
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {affectedSitters.map((sitter) => (
              <div
                key={sitter.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      {sitter.first_name} {sitter.last_name}
                    </p>
                    {sitter.onboarding_completed && (
                      <Badge variant="secondary">Onboarded</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{sitter.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Account ID: {sitter.stripe_account_id}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={sitter.stripe_account_enabled ? 'default' : 'secondary'}>
                    {sitter.stripe_account_enabled ? 'Enabled' : 'Not Enabled'}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => resetSitterStripe(sitter.id, sitter.email)}
                    disabled={resetting === sitter.id}
                  >
                    {resetting === sitter.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reset
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {affectedSitters.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No affected sitters found. All Stripe accounts are up to date!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStripeReset;
