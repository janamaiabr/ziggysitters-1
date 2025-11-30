import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Calendar, DollarSign, User, MapPin, Clock, RefreshCw, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Booking {
  id: string;
  booking_reference: string;
  status: string;
  payment_status: string;
  service_type: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  platform_fee: number;
  created_at: string;
  updated_at: string;
  owner: {
    first_name: string;
    last_name: string;
    email: string;
  };
  sitter: {
    first_name: string;
    last_name: string;
    email: string;
  };
  promo_code?: string;
  promo_discount_amount?: number;
  requires_daily_reports: boolean;
  daily_reports_completed: number;
  daily_reports_required: number;
}

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'pending': 'bg-yellow-500',
    'awaiting_payment': 'bg-blue-500',
    'confirmed': 'bg-green-500',
    'in_progress': 'bg-purple-500',
    'completed': 'bg-emerald-600',
    'cancelled': 'bg-red-500',
    'declined': 'bg-gray-500'
  };
  return colors[status] || 'bg-gray-400';
};

const getStatusEmoji = (status: string): string => {
  const emojis: Record<string, string> = {
    'pending': '⏳',
    'awaiting_payment': '💳',
    'confirmed': '✅',
    'in_progress': '🔄',
    'completed': '🎉',
    'cancelled': '❌',
    'declined': '⛔'
  };
  return emojis[status] || '📋';
};

export default function BookingTracker() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('booking-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        () => {
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_reference,
          status,
          payment_status,
          service_type,
          start_date,
          end_date,
          total_amount,
          platform_fee,
          created_at,
          updated_at,
          promo_code,
          promo_discount_amount,
          requires_daily_reports,
          daily_reports_completed,
          daily_reports_required,
          owner:profiles!bookings_owner_id_fkey(first_name, last_name, email),
          sitter:profiles!bookings_sitter_id_fkey(first_name, last_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBookings(data as any || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Failed to load bookings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  const statusCounts = {
    all: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    awaiting_payment: bookings.filter(b => b.status === 'awaiting_payment').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    in_progress: bookings.filter(b => b.status === 'in_progress').length,
    completed: bookings.filter(b => b.status === 'completed').length,
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading bookings...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Booking Tracker</h2>
          <p className="text-muted-foreground">Monitor all bookings in real-time</p>
        </div>
        <Button onClick={fetchBookings} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All ({statusCounts.all})
        </Button>
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('pending')}
        >
          ⏳ Pending ({statusCounts.pending})
        </Button>
        <Button
          variant={filter === 'awaiting_payment' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('awaiting_payment')}
        >
          💳 Awaiting Payment ({statusCounts.awaiting_payment})
        </Button>
        <Button
          variant={filter === 'confirmed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('confirmed')}
        >
          ✅ Confirmed ({statusCounts.confirmed})
        </Button>
        <Button
          variant={filter === 'in_progress' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('in_progress')}
        >
          🔄 In Progress ({statusCounts.in_progress})
        </Button>
        <Button
          variant={filter === 'completed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('completed')}
        >
          🎉 Completed ({statusCounts.completed})
        </Button>
      </div>

      {/* Bookings List */}
      <div className="grid gap-4">
        {filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center p-8 text-muted-foreground">
              No bookings found for this filter
            </CardContent>
          </Card>
        ) : (
          filteredBookings.map((booking) => (
            <Card key={booking.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getStatusEmoji(booking.status)}</span>
                    <div>
                      <CardTitle className="text-lg">
                        {booking.booking_reference}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Created {new Date(booking.created_at).toLocaleDateString('en-NZ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status.replace(/_/g, ' ').toUpperCase()}
                    </Badge>
                    <Badge variant="outline">
                      {booking.payment_status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* People */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 mt-0.5 text-blue-500" />
                    <div className="text-sm">
                      <p className="font-semibold">Pet Owner</p>
                      <p className="text-muted-foreground">{booking.owner.first_name} {booking.owner.last_name}</p>
                      <p className="text-xs text-muted-foreground">{booking.owner.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 mt-0.5 text-green-500" />
                    <div className="text-sm">
                      <p className="font-semibold">Pet Sitter</p>
                      <p className="text-muted-foreground">{booking.sitter.first_name} {booking.sitter.last_name}</p>
                      <p className="text-xs text-muted-foreground">{booking.sitter.email}</p>
                    </div>
                  </div>
                </div>

                {/* Service & Dates */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{booking.service_type.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {new Date(booking.start_date).toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' })} - 
                        {new Date(booking.end_date).toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <DollarSign className="w-4 h-4 mt-0.5 text-green-500" />
                    <div>
                      <p className="font-semibold text-green-600">NZ${booking.total_amount.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Fee: NZ${booking.platform_fee.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                {(booking.promo_code || booking.requires_daily_reports) && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t">
                    {booking.promo_code && (
                      <Badge variant="secondary" className="text-xs">
                        🎁 Promo: {booking.promo_code} (-NZ${booking.promo_discount_amount?.toFixed(2)})
                      </Badge>
                    )}
                    {booking.requires_daily_reports && (
                      <Badge variant="secondary" className="text-xs">
                        📸 Reports: {booking.daily_reports_completed}/{booking.daily_reports_required}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/booking/${booking.id}`)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}