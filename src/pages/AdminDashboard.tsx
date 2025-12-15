import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Users, CalendarCheck, DollarSign, TrendingUp, Eye, ShieldCheck, Target, Mail, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BusinessReports } from '@/components/admin/BusinessReports';
import { OnboardingFunnel } from '@/components/admin/OnboardingFunnel';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sendingReminders, setSendingReminders] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSitters: 0,
    totalOwners: 0,
    pendingDocs: 0,
    activeBookings: 0,
    pendingPayouts: 0,
    incompleteSitters: 0,
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    initializeAdminDashboard();
  }, [user]);

  const initializeAdminDashboard = async () => {
    await checkAdminStatus();
    await fetchStats();
  };

  const checkAdminStatus = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      
      const adminStatus = !!data;
      setIsAdmin(adminStatus);
      
      if (!adminStatus) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this page.",
          variant: "destructive",
        });
        navigate('/');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      navigate('/');
    }
  };

  const fetchStats = async () => {
    try {
      const [usersRes, sittersRes, ownersRes, pendingRes, bookingsRes, incompleteRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'pet_sitter'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'pet_owner'),
        supabase.from('profiles').select('id', { count: 'exact', head: true })
          .eq('role', 'pet_sitter')
          .eq('verification_status', 'pending')
          .not('id_document_url', 'is', null),
        supabase.from('bookings').select('id', { count: 'exact', head: true })
          .in('status', ['confirmed', 'in_progress']),
        supabase.from('profiles').select('id', { count: 'exact', head: true })
          .eq('role', 'pet_sitter')
          .eq('is_test_account', false)
          .or('onboarding_completed.is.null,onboarding_completed.eq.false'),
      ]);

      setStats({
        totalUsers: usersRes.count || 0,
        totalSitters: sittersRes.count || 0,
        totalOwners: ownersRes.count || 0,
        pendingDocs: pendingRes.count || 0,
        activeBookings: bookingsRes.count || 0,
        pendingPayouts: 0,
        incompleteSitters: incompleteRes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendSitterReminders = async () => {
    setSendingReminders(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-sitter-onboarding-status');
      
      if (error) throw error;
      
      const results = data?.results || {};
      const totalSent = (results.day1Reminders || 0) + (results.day3Reminders || 0) + (results.day7Reminders || 0);
      
      toast({
        title: "Reminders Sent!",
        description: `Day 1: ${results.day1Reminders || 0}, Day 3: ${results.day3Reminders || 0}, Day 7: ${results.day7Reminders || 0}`,
      });
    } catch (error: any) {
      console.error('Error sending reminders:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send reminders",
        variant: "destructive",
      });
    } finally {
      setSendingReminders(false);
    }
  };

  if (!user || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p>Checking access...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading...</div>;
  }

  const quickActions = [
    { 
      title: 'Bookings', 
      description: `${stats.activeBookings} active`, 
      icon: CalendarCheck, 
      href: '/admin/bookings',
      color: 'text-blue-600'
    },
    { 
      title: 'Users', 
      description: `${stats.totalUsers} total`, 
      icon: Users, 
      href: '/admin/users',
      color: 'text-green-600'
    },
    { 
      title: 'Document Review', 
      description: `${stats.pendingDocs} pending`, 
      icon: ShieldCheck, 
      href: '/admin/documents',
      color: 'text-purple-600',
      highlight: stats.pendingDocs > 0
    },
    { 
      title: 'Payouts', 
      description: 'Manage payments', 
      icon: DollarSign, 
      href: '/admin/payouts',
      color: 'text-amber-600'
    },
  ];

  const marketingActions = [
    { 
      title: 'Marketing Dashboard', 
      description: 'Supply & demand insights', 
      icon: TrendingUp, 
      href: '/admin/marketing-insights',
      color: 'text-pink-600'
    },
    { 
      title: 'Search Analytics', 
      description: 'User search behavior', 
      icon: Eye, 
      href: '/admin/search-analytics',
      color: 'text-indigo-600'
    },
    { 
      title: 'Sitter Recruitment', 
      description: 'High demand areas', 
      icon: Target, 
      href: '/admin/sitter-recruitment',
      color: 'text-orange-600'
    },
    { 
      title: 'Sitter Leads', 
      description: 'Potential sitters', 
      icon: Users, 
      href: '/admin/sitter-leads',
      color: 'text-teal-600'
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Admin Overview</h1>
        <p className="text-muted-foreground">Quick access to key metrics and actions</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.totalSitters}</div>
            <div className="text-sm text-muted-foreground">Sitters</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.totalOwners}</div>
            <div className="text-sm text-muted-foreground">Pet Owners</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.activeBookings}</div>
            <div className="text-sm text-muted-foreground">Active Bookings</div>
          </CardContent>
        </Card>
      </div>

      {/* Business Reports & Onboarding Funnel */}
      <div className="mb-8 grid md:grid-cols-2 gap-6">
        <BusinessReports />
        <OnboardingFunnel />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Card 
              key={action.href} 
              className={`cursor-pointer hover:shadow-md transition-shadow ${action.highlight ? 'ring-2 ring-primary' : ''}`}
              onClick={() => navigate(action.href)}
            >
              <CardContent className="pt-6 text-center">
                <action.icon className={`h-8 w-8 mx-auto mb-2 ${action.color}`} />
                <h3 className="font-semibold">{action.title}</h3>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Sitter Automation */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          Sitter Onboarding
        </h2>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Incomplete Sitter Profiles</p>
                <p className="text-sm text-muted-foreground">
                  {stats.incompleteSitters} sitters haven't completed onboarding
                </p>
              </div>
              <Button 
                onClick={sendSitterReminders} 
                disabled={sendingReminders}
                className="gap-2"
              >
                {sendingReminders ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4" />
                    Send Reminders
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Sends reminder emails to sitters based on signup date (Day 1, 3, or 7)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Marketing & Insights */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Marketing & Insights
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {marketingActions.map((action) => (
            <Card 
              key={action.href} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(action.href)}
            >
              <CardContent className="pt-6 text-center">
                <action.icon className={`h-8 w-8 mx-auto mb-2 ${action.color}`} />
                <h3 className="font-semibold">{action.title}</h3>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
