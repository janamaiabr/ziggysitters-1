import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SEOHead from "@/components/seo/SEOHead";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/contexts/ProfileContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { YOUNG_WALKER_CONFIG } from "@/config/features";
import { format } from "date-fns";
import { 
  Dog, 
  MapPin, 
  Clock, 
  Calendar as CalendarIcon,
  DollarSign,
  Shield,
  CheckCircle2,
  ArrowLeft
} from "lucide-react";

interface YoungWalker {
  id: string;
  child_first_name: string;
  child_last_name: string;
  home_suburb: string;
  home_city: string;
  rate_per_walk: number;
  max_walk_duration_mins: number;
  accepted_dog_sizes: string[];
  available_after_school: boolean;
  available_weekends: boolean;
  available_school_holidays: boolean;
  after_school_start_time: string | null;
  after_school_end_time: string | null;
  weekend_start_time: string | null;
  weekend_end_time: string | null;
  holiday_start_time: string | null;
  holiday_end_time: string | null;
  bio: string | null;
  parent_name: string;
  parent_email: string;
}

interface BookingFormData {
  dogName: string;
  dogBreed: string;
  dogSize: string;
  dogTemperament: string;
  pickupAddress: string;
  walkDate: Date | undefined;
  walkTime: string;
  walkNotes: string;
  confirmedTemperament: boolean;
  confirmedSafetyGuidelines: boolean;
}

