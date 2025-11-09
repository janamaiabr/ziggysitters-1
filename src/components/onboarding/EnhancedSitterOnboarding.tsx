import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Upload, PlusCircle, X, Shield, Calendar, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format, eachDayOfInterval, parseISO } from 'date-fns';

interface Service {
  service_type: 'drop_in_visits' | 'pet_sitting_owners_home' | 'pet_sitting_sitters_home';
  hourly_rate?: number;
  daily_rate?: number;
  overnight_rate?: number;
  description: string;
}

interface EnhancedSitterOnboardingProps {
  profileId: string;
  userId: string;
  onComplete: (sitterId: string) => void;
}

const petSpecies = ['dog', 'cat', 'bird', 'reptile', 'rabbit', 'horse'];
const petSizes = ['small', 'medium', 'large', 'extra_large'];

const serviceTypes = [
  { key: 'pet_sitting_owners_home', label: 'Pet Sitting (Your Home)', rate_types: ['daily_rate'], unit: '/day/pet' },
  { key: 'pet_sitting_sitters_home', label: 'Pet Sitting (Sitter\'s Home)', rate_types: ['daily_rate'], unit: '/day/pet' },
  /* DOG_WALKING */ // { key: 'dog_walking', label: 'Dog Walking', rate_types: ['hourly_rate'], unit: '/hour/pet' }, /* END_DOG_WALKING */
  { key: 'drop_in_visits', label: 'Drop-in Visits', rate_types: ['hourly_rate'], unit: '/visit' }
];

