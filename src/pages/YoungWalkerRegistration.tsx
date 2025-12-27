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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Mail,
  Sparkles,
  Camera,
  Image,
  Upload,
  Star,
  Heart
} from "lucide-react";
import OnboardingLayout from "@/components/layout/OnboardingLayout";

interface YoungWalkerFormData {
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  childFirstName: string;
  childLastName: string;
  childDob: string;
  childPhotoUrl: string;
  homeSuburb: string;
  homeCity: string;
  additionalSuburbs: string[];
  ratePerWalk: number;
  maxWalkDurationMins: number;
  serviceRadiusKm: number;
  acceptedDogSizes: string[];
  availableAfterSchool: boolean;
  availableWeekends: boolean;
  availableSchoolHolidays: boolean;
  experienceWithDogs: string;
  bio: string;
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
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const totalSteps = 3;
  
  const [formData, setFormData] = useState<YoungWalkerFormData>({
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    childFirstName: "",
    childLastName: "",
    childDob: "",
    childPhotoUrl: "",
    homeSuburb: "",
    homeCity: "Auckland",
    additionalSuburbs: [],
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

  // Check if already registered
  useEffect(() => {
    const checkExistingRegistration = async () => {
      if (!user) return;
      
      try {
        const { data: existing } = await supabase
          .from("young_walkers")
          .select("id, status")
          .eq("parent_user_id", user.id)
          .maybeSingle();
        
        if (existing) {
          toast({
            title: "Already Registered",
            description: "You've already registered a Young Walker. Redirecting to dashboard...",
          });
          navigate("/young-walker-dashboard");
          return;
        }
      } catch (error) {
        console.error("Error checking existing registration:", error);
      } finally {
        setCheckingExisting(false);
      }
    };
    
    if (user) {
      checkExistingRegistration();
    }
  }, [user, navigate, toast]);

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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please upload an image under 2MB.", variant: "destructive" });
      return;
    }

    setUploadingPhoto(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `young-walker-${user.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      handleInputChange("childPhotoUrl", publicUrl);
      toast({ title: "Photo uploaded!", description: "Looking great!" });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({ title: "Upload failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setUploadingPhoto(false);
    }
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
      case 1:
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
      
      case 2:
        if (!formData.homeSuburb.trim()) {
          toast({ title: "Required", description: "Please enter your suburb.", variant: "destructive" });
          return false;
        }
        return true;
      
      case 3:
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
    if (!validateStep(3)) return;
    if (!user || !profile) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      const { data: youngWalker, error } = await supabase
        .from("young_walkers")
        .insert({
          parent_user_id: user.id,
          parent_profile_id: profile.id,
          profile_id: profile.id,
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

      // Update parent profile avatar if child photo was uploaded
      if (formData.childPhotoUrl) {
        await supabase.from("profiles").update({ avatar_url: formData.childPhotoUrl }).eq("id", profile.id);
      }

      toast({
        title: "🎉 Registration Submitted!",
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

  const stepInfo = [
    { title: "Young Walker", icon: Dog, color: "from-amber-500 to-orange-500" },
    { title: "Location", icon: MapPin, color: "from-emerald-500 to-teal-500" },
    { title: "Safety", icon: Shield, color: "from-rose-500 to-pink-500" },
  ];

  if (checkingExisting) {
    return (
      <OnboardingLayout showNavigation={false}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 flex items-center justify-center mx-auto animate-pulse">
                <Dog className="h-10 w-10 text-white" />
              </div>
              <Sparkles className="h-6 w-6 text-amber-400 absolute -top-1 -right-1 animate-bounce" />
            </div>
            <p className="text-muted-foreground">Checking registration status...</p>
          </div>
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout showNavigation={false}>
      <SEOHead 
        title="Register Young Walker | ZiggySitters"
        description="Register your child as a Young Dog Walker. Safe, supervised dog walking for ages 12-17."
        canonical="/young-walker-registration"
      />

      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/30 to-amber-50/20 dark:from-background dark:via-background dark:to-background">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-emerald-200/30 to-teal-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-amber-200/30 to-orange-200/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />
        
        <div className="container mx-auto px-4 py-8 max-w-2xl relative z-10">
          {/* Hero Header */}
          <div className="text-center space-y-6 mb-10">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-2.5 rounded-full shadow-lg shadow-emerald-500/25">
              <Dog className="h-5 w-5" />
              <span className="font-semibold">Young Walker Program</span>
              <Sparkles className="h-4 w-4" />
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-bold">
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
                Your Child's First Business
              </span>
              <br />
              <span className="text-2xl sm:text-3xl text-muted-foreground">Adventure Starts Here! 🐕</span>
            </h1>
            
            <p className="text-muted-foreground max-w-md mx-auto text-lg">
              Earn <span className="font-semibold text-emerald-600">${YOUNG_WALKER_CONFIG.SUGGESTED_RATE_PER_WALK}</span> per walk while learning responsibility
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-3 mb-8">
            {stepInfo.map((s, i) => (
              <div key={i} className="flex items-center">
                <div className={`relative transition-all duration-300 ${i + 1 === step ? 'scale-110' : ''}`}>
                  <div
                    className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all shadow-lg ${
                      i + 1 < step 
                        ? 'bg-green-500 text-white' 
                        : i + 1 === step 
                        ? `bg-gradient-to-br ${s.color} text-white` 
                        : 'bg-white dark:bg-muted text-muted-foreground border'
                    }`}
                  >
                    {i + 1 < step ? <CheckCircle2 className="h-6 w-6" /> : <s.icon className="h-5 w-5" />}
                  </div>
                  {i + 1 === step && (
                    <div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>
                      {s.title}
                    </div>
                  )}
                </div>
                {i < 3 && (
                  <div className={`h-1 w-8 mx-2 rounded-full transition-colors ${i + 1 < step ? 'bg-green-500' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>

          <div className="mt-12">
            {/* Step 1: Child Information with Photo */}
            {step === 1 && (
              <Card className="border-0 shadow-xl bg-white/80 dark:bg-card/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl text-white shadow-lg shadow-amber-500/25">
                      <Dog className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Young Walker Profile</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Tell us about your future dog walker!
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Photo Upload Section */}
                  <div className="flex flex-col items-center space-y-4 p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-2xl border border-amber-200/50">
                    <div className="relative group">
                      <Avatar className="h-28 w-28 ring-4 ring-white shadow-xl">
                        <AvatarImage src={formData.childPhotoUrl} alt="Child photo" className="object-cover" />
                        <AvatarFallback className="text-3xl bg-gradient-to-br from-amber-400 to-orange-400 text-white">
                          {formData.childFirstName?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        id="child-photo-upload"
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => document.getElementById('child-photo-upload')?.click()}
                        disabled={uploadingPhoto}
                        className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full p-0 shadow-lg"
                      >
                        {uploadingPhoto ? <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Camera className="w-5 h-5" />}
                      </Button>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-amber-800 dark:text-amber-200">Add a friendly photo</p>
                      <p className="text-xs text-amber-600 dark:text-amber-400">Dog owners love to see who'll walk their pup!</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="childFirstName" className="font-medium">First Name</Label>
                      <Input
                        id="childFirstName"
                        value={formData.childFirstName}
                        onChange={(e) => handleInputChange("childFirstName", e.target.value)}
                        placeholder="First name"
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="childLastName" className="font-medium">Last Name</Label>
                      <Input
                        id="childLastName"
                        value={formData.childLastName}
                        onChange={(e) => handleInputChange("childLastName", e.target.value)}
                        placeholder="Last name"
                        className="h-12"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="childDob" className="flex items-center gap-2 font-medium">
                      <Calendar className="h-4 w-4 text-amber-500" />
                      Date of Birth
                    </Label>
                    <Input
                      id="childDob"
                      type="date"
                      value={formData.childDob}
                      onChange={(e) => handleInputChange("childDob", e.target.value)}
                      className="h-12"
                    />
                    <p className="text-sm text-muted-foreground">
                      Ages {YOUNG_WALKER_CONFIG.MIN_AGE}-{YOUNG_WALKER_CONFIG.MAX_AGE} only
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="experienceWithDogs" className="flex items-center gap-2 font-medium">
                      <Heart className="h-4 w-4 text-rose-500" />
                      Experience with Dogs
                    </Label>
                    <Textarea
                      id="experienceWithDogs"
                      value={formData.experienceWithDogs}
                      onChange={(e) => handleInputChange("experienceWithDogs", e.target.value)}
                      placeholder="e.g., We have a family dog, they've walked neighbours' dogs..."
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="flex items-center gap-2 font-medium">
                      <Star className="h-4 w-4 text-amber-500" />
                      About Your Child
                    </Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      placeholder="Help your child write about themselves and why they love dogs..."
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Location & Preferences */}
            {step === 2 && (
              <Card className="border-0 shadow-xl bg-white/80 dark:bg-card/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl text-white shadow-lg shadow-emerald-500/25">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Location & Preferences</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Where and when can your child walk dogs?
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="homeSuburb" className="font-medium">Primary Suburb</Label>
                      <Input
                        id="homeSuburb"
                        value={formData.homeSuburb}
                        onChange={(e) => handleInputChange("homeSuburb", e.target.value)}
                        placeholder="e.g., Ponsonby"
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="homeCity" className="font-medium">City</Label>
                      <Input
                        id="homeCity"
                        value={formData.homeCity}
                        onChange={(e) => handleInputChange("homeCity", e.target.value)}
                        placeholder="Auckland"
                        className="h-12"
                      />
                    </div>
                  </div>

                  {/* Additional Suburbs */}
                  <div className="space-y-3 p-4 bg-muted/50 rounded-xl">
                    <Label className="font-medium">Additional Suburbs <span className="text-muted-foreground font-normal">(optional)</span></Label>
                    <div className="flex flex-wrap gap-2 min-h-[32px]">
                      {formData.additionalSuburbs.map((suburb, index) => (
                        <Badge key={index} variant="secondary" className="px-3 py-1.5 gap-1 bg-white dark:bg-muted">
                          {suburb}
                          <button 
                            onClick={() => handleInputChange("additionalSuburbs", formData.additionalSuburbs.filter((_, i) => i !== index))}
                            className="ml-1 hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <Input
                      placeholder="Type suburb and press Enter..."
                      className="h-10"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const value = (e.target as HTMLInputElement).value.trim();
                          if (value && !formData.additionalSuburbs.includes(value)) {
                            handleInputChange("additionalSuburbs", [...formData.additionalSuburbs, value]);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="font-medium">Dog Sizes</Label>
                    <div className="flex flex-wrap gap-3">
                      {["small", "medium"].map((size) => (
                        <Badge
                          key={size}
                          variant={formData.acceptedDogSizes.includes(size) ? "default" : "outline"}
                          className={`cursor-pointer px-5 py-2.5 text-sm transition-all ${
                            formData.acceptedDogSizes.includes(size) 
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 border-0 shadow-lg' 
                              : 'hover:border-emerald-300'
                          }`}
                          onClick={() => {
                            const newSizes = formData.acceptedDogSizes.includes(size)
                              ? formData.acceptedDogSizes.filter(s => s !== size)
                              : [...formData.acceptedDogSizes, size];
                            handleInputChange("acceptedDogSizes", newSizes);
                          }}
                        >
                          {size === 'small' ? '🐕 Small' : '🐕‍🦺 Medium'}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="font-medium">Availability</Label>
                    <div className="grid gap-3">
                      {[
                        { id: "afterSchool", label: "After School", sublabel: "3pm - 6pm weekdays", checked: formData.availableAfterSchool, field: "availableAfterSchool" },
                        { id: "weekends", label: "Weekends", sublabel: "Saturday & Sunday", checked: formData.availableWeekends, field: "availableWeekends" },
                        { id: "schoolHolidays", label: "School Holidays", sublabel: "During school breaks", checked: formData.availableSchoolHolidays, field: "availableSchoolHolidays" },
                      ].map((item) => (
                        <div key={item.id} className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${item.checked ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' : 'border-muted hover:border-muted-foreground/30'}`}
                          onClick={() => handleInputChange(item.field as keyof YoungWalkerFormData, !item.checked)}>
                          <Checkbox id={item.id} checked={item.checked} onCheckedChange={(checked) => handleInputChange(item.field as keyof YoungWalkerFormData, checked)} />
                          <div>
                            <Label htmlFor={item.id} className="font-medium cursor-pointer">{item.label}</Label>
                            <p className="text-xs text-muted-foreground">{item.sublabel}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Safety & Consent */}
            {step === 3 && (
              <Card className="border-0 shadow-xl bg-white/80 dark:bg-card/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl text-white shadow-lg shadow-rose-500/25">
                      <Shield className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Safety & Consent</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Please review the safety guidelines
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Alert className="bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800">
                    <Shield className="h-4 w-4 text-rose-600" />
                    <AlertDescription className="text-sm text-rose-800 dark:text-rose-200">
                      <strong>Important:</strong> As the parent/guardian, you are responsible for ensuring your child follows these safety guidelines.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Safety Checklist</Label>
                    <div className="space-y-2">
                      {safetyChecklist.map((item, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-100 dark:border-green-900">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t">
                    {[
                      { id: "safetyAcknowledged", label: "I have read and discussed these safety guidelines with my child", field: "safetyGuidelinesAcknowledged", checked: formData.safetyGuidelinesAcknowledged },
                      { id: "parentChecklist", label: "I confirm my child understands their responsibilities", field: "parentChecklistCompleted", checked: formData.parentChecklistCompleted },
                    ].map((item) => (
                      <div key={item.id} className={`flex items-start space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${item.checked ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 'border-muted'}`}
                        onClick={() => handleInputChange(item.field as keyof YoungWalkerFormData, !item.checked)}>
                        <Checkbox id={item.id} checked={item.checked} onCheckedChange={(checked) => handleInputChange(item.field as keyof YoungWalkerFormData, checked)} className="mt-0.5" />
                        <Label htmlFor={item.id} className="cursor-pointer font-medium">{item.label}</Label>
                      </div>
                    ))}

                    <div className={`flex items-start space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${formData.parentConsentGiven ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/20' : 'border-rose-200 bg-rose-50/50 dark:bg-rose-950/10'}`}
                      onClick={() => handleInputChange("parentConsentGiven", !formData.parentConsentGiven)}>
                      <Checkbox id="parentConsent" checked={formData.parentConsentGiven} onCheckedChange={(checked) => handleInputChange("parentConsentGiven", checked)} className="mt-0.5" />
                      <div>
                        <Label htmlFor="parentConsent" className="cursor-pointer font-semibold text-rose-800 dark:text-rose-200">
                          I give consent for my child to participate in the Young Walker program
                        </Label>
                        <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                          By checking this box, I confirm I am the parent or legal guardian.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between mt-8">
              {step > 1 ? (
                <Button variant="outline" onClick={prevStep} size="lg" className="shadow-sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
              ) : (
                <Button variant="ghost" onClick={() => navigate("/young-walkers")} size="lg">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              )}

              {step < totalSteps ? (
                <Button onClick={nextStep} size="lg" className="shadow-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600">
                  Next Step
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={isLoading}
                  size="lg"
                  className="shadow-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  {isLoading ? "Submitting..." : "Complete Registration"}
                  <CheckCircle2 className="ml-2 h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
}
