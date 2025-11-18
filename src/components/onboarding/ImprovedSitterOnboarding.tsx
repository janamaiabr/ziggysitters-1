import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, PlusCircle, X, Shield, Calendar, Trash2, DollarSign, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
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

interface ImprovedSitterOnboardingProps {
  profileId: string;
  userId: string;
  onComplete: (sitterId: string) => void;
  overallStep?: number; // The overall step number from parent (3-7)
  onStepChange?: (newStep: number) => void; // Callback to update parent step
}

const petSpecies = ['dog', 'cat', 'bird', 'reptile', 'rabbit', 'horse'];
const petSizes = ['small', 'medium', 'large', 'extra_large'];

const serviceTypes = [
  { key: 'pet_sitting_owners_home', label: 'Pet Sitting (Your Home)', rate_types: ['daily_rate'], suggestedDaily: 50, unit: '/day/pet' },
  { key: 'pet_sitting_sitters_home', label: 'Pet Sitting (Sitter\'s Home)', rate_types: ['daily_rate'], suggestedDaily: 60, unit: '/day/pet' },
  /* DOG_WALKING */ // { key: 'dog_walking', label: 'Dog Walking', rate_types: ['hourly_rate'], suggestedHourly: 25, unit: '/hour/pet' }, /* END_DOG_WALKING */
  { key: 'drop_in_visits', label: 'Drop-in Visits', rate_types: ['hourly_rate'], suggestedHourly: 30, unit: '/visit' }
];

