import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import SEOHead from "@/components/seo/SEOHead";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/contexts/ProfileContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { YOUNG_WALKER_CONFIG } from "@/config/features";
import { 
  Dog, 
  Shield, 
  CheckCircle2, 
  ArrowLeft,
  ArrowRight,
  User,
  Calendar,
  MapPin,
  Phone,
  Mail
} from "lucide-react";
import OnboardingLayout from "@/components/layout/OnboardingLayout";

interface YoungWalkerFormData {
  // Parent info
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  
  // Child info
  childFirstName: string;
  childLastName: string;
  childDob: string;
  
  // Location
  homeSuburb: string;
  homeCity: string;
  
  // Service preferences
  ratePerWalk: number;
  maxWalkDurationMins: number;
  serviceRadiusKm: number;
  acceptedDogSizes: string[];
  
  // Availability
  availableAfterSchool: boolean;
  availableWeekends: boolean;
  availableSchoolHolidays: boolean;
  
  // Experience
  experienceWithDogs: string;
  bio: string;
  
  // Consent
  safetyGuidelinesAcknowledged: boolean;
  parentConsentGiven: boolean;
  parentChecklistCompleted: boolean;
}

export default function YoungWalkerRegistration() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<YoungWalkerFormData>({
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    childFirstName: "",
    childLastName: "",
    childDob: "",
    homeSuburb: "",
    homeCity: "Auckland",
    ratePerWalk: YOUNG_WALKER_CONFIG.SUGGESTED_RATE_PER_WALK,
    maxWalkDurationMins: YOUNG_WALKER_CONFIG.MAX_WALK_DURATION_MINS,
    serviceRadiusKm: YOUNG_WALKER_CONFIG.DEFAULT_SERVICE_RADIUS_KM,
    acceptedDogSizes: ["small", "medium"],
    availableAfterSchool: true,
    availableWeekends: true,
    availableSchoolHolidays: true,
    experienceWithDogs: "",
    bio: "",
    safetyGuidelinesAcknowledged: false,
    parentConsentGiven: false,
    parentChecklistCompleted: false,
  });

  // Pre-fill parent info from profile
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        parentName: `${profile.first_name} ${profile.last_name}`,
        parentEmail: profile.email,
        parentPhone: profile.phone || "",
        homeSuburb: profile.suburb || "",
        homeCity: profile.city || "Auckland",
      }));
    }
  }, [profile]);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/auth?redirect=/young-walker-registration");
    }
  }, [user, navigate]);

  const handleInputChange = (field: keyof YoungWalkerFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateAge = (dob: string): number => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1: // Parent info
        if (!formData.parentName.trim() || !formData.parentEmail.trim() || !formData.parentPhone.trim()) {
          toast({ title: "Required", description: "Please fill in all parent details.", variant: "destructive" });
          return false;
        }
        return true;
      
      case 2: // Child info
        if (!formData.childFirstName.trim() || !formData.childLastName.trim() || !formData.childDob) {
          toast({ title: "Required", description: "Please fill in your child's details.", variant: "destructive" });
          return false;
        }
        const age = calculateAge(formData.childDob);
        if (age < YOUNG_WALKER_CONFIG.MIN_AGE || age > YOUNG_WALKER_CONFIG.MAX_AGE) {
          toast({ 
            title: "Age Requirement", 
            description: `Young Walkers must be between ${YOUNG_WALKER_CONFIG.MIN_AGE} and ${YOUNG_WALKER_CONFIG.MAX_AGE} years old.`, 
            variant: "destructive" 
          });
          return false;
        }
        return true;
      
      case 3: // Location & Preferences
        if (!formData.homeSuburb.trim()) {
          toast({ title: "Required", description: "Please enter your suburb.", variant: "destructive" });
          return false;
        }
        return true;
      
      case 4: // Safety & Consent
        if (!formData.safetyGuidelinesAcknowledged || !formData.parentConsentGiven || !formData.parentChecklistCompleted) {
          toast({ title: "Required", description: "Please acknowledge all safety requirements and give consent.", variant: "destructive" });
          return false;
        }
        return true;
      
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    if (!user || !profile) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      // Create young walker record
      const { data: youngWalker, error } = await supabase
        .from("young_walkers")
        .insert({
          parent_user_id: user.id,
          parent_profile_id: profile.id,
          profile_id: profile.id, // Will be updated when child gets their own profile
          parent_name: formData.parentName,
          parent_email: formData.parentEmail,
          parent_phone: formData.parentPhone,
          child_first_name: formData.childFirstName,
          child_last_name: formData.childLastName,
          child_date_of_birth: formData.childDob,
          home_suburb: formData.homeSuburb,
          home_city: formData.homeCity,
          rate_per_walk: formData.ratePerWalk,
          max_walk_duration_mins: formData.maxWalkDurationMins,
          service_radius_km: formData.serviceRadiusKm,
          accepted_dog_sizes: formData.acceptedDogSizes,
          available_after_school: formData.availableAfterSchool,
          available_weekends: formData.availableWeekends,
          available_school_holidays: formData.availableSchoolHolidays,
          experience_with_dogs: formData.experienceWithDogs,
          bio: formData.bio,
          safety_guidelines_acknowledged: formData.safetyGuidelinesAcknowledged,
          parent_consent_given: formData.parentConsentGiven,
          parent_consent_given_at: new Date().toISOString(),
          parent_checklist_completed: formData.parentChecklistCompleted,
          status: "pending_approval",
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Registration Submitted!",
        description: "We'll review your application and get back to you soon.",
      });

      navigate("/young-walker-dashboard");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const safetyChecklist = [
    "My child understands they can only walk small to medium, well-behaved dogs",
    "My child will only walk dogs in daylight hours in our local neighbourhood",
    "My child knows to never enter a stranger's home",
    "My child will always carry a charged phone during walks",
    "I will supervise or be available during walks if my child is under 14",
    "My child understands they cannot walk more than one dog at a time",
  ];

  return (
    <OnboardingLayout showNavigation={false}>
      <SEOHead 
        title="Register Young Walker | Parent Registration | ZiggySitters"
        description="Register your child as a Young Dog Walker on ZiggySitters. Safe, supervised dog walking for ages 12-17."
        canonical="/young-walker-registration"
      />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Step {step} of 4</span>
            <Button variant="ghost" size="sm" onClick={() => navigate("/young-walkers")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Info
            </Button>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Parent Information */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Parent/Caregiver Information
              </CardTitle>
              <CardDescription>
                As the parent or legal guardian, you'll manage your child's Young Walker account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="parentName">Your Full Name</Label>
                <Input
                  id="parentName"
                  value={formData.parentName}
                  onChange={(e) => handleInputChange("parentName", e.target.value)}
                  placeholder="Jane Smith"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentEmail">Your Email</Label>
                <Input
                  id="parentEmail"
                  type="email"
                  value={formData.parentEmail}
                  onChange={(e) => handleInputChange("parentEmail", e.target.value)}
                  placeholder="parent@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentPhone">Your Phone Number</Label>
                <Input
                  id="parentPhone"
                  type="tel"
                  value={formData.parentPhone}
                  onChange={(e) => handleInputChange("parentPhone", e.target.value)}
                  placeholder="021 xxx xxxx"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Child Information */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dog className="h-5 w-5 text-primary" />
                Young Walker Information
              </CardTitle>
              <CardDescription>
                Tell us about the young person who will be walking dogs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="childFirstName">First Name</Label>
                  <Input
                    id="childFirstName"
                    value={formData.childFirstName}
                    onChange={(e) => handleInputChange("childFirstName", e.target.value)}
                    placeholder="First name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="childLastName">Last Name</Label>
                  <Input
                    id="childLastName"
                    value={formData.childLastName}
                    onChange={(e) => handleInputChange("childLastName", e.target.value)}
                    placeholder="Last name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="childDob">Date of Birth</Label>
                <Input
                  id="childDob"
                  type="date"
                  value={formData.childDob}
                  onChange={(e) => handleInputChange("childDob", e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Young Walkers must be between {YOUNG_WALKER_CONFIG.MIN_AGE} and {YOUNG_WALKER_CONFIG.MAX_AGE} years old.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="experienceWithDogs">Experience with Dogs</Label>
                <Textarea
                  id="experienceWithDogs"
                  value={formData.experienceWithDogs}
                  onChange={(e) => handleInputChange("experienceWithDogs", e.target.value)}
                  placeholder="e.g., We have a family dog, I've walked neighbours' dogs before..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Short Bio (shown to dog owners)</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder="Tell dog owners a bit about yourself..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Location & Preferences */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Location & Preferences
              </CardTitle>
              <CardDescription>
                Set your service area and availability.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="homeSuburb">Your Suburb</Label>
                  <Input
                    id="homeSuburb"
                    value={formData.homeSuburb}
                    onChange={(e) => handleInputChange("homeSuburb", e.target.value)}
                    placeholder="e.g., Ponsonby"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="homeCity">City</Label>
                  <Input
                    id="homeCity"
                    value={formData.homeCity}
                    onChange={(e) => handleInputChange("homeCity", e.target.value)}
                    placeholder="Auckland"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Dog Sizes Accepted</Label>
                <div className="flex flex-wrap gap-2">
                  {["small", "medium"].map((size) => (
                    <Badge
                      key={size}
                      variant={formData.acceptedDogSizes.includes(size) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        const newSizes = formData.acceptedDogSizes.includes(size)
                          ? formData.acceptedDogSizes.filter(s => s !== size)
                          : [...formData.acceptedDogSizes, size];
                        handleInputChange("acceptedDogSizes", newSizes);
                      }}
                    >
                      {size.charAt(0).toUpperCase() + size.slice(1)}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  For safety, Young Walkers can only walk small and medium dogs.
                </p>
              </div>

              <div className="space-y-3">
                <Label>Availability</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="afterSchool"
                      checked={formData.availableAfterSchool}
                      onCheckedChange={(checked) => handleInputChange("availableAfterSchool", checked)}
                    />
                    <Label htmlFor="afterSchool" className="font-normal">After school (3pm-6pm weekdays)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="weekends"
                      checked={formData.availableWeekends}
                      onCheckedChange={(checked) => handleInputChange("availableWeekends", checked)}
                    />
                    <Label htmlFor="weekends" className="font-normal">Weekends</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="holidays"
                      checked={formData.availableSchoolHolidays}
                      onCheckedChange={(checked) => handleInputChange("availableSchoolHolidays", checked)}
                    />
                    <Label htmlFor="holidays" className="font-normal">School holidays</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ratePerWalk">Rate per Walk (NZD)</Label>
                <Input
                  id="ratePerWalk"
                  type="number"
                  min={YOUNG_WALKER_CONFIG.MIN_RATE}
                  max={YOUNG_WALKER_CONFIG.MAX_RATE}
                  value={formData.ratePerWalk}
                  onChange={(e) => handleInputChange("ratePerWalk", parseInt(e.target.value))}
                />
                <p className="text-sm text-muted-foreground">
                  Suggested: ${YOUNG_WALKER_CONFIG.SUGGESTED_RATE_PER_WALK} for a 30-minute walk
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Safety & Consent */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Safety Guidelines & Consent
              </CardTitle>
              <CardDescription>
                Please read and acknowledge the safety requirements.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                <h4 className="font-semibold">Safety Checklist</h4>
                {safetyChecklist.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Checkbox 
                    id="safetyAck"
                    checked={formData.safetyGuidelinesAcknowledged}
                    onCheckedChange={(checked) => handleInputChange("safetyGuidelinesAcknowledged", checked === true)}
                  />
                  <Label htmlFor="safetyAck" className="font-normal text-sm">
                    I confirm that my child has read and understands the safety guidelines above.
                  </Label>
                </div>

                <div className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Checkbox 
                    id="checklist"
                    checked={formData.parentChecklistCompleted}
                    onCheckedChange={(checked) => handleInputChange("parentChecklistCompleted", checked === true)}
                  />
                  <Label htmlFor="checklist" className="font-normal text-sm">
                    I have reviewed all the safety requirements in the checklist above and confirm they will be followed.
                  </Label>
                </div>

                <div className="flex items-start space-x-3 p-3 border rounded-lg bg-primary/5">
                  <Checkbox 
                    id="consent"
                    checked={formData.parentConsentGiven}
                    onCheckedChange={(checked) => handleInputChange("parentConsentGiven", checked === true)}
                  />
                  <Label htmlFor="consent" className="font-normal text-sm">
                    <strong>Parent/Guardian Consent:</strong> I, as the legal parent or guardian, give permission 
                    for my child ({formData.childFirstName || "my child"}) to participate in the Young Walker 
                    program and agree to the terms of service.
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-6">
          {step > 1 ? (
            <Button variant="outline" onClick={prevStep}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
          ) : (
            <div />
          )}
          
          {step < 4 ? (
            <Button onClick={nextStep}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit Registration"}
            </Button>
          )}
        </div>
      </div>
    </OnboardingLayout>
  );
}
