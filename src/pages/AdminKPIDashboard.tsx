import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Users, Star, Heart, Clock, DollarSign, RefreshCw } from 'lucide-react';

// --- Pure KPI calculation logic (exported for tests) ---
export interface KPIBooking {
  id: string;
  client_id: string;
  status: string;
  total_amount: number;
  is_senior_pet?: boolean;
  referral_source?: string;
  daily_reports_completed?: number;
  daily_reports_required?: number;
  created_at: string;
}

export interface KPIReview {
  rating: number;
}

export interface KPISitter {
  id: string;
  last_active_at?: string;
}

export function calcRepeatBookingRate(bookings: KPIBooking[]): number {
  const clientCounts: Record<string, number> = {};
  for (const b of bookings) {
    clientCounts[b.client_id] = (clientCounts[b.client_id] || 0) + 1;
  }
  const clientIds = Object.keys(clientCounts);
  if (clientIds.length === 0) return 0;
  const repeatClients = clientIds.filter(id => clientCounts[id] > 1).length;
  return Math.round((repeatClients / clientIds.length) * 100);
}

export function calcDailyUpdateCompliance(bookings: KPIBooking[]): number {
  const withRequirements = bookings.filter(
    b => b.daily_reports_required !== undefined && b.daily_reports_required > 0
  );
  if (withRequirements.length === 0) return 0;
  const compliant = withRequirements.filter(
    b => (b.daily_reports_completed ?? 0) >= (b.daily_reports_required ?? 0)
  ).length;
  return Math.round((compliant / withRequirements.length) * 100);
}

export function calcClientLTV(bookings: KPIBooking[]): number {
  const clientSpend: Record<string, number> = {};
  for (const b of bookings) {
    clientSpend[b.client_id] = (clientSpend[b.client_id] || 0) + b.total_amount;
  }
  const clients = Object.keys(clientSpend);
  if (clients.length === 0) return 0;
  const totalSpend = clients.reduce((sum, id) => sum + clientSpend[id], 0);
  return Math.round(totalSpend / clients.length);
}

export function calcSeniorPetBookingPct(bookings: KPIBooking[]): number {
  if (bookings.length === 0) return 0;
  const seniorCount = bookings.filter(b => b.is_senior_pet).length;
  return Math.round((seniorCount / bookings.length) * 100);
}

export function calcNPS(reviews: KPIReview[]): number {
  if (reviews.length === 0) return 0;
  const promoters = reviews.filter(r => r.rating === 5).length;
  const detractors = reviews.filter(r => r.rating <= 2).length;
  return Math.round(((promoters - detractors) / reviews.length) * 100);
}

export function calcSitterChurn(sitters: KPISitter[], now: Date = new Date()): number {
  if (sitters.length === 0) return 0;
  const cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const inactive = sitters.filter(s => {
    if (!s.last_active_at) return true;
    return new Date(s.last_active_at) < cutoff;
  }).length;
  return Math.round((inactive / sitters.length) * 100);
}

export function getKPIColor(value: number, target: number, higherIsBetter = true): 'green' | 'red' {
  if (higherIsBetter) return value >= target ? 'green' : 'red';
  return value <= target ? 'green' : 'red';
}

export function getMonthlyBookings(bookings: KPIBooking[], now: Date = new Date()): KPIBooking[] {
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return bookings.filter(b => new Date(b.created_at) >= startOfMonth);
}

// --- Mock data (replace with real Supabase queries) ---
// TODO: Replace with:
// const { data: bookings } = await supabase.from('bookings').select('*').eq('status', 'completed')
// const { data: reviews } = await supabase.from('booking_followups').select('rating')
// const { data: sitters } = await supabase.from('profiles').select('id, last_active_at').eq('role', 'sitter')

const MOCK_BOOKINGS: KPIBooking[] = [
  { id: '1', client_id: 'c1', status: 'completed', total_amount: 250, is_senior_pet: true, daily_reports_required: 3, daily_reports_completed: 3, created_at: new Date().toISOString() },
  { id: '2', client_id: 'c1', status: 'completed', total_amount: 180, is_senior_pet: true, daily_reports_required: 2, daily_reports_completed: 2, created_at: new Date().toISOString() },
  { id: '3', client_id: 'c2', status: 'completed', total_amount: 320, is_senior_pet: false, daily_reports_required: 4, daily_reports_completed: 4, created_at: new Date().toISOString() },
  { id: '4', client_id: 'c3', status: 'completed', total_amount: 150, is_senior_pet: true, daily_reports_required: 2, daily_reports_completed: 1, created_at: new Date().toISOString() },
  { id: '5', client_id: 'c3', status: 'completed', total_amount: 200, is_senior_pet: false, daily_reports_required: 3, daily_reports_completed: 3, created_at: new Date().toISOString() },
  { id: '6', client_id: 'c4', status: 'completed', total_amount: 290, is_senior_pet: true, daily_reports_required: 0, daily_reports_completed: 0, created_at: new Date().toISOString() },
];

const MOCK_REVIEWS: KPIReview[] = [
  { rating: 5 }, { rating: 5 }, { rating: 5 }, { rating: 4 }, { rating: 5 },
  { rating: 3 }, { rating: 5 }, { rating: 2 }, { rating: 5 }, { rating: 4 },
];

