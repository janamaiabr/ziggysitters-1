import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, ArrowRight } from 'lucide-react';

interface QuickStartPetOwnerProps {
  profileId: string;
  userId: string;
  onComplete: (ownerId: string) => void;
}

export default function QuickStartPetOwner({ profileId, userId, onComplete }: QuickStartPetOwnerProps) {
  const [petName, setPetName] = useState('');
  const [petSpecies, setPetSpecies] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleQuickStart = async () => {
    if (!petName.trim()) {
      toast({
        title: "Pet name required",
        description: "Please enter your pet's name to continue",
        variant: "destructive"
      });
      return;
    }

    if (!petSpecies) {
      toast({
        title: "Pet type required",
        description: "Please select your pet's type",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create basic pet record
      const { error: petError } = await supabase
        .from('pets')
        .insert([{
          owner_id: profileId,
          name: petName,
          species: petSpecies as any,
          age: 0,
          size: 'medium' as any,
        }]);

      if (petError) throw petError;

      // Mark onboarding as completed
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', profileId);

      if (profileError) throw profileError;

      toast({
        title: "✨ You're all set!",
        description: "You can now browse and book sitters. Add more pet details anytime from your profile.",
      });

      onComplete(profileId);
    } catch (error: any) {
      console.error('Error in quick start:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to complete setup. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold">Quick Start</h2>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Get started in 30 seconds! Just tell us about your pet and you can book immediately.
        </p>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            Tell us about your pet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="petName" className="text-base">
              What's your pet's name? <span className="text-destructive">*</span>
            </Label>
            <Input
              id="petName"
              placeholder="e.g., Max, Bella, Luna"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              className="h-12 text-lg"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="petSpecies" className="text-base">
              What type of pet? <span className="text-destructive">*</span>
            </Label>
            <Select value={petSpecies} onValueChange={setPetSpecies}>
              <SelectTrigger className="h-12 text-lg">
                <SelectValue placeholder="Select pet type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dog">🐕 Dog</SelectItem>
                <SelectItem value="cat">🐱 Cat</SelectItem>
                <SelectItem value="bird">🦜 Bird</SelectItem>
                <SelectItem value="rabbit">🐰 Rabbit</SelectItem>
                <SelectItem value="horse">🐴 Horse</SelectItem>
                <SelectItem value="other">🐾 Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              ℹ️ You can add more details (breed, age, photos, etc.) later from your profile. For now, this is all we need to get you booking!
            </p>
          </div>

          <Button 
            onClick={handleQuickStart} 
            disabled={isSubmitting} 
            size="lg" 
            className="w-full h-14 text-lg gap-2"
          >
            {isSubmitting ? 'Setting up...' : 'Start Booking'}
            <ArrowRight className="h-5 w-5" />
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            By continuing, you can browse and book sitters immediately
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
