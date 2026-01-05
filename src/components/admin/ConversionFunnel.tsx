import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { subDays, subHours } from 'date-fns';
import { TrendingUp, Users, Search, Eye, MessageCircle, Calendar, CreditCard, ArrowRight } from 'lucide-react';

interface FunnelStep {
  name: string;
  icon: React.ReactNode;
  count: number;
  color: string;
}

export default function ConversionFunnel() {
  const [period, setPeriod] = useState<'24h' | '7d' | '30d'>('7d');
  const [loading, setLoading] = useState(true);
  const [funnelData, setFunnelData] = useState<FunnelStep[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const startDate = period === '24h' 
        ? subHours(new Date(), 24) 
        : period === '7d' 
          ? subDays(new Date(), 7) 
          : subDays(new Date(), 30);

      try {
        // Fetch all relevant events
        const { data: events, error } = await supabase
          .from('user_events')
          .select('event_name, user_id, session_id')
          .gte('created_at', startDate.toISOString());

        if (error) throw error;

        // Count unique sessions/users for each funnel step
        const stepCounts = {
          visitors: new Set<string>(),
          searched: new Set<string>(),
          viewedProfile: new Set<string>(),
          openedForm: new Set<string>(),
          sentEnquiry: new Set<string>(),
          bookedPaid: new Set<string>(),
        };

        (events || []).forEach(e => {
          const key = e.user_id || e.session_id;
          if (!key) return;

          // All visitors
          if (e.event_name === 'page_entered') {
            stepCounts.visitors.add(key);
          }

          // Searched
          if (e.event_name?.includes('search') || e.event_name === 'sitter_search') {
            stepCounts.searched.add(key);
          }

          // Viewed sitter profile
          if (e.event_name === 'sitter_profile_view' || e.event_name?.includes('profile_view')) {
            stepCounts.viewedProfile.add(key);
          }

          // Opened booking form
          if (e.event_name === 'booking_form_viewed' || e.event_name === 'booking_accordion_opened') {
            stepCounts.openedForm.add(key);
          }

          // Sent enquiry/booking request
          if (e.event_name === 'booking_request_sent' || e.event_name === 'enquiry_sent' || e.event_name === 'guest_enquiry_sent') {
            stepCounts.sentEnquiry.add(key);
          }

          // Completed booking with payment
          if (e.event_name === 'booking_paid' || e.event_name === 'payment_completed') {
            stepCounts.bookedPaid.add(key);
          }
        });

        setFunnelData([
          { name: 'Visitors', icon: <Users className="h-4 w-4" />, count: stepCounts.visitors.size, color: 'bg-blue-500' },
          { name: 'Searched', icon: <Search className="h-4 w-4" />, count: stepCounts.searched.size, color: 'bg-indigo-500' },
          { name: 'Viewed Profile', icon: <Eye className="h-4 w-4" />, count: stepCounts.viewedProfile.size, color: 'bg-purple-500' },
          { name: 'Opened Form', icon: <Calendar className="h-4 w-4" />, count: stepCounts.openedForm.size, color: 'bg-pink-500' },
          { name: 'Sent Enquiry', icon: <MessageCircle className="h-4 w-4" />, count: stepCounts.sentEnquiry.size, color: 'bg-orange-500' },
          { name: 'Paid & Booked', icon: <CreditCard className="h-4 w-4" />, count: stepCounts.bookedPaid.size, color: 'bg-green-500' },
        ]);
      } catch (error) {
        console.error('Error fetching funnel data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period]);

  const maxCount = Math.max(...funnelData.map(s => s.count), 1);

  const getDropoffRate = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return Math.round(((previous - current) / previous) * 100);
  };

  const getConversionRate = (current: number, first: number) => {
    if (first === 0) return '0%';
    return `${((current / first) * 100).toFixed(1)}%`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Conversion Funnel
          </CardTitle>
          <Select value={period} onValueChange={(v) => setPeriod(v as any)}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24h</SelectItem>
              <SelectItem value="7d">7 days</SelectItem>
              <SelectItem value="30d">30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {funnelData.map((step, i) => {
              const prevCount = i > 0 ? funnelData[i - 1].count : step.count;
              const dropoff = getDropoffRate(step.count, prevCount);
              const widthPercent = (step.count / maxCount) * 100;

              return (
                <div key={step.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded ${step.color} text-white`}>
                        {step.icon}
                      </div>
                      <span className="font-medium">{step.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg">{step.count.toLocaleString()}</span>
                      {i > 0 && dropoff > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          -{dropoff}%
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {getConversionRate(step.count, funnelData[0]?.count || 1)}
                      </Badge>
                    </div>
                  </div>
                  <div className="relative h-8 bg-muted rounded-lg overflow-hidden">
                    <div 
                      className={`absolute left-0 top-0 h-full ${step.color} transition-all duration-500`}
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                  {i < funnelData.length - 1 && (
                    <div className="flex justify-center py-1">
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Overall Conversion */}
            {funnelData.length > 1 && (
              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Overall Conversion (Visitor → Booking)</span>
                  <span className="text-2xl font-bold text-green-600">
                    {getConversionRate(funnelData[funnelData.length - 1]?.count || 0, funnelData[0]?.count || 1)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
