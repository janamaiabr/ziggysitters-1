import { useEffect, useState } from 'react';
import { MapPin, Clock, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface RecentBooking {
  suburb: string;
  city: string;
  count: number;
  lastBooked: string;
}

export default function LocalSocialProof() {
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        // Get recent booking activity by suburb
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            created_at,
            sitter_id,
            profiles!bookings_sitter_id_fkey(suburb, city)
          `)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })
          .limit(20);

        if (data) {
          // Group by suburb
          const suburbMap = new Map<string, { count: number; lastBooked: string; city: string }>();
          
          data.forEach((booking: any) => {
            const suburb = booking.profiles?.suburb || 'Auckland';
            const city = booking.profiles?.city || 'Auckland';
            const existing = suburbMap.get(suburb);
            
            if (existing) {
              existing.count++;
            } else {
              suburbMap.set(suburb, {
                count: 1,
                lastBooked: booking.created_at,
                city: city
              });
            }
          });

          const bookings = Array.from(suburbMap.entries())
            .map(([suburb, data]) => ({
              suburb,
              city: data.city,
              count: data.count,
              lastBooked: data.lastBooked
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 4);

          setRecentBookings(bookings);
        }
      } catch (error) {
        console.error('Error fetching recent activity:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivity();
  }, []);

  // Format relative time
  const getRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return 'last week';
    return `${Math.floor(diffDays / 7)} weeks ago`;
  };

  if (loading || recentBookings.length === 0) {
    // Show fallback static content
    return (
      <div className="flex flex-wrap justify-center gap-3 text-sm">
        <div className="flex items-center gap-2 bg-white/90 dark:bg-gray-900/90 rounded-full px-4 py-2 shadow-sm border border-border">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground">Popular in <span className="font-semibold text-foreground">Auckland Central</span></span>
        </div>
        <div className="flex items-center gap-2 bg-white/90 dark:bg-gray-900/90 rounded-full px-4 py-2 shadow-sm border border-border">
          <TrendingUp className="w-4 h-4 text-green-600" />
          <span className="text-muted-foreground">High demand in <span className="font-semibold text-foreground">North Shore</span></span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-center text-sm text-muted-foreground font-medium">
        🔥 Recent booking activity near you
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {recentBookings.map((booking, index) => (
          <div 
            key={index}
            className="flex items-center gap-2 bg-white/90 dark:bg-gray-900/90 rounded-full px-4 py-2 shadow-sm border border-border hover:border-primary/30 transition-colors"
          >
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm">
              <span className="font-semibold text-foreground">{booking.suburb}</span>
              <span className="text-muted-foreground"> • booked {getRelativeTime(booking.lastBooked)}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}