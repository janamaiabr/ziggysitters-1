import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/contexts/ProfileContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Send, Users, CheckCircle, XCircle, Download, Eye, Mail, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Campaign {
  id: string;
  name: string;
  description: string;
  edgeFunction: string;
  targetAudience: string;
  hasPreview?: boolean;
  userTypes?: string[];
}

interface Subscription {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  marketing_emails: boolean;
  booking_notifications: boolean;
  daily_report_notifications: boolean;
  payment_notifications: boolean;
  created_at: string;
}

interface EmailTemplate {
  template_key: string;
  template_name: string;
  subject: string;
  description: string;
  html_content: string;
}

const campaigns: Campaign[] = [
  {
    id: 'black_friday_promo',
    name: 'Black Friday Promo Campaign',
    description: 'Send Black Friday 50% off promo to all subscribed users (BLACKFRIDAY50)',
    edgeFunction: 'send-black-friday-promo',
    targetAudience: 'All users subscribed to marketing emails',
    hasPreview: true,
    userTypes: ['pet_owner', 'pet_sitter'],
  },
  {
    id: 'launch_announcement',
    name: 'Platform Launch Announcement',
    description: 'Send official launch announcement to all users',
    edgeFunction: 'send-launch-announcement',
    targetAudience: 'All users (excluding test accounts)',
  },
  {
    id: 'onboarding_reminder',
    name: 'Onboarding Reminder',
    description: 'Remind sitters who haven\'t completed onboarding',
    edgeFunction: 'send-onboarding-reminder',
    targetAudience: 'Sitters with incomplete onboarding',
  },
  {
    id: 'id_submission_reminder',
    name: 'ID Verification Reminder',
    description: 'Remind sitters to upload their ID documents',
    edgeFunction: 'send-id-submission-reminder',
    targetAudience: 'Sitters without ID documents',
  },
  {
    id: 'police_vet_reminder',
    name: 'Police Vetting Reminder',
    description: 'Remind sitters to upload police vetting documents',
    edgeFunction: 'send-police-vet-reminder',
    targetAudience: 'Sitters without police vetting',
  }
];

const emailTemplates: EmailTemplate[] = [
  {
    template_key: 'launch_announcement',
    template_name: 'Launch Announcement',
    subject: '🎉 ZiggySitters is Officially LIVE!',
    description: 'Email sent to users announcing the platform launch',
    html_content: 'Customized for pet owners vs sitters'
  },
  {
    template_key: 'booking_notification',
    template_name: 'New Booking Request',
    subject: 'New Booking Request from {ownerName}',
    description: 'Email sent to sitters when they receive a booking request',
    html_content: 'Contains booking details and acceptance link'
  },
  {
    template_key: 'booking_confirmation',
    template_name: 'Booking Confirmed',
    subject: 'Your booking with {sitterName} is confirmed!',
    description: 'Email sent to pet owners when booking is confirmed',
    html_content: 'Contains booking details and sitter contact info'
  },
  {
    template_key: 'daily_report',
    template_name: 'Daily Pet Report',
    subject: 'Daily Report for {petName} - {date}',
    description: 'Email sent to pet owners with daily pet care updates',
    html_content: 'Contains photos, mood, activities, and care notes'
  },
  {
    template_key: 'welcome_email',
    template_name: 'Welcome Email',
    subject: 'Welcome to ZiggySitters!',
    description: 'Email sent to new users after signup',
    html_content: 'Welcome message with next steps'
  }
];

