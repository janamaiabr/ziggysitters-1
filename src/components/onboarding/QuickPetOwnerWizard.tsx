import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/contexts/ProfileContext';
import { useEventTracking } from '@/hooks/useEventTracking';
import { Dog, Cat, Bird, Rabbit, MapPin, Search, ArrowRight, ArrowLeft, Sparkles, CheckCircle } from 'lucide-react';

type PetType = 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';

interface WizardData {
  petType: PetType | null;
  petName: string;
  suburb: string;
}

const petOptions = [
  { type: 'dog' as PetType, icon: Dog, label: 'Dog', emoji: '🐕' },
  { type: 'cat' as PetType, icon: Cat, label: 'Cat', emoji: '🐱' },
  { type: 'bird' as PetType, icon: Bird, label: 'Bird', emoji: '🐦' },
  { type: 'rabbit' as PetType, icon: Rabbit, label: 'Rabbit', emoji: '🐰' },
  { type: 'other' as PetType, icon: Sparkles, label: 'Other', emoji: '🐾' },
];

export function QuickPetOwnerWizard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, loading: profileLoading, refetch } = useProfile();
  const { trackOnboarding, trackConversion } = useEventTracking();
  
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<WizardData>({
    petType: null,
    petName: '',
    suburb: '',
  });

  useEffect(() => {
    trackOnboarding('wizard_started', { step: 1 });
  }, []);

  // Show loading state while profile is being fetched
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-pink-950/20 dark:via-purple-950/20 dark:to-blue-950/20 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">🐾</div>
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // If no profile, redirect to onboarding
  if (!profile) {
    navigate('/onboarding', { replace: true });
    return null;
  }

  const progress = (step / 3) * 100;

  const handlePetSelect = (petType: PetType) => {
    setData(prev => ({ ...prev, petType }));
    trackOnboarding('pet_type_selected', { pet_type: petType });
    // Auto-advance after selection
    setTimeout(() => setStep(2), 300);
  };

  const handleNext = () => {
    if (step === 2 && !data.petName.trim()) {
      toast({ title: "Please enter your pet's name", variant: "destructive" });
      return;
    }
    trackOnboarding(`step_${step}_completed`, { step, data });
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleComplete = async () => {
    if (!data.suburb.trim()) {
      toast({ title: "Please enter your suburb", variant: "destructive" });
      return;
    }

    if (!profile) {
      toast({ title: "Profile not loaded. Please refresh the page.", variant: "destructive" });
      return;
    }

    setSaving(true);
    trackOnboarding('wizard_completing', { data });

    try {
      // Update profile with suburb - use profile.id which we've verified exists
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ suburb: data.suburb, city: 'Auckland' })
        .eq('id', profile.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        throw profileError;
      }

      // Create pet
      if (data.petType && data.petName) {
        const { error: petError } = await supabase
          .from('pets')
          .insert({
            owner_id: profile.id,
            name: data.petName,
            species: data.petType,
          });

        if (petError) {
          console.error('Error creating pet:', petError);
          // Don't throw - pet creation is non-critical
        }
      }

      // Don't call refetch() - it causes loading state issues
      // Just navigate directly - FindSitters doesn't need the updated profile
      
      trackConversion('wizard_completed', { 
        pet_type: data.petType, 
        pet_name: data.petName,
        suburb: data.suburb 
      });

      toast({
        title: "You're all set! 🎉",
        description: "Let's find the perfect sitter for " + data.petName,
      });

      // Navigate to search with pre-filled location
      navigate(`/find-sitters?location=${encodeURIComponent(data.suburb)}`);
    } catch (error) {
      console.error('Error completing wizard:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again",
        variant: "destructive",
      });
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-pink-950/20 dark:via-purple-950/20 dark:to-blue-950/20 flex items-center justify-center p-4">
      {/* Subtle background decoration - no animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-20 left-1/4 text-5xl">🐾</div>
        <div className="absolute top-32 right-1/4 text-4xl">💖</div>
        <div className="absolute bottom-32 right-1/3 text-4xl">✨</div>
      </div>

      <Card className="w-full max-w-lg shadow-2xl border-2 border-purple-200 dark:border-purple-800 relative overflow-hidden">
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-purple-100 dark:bg-purple-900">
          <div 
            className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <CardHeader className="text-center pt-8">
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-3 h-3 rounded-full transition-all ${
                  s === step
                    ? 'bg-purple-500 scale-125'
                    : s < step
                    ? 'bg-green-500'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
          <CardTitle className="text-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            {step === 1 && "What kind of pet do you have? 🐾"}
            {step === 2 && "What's your pet's name? 💕"}
            {step === 3 && "Where are you located? 📍"}
          </CardTitle>
          <p className="text-muted-foreground mt-2 text-sm">
            Step {step} of 3
          </p>
        </CardHeader>

        <CardContent className="space-y-6 pb-8">
          {/* Step 1: Pet Type */}
          {step === 1 && (
            <div className="grid grid-cols-3 gap-3 animate-in fade-in slide-in-from-right-4 duration-300">
              {petOptions.map((pet) => (
                <button
                  key={pet.type}
                  onClick={() => handlePetSelect(pet.type)}
                  className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                    data.petType === pet.type
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/50 shadow-lg'
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{pet.emoji}</div>
                  <div className="text-sm font-medium">{pet.label}</div>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Pet Name */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-6">
                <span className="text-6xl">
                  {petOptions.find(p => p.type === data.petType)?.emoji || '🐾'}
                </span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="petName" className="text-base">Pet's Name</Label>
                <Input
                  id="petName"
                  placeholder="e.g., Buddy, Luna, Max..."
                  value={data.petName}
                  onChange={(e) => setData(prev => ({ ...prev, petName: e.target.value }))}
                  className="text-lg h-12 text-center"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button 
                  onClick={handleNext} 
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500"
                  disabled={!data.petName.trim()}
                >
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Location */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full mb-2">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <p className="text-sm text-muted-foreground">
                  We'll show you sitters near {data.petName}!
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="suburb" className="text-base">Your Suburb</Label>
                <Input
                  id="suburb"
                  placeholder="e.g., Ponsonby, Grey Lynn, Newmarket..."
                  value={data.suburb}
                  onChange={(e) => setData(prev => ({ ...prev, suburb: e.target.value }))}
                  className="text-lg h-12 text-center"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button 
                  onClick={handleComplete} 
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  disabled={!data.suburb.trim() || saving}
                >
                  {saving ? (
                    'Saving...'
                  ) : (
                    <>
                      Find Sitters <Search className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Skip option - subtle at bottom */}
          <div className="text-center pt-4">
            <button
              onClick={() => {
                trackOnboarding('wizard_skipped', { step, data });
                navigate('/find-sitters');
              }}
              className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
            >
              Skip for now
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
