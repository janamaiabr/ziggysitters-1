import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SEOHead from "@/components/seo/SEOHead";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/contexts/ProfileContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
  Wallet
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
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  
  const [youngWalker, setYoungWalker] = useState<YoungWalker | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [earnings, setEarnings] = useState({ total: 0, pending: 0 });

  useEffect(() => {
    if (!user) {
      navigate("/auth?redirect=/young-walker-dashboard");
      return;
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

  const handleAcceptBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from("young_walker_bookings")
        .update({ status: "confirmed" })
        .eq("id", bookingId);

      if (error) throw error;

      toast({ title: "Booking Accepted!", description: "The dog owner will be notified." });
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
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case "confirmed":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Confirmed</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case "declined":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Declined</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  if (!youngWalker) {
    return null;
  }

  const upcomingBookings = bookings.filter(b => 
    ["pending", "confirmed"].includes(b.status) && new Date(b.walk_date) >= new Date()
  );
  const pastBookings = bookings.filter(b => 
    b.status === "completed" || new Date(b.walk_date) < new Date()
  );

  return (
    <>
      <SEOHead 
        title="Young Walker Dashboard | ZiggySitters"
        description="Manage your young walker bookings and earnings."
        canonical="/young-walker-dashboard"
      />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {youngWalker.child_first_name}'s Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                {youngWalker.home_suburb}
              </div>
              {youngWalker.status === "pending_approval" && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Pending Admin Approval
                </Badge>
              )}
              {youngWalker.status === "active" && (
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Earned</p>
                    <p className="text-2xl font-bold">${earnings.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Wallet className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Payment</p>
                    <p className="text-2xl font-bold">${earnings.pending}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Dog className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Walks Completed</p>
                    <p className="text-2xl font-bold">
                      {bookings.filter(b => b.status === "completed").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {youngWalker.status === "pending_approval" && (
            <Card className="mb-8 border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-yellow-800">Application Under Review</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Your Young Walker application is being reviewed by our team. 
                      You'll receive an email once it's approved, typically within 1-2 business days.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bookings */}
          <Tabs defaultValue="upcoming">
            <TabsList className="mb-6">
              <TabsTrigger value="upcoming">
                Upcoming ({upcomingBookings.length})
              </TabsTrigger>
              <TabsTrigger value="past">
                Past Walks ({pastBookings.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              {upcomingBookings.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Dog className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No Upcoming Walks</h3>
                    <p className="text-muted-foreground">
                      When dog owners book walks, they'll appear here.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {upcomingBookings.map(booking => (
                    <Card key={booking.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{booking.dog_name}</h3>
                              {getStatusBadge(booking.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Ref: {booking.booking_reference}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">${booking.total_amount}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{format(new Date(booking.walk_date), "PPP")}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{booking.walk_time} ({booking.duration_mins} min)</span>
                          </div>
                          <div className="flex items-center gap-2 col-span-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{booking.pickup_address}</span>
                          </div>
                        </div>

                        {booking.status === "pending" && (
                          <div className="flex gap-2">
                            <Button 
                              className="flex-1" 
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
                            className="w-full" 
                            onClick={() => handleCompleteWalk(booking.id)}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Mark Walk as Completed
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="past">
              {pastBookings.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Dog className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No Past Walks</h3>
                    <p className="text-muted-foreground">
                      Completed walks will appear here.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {pastBookings.map(booking => (
                    <Card key={booking.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{booking.dog_name}</h3>
                              {getStatusBadge(booking.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(booking.walk_date), "PPP")} at {booking.walk_time}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">${booking.total_amount}</p>
                            <Badge variant="outline" className={
                              booking.payment_status === "paid" 
                                ? "bg-green-50 text-green-700" 
                                : "bg-yellow-50 text-yellow-700"
                            }>
                              {booking.payment_status === "paid" ? "Paid" : "Awaiting Payment"}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
