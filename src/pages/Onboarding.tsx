import { useState, useEffect } from 'react';
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
import PetOwnerOnboarding from '@/components/onboarding/PetOwnerOnboarding';
import SitterOnboarding from '@/components/onboarding/SitterOnboarding';
import EnhancedSitterOnboarding from '@/components/onboarding/EnhancedSitterOnboarding';
import { useIsMobile } from '@/hooks/use-mobile';
import { Textarea } from '@/components/ui/textarea';
import { useProfile } from '@/contexts/ProfileContext';

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
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [profileId, setProfileId] = useState<string>('');
  const [data, setData] = useState<OnboardingData>({
    role: null,
    city: 'Auckland'
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Check if user is admin - if so, skip onboarding
    const checkAdminStatus = async () => {
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
          navigate('/admin-dashboard');
          return;
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };

    checkAdminStatus();

    // Pre-fill with existing user data if available
    const fetchExistingProfile = async () => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!error && profile) {
          setData(prev => ({
            ...prev,
            first_name: profile.first_name || user.user_metadata?.first_name || '',
            last_name: profile.last_name || user.user_metadata?.last_name || '',
            phone: profile.phone || '',
            address: profile.address || '',
            suburb: profile.suburb || '',
            city: profile.city || 'Auckland',
            postal_code: profile.postal_code || '',
            bio: profile.bio || '',
            avatar_url: profile.avatar_url || '',
          }));
        } else {
          // If no profile exists, use signup metadata
          setData(prev => ({
            ...prev,
            first_name: user.user_metadata?.first_name || '',
            last_name: user.user_metadata?.last_name || '',
          }));
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchExistingProfile();
  }, [user, navigate]);

  const handleRoleSelection = (role: UserRole) => {
    setData(prev => ({ ...prev, role }));
  };

  const handleInputChange = (field: string, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
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

      if (profileError || !profileData) throw new Error('Failed to update profile');

      setProfileId(profileData.id);
      setStep(step + 1);
    } catch (error: any) {
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

      toast({
        title: "Profile completed!",
        description: "Welcome to ZiggySitters! Your profile has been set up successfully.",
      });

      // Navigate immediately - context state is already updated
      navigate('/onboarding-complete', { replace: true });
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
      console.log('Completing basic onboarding for sitter role');
      console.log('Current user ID:', user?.id);
      console.log('Current profile:', profile);
      
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
      
      toast({
        title: "Welcome to ZiggySitters!",
        description: "Your sitter profile is set up!",
      });
      
      // Navigate immediately - context state is already updated
      navigate('/', { replace: true });
    } catch (error: any) {
      console.error('Error in handleSitterOnboardingComplete:', error);
      toast({
        title: "Error completing onboarding",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const nextStep = () => {
    if (step === 1 && !data.role) {
      toast({
        title: "Please select a role",
        description: "Choose whether you want to be a pet owner, sitter, or both.",
        variant: "destructive",
      });
      return;
    }
    if (step === 2) {
      saveBasicProfile();
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const renderRoleSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">How would you like to use ZiggySitters?</h2>
        <p className="text-muted-foreground">Choose your role to customize your experience</p>
      </div>
      
      <div className="grid gap-4">
        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${data.role === 'pet_owner' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => handleRoleSelection('pet_owner')}
        >
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Pet Owner</h3>
                <p className="text-sm text-muted-foreground">Find trusted sitters for your beloved pets</p>
              </div>
              <RadioGroup value={data.role || ''}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pet_owner" id="pet_owner" />
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${data.role === 'pet_sitter' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => handleRoleSelection('pet_sitter')}
        >
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <UserCheck className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Pet Sitter</h3>
                <p className="text-sm text-muted-foreground">Offer pet sitting services and earn money</p>
              </div>
              <RadioGroup value={data.role || ''}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pet_sitter" id="pet_sitter" />
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

      </div>
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
              placeholder="Your mobile number"
              value={data.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              required
            />
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
          <Label htmlFor="bio">About You</Label>
          <Textarea
            id="bio"
            placeholder="Tell us about yourself, your experience with pets, or what makes you special..."
            value={data.bio || ''}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            rows={4}
          />
        </div>
      </div>
    </div>
  );

  const renderRoleSpecificOnboarding = () => {
    if (!data.role) return null;

    if (data.role === 'pet_owner') {
      return <PetOwnerOnboarding profileId={profile?.id || ''} userId={user?.id || ''} onComplete={handleOnboardingComplete} />;
    }
    
    if (data.role === 'pet_sitter') {
      return <EnhancedSitterOnboarding profileId={profile?.id || ''} userId={user?.id || ''} onComplete={handleSitterOnboardingComplete} />;
    }
    
    return null;
  };

  const getTotalSteps = () => {
    if (data.role === 'pet_owner' || data.role === 'pet_sitter') return 3;
    return 2;
  };

  const getStepTitle = () => {
    if (step === 1) return 'Choose Your Role';
    if (step === 2) return 'Basic Information';
    if (data.role === 'pet_owner') {
      if (step === 3) return 'Your Pets';
    } else if (data.role === 'pet_sitter') {
      if (step === 3) return 'Sitter Services';
    }
    return '';
  };

  const totalSteps = getTotalSteps();

  return (
    <div className={`min-h-screen bg-background ${isMobile ? 'p-4' : 'py-12'}`}>
      <div className={`container mx-auto ${isMobile ? 'px-0' : 'px-4'}`}>
        <div className={`max-w-${isMobile ? 'full' : '4xl'} mx-auto`}>
          <Card>
              <CardHeader className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <PawPrint className="w-8 h-8 text-primary mr-2" />
                  <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>Welcome to ZiggySitters</h1>
                </div>
                
                {/* Progress indicator */}
                <div className="flex justify-center mb-6">
                  <div className="flex space-x-2">
                    {Array.from({ length: totalSteps }, (_, i) => (
                      <div
                        key={i}
                        className={`${isMobile ? 'w-2 h-2' : 'w-3 h-3'} rounded-full ${
                          i + 1 <= step ? 'bg-primary' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                <CardTitle className={`${isMobile ? 'text-lg' : 'text-xl'} mb-2`}>
                  Step {step} of {totalSteps}: {getStepTitle()}
                </CardTitle>
              </CardHeader>
              
              <CardContent className={isMobile ? 'p-4' : 'p-6'}>
                {step === 1 && renderRoleSelection()}
                {step === 2 && renderBasicInfo()}
                {step >= 3 && renderRoleSpecificOnboarding()}
              </CardContent>
              
              {/* Navigation buttons */}
              {step <= 2 && (
                <div className={`flex justify-between ${isMobile ? 'p-4 pt-0' : 'p-6 pt-0'}`}>
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={step === 1}
                    className={isMobile ? 'px-4' : 'px-6'}
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
                    className={isMobile ? 'px-4' : 'px-6'}
                  >
                    {step === 2 ? 'Save & Continue' : 'Next'}
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
  );
}