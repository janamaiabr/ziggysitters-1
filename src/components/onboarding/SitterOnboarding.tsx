import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Upload, PlusCircle, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Service {
  service_type: 'drop_in_visits' | 'pet_sitting_owners_home' | 'pet_sitting_sitters_home';
  rate: number;
  description: string;
  what_included: string;
}

interface SitterOnboardingProps {
  profileId: string;
  userId: string;
  onComplete: (sitterId: string) => void;
}

const petSpecies = ['dog', 'cat', 'bird', 'reptile', 'rabbit', 'horse'];
const petSizes = ['small', 'medium', 'large', 'extra_large'];

const serviceTypes = [
  /* DOG_WALKING */ // { key: 'dog_walking', label: 'Dog Walking', rate_type: 'hourly' }, /* END_DOG_WALKING */
  { key: 'pet_sitting_owners_home', label: 'Pet Sitting (Your Home)', rate_type: 'daily' },
  { key: 'pet_sitting_sitters_home', label: 'Pet Sitting (Sitter\'s Home)', rate_type: 'daily' },
  { key: 'drop_in_visits', label: 'Drop-in Visits', rate_type: 'hourly' }
];

export default function SitterOnboarding({ profileId, userId, onComplete }: SitterOnboardingProps) {
  const { toast } = useToast();
  const [experienceYears, setExperienceYears] = useState(0);
  const [hasFencedYard, setHasFencedYard] = useState(false);
  const [maxPets, setMaxPets] = useState(1);
  const [acceptedSpecies, setAcceptedSpecies] = useState<string[]>(['dog']);
  const [acceptedSizes, setAcceptedSizes] = useState<string[]>(['small', 'medium']);
  const [allowsPuppies, setAllowsPuppies] = useState(true);
  const [allowsSeniorPets, setAllowsSeniorPets] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [portfolioPhotos, setPortfolioPhotos] = useState<string[]>([]);
  const [bio, setBio] = useState('');

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
      // Suggest lower, competitive rates
      const defaultRate = serviceType.rate_type === 'hourly' ? 15 : 35;
      setServices(prev => [...prev, {
        service_type: serviceType.key,
        rate: defaultRate,
        description: '',
        what_included: ''
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

  const handlePortfolioUpload = async (files: FileList | null) => {
    if (!files) return;

    try {
      const uploadPromises = Array.from(files).map(async (file, index) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-portfolio-${Date.now()}-${index}.${fileExt}`;
        
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
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    try {
      // Validate that all services have valid rates
      for (const service of services) {
        if (!service.rate || service.rate <= 0) {
          toast({
            title: "Invalid rate",
            description: `Please enter a valid rate for ${serviceTypes.find(st => st.key === service.service_type)?.label}`,
            variant: "destructive",
          });
          return;
        }
      }

      // Get profile ID
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError || !profileData) throw new Error('Profile not found');

      // Update profile with bio
      await supabase
        .from('profiles')
        .update({ bio })
        .eq('user_id', userId);

      // Save each service
      for (const service of services) {
        const rateField = serviceTypes.find(st => st.key === service.service_type)?.rate_type === 'hourly' ? 'hourly_rate' :
                         serviceTypes.find(st => st.key === service.service_type)?.rate_type === 'daily' ? 'daily_rate' : 'overnight_rate';

        const serviceData = {
          sitter_id: profileData.id,
          service_type: service.service_type,
          description: service.description,
          experience_years: experienceYears,
          has_fenced_yard: hasFencedYard,
          accepted_pet_species: acceptedSpecies as any,
          accepted_pet_sizes: acceptedSizes as any,
          allows_senior_pets: allowsSeniorPets,
          allows_puppies: allowsPuppies,
          max_pets: maxPets,
          [rateField]: service.rate
        };

        const { error: serviceError } = await supabase
          .from('sitter_services')
          .upsert(serviceData, {
            onConflict: 'sitter_id,service_type'
          });

        if (serviceError) throw serviceError;
      }

      onComplete(profileData.id);
    } catch (error: any) {
      toast({
        title: "Error saving sitter information",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Set up your sitter profile</h2>
        <p className="text-muted-foreground">Tell pet owners about your experience and services</p>
      </div>

      {/* Experience & Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Experience & Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Years of Experience</Label>
              <Input
                type="number"
                min="0"
                max="50"
                value={experienceYears}
                onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
              />
            </div>
            
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
            <Label>Bio</Label>
            <Textarea
              placeholder="Tell pet owners about yourself, your experience, and why you love caring for pets..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Pet Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Pet Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Pet Species I Accept</Label>
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
            <Label>Pet Sizes I Accept</Label>
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
        </CardContent>
      </Card>

      {/* Services & Rates */}
      <Card>
        <CardHeader>
          <CardTitle>Services & Rates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Important:</strong> From your listed price, 10% platform fee + 3% Stripe payment processing fee will be deducted. 
              For example: $100 booking → You receive $87 ($100 - $10 platform fee - $3 Stripe fee).
            </p>
          </div>
          <div className="space-y-2">
            <Label>Available Services</Label>
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
                  
                  <div className="space-y-2">
                    <Label>Rate (${serviceType?.rate_type === 'hourly' ? 'per hour' : serviceType?.rate_type === 'daily' ? 'per day' : 'per night'})</Label>
                    <Input
                      type="number"
                      min="10"
                      max="200"
                      value={service.rate}
                      onChange={(e) => updateService(service.service_type, 'rate', parseFloat(e.target.value) || 0)}
                      required
                    />
                    {service.rate > 0 && (
                      <p className="text-xs text-muted-foreground">
                        You'll receive approximately ${Math.round(service.rate * 0.87 * 100) / 100} after fees (87% of ${service.rate})
                      </p>
                    )}
                    {service.rate <= 0 && (
                      <p className="text-sm text-destructive">Rate must be greater than $0</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Suggested: ${serviceType?.rate_type === 'hourly' ? '15-25/hr' : '35-50/day'} for competitive pricing
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Service Description</Label>
                    <Textarea
                      placeholder="Describe what this service includes..."
                      value={service.description}
                      onChange={(e) => updateService(service.service_type, 'description', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </CardContent>
      </Card>

      {/* Portfolio Photos */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Photos (Optional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Upload photos showing your experience with pets</Label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handlePortfolioUpload(e.target.files)}
                className="hidden"
                id="portfolio-photos"
              />
              <Label htmlFor="portfolio-photos" className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg hover:border-gray-400">
                  <Upload className="w-4 h-4" />
                  <span>Upload Portfolio Photos</span>
                </div>
              </Label>
            </div>
            {portfolioPhotos.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {portfolioPhotos.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Portfolio photo ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="px-8">
          Save Sitter Profile
        </Button>
      </div>
    </div>
  );
}