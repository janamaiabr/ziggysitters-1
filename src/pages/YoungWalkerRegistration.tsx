import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Users,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Sparkles
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
  const totalSteps = 4;
  
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
    maxWalkDurationMins: YOUNG_WALKER_CONFIG.MAX_WALK_DURATION,
    serviceRadiusKm: YOUNG_WALKER_CONFIG.MAX_DISTANCE_KM,
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
      setStep(prev => Math.min(prev + 1, totalSteps));
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

  const getStepTitle = () => {
    switch (step) {
      case 1: return "Parent/Guardian Details";
      case 2: return "Young Walker Details";
      case 3: return "Location & Preferences";
      case 4: return "Safety & Consent";
      default: return "";
    }
  };

  return (
    <OnboardingLayout showNavigation={false}>
      <SEOHead 
        title="Register Young Walker | Parent Registration | ZiggySitters"
        description="Register your child as a Young Dog Walker on ZiggySitters. Safe, supervised dog walking for ages 12-17."
        canonical="/young-walker-registration"
      />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header Section */}
        <div className="text-center space-y-2 mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold">Young Walker Registration</h1>
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          
          <Alert className="bg-primary/10 border-primary/20 mb-4">
            <Users className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Parents:</strong> This form is for you to register your child ({YOUNG_WALKER_CONFIG.MIN_AGE}-{YOUNG_WALKER_CONFIG.MAX_AGE} years old) as a Young Dog Walker.
            </AlertDescription>
          </Alert>
          
          <p className="text-muted-foreground text-sm sm:text-base">
            Step {step} of {totalSteps}: {getStepTitle()}
          </p>
          
          {/* Progress indicator */}
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2, 3, 4].map(s => (
              <div
                key={s}
                className={`h-2 w-12 rounded-full transition-colors ${
                  s < step ? 'bg-green-500' :
                  s === step ? 'bg-primary' :
                  'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Parent Information */}
        {step === 1 && (
          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Your Details (Parent/Guardian)</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    As the parent, you'll manage your child's account and receive all communications.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="parentName" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Your Full Name
                </Label>
                <Input
                  id="parentName"
                  value={formData.parentName}
                  onChange={(e) => handleInputChange("parentName", e.target.value)}
                  placeholder="Jane Smith"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentEmail" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Your Email
                </Label>
                <Input
                  id="parentEmail"
                  type="email"
                  value={formData.parentEmail}
                  onChange={(e) => handleInputChange("parentEmail", e.target.value)}
                  placeholder="parent@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentPhone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  Your Phone Number
                </Label>
                <Input
                  id="parentPhone"
                  type="tel"
                  value={formData.parentPhone}
                  onChange={(e) => handleInputChange("parentPhone", e.target.value)}
                  placeholder="021 xxx xxxx"
                />
                <p className="text-xs text-muted-foreground">We'll contact you for any booking requests.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Child Information */}
        {step === 2 && (
          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Dog className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <CardTitle>Your Child's Details</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Tell us about the young person who will be walking dogs.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-amber-50 border-amber-200">
                <Sparkles className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-sm text-amber-800">
                  This section is about <strong>your child</strong> who wants to become a Young Dog Walker.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="childFirstName">Child's First Name</Label>
                  <Input
                    id="childFirstName"
                    value={formData.childFirstName}
                    onChange={(e) => handleInputChange("childFirstName", e.target.value)}
                    placeholder="First name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="childLastName">Child's Last Name</Label>
                  <Input
                    id="childLastName"
                    value={formData.childLastName}
                    onChange={(e) => handleInputChange("childLastName", e.target.value)}
                    placeholder="Last name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="childDob">Child's Date of Birth</Label>
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
                <Label htmlFor="experienceWithDogs">Child's Experience with Dogs</Label>
                <Textarea
                  id="experienceWithDogs"
                  value={formData.experienceWithDogs}
                  onChange={(e) => handleInputChange("experienceWithDogs", e.target.value)}
                  placeholder="e.g., We have a family dog, they've walked neighbours' dogs before..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Child's Short Bio (shown to dog owners)</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder="Help your child write a bit about themselves and why they love dogs..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Location & Preferences */}
        {step === 3 && (
          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <MapPin className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle>Location & Preferences</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Set your child's service area and availability.
                  </p>
                </div>
              </div>
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
                <Label>Dog Sizes Your Child Can Walk</Label>
                <div className="flex flex-wrap gap-2">
                  {["small", "medium"].map((size) => (
                    <Badge
                      key={size}
                      variant={formData.acceptedDogSizes.includes(size) ? "default" : "outline"}
                      className="cursor-pointer px-4 py-2"
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
                <Label>Your Child's Availability</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                    <Checkbox 
                      id="afterSchool"
                      checked={formData.availableAfterSchool}
                      onCheckedChange={(checked) => handleInputChange("availableAfterSchool", checked)}
                    />
                    <div>
                      <Label htmlFor="afterSchool" className="font-normal cursor-pointer">After School</Label>
                      <p className="text-xs text-muted-foreground">3pm - 6pm weekdays</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                    <Checkbox 
                      id="weekends"
                      checked={formData.availableWeekends}
                      onCheckedChange={(checked) => handleInputChange("availableWeekends", checked)}
                    />
                    <div>
                      <Label htmlFor="weekends" className="font-normal cursor-pointer">Weekends</Label>
                      <p className="text-xs text-muted-foreground">Saturday & Sunday</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                    <Checkbox 
                      id="schoolHolidays"
                      checked={formData.availableSchoolHolidays}
                      onCheckedChange={(checked) => handleInputChange("availableSchoolHolidays", checked)}
                    />
                    <div>
                      <Label htmlFor="schoolHolidays" className="font-normal cursor-pointer">School Holidays</Label>
                      <p className="text-xs text-muted-foreground">During school breaks</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Safety & Consent */}
        {step === 4 && (
          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <Shield className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <CardTitle>Safety & Parent Consent</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Please review and acknowledge the safety guidelines.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="bg-red-50 border-red-200">
                <Shield className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-sm text-red-800">
                  <strong>Important:</strong> As the parent/guardian, you are responsible for ensuring your child follows these safety guidelines.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <Label className="text-base font-semibold">Safety Checklist</Label>
                <div className="space-y-3">
                  {safetyChecklist.map((item, index) => (
                    <div 
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg border border-muted bg-background"
                    >
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-start space-x-3 p-4 rounded-lg bg-muted/50">
                  <Checkbox 
                    id="safetyAcknowledged"
                    checked={formData.safetyGuidelinesAcknowledged}
                    onCheckedChange={(checked) => handleInputChange("safetyGuidelinesAcknowledged", checked)}
                  />
                  <div>
                    <Label htmlFor="safetyAcknowledged" className="cursor-pointer font-medium">
                      I have read and discussed these safety guidelines with my child
                    </Label>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 rounded-lg bg-muted/50">
                  <Checkbox 
                    id="parentChecklist"
                    checked={formData.parentChecklistCompleted}
                    onCheckedChange={(checked) => handleInputChange("parentChecklistCompleted", checked)}
                  />
                  <div>
                    <Label htmlFor="parentChecklist" className="cursor-pointer font-medium">
                      I confirm my child understands their responsibilities
                    </Label>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <Checkbox 
                    id="parentConsent"
                    checked={formData.parentConsentGiven}
                    onCheckedChange={(checked) => handleInputChange("parentConsentGiven", checked)}
                  />
                  <div>
                    <Label htmlFor="parentConsent" className="cursor-pointer font-medium">
                      I give consent for my child to participate in the Young Walker program
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      By checking this box, I confirm I am the parent or legal guardian.
                    </p>
                  </div>
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
            <Button variant="ghost" onClick={() => navigate("/young-walkers")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Info
            </Button>
          )}

          {step < totalSteps ? (
            <Button onClick={nextStep}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? "Submitting..." : "Submit Registration"}
              <CheckCircle2 className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </OnboardingLayout>
  );
}
