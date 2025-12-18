import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, Users, PawPrint, Search, CalendarCheck, CheckCircle } from 'lucide-react';

interface FunnelStats {
  totalSignups: number;
  addedPet: number;
  searched: number;
  madeBooking: number;
  completedBooking: number;
}

export function OnboardingFunnel() {
  const [stats, setStats] = useState<FunnelStats>({
    totalSignups: 0,
    addedPet: 0,
    searched: 0,
    madeBooking: 0,
    completedBooking: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFunnelStats();
  }, []);

  const fetchFunnelStats = async () => {
    try {
      // Use the onboarding_funnel view which has pre-computed data
      const { data, error } = await supabase
        .from('onboarding_funnel')
        .select('*')
        .eq('role', 'pet_owner');

      if (error) {
        console.error('Error fetching funnel stats:', error);
        return;
      }

      if (data) {
        setStats({
          totalSignups: data.length,
          addedPet: data.filter(d => d.added_pet).length,
          searched: data.filter(d => d.searched).length,
          madeBooking: data.filter(d => d.made_booking).length,
          completedBooking: data.filter(d => d.completed_booking).length,
        });
      }
    } catch (error) {
      console.error('Error fetching funnel stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getConversionRate = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return Math.round((current / previous) * 100);
  };

  const funnelSteps = [
    { label: 'Signed Up', value: stats.totalSignups, icon: Users, color: 'bg-blue-500' },
    { label: 'Added Pet', value: stats.addedPet, icon: PawPrint, color: 'bg-purple-500' },
    { label: 'Searched', value: stats.searched, icon: Search, color: 'bg-pink-500' },
    { label: 'Made Booking', value: stats.madeBooking, icon: CalendarCheck, color: 'bg-amber-500' },
    { label: 'Completed', value: stats.completedBooking, icon: CheckCircle, color: 'bg-green-500' },
  ];

  const maxValue = stats.totalSignups || 1;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Pet Owner Onboarding Funnel
        </CardTitle>
        <p className="text-sm text-muted-foreground">Conversion through each stage</p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4 text-muted-foreground">Loading...</div>
        ) : (
          <div className="space-y-3">
            {funnelSteps.map((step, index) => {
              const prevValue = index === 0 ? step.value : funnelSteps[index - 1].value;
              const conversionRate = getConversionRate(step.value, prevValue);
              const widthPercent = (step.value / maxValue) * 100;

              return (
                <div key={step.label} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <step.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{step.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{step.value}</span>
                      {index > 0 && (
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          conversionRate >= 50 ? 'bg-green-100 text-green-700' :
                          conversionRate >= 25 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {conversionRate}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-6 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${step.color} transition-all duration-500 rounded-full flex items-center justify-end pr-2`}
                      style={{ width: `${Math.max(widthPercent, 5)}%` }}
                    >
                      {widthPercent > 15 && (
                        <span className="text-xs text-white font-medium">
                          {Math.round(widthPercent)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
