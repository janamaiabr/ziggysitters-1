import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PawPrint, User, UserCheck, Heart } from 'lucide-react';

type UserRole = 'pet_owner' | 'pet_sitter' | 'both';

interface OnboardingData {
  role: UserRole | null;
  phone?: string;
  address?: string;
  suburb?: string;
  city?: string;
  postal_code?: string;
  bio?: string;
  experience_years?: number;
  has_fenced_yard?: boolean;
  services?: Array<{
    service_type: string;
    hourly_rate?: number;
    daily_rate?: number;
    overnight_rate?: number;
  }>;
}

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    role: null,
    city: 'Auckland'
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleRoleSelection = (role: UserRole) => {
    setData(prev => ({ ...prev, role }));
  };

  const handleInputChange = (field: string, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleServiceChange = (serviceType: string, field: string, value: number) => {
    setData(prev => {
      const services = prev.services || [];
      const existingServiceIndex = services.findIndex(s => s.service_type === serviceType);
      
      if (existingServiceIndex >= 0) {
        const updatedServices = [...services];
        updatedServices[existingServiceIndex] = {
          ...updatedServices[existingServiceIndex],
          [field]: value
        };
        return { ...prev, services: updatedServices };
      } else {
        return {
          ...prev,
          services: [...services, { service_type: serviceType, [field]: value }]
        };
      }
    });
  };

  const saveProfile = async () => {
    setIsLoading(true);
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          role: data.role === 'both' ? 'pet_sitter' : data.role,
          phone: data.phone,
          address: data.address,
          suburb: data.suburb,
          city: data.city,
          postal_code: data.postal_code,
          bio: data.bio,
        })
        .eq('user_id', user?.id);

      if (profileError) throw profileError;

      // If user is a sitter, save service information
      if (data.role === 'pet_sitter' || data.role === 'both') {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user?.id)
          .single();

        if (profileData && data.services) {
          for (const service of data.services) {
            const serviceTypeMap: Record<string, 'overnight_boarding' | 'daycare' | 'dog_walking' | 'drop_in_visits' | 'grooming' | 'medication_admin'> = {
              'pet_sitting': 'overnight_boarding',
              'dog_walking': 'dog_walking'
            };

            const { error: serviceError } = await supabase
              .from('sitter_services')
              .insert({
                sitter_id: profileData.id,
                service_type: serviceTypeMap[service.service_type] || 'overnight_boarding' as const,
                hourly_rate: service.hourly_rate,
                daily_rate: service.daily_rate,
                overnight_rate: service.overnight_rate,
                experience_years: data.experience_years || 0,
                has_fenced_yard: data.has_fenced_yard || false,
              });

            if (serviceError) throw serviceError;
          }
        }
      }

      toast({
        title: "Profile completed!",
        description: "Welcome to ZiggySitters! Your profile has been set up successfully.",
      });

      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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

        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${data.role === 'both' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => handleRoleSelection('both')}
        >
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Both</h3>
                <p className="text-sm text-muted-foreground">Find sitters for your pets and offer sitting services</p>
              </div>
              <RadioGroup value={data.role || ''}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="both" id="both" />
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
        <h2 className="text-2xl font-bold mb-2">Basic Information</h2>
        <p className="text-muted-foreground">Tell us a bit about yourself and your location</p>
      </div>

      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Your phone number"
              value={data.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postal_code">Postal Code</Label>
            <Input
              id="postal_code"
              placeholder="1010"
              value={data.postal_code || ''}
              onChange={(e) => handleInputChange('postal_code', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            placeholder="Your street address"
            value={data.address || ''}
            onChange={(e) => handleInputChange('address', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="suburb">Suburb</Label>
            <Input
              id="suburb"
              placeholder="Your suburb"
              value={data.suburb || ''}
              onChange={(e) => handleInputChange('suburb', e.target.value)}
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

  const renderSitterInfo = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Sitter Services</h2>
        <p className="text-muted-foreground">Set up your services and rates</p>
      </div>

      <div className="grid gap-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="experience_years">Years of Experience</Label>
            <Input
              id="experience_years"
              type="number"
              placeholder="0"
              value={data.experience_years || ''}
              onChange={(e) => handleInputChange('experience_years', parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="flex items-center space-x-2 pt-6">
            <Checkbox
              id="has_fenced_yard"
              checked={data.has_fenced_yard || false}
              onCheckedChange={(checked) => handleInputChange('has_fenced_yard', checked)}
            />
            <Label htmlFor="has_fenced_yard">I have a fenced yard</Label>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Service Rates (NZ$)</h3>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pet Sitting (at owner's home)</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Hourly Rate</Label>
                <Input
                  type="number"
                  placeholder="25"
                  onChange={(e) => handleServiceChange('pet_sitting', 'hourly_rate', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label>Daily Rate</Label>
                <Input
                  type="number"
                  placeholder="60"
                  onChange={(e) => handleServiceChange('pet_sitting', 'daily_rate', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label>Overnight Rate</Label>
                <Input
                  type="number"
                  placeholder="80"
                  onChange={(e) => handleServiceChange('pet_sitting', 'overnight_rate', parseFloat(e.target.value) || 0)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dog Walking</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Hourly Rate</Label>
                <Input
                  type="number"
                  placeholder="20"
                  onChange={(e) => handleServiceChange('dog_walking', 'hourly_rate', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label>Daily Rate</Label>
                <Input
                  type="number"
                  placeholder="40"
                  onChange={(e) => handleServiceChange('dog_walking', 'daily_rate', parseFloat(e.target.value) || 0)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const getTotalSteps = () => {
    if (data.role === 'pet_owner') return 2;
    if (data.role === 'pet_sitter' || data.role === 'both') return 3;
    return 2;
  };

  const shouldShowSitterStep = () => {
    return step === 3 && (data.role === 'pet_sitter' || data.role === 'both');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <PawPrint className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold">Welcome to ZiggySitters!</h1>
          <p className="text-muted-foreground">Let's set up your profile</p>
          
          <div className="flex justify-center mt-4">
            <div className="flex space-x-2">
              {Array.from({ length: getTotalSteps() }, (_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i + 1 <= step ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <Card className="shadow-xl">
          <CardContent className="p-8">
            {step === 1 && renderRoleSelection()}
            {step === 2 && renderBasicInfo()}
            {shouldShowSitterStep() && renderSitterInfo()}

            <div className="flex justify-between mt-8">
              {step > 1 && (
                <Button variant="outline" onClick={prevStep}>
                  Previous
                </Button>
              )}
              
              <div className="ml-auto">
                {step < getTotalSteps() ? (
                  <Button onClick={nextStep}>
                    Next
                  </Button>
                ) : (
                  <Button onClick={saveProfile} disabled={isLoading}>
                    {isLoading ? "Setting up..." : "Complete Setup"}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}