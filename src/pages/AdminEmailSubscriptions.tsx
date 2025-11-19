import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Mail, Users, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Subscription {
  id: string;
  user_id: string;
  booking_notifications: boolean;
  daily_report_notifications: boolean;
  payment_notifications: boolean;
  marketing_emails: boolean;
  created_at: string;
  updated_at: string;
  profile: {
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  };
}

export default function AdminEmailSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    marketing: 0,
    booking: 0,
    reports: 0,
    payments: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('email_subscriptions')
        .select(`
          *,
          profile:profiles!inner(
            first_name,
            last_name,
            email,
            role
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const subs = data as any[];
      setSubscriptions(subs);

      // Calculate stats
      setStats({
        total: subs.length,
        marketing: subs.filter(s => s.marketing_emails).length,
        booking: subs.filter(s => s.booking_notifications).length,
        reports: subs.filter(s => s.daily_report_notifications).length,
        payments: subs.filter(s => s.payment_notifications).length,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const marketingSubscribers = subscriptions.filter(s => s.marketing_emails);
    const csv = [
      ['Email', 'Name', 'Role', 'Subscribed Date'],
      ...marketingSubscribers.map(s => [
        s.profile.email,
        `${s.profile.first_name} ${s.profile.last_name}`,
        s.profile.role,
        new Date(s.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marketing-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <p>Loading subscriptions...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Email Subscriptions</h1>
        <p className="text-muted-foreground">
          Manage user email preferences and export marketing lists
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Mail className="h-4 w-4 text-green-600" />
              Marketing Emails
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.marketing}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.marketing / stats.total) * 100)}% opted in
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Booking Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.booking}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Report Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.reports}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Payment Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.payments}</div>
          </CardContent>
        </Card>
      </div>

      {/* Export Button */}
      <Card>
        <CardHeader>
          <CardTitle>Marketing List Export</CardTitle>
          <CardDescription>
            Download CSV of users who opted into marketing emails (GDPR compliant)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={exportToCSV} className="gap-2">
            <Download className="h-4 w-4" />
            Export Marketing Subscribers ({stats.marketing} users)
          </Button>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Subscriptions</CardTitle>
          <CardDescription>View detailed subscription preferences for all users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Marketing</TableHead>
                  <TableHead>Bookings</TableHead>
                  <TableHead>Reports</TableHead>
                  <TableHead>Payments</TableHead>
                  <TableHead>Subscribed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">
                      {sub.profile.first_name} {sub.profile.last_name}
                    </TableCell>
                    <TableCell>{sub.profile.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{sub.profile.role}</Badge>
                    </TableCell>
                    <TableCell>
                      {sub.marketing_emails ? (
                        <Badge className="bg-green-500">✓</Badge>
                      ) : (
                        <Badge variant="secondary">✗</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {sub.booking_notifications ? (
                        <Badge className="bg-green-500">✓</Badge>
                      ) : (
                        <Badge variant="secondary">✗</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {sub.daily_report_notifications ? (
                        <Badge className="bg-green-500">✓</Badge>
                      ) : (
                        <Badge variant="secondary">✗</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {sub.payment_notifications ? (
                        <Badge className="bg-green-500">✓</Badge>
                      ) : (
                        <Badge variant="secondary">✗</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(sub.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
