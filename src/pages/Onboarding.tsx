import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PawPrint, User, UserCheck, Heart } from 'lucide-react';
import ImprovedPetOwnerOnboarding from '@/components/onboarding/ImprovedPetOwnerOnboarding';
import ImprovedSitterOnboarding from '@/components/onboarding/ImprovedSitterOnboarding';
import QuickStartPetOwner from '@/components/onboarding/QuickStartPetOwner';
import TermsAcceptance from '@/components/TermsAcceptance';
import EmailVerificationStep from '@/components/onboarding/EmailVerificationStep';
import { useIsMobile } from '@/hooks/use-mobile';
import { Textarea } from '@/components/ui/textarea';
import { useProfile } from '@/contexts/ProfileContext';
import { useBehaviorTracking } from '@/hooks/useBehaviorTracking';

// Phone validation function for New Zealand numbers
const validateNZPhone = (phone: string): boolean => {
  // Remove spaces, hyphens, and parentheses
  const cleaned = phone.replace(/[\s\-()]/g, '');
  
  // NZ mobile: 02x xxx xxxx or +6421/22/27/28/29 followed by 6-8 digits
  const nzMobileRegex = /^(?:\+?64|0)2[1-9]\d{6,8}$/;
  
  // NZ landline: 0x xxx xxxx (3-9 area codes)
  const nzLandlineRegex = /^(?:\+?64|0)[3-9]\d{7,9}$/;
  
  return nzMobileRegex.test(cleaned) || nzLandlineRegex.test(cleaned);
};

type UserRole = 'pet_owner' | 'pet_sitter';

interface OnboardingData {
  role: UserRole | null;
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  suburb?: string;
  city?: string;
  postal_code?: string;
  bio?: string;
  avatar_url?: string;
}