export default function ImprovedSitterOnboarding({ profileId, userId, onComplete, overallStep, onStepChange }: ImprovedSitterOnboardingProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(() => {
    const saved = localStorage.getItem('sitter_onboarding_step');
    return saved ? parseInt(saved) : 1;
  });
  const totalSteps = 5; // Experience, Services, Calendar, Verification, Payment Setup
  
  // Load saved data from localStorage
  const loadSavedData = () => {
    const saved = localStorage.getItem('sitter_onboarding_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved sitter onboarding data', e);
      }
    }
    return {};
  };

  const savedData = loadSavedData();
  
  // Step 1: Experience
  const [bio, setBio] = useState(savedData.bio || '');
  const [experienceYears, setExperienceYears] = useState(savedData.experienceYears || 0);
  const [portfolioPhotos, setPortfolioPhotos] = useState<string[]>(savedData.portfolioPhotos || []);
  
  // Step 2: Services & Pricing
  const [services, setServices] = useState<Service[]>(savedData.services || []);
  const [hasFencedYard, setHasFencedYard] = useState(savedData.hasFencedYard || false);
  const [maxPets, setMaxPets] = useState(savedData.maxPets || 1);
  const [acceptedSpecies, setAcceptedSpecies] = useState<string[]>(savedData.acceptedSpecies || ['dog']);
  const [acceptedSizes, setAcceptedSizes] = useState<string[]>(savedData.acceptedSizes || ['small', 'medium']);
  const [allowsPuppies, setAllowsPuppies] = useState(savedData.allowsPuppies ?? true);
  const [allowsSeniorPets, setAllowsSeniorPets] = useState(savedData.allowsSeniorPets ?? true);
  
  // Step 3: Calendar/Availability
  const [unavailableDates, setUnavailableDates] = useState<{startDate: string, endDate: string}[]>(savedData.unavailableDates || []);
  const [newUnavailableStart, setNewUnavailableStart] = useState('');
  const [newUnavailableEnd, setNewUnavailableEnd] = useState('');
  
  // Step 4: Verification docs
  const [idDocumentUrl, setIdDocumentUrl] = useState<string>(savedData.idDocumentUrl || '');
  const [blueCardUrl, setBlueCardUrl] = useState<string>(savedData.blueCardUrl || '');
  
  // Step 5: Payment setup flag
  const [paymentSetupCompleted, setPaymentSetupCompleted] = useState(savedData.paymentSetupCompleted || false);
  const [isLoading, setIsLoading] = useState(false);

  // Save to localStorage whenever data changes
  useEffect(() => {
    const dataToSave = {
      bio,
      experienceYears,
      portfolioPhotos,
      services,
      hasFencedYard,
      maxPets,
      acceptedSpecies,
      acceptedSizes,
      allowsPuppies,
      allowsSeniorPets,
      unavailableDates,
      idDocumentUrl,
      blueCardUrl,
      paymentSetupCompleted
    };
    localStorage.setItem('sitter_onboarding_data', JSON.stringify(dataToSave));
    console.log('Saved to localStorage. Services count:', services.length);
    if (services.length > 0) {
      console.log('Service rates:', services.map(s => ({ 
        type: s.service_type, 
        hourly: s.hourly_rate, 
        daily: s.daily_rate 
      })));
    }
  }, [bio, experienceYears, portfolioPhotos, services, hasFencedYard, maxPets, acceptedSpecies, acceptedSizes, allowsPuppies, allowsSeniorPets, unavailableDates, idDocumentUrl, blueCardUrl, paymentSetupCompleted]);
  
  // Load existing data from database on mount (only if not already in state)
  useEffect(() => {
    const loadExistingData = async () => {
      if (!profileId) return;
      
      try {
        console.log('Loading existing sitter data from database...');
        
        // Load profile data - only set if current state is empty
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('bio, id_document_url, blue_card_document_url')
          .eq('id', profileId)
          .single();
        
        if (profileError) throw profileError;
        
        if (profileData) {
          if (profileData.bio && !bio) setBio(profileData.bio);
          if (profileData.id_document_url && !idDocumentUrl) setIdDocumentUrl(profileData.id_document_url);
          if (profileData.blue_card_document_url && !blueCardUrl) setBlueCardUrl(profileData.blue_card_document_url);
        }
        
        // Load services - only if current services array is empty
        if (services.length === 0) {
          const { data: servicesData, error: servicesError } = await supabase
            .from('sitter_services')
            .select('*')
            .eq('sitter_id', profileId);
          
          if (servicesError) throw servicesError;
          
          if (servicesData && servicesData.length > 0) {
            console.log('Loaded', servicesData.length, 'services from database');
            console.log('Services data:', JSON.stringify(servicesData.map(s => ({ 
              type: s.service_type, 
              hourly: s.hourly_rate, 
              daily: s.daily_rate 
            }))));
            
            const loadedServices = servicesData.map(s => ({
              service_type: s.service_type,
              // Preserve numeric values including 0, only use undefined for null
              hourly_rate: s.hourly_rate !== null ? s.hourly_rate : undefined,
              daily_rate: s.daily_rate !== null ? s.daily_rate : undefined,
              overnight_rate: s.overnight_rate !== null ? s.overnight_rate : undefined,
              description: s.description || ''
            }));
            setServices(loadedServices);
            
            console.log('Loaded services state:', JSON.stringify(loadedServices.map(s => ({ 
              type: s.service_type, 
              hourly: s.hourly_rate, 
              daily: s.daily_rate 
            }))));
            
            // Load common fields from first service
            if (servicesData[0]) {
              setExperienceYears(servicesData[0].experience_years || 0);
              setHasFencedYard(servicesData[0].has_fenced_yard || false);
              setMaxPets(servicesData[0].max_pets || 1);
              setAcceptedSpecies(servicesData[0].accepted_pet_species || ['dog']);
              setAcceptedSizes(servicesData[0].accepted_pet_sizes || ['small', 'medium']);
              setAllowsPuppies(servicesData[0].allows_puppies ?? true);
              setAllowsSeniorPets(servicesData[0].allows_senior_pets ?? true);
            }
          }
        }
        
        console.log('Existing data loaded from database');
      } catch (error) {
        console.error('Error loading existing data:', error);
        // Don't show error to user, just continue with localStorage data
      }
    };
    
    loadExistingData();
  }, [profileId]); // Only depend on profileId, not on the state values

  // Save step to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sitter_onboarding_step', currentStep.toString());
  }, [currentStep]);

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
        hourly_rate: serviceType.suggestedHourly || undefined,
        daily_rate: serviceType.suggestedDaily || undefined,
        overnight_rate: serviceType.suggestedOvernight || undefined,
        description: ''
      }]);
    }
  };

  const removeService = (serviceType: string) => {
    setServices(prev => prev.filter(s => s.service_type !== serviceType));
  };

  const updateService = (serviceType: string, field: keyof Service, value: any) => {
    console.log(`🔧 updateService called: ${serviceType}, field: ${field}, value:`, value, typeof value);
    setServices(prev => {
      const updated = prev.map(service =>
        service.service_type === serviceType
          ? { ...service, [field]: value }
          : service
      );
      console.log(`📝 Services after update:`, JSON.stringify(updated.map(s => ({ 
        type: s.service_type, 
        hourly: s.hourly_rate, 
        daily: s.daily_rate,
        overnight: s.overnight_rate 
      }))));
      return updated;
    });
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
          description: `${uploadedUrls.length} photos added.`,
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
          title: `${type === 'id' ? 'ID' : 'Police Vet'} uploaded!`,
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

  const handleSaveProgress = async () => {
    console.log('=== handleSaveProgress called ===');
    console.log('ProfileId:', profileId);
    console.log('UserId:', userId);
    console.log('Services to save:', services.length);
    console.log('📊 Services state before save:', JSON.stringify(services.map(s => ({ 
      type: s.service_type, 
      hourly: s.hourly_rate, 
      daily: s.daily_rate,
      overnight: s.overnight_rate 
    }))));
    
    // CRITICAL VALIDATION: Check profileId exists
    if (!profileId || profileId === '') {
      const error = new Error('CRITICAL ERROR: profileId is empty! Cannot save services without a valid profileId.');
      console.error(error);
      toast({
        title: "Profile ID Missing",
        description: "Your profile ID is missing. Please go back to the previous step and try again.",
        variant: "destructive",
      });
      throw error;
    }
    
    try {
      // Save bio and documents
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          bio,
          id_document_url: idDocumentUrl,
          blue_card_document_url: blueCardUrl,
          verification_documents_uploaded_at: (idDocumentUrl || blueCardUrl) ? new Date().toISOString() : null
        })
        .eq('user_id', userId);

      if (profileError) {
        console.error('Error saving profile:', profileError);
        throw profileError;
      }
      console.log('Profile updated successfully');

      // Save services
      if (services.length > 0) {
        console.log('Saving', services.length, 'services for profileId:', profileId);
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

          console.log('💾 About to upsert service:', serviceData.service_type);
          console.log('💾 Service data being sent:', JSON.stringify({
            service_type: serviceData.service_type,
            hourly_rate: serviceData.hourly_rate,
            daily_rate: serviceData.daily_rate,
            overnight_rate: serviceData.overnight_rate
          }));
          const { data: upsertedData, error: serviceError } = await supabase
            .from('sitter_services')
            .upsert(serviceData, {
              onConflict: 'sitter_id,service_type'
            })
            .select();

          if (serviceError) {
            console.error('❌ Error saving service:', serviceError);
            console.error('Service data that failed:', serviceData);
            throw serviceError;
          }
          console.log('✅ Service saved successfully:', serviceData.service_type, 'Data returned:', upsertedData);
        }
        console.log('✅ All services saved successfully');
      } else {
        console.log('⚠️ No services to save');
      }

      // Save unavailable dates
      if (unavailableDates.length > 0) {
        console.log('Saving unavailable dates...');
        const allDates: string[] = [];
        unavailableDates.forEach(range => {
          const start = parseISO(range.startDate);
          const end = parseISO(range.endDate);
          const datesInRange = eachDayOfInterval({ start, end });
          datesInRange.forEach(date => {
            allDates.push(format(date, 'yyyy-MM-dd'));
          });
        });

        const uniqueDates = [...new Set(allDates)];
        const availabilityData = uniqueDates.map(date => ({
          sitter_id: profileId,
          date: date,
          is_available: false
        }));

        const { error: availabilityError } = await supabase
          .from('sitter_availability')
          .upsert(availabilityData, {
            onConflict: 'sitter_id,date'
          });

        if (availabilityError) {
          console.error('Error saving availability:', availabilityError);
          throw availabilityError;
        }
        console.log('Availability saved successfully');
      }

      console.log('=== handleSaveProgress completed successfully ===');
      toast({
        title: "Progress saved",
        description: "Your profile information has been saved.",
      });
    } catch (error: any) {
      console.error('=== Error in handleSaveProgress ===', error);
      toast({
        title: "Error saving progress",
        description: error.message,
        variant: "destructive",
      });
      throw error; // Re-throw to let caller handle it
    }
  };

  const handleInitiatePaymentSetup = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    console.log('🔵 handleInitiatePaymentSetup CLICKED');
    setIsLoading(true);
    
    try {
      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      console.log('🔵 Session exists:', !!session);
      console.log('🔵 Session user:', session?.user?.id);
      
      if (!session) {
        throw new Error('Not authenticated. Please sign in and try again.');
      }
      
      console.log('🔵 Invoking stripe-connect-onboarding function...');
      const { data, error } = await supabase.functions.invoke('stripe-connect-onboarding', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        }
      });
      
      console.log('🔵 Function response:', { data, error });
      
      if (error) {
        console.error('🔴 Stripe connect error:', error);
        console.error('🔴 Error details:', JSON.stringify(error, null, 2));
        throw error;
      }
      
      if (data?.url) {
        console.log('🟢 Opening Stripe setup in new tab:', data.url);
        // Open in new tab to keep Ziggysitters page open
        window.open(data.url, '_blank');
        setIsLoading(false);
        toast({
          title: "Complete Stripe setup",
          description: "A new tab has opened. Please complete your payment account setup and return here when done.",
          duration: 10000,
        });
      } else {
        console.error('🔴 No URL in response:', data);
        throw new Error('No URL returned from Stripe');
      }
    } catch (error: any) {
      console.error('🔴 Error in handleInitiatePaymentSetup:', error);
      console.error('🔴 Full error object:', JSON.stringify(error, null, 2));
      setIsLoading(false);
      
      // Check if this is the platform profile setup error
      const errorMessage = error?.message || '';
      const isPlatformSetupError = errorMessage.includes('platform-profile') || 
                                    errorMessage.includes('managing losses for connected accounts');
      
      if (isPlatformSetupError) {
        toast({
          title: "Platform Setup In Progress",
          description: "We're still setting up the payment system. This should be ready soon! Please check back in a few hours or contact support if this persists.",
          variant: "default",
          duration: 8000,
        });
      } else {
        toast({
          title: "Connection failed",
          description: error?.message || "Failed to connect to Stripe. Please try again or contact support.",
          variant: "destructive",
          duration: 10000,
        });
      }
    }
  };

  const checkStripeStatus = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    try {
      const { data, error } = await supabase.functions.invoke('stripe-connect-account-status');
      
      if (error) throw error;
      
      if (data?.enabled) {
        setPaymentSetupCompleted(true);
        return true;
      } else if (data?.onboarding_completed) {
        // Onboarding is complete, just waiting for Stripe verification
        setPaymentSetupCompleted(true);
        return true;
      } else if (data?.connected && !data?.onboarding_completed) {
        // Connected but onboarding not finished
        toast({
          title: "Complete Stripe setup",
          description: "Please finish all required steps in your Stripe setup tab.",
          variant: "destructive",
        });
        return false;
      } else {
        // Not connected at all - no error needed, just informational
        return false;
      }
    } catch (error: any) {
      console.error('Error checking Stripe status:', error);
      toast({
        title: "Could not verify payment setup",
        description: "You can skip this step and set up payments later from your profile.",
      });
      return false;
    }
  };

  const handleCompleteOnboarding = async () => {
    console.log('=== handleCompleteOnboarding called ===');
    console.log('Services in state:', services.length);
    
    // Validate all required fields
    if (services.length === 0) {
      toast({
        title: "Services required",
        description: "Please add at least one service before submitting.",
        variant: "destructive",
      });
      setCurrentStep(2);
      return;
    }

    if (!idDocumentUrl && !blueCardUrl) {
      toast({
        title: "Documents required",
        description: "Please upload at least one verification document.",
        variant: "destructive",
      });
      setCurrentStep(4);
      return;
    }

    // Check Stripe status if on payment step
    if (currentStep === 5) {
      console.log('Checking Stripe status before completion...');
      const stripeConnected = await checkStripeStatus();
      if (!stripeConnected) {
        // Show a warning but allow continuing
        const confirmed = window.confirm(
          "Your payment account is not fully set up. You can continue and set it up later from your profile, but you won't be able to receive payments until it's complete. Continue anyway?"
        );
        if (!confirmed) {
          return;
        }
      }
    }

    try {
      console.log('=== FINAL SAVE: Saving all progress before completion ===');
      await handleSaveProgress();
      console.log('=== FINAL SAVE COMPLETED ===');

      // Verify services were actually saved
      const { data: savedServices, error: verifyError } = await supabase
        .from('sitter_services')
        .select('id')
        .eq('sitter_id', profileId);

      if (verifyError) {
        console.error('Error verifying saved services:', verifyError);
      } else {
        console.log('Verified services in DB:', savedServices?.length || 0);
        if (!savedServices || savedServices.length === 0) {
          throw new Error('Services were not saved. Please try again.');
        }
      }

      // Send verification email
      console.log('Sending verification request email...');
      try {
        await supabase.functions.invoke('send-verification-request-email', {
          body: {
            user_id: userId,
            documents_uploaded: !!(idDocumentUrl || blueCardUrl)
          }
        });
      } catch (error) {
        console.error('Error sending verification email:', error);
        // Don't block onboarding completion if email fails
      }

      console.log('Calling onComplete with profileId:', profileId);
      
      // Clear localStorage after successful completion
      localStorage.removeItem('sitter_onboarding_data');
      localStorage.removeItem('sitter_onboarding_step');
      
      // Call onComplete which will mark onboarding as complete
      onComplete(profileId);
    } catch (error: any) {
      console.error('=== Error in handleCompleteOnboarding ===', error);
      toast({
        title: "Error completing onboarding",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1: return true; // Experience is optional
      case 2: {
        if (services.length === 0) return false;
        // Every service must have at least one valid rate (number > 0)
        return services.every(s => {
          const hasRate = (typeof s.hourly_rate === 'number' && s.hourly_rate > 0) ||
                         (typeof s.daily_rate === 'number' && s.daily_rate > 0) ||
                         (typeof s.overnight_rate === 'number' && s.overnight_rate > 0);
          console.log(`Validating service ${s.service_type}:`, { hourly: s.hourly_rate, daily: s.daily_rate, overnight: s.overnight_rate, hasRate });
          return hasRate;
        });
      }
      case 3: return true; // Calendar is optional
      case 4: return idDocumentUrl || blueCardUrl;
      case 5: return true; // Payment can be done later
      default: return false;
    }
  };

  const handleNextStep = async () => {
    if (!isStepValid(currentStep) && currentStep !== 1 && currentStep !== 3 && currentStep !== 5) {
      toast({
        title: "Required fields missing",
        description: "Please complete required fields before continuing.",
        variant: "destructive",
      });
      return;
    }
    
    // Auto-save on next (CRITICAL: Must await to ensure save completes!)
    if (currentStep < totalSteps) {
      try {
        console.log('Saving progress before moving to next step...');
        await handleSaveProgress();
        console.log('Progress saved, moving to next step');
        const newStep = currentStep + 1;
        setCurrentStep(newStep);
        // Notify parent of step change if callback provided
        if (onStepChange && overallStep) {
          onStepChange(overallStep + 1);
        }
      } catch (error) {
        console.error('Failed to save progress, not advancing step');
        // Don't advance if save fails
        return;
      }
    }
  };

  const handlePrevStep = () => {
    const newStep = Math.max(currentStep - 1, 1);
    setCurrentStep(newStep);
    // Notify parent of step change if callback provided
    if (onStepChange && overallStep && newStep < currentStep) {
      onStepChange(overallStep - 1);
    }
  };

  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="space-y-6 px-2 sm:px-0">
      {/* Hero-style header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-8 border border-primary/20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Sitter Onboarding</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-bold">Complete Your Sitter Profile</h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
            {overallStep ? `Step ${overallStep} of 7` : `Step ${currentStep} of ${totalSteps}`}: {
              currentStep === 1 ? 'About Your Experience' :
              currentStep === 2 ? 'Services & Pricing' :
              currentStep === 3 ? 'Calendar & Availability' :
              currentStep === 4 ? 'Verification Documents' :
              currentStep === 5 ? 'Payment Setup' :
              'Review & Submit'
            }
          </p>
          
          <div className="max-w-lg mx-auto">
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>
      </div>

      {/* Step 1: Experience */}
      {currentStep === 1 && (
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              About Your Experience
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertDescription>
                Share your passion for pets! This helps owners feel confident choosing you.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>Years of Experience with Pets</Label>
              <Input
                type="number"
                min="0"
                max="50"
                value={experienceYears}
                onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
                placeholder="How many years?"
              />
            </div>
            
            <div className="space-y-2">
              <Label>About You (Optional)</Label>
              <Textarea
                placeholder="Tell pet owners about yourself, your experience with pets, and why you love caring for animals..."
                value={bio}
                onChange={(e) => {
                  console.log('Bio onChange triggered, new value length:', e.target.value.length);
                  setBio(e.target.value);
                }}
                rows={5}
                className="min-h-[120px]"
                disabled={false}
                readOnly={false}
              />
              <p className="text-xs text-muted-foreground">Share your experience, what makes you special, and why pet owners should choose you!</p>
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
                  <div className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-primary/30 rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all">
                    <Upload className="w-5 h-5 text-primary" />
                    <span className="font-medium">Upload Photos of You with Pets</span>
                  </div>
                </Label>
              </div>
              {portfolioPhotos.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mt-4">
                  {portfolioPhotos.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Portfolio ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg shadow-md"
                    />
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Services & Pricing */}
      {currentStep === 2 && (
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Services & Pricing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="bg-primary/5 border-primary/20">
              <AlertDescription className="space-y-2">
                <div className="font-semibold text-foreground">Pricing Information:</div>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li><strong>Your Earnings:</strong> You receive 100% of your rate</li>
                  <li><strong>Platform Fee:</strong> 10% added to owner's total (not from your earnings)</li>
                  <li><strong>Daily Reports:</strong> If owner requests them and you miss any, you'll receive 15% less and owner gets 15% refunded</li>
                </ul>
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
                    className="cursor-pointer capitalize hover:scale-105 transition-transform"
                    onClick={() => toggleSpecies(species)}
                  >
                    {species}
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
                    className="cursor-pointer capitalize hover:scale-105 transition-transform"
                    onClick={() => toggleSize(size)}
                  >
                    {size.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Services Offered * (Click to add)</Label>
              <div className="flex flex-wrap gap-2">
                {serviceTypes.map(serviceType => (
                  <Badge
                    key={serviceType.key}
                    variant={services.find(s => s.service_type === serviceType.key) ? "default" : "outline"}
                    className="cursor-pointer hover:scale-105 transition-transform"
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
                <Card key={service.service_type} className="bg-muted/50 border-primary/10">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-lg">{serviceType?.label}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeService(service.service_type)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {serviceType?.rate_types.includes('hourly_rate') && (
                        <div className="space-y-1">
                          <Label className="text-sm">Hourly Rate (NZ$) *</Label>
                          <Input
                            type="number"
                            min="10"
                            max="200"
                            placeholder="e.g., $20"
                            value={service.hourly_rate ?? ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateService(service.service_type, 'hourly_rate', val === '' ? undefined : parseFloat(val));
                            }}
                          />
                        </div>
                      )}
                      {serviceType?.rate_types.includes('daily_rate') && (
                        <div className="space-y-1">
                          <Label className="text-sm">Daily Rate (NZ$) *</Label>
                          <Input
                            type="number"
                            min="30"
                            max="500"
                            placeholder="e.g., $45"
                            value={service.daily_rate ?? ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateService(service.service_type, 'daily_rate', val === '' ? undefined : parseFloat(val));
                            }}
                          />
                        </div>
                      )}
                      {serviceType?.rate_types.includes('overnight_rate') && (
                        <div className="space-y-1">
                          <Label className="text-sm">Overnight Rate (NZ$) *</Label>
                          <Input
                            type="number"
                            min="40"
                            max="300"
                            placeholder="e.g., $60"
                            value={service.overnight_rate ?? ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateService(service.service_type, 'overnight_rate', val === '' ? undefined : parseFloat(val));
                            }}
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm">Service Description (Optional)</Label>
                      <Textarea
                        placeholder="What's included in this service?"
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

      {/* Step 3: Calendar */}
      {currentStep === 3 && (
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Calendar & Availability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Calendar className="h-4 w-4" />
              <AlertDescription>
                Block out dates when you're unavailable. You can skip this and update later from your profile.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              <Label>Add Unavailable Date Ranges (Optional)</Label>
              
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
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Verification Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-primary/5 border-primary/20">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                ID document is required for verification. Upload your Police Vet check to earn a gold badge!
              </AlertDescription>
            </Alert>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-semibold">Photo ID (Driver's License, Passport, etc.) <span className="text-destructive">*</span></Label>
                <Input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload(e.target.files, 'id')}
                  id="id-document"
                  className="cursor-pointer"
                />
                {idDocumentUrl && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>ID document uploaded</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  Police Vet Check 
                  <Badge variant="secondary" className="bg-yellow-500 text-white">Optional - Gold Badge ⭐</Badge>
                </Label>
                <p className="text-sm text-muted-foreground">
                  Stand out with a gold badge! Upload your NZ Police Vetting Service check. <a href="https://www.police.govt.nz/advice-services/businesses-and-organisations/nz-police-vetting-service/forms-and-guides" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">Get your police vet here →</a>
                </p>
                <Input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload(e.target.files, 'blue_card')}
                  id="police-vet"
                  className="cursor-pointer"
                />
                {blueCardUrl && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Police Vet uploaded</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Payment Setup */}
      {currentStep === 5 && (
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Payment Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="bg-primary/5 border-primary/20">
              <AlertDescription>
                Connect your bank account to receive payouts when you complete bookings. This uses Stripe Connect for secure payments.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="p-6 bg-muted/50 rounded-lg space-y-4">
                <h4 className="font-semibold text-lg">How Payment Works</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Pet owners pay through the platform when they book</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>You receive 100% of your listed rate (minus deductions if you don't submit daily reports)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Platform fee (10%) is added to the owner's total</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Funds are transferred after booking completion</span>
                  </li>
                </ul>
              </div>

              {paymentSetupCompleted ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                    <div className="flex-1">
                      <p className="font-semibold text-green-900">Payment setup verified!</p>
                      <p className="text-sm text-green-700">Your Stripe account is connected and ready to receive payments.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Button
                    type="button"
                    onClick={(e) => handleInitiatePaymentSetup(e)}
                    disabled={isLoading}
                    size="lg"
                    className="w-full"
                  >
                    <DollarSign className="w-5 h-5 mr-2" />
                    {isLoading ? "Opening Stripe..." : "Connect Bank Account with Stripe"}
                  </Button>
                  
                  <Button
                    type="button"
                    onClick={(e) => checkStripeStatus(e)}
                    variant="outline"
                    size="lg"
                    className="w-full"
                  >
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Verify Connection Status
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    After completing Stripe setup in the new tab, click "Verify Connection Status" to confirm.
                  </p>
                </div>
              )}

              <p className="text-sm text-muted-foreground text-center mt-4">
                You can also set this up later from your profile settings.
              </p>
            </div>
          </CardContent>
        </Card>
      )}


      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevStep}
          disabled={currentStep === 1}
          size="lg"
        >
          Back
        </Button>

        {currentStep < totalSteps ? (
          <Button
            type="button"
            onClick={handleNextStep}
            size="lg"
            className="px-8"
          >
            Continue
          </Button>
        ) : (
          <Button 
            type="button"
            onClick={handleCompleteOnboarding}
            disabled={!isStepValid(2) || !isStepValid(4)}
            size="lg"
            className="px-8 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Submit for Approval
          </Button>
        )}
      </div>
    </div>
  );
}
