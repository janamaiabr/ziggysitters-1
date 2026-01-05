import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Clock, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/contexts/ProfileContext';
import { format } from 'date-fns';

interface LastBookingData {
  sitter_id: string;
  sitter_name: string;
  sitter_avatar: string | null;
  service_type: string;
  last_booked: string;
}

const BOOKING_PREFS_KEY = 'ziggy_last_booking_prefs';

export default function QuickRebook() {
  const [lastBooking, setLastBooking] = useState<LastBookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLastBooking = async () => {
      if (!user || !profile) {
        setLoading(false);
        return;
      }

      try {
        // Get last completed booking for this user
        const { data: booking, error } = await supabase
          .from('bookings')
          .select(`
            id,
            service_type,
            created_at,
            sitter_id
          `)
          .eq('owner_id', profile.id)
          .in('status', ['completed', 'confirmed', 'in_progress'])
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error || !booking) {
          // Check localStorage fallback
          const savedPrefs = localStorage.getItem(BOOKING_PREFS_KEY);
          if (savedPrefs) {
            const prefs = JSON.parse(savedPrefs);
            setLastBooking({
              sitter_id: prefs.sitterId,
              sitter_name: prefs.sitterName,
              sitter_avatar: null,
              service_type: prefs.serviceType,
              last_booked: prefs.lastBookedAt,
            });
          }
          setLoading(false);
          return;
        }

        // Fetch sitter info
        const { data: sitter } = await supabase
          .from('public_sitters')
          .select('id, first_name, last_name, avatar_url')
          .eq('id', booking.sitter_id)
          .maybeSingle();

        if (sitter) {
          setLastBooking({
            sitter_id: sitter.id,
            sitter_name: `${sitter.first_name} ${sitter.last_name?.charAt(0) || ''}.`,
            sitter_avatar: sitter.avatar_url,
            service_type: booking.service_type,
            last_booked: booking.created_at,
          });
        }
      } catch (error) {
        console.error('Error fetching last booking:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLastBooking();
  }, [user, profile]);

  if (loading || !lastBooking || !profile || profile.role !== 'pet_owner') {
    return null;
  }

  const serviceLabels: Record<string, string> = {
    'pet_sitting_sitters_home': "Pet Sitting (Sitter's Home)",
    'pet_sitting_owners_home': 'Pet Sitting (Your Home)',
    'drop_in_visits': 'Drop-in Visits',
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={lastBooking.sitter_avatar || undefined} />
            <AvatarFallback>{lastBooking.sitter_name.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <RefreshCw className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Book Again</span>
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {lastBooking.sitter_name} • {serviceLabels[lastBooking.service_type] || lastBooking.service_type}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Last booked {format(new Date(lastBooking.last_booked), 'MMM d, yyyy')}
            </p>
          </div>
          
          <Button 
            size="sm"
            onClick={() => navigate(`/sitter/${lastBooking.sitter_id}?booking=true&serviceType=${lastBooking.service_type}`)}
            className="shrink-0"
          >
            Rebook
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