export default function Onboarding() {
  const { user } = useAuth();
  const { profile, refetch, updateProfile } = useProfile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { trackAction, trackDropoff } = useBehaviorTracking();
  const stepStartTime = useRef<number>(Date.now());
  const onboardingStartTime = useRef<number>(Date.now());
  
  // Check if terms were accepted during signup BEFORE any useState
  const termsAcceptedDuringSignup = localStorage.getItem('terms_accepted_during_signup') === 'true';
  
  const [step, setStep] = useState(() => {
    // If terms were accepted during signup, start at step 1 (role selection)
    if (termsAcceptedDuringSignup) return 1;
    const saved = localStorage.getItem('onboarding_step');
    return saved ? parseInt(saved) : 1;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [profileId, setProfileId] = useState<string>('');
  // CRITICAL: Never show terms if they were accepted during signup
  const [showTerms, setShowTerms] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [termsChecked, setTermsChecked] = useState(termsAcceptedDuringSignup);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [hasAcceptedTermsLocally, setHasAcceptedTermsLocally] = useState(termsAcceptedDuringSignup);
  const [emailVerified, setEmailVerified] = useState(false);

  // Track onboarding page view - use ref to prevent double-tracking on React re-mounts
  const hasTrackedOnboardingStart = useRef(false);
  
  useEffect(() => {
    // Only track once per actual page load, not on React re-mounts
    if (!hasTrackedOnboardingStart.current) {
      hasTrackedOnboardingStart.current = true;
      onboardingStartTime.current = Date.now();
      trackAction('onboarding_started', { 
        initial_step: step,
        has_saved_data: !!localStorage.getItem('onboarding_data'),
      });
    }

    // Track if user leaves without completing
    // IMPORTANT: Only track dropoff if they've been on page for at least 3 seconds
    // This prevents false dropoffs from React re-renders/re-mounts
    return () => {
      const timeSpent = Math.round((Date.now() - onboardingStartTime.current) / 1000);
      // Only track dropoff if they didn't complete AND spent meaningful time
      if (step < 3 && timeSpent >= 3) {
        trackDropoff('onboarding', 'page_left', {
          last_step: step,
          role_selected: !!profile?.role,
          time_spent_seconds: timeSpent,
        });
      }
    };
  }, []);

  // Track step changes
  useEffect(() => {
    const timeOnPreviousStep = Math.round((Date.now() - stepStartTime.current) / 1000);
    stepStartTime.current = Date.now();
    
    trackAction('onboarding_step_changed', {
      step,
      role: profile?.role || 'not_selected',
      time_on_previous_step: timeOnPreviousStep,
    });
  }, [step]);
  const [data, setData] = useState<OnboardingData>(() => {
    // Try to load from localStorage first
    const saved = localStorage.getItem('onboarding_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved onboarding data', e);
      }
    }
    return {
      role: null,
      city: 'Auckland'
    };
  });

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('onboarding_data', JSON.stringify(data));
  }, [data]);

  // Save step to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('onboarding_step', step.toString());
  }, [step]);

  // Stripe returns are now handled in Profile.tsx payments tab
  // No need to handle them here anymore

  // CRITICAL: Block rendering if user already completed onboarding
  const [blockRender, setBlockRender] = useState(true);
  
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Check if user is admin or already completed onboarding
    const checkUserStatus = async () => {
      try {
        // Use secure user_roles table
        const { data: roleData, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (!error && roleData) {
          // Admin users skip onboarding and go directly to admin dashboard
          navigate('/admin-dashboard', { replace: true });
          return;
        }

        // Check if user already completed onboarding
        const { data: profileData } = await supabase
          .from('profiles')
          .select('onboarding_completed, terms_accepted')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profileData?.onboarding_completed) {
          console.log('User already completed onboarding - redirecting away');
          // Clear any stale localStorage
          localStorage.removeItem('onboarding_step');
          localStorage.removeItem('onboarding_data');
          navigate('/', { replace: true });
          return;
        }
        
        // User needs onboarding - allow rendering
        setBlockRender(false);
      } catch (error) {
        console.error('Error checking user status:', error);
        // On error, allow rendering to prevent blocking
        setBlockRender(false);
      }
    };

    checkUserStatus();
  }, [user, navigate]);

  // CRITICAL: Pet owners should never be on step 2+ - redirect them to find sitters
  useEffect(() => {
    if (data.role === 'pet_owner' && step >= 2 && initialLoadComplete && !blockRender) {
      console.log('Pet owner detected on step 2+ - redirecting to find-sitters');
      
      // Clear onboarding localStorage since they already picked their role
      localStorage.removeItem('onboarding_step');
      localStorage.removeItem('onboarding_data');
      
      // Check for search context
      const lastClickedSitter = sessionStorage.getItem('last_clicked_sitter_id');
      const searchLocation = sessionStorage.getItem('search_location');
      const searchServiceType = sessionStorage.getItem('search_service_type');
      
      sessionStorage.removeItem('last_clicked_sitter_id');
      
      if (lastClickedSitter) {
        navigate(`/sitter/${lastClickedSitter}`, { replace: true });
      } else if (searchLocation || searchServiceType) {
        const params = new URLSearchParams();
        if (searchLocation) params.set('location', searchLocation);
        if (searchServiceType) params.set('serviceType', searchServiceType);
        navigate(`/find-sitters?${params.toString()}`, { replace: true });
      } else {
        navigate('/find-sitters', { replace: true });
      }
    }
  }, [step, data.role, initialLoadComplete, blockRender, navigate]);

  useEffect(() => {
    if (!user) return;

    // Pre-fill with existing user data if available
    const fetchExistingProfile = async () => {
      if (initialLoadComplete) return; // Prevent multiple loads
      
      try {
        // Check if terms were just accepted during signup (localStorage persists across refreshes)
        // CRITICAL: Check this ONCE and clean up immediately to prevent any race conditions
        const termsAcceptedFlag = localStorage.getItem('terms_accepted_during_signup') === 'true';
        
        if (termsAcceptedFlag) {
          console.log('✅ Terms were accepted during signup - skipping terms popup completely');
          // Clean up IMMEDIATELY to prevent double-processing
          localStorage.removeItem('terms_accepted_during_signup');
          setTermsChecked(true);
          setShowTerms(false);
          setHasAcceptedTermsLocally(true);
          
          // Make sure we're at step 1 (role selection)
          if (step === 0) {
            setStep(1);
            localStorage.setItem('onboarding_step', '1');
          }
          
          // Pre-fill names from user metadata
          setData(prev => ({
            ...prev,
            first_name: user.user_metadata?.first_name || prev.first_name || '',
            last_name: user.user_metadata?.last_name || prev.last_name || '',
          }));
          
          setInitialLoadComplete(true);
          return;
        }
        
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!error && profile) {
          // Check if user has already accepted terms in the database
          const hasAcceptedTerms = profile.terms_accepted === true;
          const hasVerifiedEmail = (profile as any).email_verified === true;
          
          setTermsChecked(hasAcceptedTerms || hasAcceptedTermsLocally);
          setEmailVerified(hasVerifiedEmail);
          
          // For existing users who already accepted terms
          if (hasAcceptedTerms || hasAcceptedTermsLocally) {
            const savedStep = localStorage.getItem('onboarding_step');
            if (savedStep === '0') {
              console.log('Existing user with accepted terms - clearing stale step 0');
              localStorage.removeItem('onboarding_step');
              setStep(1);
            }
            setShowTerms(false);
            // Email verification is now role-dependent (sitters only), handled in nextStep
            setShowEmailVerification(false);
          } else {
            // Only show terms if not accepted AND not currently showing AND not accepted locally
            if (!showTerms && !hasAcceptedTermsLocally) {
              setShowTerms(true);
              setStep(0);
              localStorage.setItem('onboarding_step', '0');
            }
          }

          // Always pre-fill names from user metadata if available (don't make users re-enter)
          const savedData = localStorage.getItem('onboarding_data');
          const parsedSavedData = savedData ? JSON.parse(savedData) : {};
          
          setData(prev => ({
            ...prev,
            role: (profile.role === 'pet_owner' || profile.role === 'pet_sitter') ? profile.role : prev.role,
            // CRITICAL: Pre-fill names from profile or user metadata - don't make users enter twice
            first_name: parsedSavedData.first_name || profile.first_name || user.user_metadata?.first_name || '',
            last_name: parsedSavedData.last_name || profile.last_name || user.user_metadata?.last_name || '',
            phone: parsedSavedData.phone || profile.phone || '',
            address: parsedSavedData.address || profile.address || '',
            suburb: parsedSavedData.suburb || profile.suburb || '',
            city: parsedSavedData.city || profile.city || 'Auckland',
            postal_code: parsedSavedData.postal_code || profile.postal_code || '',
            bio: parsedSavedData.bio || profile.bio || '',
            avatar_url: parsedSavedData.avatar_url || profile.avatar_url || '',
          }));
        } else {
          // If no profile exists yet
          if (!hasAcceptedTermsLocally) {
            setShowTerms(true);
            setStep(0);
            localStorage.setItem('onboarding_step', '0');
          }

          // Always pre-fill names from user metadata if available
          setData(prev => ({
            ...prev,
            first_name: user.user_metadata?.first_name || prev.first_name || '',
            last_name: user.user_metadata?.last_name || prev.last_name || '',
          }));
        }
        
        setInitialLoadComplete(true);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setInitialLoadComplete(true);
      }
    };

    fetchExistingProfile();
  }, [user, navigate, initialLoadComplete, showTerms, step, hasAcceptedTermsLocally]);

  const handleRoleSelection = (role: UserRole) => {
    trackAction('onboarding_role_selected', { role });
    setData(prev => ({ ...prev, role }));
  };

  const handleInputChange = (field: string, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleAcceptTerms = async () => {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Get the current session to pass auth token to edge function
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      // Call edge function to save terms acceptance with elevated privileges
      const { data, error } = await supabase.functions.invoke('save-terms-acceptance', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to save terms acceptance');
      }

      setShowTerms(false);
      setTermsChecked(true);
      setHasAcceptedTermsLocally(true);
      
      // Go directly to role selection - email verification is role-dependent
      // Pet owners: optional (prompted post-booking)
      // Sitters: required (shown after role selection)
      setStep(1);
      localStorage.setItem('onboarding_step', '1');
      
      toast({
        title: "Terms Accepted",
        description: "Let's get you set up!",
      });
    } catch (error: any) {
      console.error('Error saving terms acceptance:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to save terms acceptance. Please try again.',
        variant: "destructive",
      });
    }
  };

  const handleEmailVerified = () => {
    setShowEmailVerification(false);
    setEmailVerified(true);
    
    // For sitters, proceed to basic info (step 2)
    if (data.role === 'pet_sitter') {
      setStep(2);
      localStorage.setItem('onboarding_step', '2');
    } else {
      setStep(1);
      localStorage.setItem('onboarding_step', '1');
    }
    
    toast({
      title: "Email Verified!",
      description: "Let's continue setting up your profile.",
    });
  };

  const handleDeclineTerms = async () => {
    // Sign out user if they decline terms
    await supabase.auth.signOut();
    navigate('/auth', { replace: true });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-avatar.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      setData(prev => ({ ...prev, avatar_url: publicUrl }));
      
      toast({
        title: "Photo uploaded successfully!",
        description: "Your profile photo has been uploaded.",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const saveBasicProfile = async () => {
    setIsLoading(true);
    try {
      console.log('=== Saving basic profile ===');
      console.log('user?.id:', user?.id);
      
      // Validate required fields
      if (!data.first_name || !data.last_name || !data.phone || !data.address || !data.suburb) {
        toast({
          title: "Missing required fields",
          description: "Please fill in all required fields (marked with *).",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Validate phone number for sitters
      if (data.role === 'pet_sitter' && !validateNZPhone(data.phone)) {
        toast({
          title: "Invalid phone number",
          description: "Please enter a valid New Zealand phone number (e.g., 021 123 4567 or +64 21 123 4567).",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Update profile with basic info
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .update({
          role: data.role,
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
          address: data.address,
          suburb: data.suburb,
          city: data.city,
          postal_code: data.postal_code,
          avatar_url: data.avatar_url,
        })
        .eq('user_id', user?.id)
        .select('id')
        .maybeSingle();

      if (profileError || !profileData) {
        console.error('Error saving profile:', profileError);
        throw new Error('Failed to update profile');
      }

      console.log('✅ Basic profile saved, profile.id:', profileData.id);
      setProfileId(profileData.id);
      
      // CRITICAL: Refetch profile context to ensure it's up to date
      console.log('Refetching profile context...');
      await refetch();
      console.log('Profile context refetched');
      
      setStep(step + 1);
    } catch (error: any) {
      console.error('❌ Error in saveBasicProfile:', error);
      toast({
        title: "Error saving profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = async () => {
    try {
      console.log('Completing onboarding for pet owner role');
      console.log('Current user ID:', user?.id);
      
      // CRITICAL: Use updateProfile to update both database AND context state
      const { error: updateError } = await updateProfile({ 
        onboarding_completed: true 
      });

      if (updateError) {
        console.error('Error marking onboarding complete:', updateError);
        toast({
          title: "Error completing onboarding",
          description: updateError.message || "Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Onboarding marked as complete, context updated');

      // Clear localStorage after successful completion
      localStorage.removeItem('onboarding_data');
      localStorage.removeItem('onboarding_step');

      // For pet owners, skip the completion page and go straight to search
      if (profile?.role === 'pet_owner') {
        navigate('/find-sitters', { replace: true });
      } else {
        navigate('/onboarding-complete', { replace: true });
      }
    } catch (error: any) {
      console.error('Error in handleOnboardingComplete:', error);
      toast({
        title: "Error completing onboarding",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSitterOnboardingComplete = async () => {
    try {
      console.log('=== Starting Sitter Onboarding Completion ===');
      console.log('Current user ID:', user?.id);
      console.log('Current profile:', profile);
      
      // CRITICAL: Use updateProfile to update both database AND context state
      console.log('Updating profile with onboarding_completed: true');
      const { error: updateError } = await updateProfile({ 
        onboarding_completed: true 
      });

      if (updateError) {
        console.error('Error updating profile:', updateError);
        throw updateError;
      }

      // Send admin notification about new sitter completion
      try {
        console.log('Sending admin notification for new sitter');
        // Get ALL possible session IDs for journey tracking
        const behaviorSessionId = sessionStorage.getItem('ziggy_session_id');
        const searchSessionId = sessionStorage.getItem('search_session_id');
        const sessionId = behaviorSessionId || searchSessionId;
        
        await supabase.functions.invoke('send-welcome-email', {
          body: {
            email: user?.email,
            firstName: profile?.first_name || 'there',
            role: 'pet_sitter',
            sessionId: sessionId,
          }
        });
      } catch (emailError) {
        console.error('Error sending admin notification:', emailError);
        // Don't block onboarding if email fails
      }

      // Notify users who searched in this sitter's area that a new sitter is available
      try {
        if (profile?.suburb) {
          console.log('Triggering new sitter notification for suburb:', profile.suburb);
          await supabase.functions.invoke('send-new-sitter-notification', {
            body: {
              sitter_id: profile.id,
              suburb: profile.suburb,
              city: profile.city || 'Auckland'
            }
          });
        }
      } catch (notifyError) {
        console.error('Error sending new sitter notifications:', notifyError);
        // Don't block onboarding if notification fails
      }

      console.log('Profile updated successfully, clearing localStorage');
      localStorage.removeItem('onboarding_step');
      localStorage.removeItem('onboarding_data');
      localStorage.removeItem('sitter_onboarding_data');
      localStorage.removeItem('sitter_onboarding_step');
      
      toast({
        title: "Welcome to ZiggySitters!",
        description: "Your sitter profile is live! You can now receive bookings. Upload ID to get verified badge.",
        duration: 5000,
      });
      
      // Navigate to profile page to show success
      console.log('Navigating to /profile');
      navigate('/profile', { replace: true });
    } catch (error: any) {
      console.error('Error in handleSitterOnboardingComplete:', error);
      toast({
        title: "Error completing onboarding",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const nextStep = async () => {
    if (step === 1 && !data.role) {
      toast({
        title: "Please select a role",
        description: "Choose whether you want to be a pet owner, sitter, or both.",
        variant: "destructive",
      });
      return;
    }
    
    // CRITICAL: Pet owners skip to search immediately after selecting role
    if (step === 1 && data.role === 'pet_owner') {
      console.log('Pet owner selected - completing onboarding and redirecting to search');
      
      try {
        // Update profile with role and mark onboarding complete
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            role: 'pet_owner',
            onboarding_completed: true 
          })
          .eq('user_id', user?.id);

        if (profileError) {
          console.error('Error updating profile:', profileError);
          throw profileError;
        }

        // Send welcome email
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('first_name, email, id')
            .eq('user_id', user?.id)
            .single();

          if (profileData) {
            const behaviorSessionId = sessionStorage.getItem('ziggy_session_id');
            const searchSessionId = sessionStorage.getItem('search_session_id');
            const sessionId = behaviorSessionId || searchSessionId;
            
            await supabase.functions.invoke('send-welcome-email', {
              body: {
                email: profileData.email,
                firstName: profileData.first_name || 'there',
                role: 'pet_owner',
                sessionId: sessionId,
              }
            });
            console.log('Pet owner welcome email sent');
          }
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
        }

        // Clear localStorage
        localStorage.removeItem('onboarding_data');
        localStorage.removeItem('onboarding_step');
        
        toast({
          title: "🎉 Welcome to ZiggySitters!",
          description: "Let's find the perfect sitter for your pet!",
          duration: 4000,
        });
        
        // Check if user had search context from before registration
        const lastClickedSitter = sessionStorage.getItem('last_clicked_sitter_id');
        const searchLocation = sessionStorage.getItem('search_location');
        const searchServiceType = sessionStorage.getItem('search_service_type');
        
        // Clear these after use
        sessionStorage.removeItem('last_clicked_sitter_id');
        
        if (lastClickedSitter) {
          // User clicked a sitter before registering - take them back there
          console.log('Redirecting to previously clicked sitter:', lastClickedSitter);
          navigate(`/sitter/${lastClickedSitter}`, { replace: true });
        } else if (searchLocation || searchServiceType) {
          // User had a search in progress
          const params = new URLSearchParams();
          if (searchLocation) params.set('location', searchLocation);
          if (searchServiceType) params.set('serviceType', searchServiceType);
          console.log('Restoring search context');
          navigate(`/find-sitters?${params.toString()}`, { replace: true });
        } else {
          // No prior context - go to search page
          navigate('/find-sitters', { replace: true });
        }
        return;
      } catch (error: any) {
        console.error('Error completing pet owner onboarding:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to complete setup. Please try again.",
          variant: "destructive",
        });
        return;
      }
    }
    
    // Sitters need email verification before proceeding
    if (step === 1 && data.role === 'pet_sitter' && !emailVerified) {
      console.log('Sitter selected - showing email verification');
      setShowEmailVerification(true);
      return;
    }
    
    // Only sitters need to save basic profile
    if (step === 2 && data.role === 'pet_sitter') {
      saveBasicProfile();
      return;
    }
    
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);
  
  // Don't render anything if user already completed onboarding
  if (blockRender) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const renderRoleSelection = () => (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="text-center space-y-3">
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
          How would you like to use ZiggySitters?
        </h2>
        <p className="text-base md:text-lg text-muted-foreground">
          Choose your role to customize your experience
        </p>
      </div>
      
      <div className="grid gap-5">
        <div 
          className={`relative cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
            data.role === 'pet_owner' ? 'ring-4 ring-purple-400 shadow-2xl' : 'hover:shadow-xl'
          }`}
          onClick={() => handleRoleSelection('pet_owner')}
        >
          <Card className="border-2 border-purple-200 dark:border-purple-800 overflow-hidden bg-gradient-to-br from-purple-50 via-background to-blue-50 dark:from-purple-950/20 dark:via-background dark:to-blue-950/20">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-5">
                <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Heart className="w-8 h-8 md:w-10 md:h-10 text-white" fill="currentColor" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl md:text-2xl font-bold mb-1 flex items-center gap-2">
                    Pet Owner
                    <span className="text-2xl">💜</span>
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground">
                    Find trusted sitters for your beloved pets
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <RadioGroup value={data.role || ''}>
                    <div className="flex items-center">
                      <RadioGroupItem 
                        value="pet_owner" 
                        id="pet_owner" 
                        className="h-6 w-6 border-2 border-purple-500 data-[state=checked]:bg-purple-500"
                      />
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div 
          className={`relative cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
            data.role === 'pet_sitter' ? 'ring-4 ring-blue-400 shadow-2xl' : 'hover:shadow-xl'
          }`}
          onClick={() => handleRoleSelection('pet_sitter')}
        >
          <Card className="border-2 border-blue-200 dark:border-blue-800 overflow-hidden bg-gradient-to-br from-blue-50 via-background to-indigo-50 dark:from-blue-950/20 dark:via-background dark:to-indigo-950/20">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-5">
                <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <UserCheck className="w-8 h-8 md:w-10 md:h-10 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl md:text-2xl font-bold mb-1 flex items-center gap-2">
                    Pet Sitter
                    <span className="text-2xl">✨</span>
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground">
                    Offer pet sitting services and earn money
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <RadioGroup value={data.role || ''}>
                    <div className="flex items-center">
                      <RadioGroupItem 
                        value="pet_sitter" 
                        id="pet_sitter"
                        className="h-6 w-6 border-2 border-blue-500 data-[state=checked]:bg-blue-500"
                      />
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {data.role && (
        <div className="text-center mt-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
            <span className="text-lg">👍</span>
            Great choice! Click Next to continue
          </p>
        </div>
      )}
    </div>
  );

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold mb-2`}>Basic Information</h2>
        <p className="text-muted-foreground">Tell us a bit about yourself and your location</p>
      </div>

      <div className="grid gap-4">
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name *</Label>
            <Input
              id="first_name"
              placeholder="Your first name"
              value={data.first_name || ''}
              onChange={(e) => handleInputChange('first_name', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name *</Label>
            <Input
              id="last_name"
              placeholder="Your last name"
              value={data.last_name || ''}
              onChange={(e) => handleInputChange('last_name', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="avatar">Profile Photo</Label>
          <Input
            id="avatar"
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="cursor-pointer"
          />
          {data.avatar_url && (
            <div className="mt-2">
              <img src={data.avatar_url} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
            </div>
          )}
        </div>

        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
          <div className="space-y-2">
            <Label htmlFor="phone">Mobile Number *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="e.g., 021 123 4567 or +64 21 123 4567"
              value={data.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              required
              className={data.role === 'pet_sitter' && data.phone && !validateNZPhone(data.phone) ? 'border-destructive' : ''}
            />
            {data.role === 'pet_sitter' && (
              <p className="text-xs text-muted-foreground mt-1">
                {data.phone && !validateNZPhone(data.phone) 
                  ? '⚠️ Please enter a valid NZ phone number' 
                  : 'Valid NZ mobile or landline number required'}
              </p>
            )}
          </div>
        <div className="space-y-2">
          <Label htmlFor="postal_code">Postcode</Label>
          <Input
            id="postal_code"
            placeholder="1010"
            value={data.postal_code || ''}
            onChange={(e) => handleInputChange('postal_code', e.target.value)}
          />
        </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address *</Label>
          <Input
            id="address"
            name="address"
            type="text"
            autoComplete="street-address"
            inputMode="text"
            placeholder="Your street address"
            value={data.address || ''}
            onChange={(e) => handleInputChange('address', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="suburb">Suburb *</Label>
          <Input
            id="suburb"
            placeholder="Your suburb"
            value={data.suburb || ''}
            onChange={(e) => handleInputChange('suburb', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={data.city || 'Auckland'}
            onChange={(e) => handleInputChange('city', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio" className="flex items-center gap-2">
            About You
            <span className="text-xs text-muted-foreground font-normal">(Optional - add later from profile)</span>
          </Label>
          <Textarea
            id="bio"
            placeholder="Tell us about yourself, your experience with pets..."
            value={data.bio || ''}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            rows={3}
          />
        </div>
      </div>
    </div>
  );

  const handleSitterStepChange = (newStep: number) => {
    setStep(newStep);
  };

  const renderRoleSpecificOnboarding = () => {
    console.log('[Onboarding] renderRoleSpecificOnboarding', { step, role: data.role, profileId: profile?.id, userId: user?.id });
    if (!data.role) return null;

    // Pet owners complete immediately from step 1 via nextStep() - should never reach step 2
    if (data.role === 'pet_owner') {
      console.log('[Onboarding] Pet owner should not reach renderRoleSpecificOnboarding - redirect happening in nextStep');
      return null;
    }
    
    if (data.role === 'pet_sitter') {
      console.log('=== Rendering ImprovedSitterOnboarding ===');
      console.log('profile?.id:', profile?.id);
      console.log('user?.id:', user?.id);
      
      if (!profile?.id) {
        console.error('ERROR: profile.id is missing! Cannot save services without profileId');
        return (
          <div className="p-6 bg-destructive/10 border border-destructive rounded-lg">
            <p className="text-destructive font-semibold">Error: Profile ID not found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Please refresh the page and try again. If the problem persists, contact support.
            </p>
          </div>
        );
      }
      
      return (
        <ImprovedSitterOnboarding 
          profileId={profile.id} 
          userId={user?.id || ''} 
          onComplete={handleSitterOnboardingComplete}
          overallStep={step}
          onStepChange={handleSitterStepChange}
        />
      );
    }
    
    return null;
  };

  const getTotalSteps = () => {
    if (data.role === 'pet_sitter') return 7; // User type + Basic info + 5 sitter steps
    if (data.role === 'pet_owner') return 1; // User type only - then straight to search
    return 1;
  };

  const getStepTitle = () => {
    if (step === 1) return 'Choose Your Role';
    if (data.role === 'pet_sitter' && step === 2) return 'Basic Information';
    if (data.role === 'pet_sitter') {
      // Steps 3-7 are handled by ImprovedSitterOnboarding
      const sitterSteps = ['Experience', 'Services & Pricing', 'Calendar', 'Verification', 'Payment Setup'];
      if (step >= 3 && step <= 7) {
        return sitterSteps[step - 3];
      }
    }
    return '';
  };

  const totalSteps = getTotalSteps();

  // Show T&Cs first if not yet accepted
  if (showTerms) {
    return (
      <TermsAcceptance
        isOpen={showTerms}
        onAccept={handleAcceptTerms}
        onDecline={handleDeclineTerms}
      />
    );
  }

  // Show email verification after terms acceptance
  if (showEmailVerification && user) {
    return (
      <div className="min-h-screen relative bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-950/20 dark:via-blue-950/20 dark:to-indigo-950/20 overflow-hidden py-8 md:py-12 px-4">
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute top-10 right-20 w-80 h-80 bg-purple-300 dark:bg-purple-700 rounded-full blur-3xl opacity-25 animate-pulse"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-300 dark:bg-blue-700 rounded-full blur-3xl opacity-25 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="container mx-auto max-w-lg relative z-10">
          <Card className="shadow-2xl border-2 border-purple-200 dark:border-purple-800 bg-background/95 backdrop-blur">
            <CardContent className="p-6 md:p-8">
              <EmailVerificationStep
                userId={user.id}
                email={user.email || ''}
                firstName={data.first_name || user.user_metadata?.first_name || ''}
                onVerified={handleEmailVerified}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-950/20 dark:via-blue-950/20 dark:to-indigo-950/20 overflow-hidden py-8 md:py-12 px-4">
      {/* Subtle background decoration - no animations for better Safari performance */}
      {step === 1 && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
          <div className="absolute top-20 left-1/4 text-4xl md:text-5xl">💜</div>
          <div className="absolute top-32 right-1/4 text-3xl md:text-4xl">🐾</div>
          <div className="absolute bottom-32 right-1/3 text-3xl md:text-4xl">🎉</div>
          <div className="absolute bottom-20 left-1/4 text-4xl md:text-5xl">💙</div>
        </div>
      )}

      {/* Subtle background blobs - no animations */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-10 right-20 w-80 h-80 bg-purple-300 dark:bg-purple-700 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-300 dark:bg-blue-700 rounded-full blur-3xl opacity-20"></div>
      </div>

      <div className="container mx-auto max-w-5xl relative z-10">
        <Card className="shadow-2xl border-2 border-purple-200 dark:border-purple-800 bg-background/95 backdrop-blur">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="flex items-center justify-center gap-3">
              <PawPrint className="w-8 h-8 text-primary" />
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Welcome to ZiggySitters!
              </h1>
              <span className="text-2xl">🎉</span>
            </div>
                
            {/* Progress indicator - hide for pet owners at step 2 */}
            {!(data.role === 'pet_owner' && step >= 2) && (
              <>
                <div className="flex justify-center mb-4">
                  <div className="flex gap-2">
                    {Array.from({ length: totalSteps }, (_, i) => (
                      <div
                        key={i}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          i + 1 <= step 
                            ? 'bg-gradient-to-r from-purple-500 to-blue-500 scale-110' 
                            : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                <p className="text-sm md:text-base text-muted-foreground">
                  Step {step} of {totalSteps}: {getStepTitle()}
                </p>
              </>
            )}
          </CardHeader>
              
          <CardContent className={data.role === 'pet_owner' && step >= 2 ? 'p-0' : 'p-6 md:p-8'}>
            {step === 1 && renderRoleSelection()}
            {step === 2 && data.role === 'pet_sitter' && renderBasicInfo()}
            {step === 2 && data.role === 'pet_owner' && renderRoleSpecificOnboarding()}
            {step >= 3 && data.role === 'pet_sitter' && renderRoleSpecificOnboarding()}
          </CardContent>
          
          {/* Navigation buttons - hide for pet owners after step 1 */}
          {step <= 2 && !(data.role === 'pet_owner' && step >= 2) && (
            <div className="flex justify-between gap-4 px-6 pb-6 pt-0">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={step === 1}
                className="px-6 border-2 border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/20"
              >
                Previous
              </Button>
              
              <Button
                onClick={nextStep}
                disabled={
                  isLoading ||
                  (step === 1 && !data.role) ||
                  (step === 2 && (!data.first_name || !data.last_name || !data.phone || !data.address || !data.suburb))
                }
                className="px-6 bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 hover:from-purple-600 hover:via-blue-600 hover:to-indigo-600 shadow-lg"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></span>
                    Setting up...
                  </>
                ) : step === 1 && data.role === 'pet_owner' ? (
                  'Find Sitters! 🔍'
                ) : step === 2 ? (
                  'Save & Continue ✨'
                ) : (
                  'Next 🎉'
                )}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}