export default function EnhancedSitterOnboarding({ profileId, userId, onComplete }: EnhancedSitterOnboardingProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4; // Updated to 4 steps
  
  // Overview
  const [bio, setBio] = useState('');
  const [experienceYears, setExperienceYears] = useState(0);
  
  // Services
  const [services, setServices] = useState<Service[]>([]);
  const [hasFencedYard, setHasFencedYard] = useState(false);
  const [maxPets, setMaxPets] = useState(1);
  const [acceptedSpecies, setAcceptedSpecies] = useState<string[]>(['dog']);
  const [acceptedSizes, setAcceptedSizes] = useState<string[]>(['small', 'medium']);
  const [allowsPuppies, setAllowsPuppies] = useState(true);
  const [allowsSeniorPets, setAllowsSeniorPets] = useState(true);
  
  // Calendar/Availability 
  const [unavailableDates, setUnavailableDates] = useState<{startDate: string, endDate: string}[]>([]);
  const [newUnavailableStart, setNewUnavailableStart] = useState('');
  const [newUnavailableEnd, setNewUnavailableEnd] = useState('');
  
  // Portfolio
  const [portfolioPhotos, setPortfolioPhotos] = useState<string[]>([]);
  
  // Verification docs
  const [idDocumentUrl, setIdDocumentUrl] = useState<string>('');
  const [blueCardUrl, setBlueCardUrl] = useState<string>('');

  const toggleSpecies = (species: string) => {
    setAcceptedSpecies(prev => 
      prev.includes(species) 
        ? prev.filter(s => s !== species)
        : [...prev, species]
    );
  };

  const toggleSize = (size: string) => {
    setAcceptedSizes(prev => 
      prev.includes(size) 
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  const addService = (serviceType: any) => {
    if (!services.find(s => s.service_type === serviceType.key)) {
      setServices(prev => [...prev, {
        service_type: serviceType.key,
        hourly_rate: serviceType.rate_types.includes('hourly_rate') ? 25 : undefined,
        daily_rate: serviceType.rate_types.includes('daily_rate') ? 80 : undefined,
        overnight_rate: serviceType.rate_types.includes('overnight_rate') ? 60 : undefined,
        description: ''
      }]);
    }
  };

  const removeService = (serviceType: string) => {
    setServices(prev => prev.filter(s => s.service_type !== serviceType));
  };

  const updateService = (serviceType: string, field: keyof Service, value: any) => {
    setServices(prev => prev.map(service =>
      service.service_type === serviceType
        ? { ...service, [field]: value }
        : service
    ));
  };

  const handleFileUpload = async (files: FileList | null, type: 'portfolio' | 'id' | 'blue_card') => {
    if (!files) return;

    try {
      if (type === 'portfolio') {
        const uploadPromises = Array.from(files).map(async (file, index) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${userId}/portfolio/${Date.now()}-${index}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('profile-photos')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('profile-photos')
            .getPublicUrl(fileName);

          return publicUrl;
        });

        const uploadedUrls = await Promise.all(uploadPromises);
        setPortfolioPhotos(prev => [...prev, ...uploadedUrls]);
        
        toast({
          title: "Portfolio photos uploaded!",
          description: `${uploadedUrls.length} photos added to your portfolio.`,
        });
      } else {
        // Handle document uploads
        const file = files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${type}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('verification-docs')
          .upload(fileName, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('verification-docs')
          .getPublicUrl(fileName);

        if (type === 'id') {
          setIdDocumentUrl(publicUrl);
        } else if (type === 'blue_card') {
          setBlueCardUrl(publicUrl);
        }
        
        toast({
          title: `${type === 'id' ? 'ID' : 'Police Vet Check'} document uploaded!`,
          description: "Document uploaded successfully.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSaveAndComplete = async () => {
    try {
      // Validate required fields - bio is now optional, no minimum requirement
      if (bio.trim().length > 5000) {
        toast({
          title: "Bio too long",
          description: "Please keep your bio under 5000 characters.",
          variant: "destructive",
        });
        setCurrentStep(1);
        return;
      }

      if (services.length === 0) {
        toast({
          title: "Services required",
          description: "Please add at least one service you offer.",
          variant: "destructive",
        });
        setCurrentStep(2);
        return;
      }

      // Validate service rates
      for (const service of services) {
        const hasValidRate = service.hourly_rate || service.daily_rate || service.overnight_rate;
        if (!hasValidRate) {
          toast({
            title: "Invalid service rate",
            description: `Please set a rate for ${serviceTypes.find(st => st.key === service.service_type)?.label}`,
            variant: "destructive",
          });
          setCurrentStep(2);
          return;
        }
      }

      // Update profile with bio and verification documents
      await supabase
        .from('profiles')
        .update({ 
          bio,
          id_document_url: idDocumentUrl,
          blue_card_document_url: blueCardUrl,
          verification_documents_uploaded_at: (idDocumentUrl || blueCardUrl) ? new Date().toISOString() : null
        })
        .eq('user_id', userId);

      // Save services
      for (const service of services) {
        const serviceData = {
          sitter_id: profileId,
          service_type: service.service_type,
          description: service.description,
          experience_years: experienceYears,
          has_fenced_yard: hasFencedYard,
          accepted_pet_species: acceptedSpecies as any,
          accepted_pet_sizes: acceptedSizes as any,
          allows_senior_pets: allowsSeniorPets,
          allows_puppies: allowsPuppies,
          max_pets: maxPets,
          hourly_rate: service.hourly_rate,
          daily_rate: service.daily_rate,
          overnight_rate: service.overnight_rate
        };

        await supabase
          .from('sitter_services')
          .upsert(serviceData, {
            onConflict: 'sitter_id,service_type'
          });
      }

      // Save unavailable dates
      if (unavailableDates.length > 0) {
        const allDates: string[] = [];
        
        // Generate all dates from each date range
        unavailableDates.forEach(range => {
          const start = parseISO(range.startDate);
          const end = parseISO(range.endDate);
          const datesInRange = eachDayOfInterval({ start, end });
          datesInRange.forEach(date => {
            allDates.push(format(date, 'yyyy-MM-dd'));
          });
        });

        // Remove duplicates
        const uniqueDates = [...new Set(allDates)];

        const availabilityData = uniqueDates.map(date => ({
          sitter_id: profileId,
          date: date,
          is_available: false
        }));

        await supabase
          .from('sitter_availability')
          .upsert(availabilityData, {
            onConflict: 'sitter_id,date'
          });
      }


      // Send email notification about verification request
      try {
        await supabase.functions.invoke('send-verification-request-email', {
          body: {
            user_id: userId,
            documents_uploaded: !!(idDocumentUrl || blueCardUrl)
          }
        });
        
        // Send reminder email for police vet if not uploaded
        if (!blueCardUrl) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('email, first_name, last_name')
            .eq('user_id', userId)
            .single();
            
          if (profileData) {
            await supabase.functions.invoke('send-police-vet-reminder', {
              body: {
                user_email: profileData.email,
                user_name: `${profileData.first_name} ${profileData.last_name}`
              }
            });
          }
        }
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
      }

      // Show Stripe Connect onboarding prompt
      toast({
        title: "Profile saved!",
        description: "Now let's set up your payment account so you can get paid.",
        duration: 5000,
      });

      // Wait a moment then trigger Stripe Connect
      setTimeout(async () => {
        try {
          const { data: onboardingData, error: onboardingError } = await supabase.functions.invoke(
            'stripe-connect-onboarding'
          );

          if (onboardingError) throw onboardingError;

          if (onboardingData?.url) {
            window.open(onboardingData.url, '_blank');
            toast({
              title: "Complete Stripe setup",
              description: "A new tab has opened. Please complete your payment account setup to receive payouts.",
              duration: 10000,
            });
          }
        } catch (error: any) {
          console.error('Stripe Connect error:', error);
          
          // Check if this is the platform profile setup error
          const errorMessage = error?.message || '';
          const isPlatformSetupError = errorMessage.includes('platform-profile') || 
                                        errorMessage.includes('managing losses for connected accounts');
          
          if (isPlatformSetupError) {
            toast({
              title: "Platform Setup In Progress",
              description: "We're still setting up the payment system. You can set up your payment account from your profile once it's ready.",
              duration: 8000,
            });
          } else {
            toast({
              title: "Payment setup notice",
              description: "You can set up your payment account later from your profile.",
              variant: "default",
            });
          }
        }
      }, 1000);

      onComplete(profileId);
    } catch (error: any) {
      toast({
        title: "Error saving sitter profile",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return true; // Overview is always valid (bio optional)
      case 2:
        return services.length > 0 && services.every(s => s.hourly_rate || s.daily_rate || s.overnight_rate);
      case 3:
        return true; // Calendar is optional
      case 4:
        return idDocumentUrl || blueCardUrl; // At least one document
      default:
        return false;
    }
  };

  const handleNextStep = () => {
    if (!isStepValid(currentStep)) {
      if (currentStep === 2) {
        toast({
          title: "Services required",
          description: "Please add at least one service with rates before continuing.",
          variant: "destructive",
        });
      } else if (currentStep === 4) {
        toast({
          title: "Document required",
          description: "Please upload at least one verification document.",
          variant: "destructive",
        });
      }
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  return (
    <div className="space-y-6 px-2 sm:px-0">
      <div className="text-center space-y-2">
        <h2 className="text-xl sm:text-2xl font-bold">Complete Your Sitter Profile</h2>
        <p className="text-muted-foreground text-sm sm:text-base">
          Step {currentStep} of {totalSteps}: {
            currentStep === 1 ? 'About You' :
            currentStep === 2 ? 'Services & Pricing' :
            currentStep === 3 ? 'Calendar & Availability' :
            'Verification'
          }
        </p>
        <div className="flex justify-center gap-2 mt-4">
          {[1, 2, 3, 4].map(step => (
            <div
              key={step}
              className={`h-2 w-12 rounded-full ${
                step < currentStep ? 'bg-green-500' :
                step === currentStep ? 'bg-primary' :
                'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step 1: Overview */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>About You</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                placeholder="Tell pet owners about yourself, your experience with pets, and why you love caring for animals..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground">Optional - share your experience and passion for pet care</p>
            </div>
            
            <div className="space-y-2">
              <Label>Years of Experience with Pets</Label>
              <Input
                type="number"
                min="0"
                max="50"
                value={experienceYears}
                onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label>Portfolio Photos (Optional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileUpload(e.target.files, 'portfolio')}
                  className="hidden"
                  id="portfolio-photos"
                />
                <Label htmlFor="portfolio-photos" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg hover:border-gray-400">
                    <Upload className="w-4 h-4" />
                    <span>Upload Photos</span>
                  </div>
                </Label>
              </div>
              {portfolioPhotos.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {portfolioPhotos.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Portfolio photo ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Services */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Services & Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription className="space-y-2">
                <div>
                  <strong>Pricing Information:</strong>
                </div>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li><strong>Your Earnings:</strong> You receive 100% of your set rate</li>
                  <li><strong>Platform Fee:</strong> ZiggySitters adds a 10% listing fee to the pet owner's total (not deducted from your earnings)</li>
                  <li><strong>Suggested Rates:</strong> Hourly: $15-25 | Daily: $35-60 | Overnight: $45-80</li>
                </ul>
                <div className="text-sm mt-2">
                  <strong>What's Typically Included:</strong> Basic care, feeding, exercise, updates to owner
                  <br />
                  <strong>Not Included:</strong> Pet food, medications, vet visits, grooming (unless specified)
                </div>
              </AlertDescription>
            </Alert>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Maximum Pets at Once</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={maxPets}
                  onChange={(e) => setMaxPets(parseInt(e.target.value) || 1)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="fenced-yard"
                  checked={hasFencedYard}
                  onCheckedChange={(checked) => setHasFencedYard(checked === true)}
                />
                <Label htmlFor="fenced-yard">I have a fenced yard</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allows-puppies"
                  checked={allowsPuppies}
                  onCheckedChange={(checked) => setAllowsPuppies(checked === true)}
                />
                <Label htmlFor="allows-puppies">I'm comfortable with puppies</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allows-seniors"
                  checked={allowsSeniorPets}
                  onCheckedChange={(checked) => setAllowsSeniorPets(checked === true)}
                />
                <Label htmlFor="allows-seniors">I'm comfortable with senior pets</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Pet Species I Accept *</Label>
              <div className="flex flex-wrap gap-2">
                {petSpecies.map(species => (
                  <Badge
                    key={species}
                    variant={acceptedSpecies.includes(species) ? "default" : "outline"}
                    className="cursor-pointer capitalize"
                    onClick={() => toggleSpecies(species)}
                  >
                    {species.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Pet Sizes I Accept *</Label>
              <div className="flex flex-wrap gap-2">
                {petSizes.map(size => (
                  <Badge
                    key={size}
                    variant={acceptedSizes.includes(size) ? "default" : "outline"}
                    className="cursor-pointer capitalize"
                    onClick={() => toggleSize(size)}
                  >
                    {size.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Services Offered *</Label>
              <div className="flex flex-wrap gap-2">
                {serviceTypes.map(serviceType => (
                  <Badge
                    key={serviceType.key}
                    variant={services.find(s => s.service_type === serviceType.key) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      if (services.find(s => s.service_type === serviceType.key)) {
                        removeService(serviceType.key);
                      } else {
                        addService(serviceType);
                      }
                    }}
                  >
                    {serviceType.label}
                  </Badge>
                ))}
              </div>
            </div>

            {services.map(service => {
              const serviceType = serviceTypes.find(st => st.key === service.service_type);
              return (
                <Card key={service.service_type} className="bg-gray-50">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{serviceType?.label}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeService(service.service_type)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {serviceType?.rate_types.includes('hourly_rate') && (
                <div className="space-y-1">
                  <Label className="text-xs">Hourly Rate (NZ$)</Label>
                  <Input
                    type="number"
                    min="10"
                    max="200"
                    placeholder="Suggested: $15-25"
                    value={service.hourly_rate || ''}
                    onChange={(e) => updateService(service.service_type, 'hourly_rate', parseFloat(e.target.value) || undefined)}
                  />
                </div>
              )}
              {serviceType?.rate_types.includes('daily_rate') && (
                <div className="space-y-1">
                  <Label className="text-xs">Daily Rate (NZ$)</Label>
                  <Input
                    type="number"
                    min="30"
                    max="500"
                    placeholder="Suggested: $35-60"
                    value={service.daily_rate || ''}
                    onChange={(e) => updateService(service.service_type, 'daily_rate', parseFloat(e.target.value) || undefined)}
                  />
                </div>
              )}
              {serviceType?.rate_types.includes('overnight_rate') && (
                <div className="space-y-1">
                  <Label className="text-xs">Overnight Rate (NZ$)</Label>
                  <Input
                    type="number"
                    min="40"
                    max="300"
                    placeholder="Suggested: $45-80"
                    value={service.overnight_rate || ''}
                    onChange={(e) => updateService(service.service_type, 'overnight_rate', parseFloat(e.target.value) || undefined)}
                  />
                </div>
              )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs">Service Description</Label>
                      <Textarea
                        placeholder="Describe what this service includes..."
                        value={service.description}
                        onChange={(e) => updateService(service.service_type, 'description', e.target.value)}
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Calendar & Availability */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Calendar & Availability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Calendar className="h-4 w-4" />
              <AlertDescription>
                Block out dates when you're unavailable. This helps pet owners know when you can take bookings. You can skip this step and update it later from your profile.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              <Label>Add Unavailable Date Ranges (Optional)</Label>
              <p className="text-sm text-muted-foreground">
                Select start and end dates to block out periods when you're not available.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="start-date" className="text-sm">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={newUnavailableStart}
                    onChange={(e) => setNewUnavailableStart(e.target.value)}
                    min={format(new Date(), 'yyyy-MM-dd')}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="end-date" className="text-sm">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={newUnavailableEnd}
                    onChange={(e) => setNewUnavailableEnd(e.target.value)}
                    min={newUnavailableStart || format(new Date(), 'yyyy-MM-dd')}
                  />
                </div>
              </div>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (newUnavailableStart && newUnavailableEnd) {
                    if (new Date(newUnavailableEnd) >= new Date(newUnavailableStart)) {
                      setUnavailableDates([...unavailableDates, {
                        startDate: newUnavailableStart,
                        endDate: newUnavailableEnd
                      }]);
                      setNewUnavailableStart('');
                      setNewUnavailableEnd('');
                      toast({
                        title: "Date range added",
                        description: "Your unavailable dates have been saved.",
                      });
                    } else {
                      toast({
                        title: "Invalid date range",
                        description: "End date must be after start date.",
                        variant: "destructive",
                      });
                    }
                  }
                }}
                disabled={!newUnavailableStart || !newUnavailableEnd}
                className="w-full sm:w-auto"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Date Range
              </Button>
              
              {unavailableDates.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Unavailable Periods:</Label>
                  <div className="space-y-2">
                    {unavailableDates.map((range, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="text-sm">
                          {format(parseISO(range.startDate), 'MMM d, yyyy')} - {format(parseISO(range.endDate), 'MMM d, yyyy')}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setUnavailableDates(unavailableDates.filter((_, i) => i !== index));
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Verification */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Verification Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Upload verification documents to build trust with pet owners. At least one document is required.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Photo ID (Driver's License, Passport, etc.)</Label>
                <Input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload(e.target.files, 'id')}
                  id="id-document"
                />
                {idDocumentUrl && (
                  <p className="text-sm text-green-600">✓ ID document uploaded</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Police Vet Check</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Required: NZ Police Vetting Service check. <a href="https://www.police.govt.nz/advice-services/businesses-and-organisations/nz-police-vetting-service/forms-and-guides" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Get your police vet here</a>
                </p>
                <Input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload(e.target.files, 'blue_card')}
                  id="police-vet"
                />
                {blueCardUrl && (
                  <p className="text-sm text-green-600">✓ Police Vet uploaded</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-4">
        <Button
          variant="outline"
          onClick={handlePrevStep}
          disabled={currentStep === 1}
        >
          Back
        </Button>

        {currentStep < totalSteps ? (
          <Button
            onClick={handleNextStep}
            disabled={!isStepValid(currentStep)}
          >
            Continue
          </Button>
        ) : (
          <Button 
            onClick={handleSaveAndComplete}
            disabled={!isStepValid(1) || !isStepValid(2) || !isStepValid(4)}
            className="px-8"
          >
            Complete Profile & Submit for Approval
          </Button>
        )}
      </div>
    </div>
  );
}