export default function BookYoungWalker() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  
  const [walker, setWalker] = useState<YoungWalker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<BookingFormData>({
    dogName: "",
    dogBreed: "",
    dogSize: "small",
    dogTemperament: "",
    pickupAddress: "",
    walkDate: undefined,
    walkTime: "15:30",
    walkNotes: "",
    confirmedTemperament: false,
    confirmedSafetyGuidelines: false,
  });

  useEffect(() => {
    if (id) {
      fetchWalker();
    }
  }, [id]);

  useEffect(() => {
    if (profile?.address) {
      setFormData(prev => ({ ...prev, pickupAddress: profile.address || "" }));
    }
  }, [profile]);

  const fetchWalker = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("young_walkers")
        .select("*")
        .eq("id", id)
        .eq("status", "active")
        .single();

      if (error) throw error;
      setWalker(data);
    } catch (error: any) {
      console.error("Error fetching walker:", error);
      toast({
        title: "Not Found",
        description: "This young walker is not available.",
        variant: "destructive",
      });
      navigate("/search-young-walkers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof BookingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.dogName.trim()) {
      toast({ title: "Required", description: "Please enter your dog's name.", variant: "destructive" });
      return false;
    }
    if (!formData.dogSize) {
      toast({ title: "Required", description: "Please select your dog's size.", variant: "destructive" });
      return false;
    }
    if (!formData.pickupAddress.trim()) {
      toast({ title: "Required", description: "Please enter the pickup address.", variant: "destructive" });
      return false;
    }
    if (!formData.walkDate) {
      toast({ title: "Required", description: "Please select a walk date.", variant: "destructive" });
      return false;
    }
    if (!formData.walkTime) {
      toast({ title: "Required", description: "Please select a walk time.", variant: "destructive" });
      return false;
    }
    if (!formData.confirmedTemperament || !formData.confirmedSafetyGuidelines) {
      toast({ title: "Required", description: "Please confirm the safety requirements.", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!user || !profile || !walker) {
      toast({ title: "Error", description: "Please sign in to book.", variant: "destructive" });
      navigate(`/auth?redirect=/book-young-walker/${id}`);
      return;
    }

    setIsSubmitting(true);

    try {
      const platformFee = Math.round(walker.rate_per_walk * 0.10); // 10% platform fee
      const totalAmount = walker.rate_per_walk;

      const { data: booking, error } = await supabase
        .from("young_walker_bookings")
        .insert({
          young_walker_id: walker.id,
          client_id: profile.id,
          dog_name: formData.dogName,
          dog_breed: formData.dogBreed || null,
          dog_size: formData.dogSize,
          dog_temperament: formData.dogTemperament || null,
          pickup_address: formData.pickupAddress,
          walk_date: format(formData.walkDate!, "yyyy-MM-dd"),
          walk_time: formData.walkTime,
          walk_notes: formData.walkNotes || null,
          duration_mins: walker.max_walk_duration_mins,
          rate: walker.rate_per_walk,
          platform_fee: platformFee,
          total_amount: totalAmount,
          client_confirmed_dog_temperament: formData.confirmedTemperament,
          client_confirmed_safety_guidelines: formData.confirmedSafetyGuidelines,
          status: "pending",
          payment_status: "pending",
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Booking Requested!",
        description: `Your walk request has been sent to ${walker.child_first_name}. They'll confirm soon!`,
      });

      navigate("/bookings");
    } catch (error: any) {
      console.error("Booking error:", error);
      toast({
        title: "Booking Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate time slots based on walker's availability settings
  const generateTimeSlots = (startTime: string, endTime: string): string[] => {
    const slots: string[] = [];
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let min = 0; min < 60; min += 30) {
        // Skip times before start
        if (hour === startHour && min < startMin) continue;
        // Skip times after end
        if (hour === endHour && min > endMin) continue;
        if (hour > endHour) continue;
        
        const time = `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const isWeekend = formData.walkDate 
    ? formData.walkDate.getDay() === 0 || formData.walkDate.getDay() === 6 
    : false;

  // Use walker's custom time settings or defaults
  const afterSchoolSlots = generateTimeSlots(
    walker?.after_school_start_time || "15:00", 
    walker?.after_school_end_time || "18:00"
  );
  const weekendSlots = generateTimeSlots(
    walker?.weekend_start_time || "09:00", 
    walker?.weekend_end_time || "17:00"
  );

  const availableTimeSlots = isWeekend ? weekendSlots : afterSchoolSlots;
  
  // Get display time range for user
  const getTimeRangeDisplay = () => {
    if (isWeekend) {
      const start = walker?.weekend_start_time || "09:00";
      const end = walker?.weekend_end_time || "17:00";
      return `Weekend hours: ${start} - ${end}`;
    } else {
      const start = walker?.after_school_start_time || "15:00";
      const end = walker?.after_school_end_time || "18:00";
      return `After school: ${start} - ${end}`;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!walker) {
    return null;
  }

  return (
    <>
      <SEOHead 
        title={`Book ${walker.child_first_name} for Dog Walking | ZiggySitters`}
        description={`Book a dog walk with ${walker.child_first_name} in ${walker.home_suburb}. ${walker.max_walk_duration_mins} minute walks for $${walker.rate_per_walk}.`}
        canonical={`/book-young-walker/${id}`}
      />

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button variant="ghost" onClick={() => navigate("/search-young-walkers")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Search
        </Button>

        {/* Walker Info */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary/10 text-primary text-lg">
                  {walker.child_first_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-bold">
                  Book a Walk with {walker.child_first_name}
                </h2>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  {walker.home_suburb}, {walker.home_city}
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-medium">${walker.rate_per_walk}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{walker.max_walk_duration_mins} min walk</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking Form */}
        <Card>
          <CardHeader>
            <CardTitle>Walk Details</CardTitle>
            <CardDescription>Tell us about your dog and when you'd like the walk.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dog Info */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Dog className="h-4 w-4" />
                Your Dog
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dogName">Dog's Name *</Label>
                  <Input
                    id="dogName"
                    value={formData.dogName}
                    onChange={(e) => handleInputChange("dogName", e.target.value)}
                    placeholder="e.g., Max"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dogBreed">Breed (optional)</Label>
                  <Input
                    id="dogBreed"
                    value={formData.dogBreed}
                    onChange={(e) => handleInputChange("dogBreed", e.target.value)}
                    placeholder="e.g., Labrador"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dogSize">Dog Size *</Label>
                <Select value={formData.dogSize} onValueChange={(v) => handleInputChange("dogSize", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {walker.accepted_dog_sizes.includes("small") && (
                      <SelectItem value="small">Small (under 10kg)</SelectItem>
                    )}
                    {walker.accepted_dog_sizes.includes("medium") && (
                      <SelectItem value="medium">Medium (10-25kg)</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dogTemperament">Dog's Temperament</Label>
                <Textarea
                  id="dogTemperament"
                  value={formData.dogTemperament}
                  onChange={(e) => handleInputChange("dogTemperament", e.target.value)}
                  placeholder="e.g., Friendly, good with other dogs, doesn't pull on lead..."
                  rows={2}
                />
              </div>
            </div>

            {/* Walk Details */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Walk Schedule
              </h3>
              <div className="space-y-2">
                <Label htmlFor="pickupAddress">Pickup Address *</Label>
                <Input
                  id="pickupAddress"
                  value={formData.pickupAddress}
                  onChange={(e) => handleInputChange("pickupAddress", e.target.value)}
                  placeholder="Your home address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Walk Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.walkDate ? format(formData.walkDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.walkDate}
                        onSelect={(date) => handleInputChange("walkDate", date)}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Walk Time *</Label>
                  <Select value={formData.walkTime} onValueChange={(v) => handleInputChange("walkTime", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTimeSlots.map(time => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {getTimeRangeDisplay()}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="walkNotes">Special Instructions (optional)</Label>
                <Textarea
                  id="walkNotes"
                  value={formData.walkNotes}
                  onChange={(e) => handleInputChange("walkNotes", e.target.value)}
                  placeholder="Any special instructions for the walker..."
                  rows={2}
                />
              </div>
            </div>

            {/* Safety Confirmations */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Safety Confirmations
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Checkbox 
                    id="temperament"
                    checked={formData.confirmedTemperament}
                    onCheckedChange={(checked) => handleInputChange("confirmedTemperament", checked === true)}
                  />
                  <Label htmlFor="temperament" className="font-normal text-sm">
                    I confirm my dog is well-behaved, friendly, and suitable for a young person to walk. 
                    My dog does not pull excessively on the lead or show aggression.
                  </Label>
                </div>
                <div className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Checkbox 
                    id="safety"
                    checked={formData.confirmedSafetyGuidelines}
                    onCheckedChange={(checked) => handleInputChange("confirmedSafetyGuidelines", checked === true)}
                  />
                  <Label htmlFor="safety" className="font-normal text-sm">
                    I understand this is a Young Walker (ages {YOUNG_WALKER_CONFIG.MIN_AGE}-{YOUNG_WALKER_CONFIG.MAX_AGE}) 
                    and the walk will be limited to {walker.max_walk_duration_mins} minutes in the local neighbourhood.
                  </Label>
                </div>
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total</span>
                <span className="text-2xl font-bold text-primary">${walker.rate_per_walk}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {walker.max_walk_duration_mins} minute walk • Payment after walk completion
              </p>
            </div>

            <Button 
              className="w-full" 
              size="lg"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Request Walk"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