const MOCK_SITTERS: KPISitter[] = [
  { id: 's1', last_active_at: new Date().toISOString() },
  { id: 's2', last_active_at: new Date(Date.now() - 30 * 86400000).toISOString() },
  { id: 's3', last_active_at: new Date(Date.now() - 100 * 86400000).toISOString() },
  { id: 's4', last_active_at: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: 's5' },
];

// --- KPI Card Component ---
interface KPICardProps {
  title: string;
  value: string;
  target: string;
  color: 'green' | 'red';
  trend?: 'up' | 'down' | 'flat';
  icon: React.ReactNode;
  description?: string;
}

function KPICard({ title, value, target, color, trend = 'flat', icon, description }: KPICardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-400';

  return (
    <Card className={`border-l-4 ${color === 'green' ? 'border-l-green-500' : 'border-l-red-500'}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            {icon}
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
          </div>
          <TrendIcon className={`h-4 w-4 ${trendColor}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <div className={`text-2xl font-bold ${color === 'green' ? 'text-green-700' : 'text-red-600'}`}>
              {value}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Target: {target}
            </div>
          </div>
          <Badge
            variant="outline"
            className={color === 'green'
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-red-50 text-red-600 border-red-200'
            }
          >
            {color === 'green' ? '✓ On track' : '✗ Below target'}
          </Badge>
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-2">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

// --- Main Page ---
export default function AdminKPIDashboard() {
  const now = new Date();
  const monthlyBookings = getMonthlyBookings(MOCK_BOOKINGS, now);

  const repeatRate = calcRepeatBookingRate(MOCK_BOOKINGS);
  const complianceRate = calcDailyUpdateCompliance(MOCK_BOOKINGS);
  const ltv = calcClientLTV(MOCK_BOOKINGS);
  const seniorPct = calcSeniorPetBookingPct(MOCK_BOOKINGS);
  const nps = calcNPS(MOCK_REVIEWS);
  const churn = calcSitterChurn(MOCK_SITTERS, now);

  const kpis: KPICardProps[] = [
    {
      title: 'Total Bookings (Month)',
      value: String(monthlyBookings.length),
      target: '20+',
      color: getKPIColor(monthlyBookings.length, 20),
      trend: 'up',
      icon: <Clock className="h-4 w-4" />,
      description: 'Completed bookings this calendar month',
    },
    {
      title: 'Repeat Booking Rate',
      value: `${repeatRate}%`,
      target: '>50%',
      color: getKPIColor(repeatRate, 50),
      trend: repeatRate >= 50 ? 'up' : 'down',
      icon: <RefreshCw className="h-4 w-4" />,
      description: '% of clients who have booked more than once',
    },
    {
      title: 'Daily Update Compliance',
      value: `${complianceRate}%`,
      target: '>80%',
      color: getKPIColor(complianceRate, 80),
      trend: complianceRate >= 80 ? 'up' : 'down',
      icon: <Clock className="h-4 w-4" />,
      description: '% of bookings where daily reports were completed',
    },
    {
      title: 'Client LTV',
      value: `$${ltv}`,
      target: '>$800',
      color: getKPIColor(ltv, 800),
      trend: ltv >= 800 ? 'up' : 'down',
      icon: <DollarSign className="h-4 w-4" />,
      description: 'Average total spend per client (all time)',
    },
    {
      title: 'Senior Pet Bookings',
      value: `${seniorPct}%`,
      target: '>30%',
      color: getKPIColor(seniorPct, 30),
      trend: seniorPct >= 30 ? 'up' : 'down',
      icon: <Heart className="h-4 w-4" />,
      description: '% of bookings involving senior or high-needs pets',
    },
    {
      title: 'NPS Score',
      value: String(nps),
      target: '>70',
      color: getKPIColor(nps, 70),
      trend: nps >= 70 ? 'up' : 'down',
      icon: <Star className="h-4 w-4" />,
      description: 'Net Promoter Score from post-booking reviews',
    },
    {
      title: 'Sitter Churn',
      value: `${churn}%`,
      target: '<20%',
      color: getKPIColor(churn, 20, false),
      trend: churn <= 20 ? 'up' : 'down',
      icon: <Users className="h-4 w-4" />,
      description: '% of sitters inactive for >90 days',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-purple-600" />
          KPI Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Business performance metrics — updated in real time
        </p>
        <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-yellow-100 text-yellow-700 text-xs px-3 py-1">
          ⚠️ Currently showing mock data — connect Supabase queries to activate live data
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <KPICard key={kpi.title} {...kpi} />
        ))}
      </div>

      {/* Data source notes */}
      <Card className="bg-gray-50 border-dashed">
        <CardHeader>
          <CardTitle className="text-sm text-gray-600">📊 Live Data — Supabase Queries (uncomment to activate)</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs text-gray-500 overflow-auto whitespace-pre-wrap">
{`// Total bookings (month)
// const { data: bookings } = await supabase
//   .from('bookings')
//   .select('id, client_id, total_amount, is_senior_pet, daily_reports_completed, daily_reports_required, created_at')
//   .eq('status', 'completed')
//   .gte('created_at', startOfMonth.toISOString())

// Repeat clients %
// Group by client_id, count >1 = repeat

// Avg rating (from booking_followups)
// const { data: reviews } = await supabase
//   .from('booking_followups')
//   .select('rating')

// Senior pet bookings %
// Filter bookings where is_senior_pet = true

// Sitter churn
// const { data: sitters } = await supabase
//   .from('profiles')
//   .select('id, last_active_at')
//   .eq('role', 'sitter')`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