export default function AdminEmailManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const [sendingCampaign, setSendingCampaign] = useState<string | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    marketing: 0,
    booking: 0,
    reports: 0,
    payments: 0
  });
  const [loading, setLoading] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUserType, setPreviewUserType] = useState<string>('pet_owner');

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  if (!user || profile?.role !== 'admin') {
    navigate('/');
    return null;
  }

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_subscriptions')
        .select(`
          user_id,
          marketing_emails,
          booking_notifications,
          daily_report_notifications,
          payment_notifications,
          created_at,
          profiles!email_subscriptions_user_id_fkey (
            first_name,
            last_name,
            email,
            role
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formatted = (data || []).map((sub: any) => ({
        user_id: sub.user_id,
        first_name: sub.profiles.first_name,
        last_name: sub.profiles.last_name,
        email: sub.profiles.email,
        role: sub.profiles.role,
        marketing_emails: sub.marketing_emails ?? true,
        booking_notifications: sub.booking_notifications ?? true,
        daily_report_notifications: sub.daily_report_notifications ?? true,
        payment_notifications: sub.payment_notifications ?? true,
        created_at: sub.created_at
      }));

      setSubscriptions(formatted);

      const stats = {
        total: formatted.length,
        marketing: formatted.filter((s: Subscription) => s.marketing_emails).length,
        booking: formatted.filter((s: Subscription) => s.booking_notifications).length,
        reports: formatted.filter((s: Subscription) => s.daily_report_notifications).length,
        payments: formatted.filter((s: Subscription) => s.payment_notifications).length
      };

      setStats(stats);
    } catch (error: any) {
      console.error('Error fetching subscriptions:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch email subscriptions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendCampaign = async (campaign: Campaign) => {
    const confirmed = confirm(`Send "${campaign.name}" to ${campaign.targetAudience}?`);
    if (!confirmed) return;

    setSendingCampaign(campaign.id);
    try {
      const { data, error } = await supabase.functions.invoke(campaign.edgeFunction);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Campaign sent successfully! ${data.sent || 0} emails sent.`
      });
    } catch (error: any) {
      console.error('Error sending campaign:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send campaign',
        variant: 'destructive'
      });
    } finally {
      setSendingCampaign(null);
    }
  };

  const handlePreviewEmail = async (campaign: Campaign, userType: string) => {
    setLoadingPreview(true);
    setPreviewUserType(userType);
    try {
      const { data, error } = await supabase.functions.invoke('preview-email', {
        body: { campaign: campaign.id, userType }
      });

      if (error) throw error;

      setPreviewHtml(data.html);
      setShowPreview(true);
    } catch (error: any) {
      console.error('Error loading preview:', error);
      toast({
        title: 'Error',
        description: 'Failed to load email preview',
        variant: 'destructive'
      });
    } finally {
      setLoadingPreview(false);
    }
  };

  const exportToCSV = () => {
    const marketingSubs = subscriptions.filter(s => s.marketing_emails);
    const csvContent = [
      ['Email', 'First Name', 'Last Name', 'Role', 'Subscribed Date'].join(','),
      ...marketingSubs.map(s => 
        [s.email, s.first_name, s.last_name, s.role, new Date(s.created_at).toLocaleDateString()].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marketing-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Email Management</h1>
        <p className="text-muted-foreground">Send campaigns, manage subscriptions, and preview email templates</p>
      </div>

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          All promotional emails include unsubscribe headers for GDPR compliance. Users can manage their preferences anytime.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="campaigns" className="space-y-6">
        <TabsList>
          <TabsTrigger value="campaigns">Send Campaigns</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions ({stats.total})</TabsTrigger>
          <TabsTrigger value="templates">Email Templates</TabsTrigger>
        </TabsList>

        {/* Send Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  {campaign.name}
                </CardTitle>
                <CardDescription>{campaign.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      <Users className="h-4 w-4 inline mr-1" />
                      Target: {campaign.targetAudience}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {campaign.hasPreview && campaign.userTypes && (
                      <div className="flex gap-2">
                        {campaign.userTypes.map((userType) => (
                          <Button
                            key={userType}
                            variant="outline"
                            onClick={() => handlePreviewEmail(campaign, userType)}
                            disabled={loadingPreview}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Preview {userType === 'pet_owner' ? 'Owner' : 'Sitter'}
                          </Button>
                        ))}
                      </div>
                    )}
                    <Button
                      onClick={() => handleSendCampaign(campaign)}
                      disabled={sendingCampaign === campaign.id}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {sendingCampaign === campaign.id ? 'Sending...' : 'Send Campaign'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Marketing Emails</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.marketing}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Booking Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.booking}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Report Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.reports}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Email Preferences</CardTitle>
                  <CardDescription>View all user email subscription preferences</CardDescription>
                </div>
                <Button onClick={exportToCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Marketing List
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-center">Marketing</TableHead>
                      <TableHead className="text-center">Bookings</TableHead>
                      <TableHead className="text-center">Reports</TableHead>
                      <TableHead className="text-center">Payments</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map((sub) => (
                      <TableRow key={sub.user_id}>
                        <TableCell className="font-medium">
                          {sub.first_name} {sub.last_name}
                        </TableCell>
                        <TableCell>{sub.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{sub.role}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {sub.marketing_emails ? (
                            <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {sub.booking_notifications ? (
                            <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {sub.daily_report_notifications ? (
                            <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {sub.payment_notifications ? (
                            <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600 mx-auto" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              These are the core email templates used across the platform. They are managed in the edge functions code.
            </AlertDescription>
          </Alert>

          {emailTemplates.map((template) => (
            <Card key={template.template_key}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{template.template_name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </div>
                  <Button variant="outline" onClick={() => setPreviewTemplate(template)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  <strong>Subject:</strong> {template.subject}
                </p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Email Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Email Preview - {previewUserType === 'pet_owner' ? 'Pet Owner' : 'Sitter'} Version
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto border rounded-lg bg-gray-50">
            {previewHtml && (
              <iframe
                srcDoc={previewHtml}
                className="w-full h-full min-h-[600px]"
                title="Email Preview"
                sandbox="allow-same-origin"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Info Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.template_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-1">Subject:</h4>
              <p className="text-sm text-muted-foreground">{previewTemplate?.subject}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-1">Description:</h4>
              <p className="text-sm text-muted-foreground">{previewTemplate?.description}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-1">Content:</h4>
              <p className="text-sm text-muted-foreground">{previewTemplate?.html_content}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
