import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import SEOHead from "@/components/seo/SEOHead";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/contexts/ProfileContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { YOUNG_WALKER_CONFIG } from "@/config/features";
import { format } from "date-fns";
import { 
  Dog, 
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Wallet,
  Sparkles,
  TrendingUp,
  Star,
  Trophy,
  Target,
  ArrowRight,
  CreditCard,
  ExternalLink
} from "lucide-react";

interface YoungWalker {
  id: string;
  child_first_name: string;
  child_last_name: string;
  status: string;
  rate_per_walk: number;
  home_suburb: string;
}

interface Booking {
  id: string;
  booking_reference: string;
  dog_name: string;
  dog_size: string;
  pickup_address: string;
  walk_date: string;
  walk_time: string;
  duration_mins: number;
  total_amount: number;
  status: string;
  payment_status: string;
}

export default function YoungWalkerDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { profile, refetch } = useProfile();
  const { toast } = useToast();
  
  const [youngWalker, setYoungWalker] = useState<YoungWalker | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [earnings, setEarnings] = useState({ total: 0, pending: 0 });

  useEffect(() => {
    if (!user) {
      navigate("/auth?redirect=/young-walker-dashboard");
      return;
    }
    
    // Handle Stripe return
    if (searchParams.get("stripe_success") === "true") {
      toast({ title: "Payment Setup Complete!", description: "You can now receive payments for dog walks." });
      refetch?.();
    } else if (searchParams.get("stripe_refresh") === "true") {
      toast({ title: "Please Complete Setup", description: "Complete your Stripe setup to receive payments.", variant: "destructive" });
    }
    
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Fetch young walker record
      const { data: walkerData, error: walkerError } = await supabase
        .from("young_walkers")
        .select("*")
        .eq("parent_user_id", user.id)
        .single();

      if (walkerError && walkerError.code !== "PGRST116") {
        throw walkerError;
      }

      if (!walkerData) {
        // No young walker registered - redirect to registration
        navigate("/young-walker-registration");
        return;
      }

      setYoungWalker(walkerData);

      // Fetch bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("young_walker_bookings")
        .select("*")
        .eq("young_walker_id", walkerData.id)
        .order("walk_date", { ascending: false });

      if (bookingsError) throw bookingsError;
      setBookings(bookingsData || []);

      // Calculate earnings
      const completedBookings = (bookingsData || []).filter(b => b.status === "completed" && b.payment_status === "paid");
      const pendingBookings = (bookingsData || []).filter(b => b.status === "completed" && b.payment_status === "pending");
      
      setEarnings({
        total: completedBookings.reduce((sum, b) => sum + b.total_amount, 0),
        pending: pendingBookings.reduce((sum, b) => sum + b.total_amount, 0),
      });

    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStripeOnboarding = async () => {
    setStripeLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("young-walker-stripe-onboarding");
      
      if (error) throw error;
      if (!data?.url) throw new Error("No onboarding URL received");
      
      window.open(data.url, "_blank");
    } catch (error: any) {
      console.error("Stripe onboarding error:", error);
      toast({ 
        title: "Setup Failed", 
        description: error.message || "Could not start payment setup.", 
        variant: "destructive" 
      });
    } finally {
      setStripeLoading(false);
    }
  };

  const handleAcceptBooking = async (bookingId: string) => {
    // Check if Stripe is set up first
    if (!profile?.stripe_account_enabled) {
      toast({ 
        title: "Payment Setup Required", 
        description: "Complete your Stripe setup before accepting bookings.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from("young_walker_bookings")
        .update({ status: "confirmed" })
        .eq("id", bookingId);

      if (error) throw error;

      toast({ title: "Booking Accepted!", description: "The dog owner will be notified to pay." });
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDeclineBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from("young_walker_bookings")
        .update({ status: "declined" })
        .eq("id", bookingId);

      if (error) throw error;

      toast({ title: "Booking Declined", description: "The dog owner will be notified." });
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleCompleteWalk = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from("young_walker_bookings")
        .update({ 
          status: "completed",
          walk_completed_at: new Date().toISOString()
        })
        .eq("id", bookingId);

      if (error) throw error;

      toast({ title: "Walk Completed!", description: "Great job! The owner will be asked to pay." });
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-100 text-amber-700 border-0">New Request</Badge>;
      case "confirmed":
        return <Badge className="bg-blue-100 text-blue-700 border-0">Confirmed</Badge>;
      case "completed":
        return <Badge className="bg-emerald-100 text-emerald-700 border-0">Completed</Badge>;
      case "declined":
        return <Badge className="bg-red-100 text-red-700 border-0">Declined</Badge>;
      case "cancelled":
        return <Badge className="bg-slate-100 text-slate-700 border-0">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!youngWalker) {
    return null;
  }

  const completedWalks = bookings.filter(b => b.status === "completed").length;
  const upcomingBookings = bookings.filter(b => 
    ["pending", "confirmed"].includes(b.status) && new Date(b.walk_date) >= new Date()
  );
  const pastBookings = bookings.filter(b => 
    b.status === "completed" || new Date(b.walk_date) < new Date()
  );

  // Progress toward goals
  const walkGoal = 10;
  const earningsGoal = 100;
  const walkProgress = Math.min((completedWalks / walkGoal) * 100, 100);
  const earningsProgress = Math.min((earnings.total / earningsGoal) * 100, 100);

  return (
    <>
      <SEOHead 
        title="Young Walker Dashboard | ZiggySitters"
        description="Manage your young walker bookings and earnings."
        canonical="/young-walker-dashboard"
      />

      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="max-w-4xl mx-auto">
            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-6 md:p-8 mb-6 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4">
                <Avatar className="h-16 w-16 md:h-20 md:w-20 border-4 border-white/20">
                  <AvatarFallback className="bg-white/20 text-white text-2xl font-bold">
                    {youngWalker.child_first_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl md:text-3xl font-bold">
                      Hey {youngWalker.child_first_name}! 👋
                    </h1>
                    {youngWalker.status === "active" && (
                      <Badge className="bg-white/20 text-white border-0">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <MapPin className="h-4 w-4" />
                    <span>{youngWalker.home_suburb}</span>
                    <span>•</span>
                    <span>${YOUNG_WALKER_CONFIG.SUGGESTED_RATE_PER_WALK} per walk</span>
                  </div>
                </div>
              </div>

              {youngWalker.status === "pending_approval" && (
                <div className="relative z-10 mt-4 bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Application Under Review</p>
                      <p className="text-sm text-white/80">
                        We're reviewing your application. You'll get an email once approved!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Stripe Setup Banner - Show if not set up */}
            {!profile?.stripe_account_enabled && youngWalker.status === "active" && (
              <Alert className="mb-6 border-amber-300 bg-amber-50">
                <CreditCard className="h-4 w-4 text-amber-600" />
                <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="font-semibold text-amber-800">Set Up Payments to Receive Earnings</p>
                    <p className="text-sm text-amber-700">
                      Complete Stripe setup to receive payments when dog owners book walks.
                    </p>
                  </div>
                  <Button 
                    onClick={handleStripeOnboarding}
                    disabled={stripeLoading}
                    className="bg-amber-600 hover:bg-amber-700 text-white whitespace-nowrap"
                  >
                    {stripeLoading ? "Opening..." : "Set Up Payments"}
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
              <Card className="border-0 shadow-lg bg-white">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Earned</p>
                      <p className="text-xl md:text-2xl font-bold text-emerald-600">${earnings.total}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl">
                      <Wallet className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Pending</p>
                      <p className="text-xl md:text-2xl font-bold text-amber-600">${earnings.pending}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl">
                      <Dog className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Walks</p>
                      <p className="text-xl md:text-2xl font-bold text-blue-600">{completedWalks}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-violet-400 to-purple-500 rounded-xl">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Upcoming</p>
                      <p className="text-xl md:text-2xl font-bold text-violet-600">{upcomingBookings.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Goals Section */}
            <Card className="border-0 shadow-lg mb-6 bg-white overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  <CardTitle className="text-lg">Your Goals</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Walks Completed</span>
                    <span className="font-medium">{completedWalks}/{walkGoal}</span>
                  </div>
                  <Progress value={walkProgress} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Earnings Goal</span>
                    <span className="font-medium">${earnings.total}/${earningsGoal}</span>
                  </div>
                  <Progress value={earningsProgress} className="h-2" />
                </div>
                {walkProgress >= 100 && (
                  <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 rounded-lg p-3">
                    <Star className="h-5 w-5 fill-emerald-500" />
                    <span className="text-sm font-medium">Amazing! You've hit your walks goal! 🎉</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bookings */}
            <Tabs defaultValue="upcoming" className="mb-6">
              <TabsList className="w-full grid grid-cols-2 mb-4">
                <TabsTrigger value="upcoming" className="text-sm">
                  Upcoming ({upcomingBookings.length})
                </TabsTrigger>
                <TabsTrigger value="past" className="text-sm">
                  Past ({pastBookings.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="space-y-3">
                {upcomingBookings.length === 0 ? (
                  <Card className="border-0 shadow-lg bg-white">
                    <CardContent className="py-12 text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Dog className="h-8 w-8 text-emerald-600" />
                      </div>
                      <h3 className="font-semibold mb-2">No Upcoming Walks Yet</h3>
                      <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                        When dog owners in your area book walks, they'll appear here!
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  upcomingBookings.map(booking => (
                    <Card key={booking.id} className="border-0 shadow-lg bg-white overflow-hidden">
                      <CardContent className="p-4 md:p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center">
                              <Dog className="h-6 w-6 text-amber-600" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">{booking.dog_name}</h3>
                                {getStatusBadge(booking.status)}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Ref: {booking.booking_reference}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg text-emerald-600">${booking.total_amount}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                          <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{format(new Date(booking.walk_date), "EEE, MMM d")}</span>
                          </div>
                          <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{booking.walk_time}</span>
                          </div>
                          <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-2 col-span-2">
                            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground truncate">{booking.pickup_address}</span>
                          </div>
                        </div>

                        {booking.status === "pending" && (
                          <div className="flex gap-2">
                            <Button 
                              className="flex-1 bg-emerald-500 hover:bg-emerald-600" 
                              onClick={() => handleAcceptBooking(booking.id)}
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Accept
                            </Button>
                            <Button 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => handleDeclineBooking(booking.id)}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Decline
                            </Button>
                          </div>
                        )}

                        {booking.status === "confirmed" && (
                          <Button 
                            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600" 
                            onClick={() => handleCompleteWalk(booking.id)}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Mark Walk as Completed
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="past" className="space-y-3">
                {pastBookings.length === 0 ? (
                  <Card className="border-0 shadow-lg bg-white">
                    <CardContent className="py-12 text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Dog className="h-8 w-8 text-slate-400" />
                      </div>
                      <h3 className="font-semibold mb-2">No Past Walks</h3>
                      <p className="text-muted-foreground text-sm">
                        Completed walks will show up here.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  pastBookings.map(booking => (
                    <Card key={booking.id} className="border-0 shadow-lg bg-white">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                              <Dog className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{booking.dog_name}</h3>
                                {getStatusBadge(booking.status)}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(booking.walk_date), "MMM d, yyyy")}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-emerald-600">${booking.total_amount}</p>
                            <Badge 
                              variant="outline" 
                              className={
                                booking.payment_status === "paid" 
                                  ? "bg-emerald-50 text-emerald-700 border-0 text-xs" 
                                  : "bg-amber-50 text-amber-700 border-0 text-xs"
                              }
                            >
                              {booking.payment_status === "paid" ? "Paid" : "Pending"}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>

            {/* Tips Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-violet-500 to-purple-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Pro Tips for More Walks! 💡</h3>
                    <ul className="text-sm text-white/90 space-y-1">
                      <li>• Keep your profile bio friendly and detailed</li>
                      <li>• Respond quickly to booking requests</li>
                      <li>• Take cute photos during walks (with permission!)</li>
                      <li>• Be reliable - show up on time every time</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
