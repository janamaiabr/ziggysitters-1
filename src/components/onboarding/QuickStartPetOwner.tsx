import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, ArrowRight, Heart, Zap } from 'lucide-react';

interface QuickStartPetOwnerProps {
  profileId: string;
  userId: string;
  onComplete: (ownerId: string) => void;
}

export default function QuickStartPetOwner({ profileId, userId, onComplete }: QuickStartPetOwnerProps) {
  const [petName, setPetName] = useState('');
  const [petSpecies, setPetSpecies] = useState('');
  const [suburb, setSuburb] = useState('');
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

    if (!suburb.trim()) {
      toast({
        title: "Suburb required",
        description: "We need your suburb to find sitters nearby! 📍",
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

      // Update profile with suburb and mark onboarding as completed
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          suburb: suburb.trim(),
          city: 'Auckland',
          onboarding_completed: true 
        })
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
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
      {/* Cute Header with Floating Animation */}
      <div className="text-center space-y-4 relative">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
          <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900 rounded-full shadow-lg animate-bounce">
            <Heart className="h-10 w-10 text-pink-500 dark:text-pink-400" fill="currentColor" />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Zap className="h-6 w-6 text-yellow-500 animate-pulse" fill="currentColor" />
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              30-Second Setup!
            </h2>
            <Zap className="h-6 w-6 text-yellow-500 animate-pulse" fill="currentColor" />
          </div>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Tell us your pet's name and you're ready to book! ✨
          </p>
        </div>
      </div>

      <Card className="border-2 border-purple-200 dark:border-purple-800 shadow-xl overflow-hidden relative">
        {/* Decorative Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-pink-950/20 dark:via-purple-950/20 dark:to-blue-950/20 opacity-50"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200 dark:bg-purple-800 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-200 dark:bg-pink-800 rounded-full blur-3xl opacity-20"></div>
        
        <CardHeader className="relative pb-4">
          <CardTitle className="flex items-center justify-center gap-3 text-2xl">
            <span className="text-4xl animate-bounce">🐾</span>
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Meet Your Pet!
            </span>
            <span className="text-4xl animate-bounce" style={{ animationDelay: '0.2s' }}>🐾</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6 relative">
          <div className="space-y-3">
            <Label htmlFor="petName" className="text-lg font-semibold flex items-center gap-2">
              <span className="text-2xl">💖</span>
              What's your pet's name? <span className="text-pink-500">*</span>
            </Label>
            <Input
              id="petName"
              placeholder="e.g., Max, Bella, Luna, Charlie..."
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              className="h-14 text-lg border-2 border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600 bg-white/80 dark:bg-gray-900/80 backdrop-blur"
              autoFocus
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="petSpecies" className="text-lg font-semibold flex items-center gap-2">
              <span className="text-2xl">🌟</span>
              What kind of cutie? <span className="text-pink-500">*</span>
            </Label>
            <Select value={petSpecies} onValueChange={setPetSpecies}>
              <SelectTrigger className="h-14 text-lg border-2 border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600 bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                <SelectValue placeholder="Choose your pet type" />
              </SelectTrigger>
              <SelectContent className="backdrop-blur">
                <SelectItem value="dog" className="text-lg py-3">🐕 Dog</SelectItem>
                <SelectItem value="cat" className="text-lg py-3">🐱 Cat</SelectItem>
                <SelectItem value="bird" className="text-lg py-3">🦜 Bird</SelectItem>
                <SelectItem value="rabbit" className="text-lg py-3">🐰 Rabbit</SelectItem>
                <SelectItem value="horse" className="text-lg py-3">🐴 Horse</SelectItem>
                <SelectItem value="other" className="text-lg py-3">✨ Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="suburb" className="text-lg font-semibold flex items-center gap-2">
              <span className="text-2xl">📍</span>
              Where are you? <span className="text-pink-500">*</span>
            </Label>
            <Input
              id="suburb"
              placeholder="e.g., Ponsonby, Parnell, Mt Eden..."
              value={suburb}
              onChange={(e) => setSuburb(e.target.value)}
              className="h-14 text-lg border-2 border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600 bg-white/80 dark:bg-gray-900/80 backdrop-blur"
            />
          </div>

          <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border-2 border-purple-200 dark:border-purple-800 rounded-xl p-5">
            <p className="text-sm font-medium text-purple-900 dark:text-purple-100 flex items-start gap-2">
              <Sparkles className="h-5 w-5 flex-shrink-0 mt-0.5 text-purple-500" />
              <span>
                That's it! You can add photos, breed, age, and care details anytime from your profile. Let's find your perfect sitter! 🎉
              </span>
            </p>
          </div>

          <Button 
            onClick={handleQuickStart} 
            disabled={isSubmitting} 
            size="lg" 
            className="w-full h-16 text-xl gap-3 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Setting up...
              </>
            ) : (
              <>
                Find My Perfect Sitter
                <ArrowRight className="h-6 w-6 animate-pulse" />
              </>
            )}
          </Button>

          <p className="text-sm text-center text-muted-foreground">
            ⚡ Takes 30 seconds • 🎯 Book immediately • 💝 Add details later
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
