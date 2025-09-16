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
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  suburb?: string;
  city?: string;
  postal_code?: string;
  bio?: string;
  avatar_url?: string;
  experience_years?: number;
  has_fenced_yard?: boolean;
  accepted_pet_species?: string[];
  accepted_pet_sizes?: string[];
  comfortable_with_medication?: boolean;
  pet_sleeping_location?: string;
  has_other_pets?: boolean;
  other_pets_description?: string;
  services?: Array<{
    service_type: 'dog_walking' | 'daycare' | 'overnight_boarding';
    rate: number;
    description?: string;
    what_included?: string;
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
    city: 'Auckland',
    accepted_pet_species: [],
    accepted_pet_sizes: [],
    services: []
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Pre-fill with existing user data if available
    const fetchExistingProfile = async () => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

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

  const handleServiceChange = (serviceType: 'dog_walking' | 'daycare' | 'overnight_boarding', field: string, value: any) => {
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
        const newService = {
          service_type: serviceType,
          rate: field === 'rate' ? value : 0,
          description: field === 'description' ? value : undefined,
          what_included: field === 'what_included' ? value : undefined,
          [field]: value
        };
        return {
          ...prev,
          services: [...services, newService]
        };
      }
    });
  };

  const handleArrayToggle = (field: 'accepted_pet_species' | 'accepted_pet_sizes', value: string) => {
    setData(prev => {
      const currentArray = prev[field] || [];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return { ...prev, [field]: newArray };
    });
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

  const saveProfile = async () => {
    setIsLoading(true);
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          role: data.role === 'both' ? 'pet_sitter' : data.role,
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
          address: data.address,
          suburb: data.suburb,
          city: data.city,
          postal_code: data.postal_code,
          bio: data.bio,
          avatar_url: data.avatar_url,
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
            const rateField = service.service_type === 'dog_walking' ? 'hourly_rate' : 
                             service.service_type === 'daycare' ? 'daily_rate' : 'overnight_rate';

            const serviceData: any = {
              sitter_id: profileData.id,
              service_type: service.service_type,
              description: service.description,
              experience_years: data.experience_years || 0,
              has_fenced_yard: data.has_fenced_yard || false,
              accepted_pet_species: data.accepted_pet_species,
              accepted_pet_sizes: data.accepted_pet_sizes,
              allows_senior_pets: true,
              allows_puppies: true,
              max_pets: 3,
            };

            // Set the appropriate rate field
            serviceData[rateField] = service.rate;

            const { error: serviceError } = await supabase
              .from('sitter_services')
              .upsert(serviceData, {
                onConflict: 'sitter_id,service_type'
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
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              placeholder="Your first name"
              value={data.first_name || ''}
              onChange={(e) => handleInputChange('first_name', e.target.value)}
              disabled={!!(data.first_name)} // Disable if already filled from signup
            />
            {data.first_name && (
              <p className="text-xs text-muted-foreground">From your signup information</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              placeholder="Your last name"
              value={data.last_name || ''}
              onChange={(e) => handleInputChange('last_name', e.target.value)}
              disabled={!!(data.last_name)} // Disable if already filled from signup
            />
            {data.last_name && (
              <p className="text-xs text-muted-foreground">From your signup information</p>
            )}
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
              min="0"
              max="50"
              placeholder="0"
              value={data.experience_years || ''}
              onChange={(e) => handleInputChange('experience_years', parseInt(e.target.value) || 0)}
              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
          <h3 className="font-semibold">Pet Types & Sizes</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Pet Species I can care for:</Label>
              <div className="space-y-2">
                {['dog', 'cat', 'bird', 'rabbit', 'fish'].map((species) => (
                  <div key={species} className="flex items-center space-x-2">
                    <Checkbox
                      id={`species-${species}`}
                      checked={data.accepted_pet_species?.includes(species) || false}
                      onCheckedChange={() => handleArrayToggle('accepted_pet_species', species)}
                    />
                    <Label htmlFor={`species-${species}`} className="capitalize">{species}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Pet Sizes I can care for:</Label>
              <div className="space-y-2">
                {['small', 'medium', 'large', 'extra_large'].map((size) => (
                  <div key={size} className="flex items-center space-x-2">
                    <Checkbox
                      id={`size-${size}`}
                      checked={data.accepted_pet_sizes?.includes(size) || false}
                      onCheckedChange={() => handleArrayToggle('accepted_pet_sizes', size)}
                    />
                    <Label htmlFor={`size-${size}`} className="capitalize">{size.replace('_', ' ')}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Care Details</h3>
          <div className="grid gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="comfortable_with_medication"
                checked={data.comfortable_with_medication || false}
                onCheckedChange={(checked) => handleInputChange('comfortable_with_medication', checked)}
              />
              <Label htmlFor="comfortable_with_medication">I'm comfortable administering pet medication</Label>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pet_sleeping_location">Where will pets sleep during overnight stays?</Label>
              <Textarea
                id="pet_sleeping_location"
                placeholder="e.g., On their own bed in the living room, in my bedroom, wherever they're comfortable..."
                value={data.pet_sleeping_location || ''}
                onChange={(e) => handleInputChange('pet_sleeping_location', e.target.value)}
                rows={2}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_other_pets"
                checked={data.has_other_pets || false}
                onCheckedChange={(checked) => handleInputChange('has_other_pets', checked)}
              />
              <Label htmlFor="has_other_pets">I have other pets at home</Label>
            </div>

            {data.has_other_pets && (
              <div className="space-y-2">
                <Label htmlFor="other_pets_description">Tell us about your other pets:</Label>
                <Textarea
                  id="other_pets_description"
                  placeholder="e.g., 2 friendly golden retrievers, 1 cat who loves attention..."
                  value={data.other_pets_description || ''}
                  onChange={(e) => handleInputChange('other_pets_description', e.target.value)}
                  rows={2}
                />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Service Rates & Details</h3>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dog Walking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Rate per walk (NZ$)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="25"
                  onChange={(e) => handleServiceChange('dog_walking', 'rate', parseFloat(e.target.value) || 0)}
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div className="space-y-2">
                <Label>What's included in your dog walking service?</Label>
                <Textarea
                  placeholder="e.g., 30-45 minute walks, fresh water refill, basic exercise, updates with photos..."
                  onChange={(e) => handleServiceChange('dog_walking', 'what_included', e.target.value)}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Additional notes for dog walking:</Label>
                <Textarea
                  placeholder="e.g., Happy to follow specific routes, can handle reactive dogs with proper notice..."
                  onChange={(e) => handleServiceChange('dog_walking', 'description', e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Daycare</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Rate per day (NZ$)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="60"
                  onChange={(e) => handleServiceChange('daycare', 'rate', parseFloat(e.target.value) || 0)}
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div className="space-y-2">
                <Label>What's included in your daycare service?</Label>
                <Textarea
                  placeholder="e.g., 8-10 hours of care, feeding, playtime, walks, regular updates..."
                  onChange={(e) => handleServiceChange('daycare', 'what_included', e.target.value)}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Additional notes for daycare:</Label>
                <Textarea
                  placeholder="e.g., Pets will be supervised at all times, lots of garden space for play..."
                  onChange={(e) => handleServiceChange('daycare', 'description', e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Overnight Boarding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Rate per night (NZ$)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="80"
                  onChange={(e) => handleServiceChange('overnight_boarding', 'rate', parseFloat(e.target.value) || 0)}
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div className="space-y-2">
                <Label>What's included in your overnight boarding?</Label>
                <Textarea
                  placeholder="e.g., 24-hour care, feeding, walks, playtime, sleeping arrangements, regular updates..."
                  onChange={(e) => handleServiceChange('overnight_boarding', 'what_included', e.target.value)}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Additional notes for overnight boarding:</Label>
                <Textarea
                  placeholder="e.g., Pets will have full access to the house, treated like family members..."
                  onChange={(e) => handleServiceChange('overnight_boarding', 'description', e.target.value)}
                  rows={2}
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
    <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
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