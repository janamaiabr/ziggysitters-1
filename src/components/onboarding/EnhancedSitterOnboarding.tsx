import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, PlusCircle, X, Calendar, Shield, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Service {
  service_type: 'dog_walking' | 'daycare' | 'overnight_boarding' | 'pet_sitting_owners_home' | 'pet_sitting_sitters_home';
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
  { key: 'dog_walking', label: 'Dog Walking', rate_types: ['hourly_rate'] },
  { key: 'daycare', label: 'Pet Daycare', rate_types: ['daily_rate'] },
  { key: 'overnight_boarding', label: 'Overnight Boarding', rate_types: ['overnight_rate'] },
  { key: 'pet_sitting_owners_home', label: 'Pet Sitting (Owner\'s Home)', rate_types: ['hourly_rate', 'daily_rate'] },
  { key: 'pet_sitting_sitters_home', label: 'Pet Sitting (Sitter\'s Home)', rate_types: ['hourly_rate', 'daily_rate'] }
];

export default function EnhancedSitterOnboarding({ profileId, userId, onComplete }: EnhancedSitterOnboardingProps) {
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState('overview');
  
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
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
  
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
          title: `${type === 'id' ? 'ID' : 'Blue Card'} document uploaded!`,
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
        setCurrentTab('overview');
        return;
      }

      if (services.length === 0) {
        toast({
          title: "Services required",
          description: "Please add at least one service you offer.",
          variant: "destructive",
        });
        setCurrentTab('services');
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
          setCurrentTab('services');
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


      // Send notification to admin about new sitter for approval
      await supabase.functions.invoke('send-verification-request-email', {
        body: {
          user_name: `${userId}`, // We'll get this from profile in the edge function
          user_email: `${userId}`, // We'll get this from profile in the edge function  
          user_id: userId,
          documents_uploaded: !!(idDocumentUrl || blueCardUrl)
        }
      });

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
          toast({
            title: "Payment setup notice",
            description: "You can set up your payment account later from your profile.",
            variant: "default",
          });
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

  const isTabComplete = (tab: string) => {
    switch (tab) {
      case 'overview':
        return true; // Bio is now optional
      case 'services':
        return services.length > 0 && services.every(s => s.hourly_rate || s.daily_rate || s.overnight_rate);
      case 'verification':
        return idDocumentUrl || blueCardUrl; // At least one document
      default:
        return false;
    }
  };

  return (
    <div className="space-y-6 px-2 sm:px-0">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold mb-2">Complete Your Sitter Profile</h2>
        <p className="text-muted-foreground text-sm sm:text-base">Provide all the information pet owners need to choose you</p>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 gap-1 h-auto p-1">
          <TabsTrigger value="overview" className="flex flex-col sm:flex-row items-center gap-1 text-xs md:text-sm p-2 h-auto min-h-[3rem] sm:min-h-0">
            <FileText className="w-3 h-3 flex-shrink-0" />
            <span className="text-center sm:text-left truncate">Overview</span>
            {isTabComplete('overview') && <span className="text-green-500 text-xs">✓</span>}
          </TabsTrigger>
          <TabsTrigger value="services" className="flex flex-col sm:flex-row items-center gap-1 text-xs md:text-sm p-2 h-auto min-h-[3rem] sm:min-h-0">
            <PlusCircle className="w-3 h-3 flex-shrink-0" />
            <span className="text-center sm:text-left truncate">Services</span>
            {isTabComplete('services') && <span className="text-green-500 text-xs">✓</span>}
          </TabsTrigger>
          <TabsTrigger value="verification" className="flex flex-col sm:flex-row items-center gap-1 text-xs md:text-sm p-2 h-auto min-h-[3rem] sm:min-h-0">
            <Shield className="w-3 h-3 flex-shrink-0" />
            <span className="text-center sm:text-left truncate">Verify</span>
            {isTabComplete('verification') && <span className="text-green-500 text-xs">✓</span>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
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
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Services & Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
        </TabsContent>


        <TabsContent value="verification" className="space-y-4">
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
                  <Label>Blue Card / Working with Children Check (Optional)</Label>
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(e.target.files, 'blue_card')}
                    id="blue-card"
                  />
                  {blueCardUrl && (
                    <p className="text-sm text-green-600">✓ Blue Card uploaded</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button 
          onClick={handleSaveAndComplete} 
          className="px-8"
          disabled={!isTabComplete('overview') || !isTabComplete('services')}
        >
          Complete Profile & Submit for Approval
        </Button>
      </div>
    </div>
  );
}