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
  email_sent_at?: string;
  completed_at?: string;
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
      // Fetch sitters with Stripe accounts that are not fully enabled
      const { data: sittersData, error: sittersError } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, stripe_account_id, stripe_account_enabled, stripe_onboarding_completed, onboarding_completed')
        .eq('role', 'pet_sitter')
        .not('stripe_account_id', 'is', null)
        .eq('stripe_account_enabled', false)
        .order('created_at', { ascending: false });

      if (sittersError) throw sittersError;

      // Fetch tracking data
      const { data: trackingData, error: trackingError } = await supabase
        .from('stripe_migration_tracking')
        .select('sitter_id, email_sent_at, completed_at');

      if (trackingError) throw trackingError;

      // Merge tracking data with sitter data
      const trackingMap = new Map(trackingData?.map(t => [t.sitter_id, t]) || []);
      const mergedData = sittersData?.map(sitter => ({
        ...sitter,
        email_sent_at: trackingMap.get(sitter.id)?.email_sent_at,
        completed_at: trackingMap.get(sitter.id)?.completed_at,
      })) || [];

      // Filter out completed sitters
      const needsAction = mergedData.filter(s => !s.completed_at);

      setAffectedSitters(needsAction);
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

      // Track email sends
      const now = new Date().toISOString();
      for (const sitter of affectedSitters) {
        await supabase
          .from('stripe_migration_tracking')
          .upsert({
            sitter_id: sitter.id,
            email_sent_at: now,
            old_stripe_account_id: sitter.stripe_account_id,
          });
      }

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
      fetchAffectedSitters();
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
                  {sitter.email_sent_at && (
                    <Badge variant="outline">
                      <Mail className="mr-1 h-3 w-3" />
                      Emailed {new Date(sitter.email_sent_at).toLocaleDateString()}
                    </Badge>
                  )}
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
              <p className="font-semibold">✅ Migration Complete!</p>
              <p className="text-sm mt-2">All sitters have either completed re-onboarding or don't require migration.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStripeReset;
