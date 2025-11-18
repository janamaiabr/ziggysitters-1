import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/contexts/ProfileContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Send, Rocket, Mail, AlertTriangle, CheckCircle, Users, Shield, Star, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AdminNav } from '@/components/admin/AdminNav';
import { Badge } from '@/components/ui/badge';

interface Campaign {
  id: string;
  name: string;
  description: string;
  icon: any;
  edgeFunction: string;
  targetAudience: string;
  warningMessage?: string;
  color: string;
}

const campaigns: Campaign[] = [
  {
    id: 'launch_announcement',
    name: 'Platform Launch Announcement',
    description: 'Send official launch announcement to all users (customized for pet owners vs sitters)',
    icon: Rocket,
    edgeFunction: 'send-launch-announcement',
    targetAudience: 'All users (excluding test accounts)',
    warningMessage: 'This is a major announcement. Make sure the platform is ready!',
    color: 'from-purple-500/10 to-blue-500/10'
  },
  {
    id: 'go_live_notification',
    name: 'Go Live Profile Update Reminder',
    description: 'Remind sitters to complete their profiles before platform goes live',
    icon: AlertTriangle,
    edgeFunction: 'send-go-live-notification',
    targetAudience: 'All sitters (excluding test accounts)',
    color: 'from-orange-500/10 to-yellow-500/10'
  },
  {
    id: 'stripe_reonboarding',
    name: 'Stripe Re-onboarding',
    description: 'Send notification to sitters who need to update their Stripe accounts',
    icon: Shield,
    edgeFunction: 'send-stripe-reonboarding-notification',
    targetAudience: 'Sitters with incomplete Stripe setup',
    color: 'from-red-500/10 to-pink-500/10'
  },
  {
    id: 'golden_badge_invitation',
    name: 'Golden Badge Invitation',
    description: 'Invite eligible verified sitters to apply for the Golden Badge program',
    icon: Star,
    edgeFunction: 'send-golden-badge-invitation',
    targetAudience: 'Verified sitters without Golden Badge',
    color: 'from-yellow-500/10 to-amber-500/10'
  },
  {
    id: 'onboarding_reminder',
    name: 'Onboarding Reminder',
    description: 'Remind sitters who haven\'t completed their onboarding',
    icon: Clock,
    edgeFunction: 'send-onboarding-reminder',
    targetAudience: 'Sitters with incomplete onboarding',
    color: 'from-blue-500/10 to-cyan-500/10'
  },
  {
    id: 'id_submission_reminder',
    name: 'ID Verification Reminder',
    description: 'Remind sitters to upload their ID documents',
    icon: Users,
    edgeFunction: 'send-id-submission-reminder',
    targetAudience: 'Sitters without ID documents',
    color: 'from-green-500/10 to-emerald-500/10'
  },
  {
    id: 'police_vet_reminder',
    name: 'Police Vetting Reminder',
    description: 'Remind sitters to upload their police vetting documents',
    icon: Shield,
    edgeFunction: 'send-police-vet-reminder',
    targetAudience: 'Sitters without police vetting',
    color: 'from-indigo-500/10 to-purple-500/10'
  }
];

export default function AdminBulkEmails() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const [sendingCampaign, setSendingCampaign] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, any>>({});

  if (!user || profile?.role !== 'admin') {
    navigate('/');
    return null;
  }

  const handleSendCampaign = async (campaign: Campaign) => {
    const confirmMessage = campaign.warningMessage 
      ? `${campaign.warningMessage}\n\nAre you sure you want to send this email campaign?`
      : `Are you sure you want to send emails to: ${campaign.targetAudience}?\n\nThis action cannot be undone.`;

    if (!confirm(confirmMessage)) {
      return;
    }

    setSendingCampaign(campaign.id);

    try {
      const { data, error } = await supabase.functions.invoke(campaign.edgeFunction, {
        body: {},
      });

      if (error) throw error;

      setResults(prev => ({ ...prev, [campaign.id]: data }));
      
      toast({
        title: "Campaign Sent Successfully! 🎉",
        description: `Sent to ${data.emails_sent || data.total_sent || 'all'} recipients`,
      });
    } catch (error: any) {
      console.error(`Error sending ${campaign.name}:`, error);
      toast({
        title: "Error Sending Campaign",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSendingCampaign(null);
    }
  };

  return (
    <div>
      <AdminNav />
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Dashboard
          </Button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Mail className="h-8 w-8 text-primary" />
              Bulk Email Campaigns
            </h1>
            <p className="text-muted-foreground">
              Send mass email notifications to users. All campaigns are automatically personalized with recipient names.
            </p>
          </div>

          <Alert className="mb-6 border-orange-500/50 bg-orange-500/10">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              These are bulk email campaigns that will send to multiple users at once. 
              Make sure you understand the target audience before sending. All emails include unsubscribe headers for deliverability.
            </AlertDescription>
          </Alert>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((campaign) => {
              const Icon = campaign.icon;
              const result = results[campaign.id];
              const isSending = sendingCampaign === campaign.id;

              return (
                <Card key={campaign.id} className="hover:shadow-lg transition-all border-primary/20">
                  <CardHeader className={`bg-gradient-to-br ${campaign.color}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2 text-lg mb-2">
                          <Icon className="h-5 w-5 text-primary" />
                          {campaign.name}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {campaign.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Target:</span>
                        <Badge variant="secondary" className="text-xs">
                          {campaign.targetAudience}
                        </Badge>
                      </div>

                      {result && (
                        <Alert className="border-green-500/50 bg-green-500/10">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <AlertDescription className="text-sm">
                            Sent to {result.emails_sent || result.total_sent || result.count || 'all'} recipients
                            {result.timestamp && (
                              <span className="block text-xs text-muted-foreground mt-1">
                                {new Date(result.timestamp).toLocaleString()}
                              </span>
                            )}
                          </AlertDescription>
                        </Alert>
                      )}

                      <Button 
                        onClick={() => handleSendCampaign(campaign)}
                        disabled={isSending}
                        className="w-full"
                        size="lg"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {isSending ? 'Sending...' : 'Send Campaign'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
