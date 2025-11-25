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

      // Skip the success page and go straight to search
      toast({
        title: "🎉 Welcome to ZiggySitters!",
        description: `${petName} is ready to meet their perfect sitter! Let's find them... 🔍`,
        duration: 4000,
      });

      // Mark as complete then redirect directly to find-sitters
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
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
      {/* Ultra Cute Header */}
      <div className="text-center space-y-6 relative">
        {/* Floating hearts animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-4 left-1/4 text-4xl animate-bounce" style={{ animationDelay: '0s', animationDuration: '2s' }}>💖</div>
          <div className="absolute top-8 right-1/4 text-3xl animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2.5s' }}>🐾</div>
          <div className="absolute top-12 left-1/3 text-2xl animate-bounce" style={{ animationDelay: '1s', animationDuration: '3s' }}>✨</div>
        </div>
        
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-full blur-3xl opacity-40 animate-pulse"></div>
          <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900 rounded-full shadow-2xl animate-bounce" style={{ animationDuration: '1.5s' }}>
            <Heart className="h-12 w-12 text-pink-500 dark:text-pink-400" fill="currentColor" />
          </div>
        </div>
        
        <div className="space-y-3 relative">
          <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent animate-in slide-in-from-top-4 duration-500">
            Let's Meet Your Pet!
          </h2>
          <p className="text-xl text-muted-foreground max-w-md mx-auto animate-in fade-in duration-700" style={{ animationDelay: '200ms' }}>
            Just 3 quick things and you're ready to book! 🎯
          </p>
        </div>
      </div>

      <Card className="border-2 border-purple-200 dark:border-purple-800 shadow-2xl overflow-hidden relative transform transition-all hover:scale-[1.01]">
        {/* Super Decorative Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-pink-950/20 dark:via-purple-950/20 dark:to-blue-950/20 opacity-60"></div>
        <div className="absolute top-0 right-0 w-40 h-40 bg-purple-300 dark:bg-purple-700 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-pink-300 dark:bg-pink-700 rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-300 dark:bg-blue-700 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        
        <CardHeader className="relative pb-6">
          <CardTitle className="flex items-center justify-center gap-3 text-3xl">
            <span className="text-5xl animate-bounce">🐾</span>
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Quick Setup
            </span>
            <span className="text-5xl animate-bounce" style={{ animationDelay: '0.3s' }}>🐾</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-7 relative">
          <div className="space-y-4 animate-in slide-in-from-left duration-500">
            <Label htmlFor="petName" className="text-xl font-bold flex items-center gap-2">
              <span className="text-3xl">💖</span>
              What's your pet's name?
            </Label>
            <Input
              id="petName"
              placeholder="e.g., Max, Bella, Luna, Charlie..."
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              className="h-16 text-xl border-2 border-purple-300 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-500 bg-white/90 dark:bg-gray-900/90 backdrop-blur transition-all duration-300 hover:shadow-lg"
              autoFocus
            />
          </div>

          <div className="space-y-4 animate-in slide-in-from-right duration-500" style={{ animationDelay: '100ms' }}>
            <Label htmlFor="petSpecies" className="text-xl font-bold flex items-center gap-2">
              <span className="text-3xl">🌟</span>
              What kind of cutie?
            </Label>
            <Select value={petSpecies} onValueChange={setPetSpecies}>
              <SelectTrigger className="h-16 text-xl border-2 border-purple-300 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-500 bg-white/90 dark:bg-gray-900/90 backdrop-blur transition-all duration-300 hover:shadow-lg">
                <SelectValue placeholder="Choose your pet type" />
              </SelectTrigger>
              <SelectContent className="backdrop-blur">
                <SelectItem value="dog" className="text-xl py-4 cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20">🐕 Dog</SelectItem>
                <SelectItem value="cat" className="text-xl py-4 cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20">🐱 Cat</SelectItem>
                <SelectItem value="bird" className="text-xl py-4 cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20">🦜 Bird</SelectItem>
                <SelectItem value="rabbit" className="text-xl py-4 cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20">🐰 Rabbit</SelectItem>
                <SelectItem value="horse" className="text-xl py-4 cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20">🐴 Horse</SelectItem>
                <SelectItem value="other" className="text-xl py-4 cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20">✨ Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4 animate-in slide-in-from-left duration-500" style={{ animationDelay: '200ms' }}>
            <Label htmlFor="suburb" className="text-xl font-bold flex items-center gap-2">
              <span className="text-3xl">📍</span>
              Where are you?
            </Label>
            <Input
              id="suburb"
              placeholder="e.g., Ponsonby, Parnell, Mt Eden..."
              value={suburb}
              onChange={(e) => setSuburb(e.target.value)}
              className="h-16 text-xl border-2 border-purple-300 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-500 bg-white/90 dark:bg-gray-900/90 backdrop-blur transition-all duration-300 hover:shadow-lg"
            />
          </div>

          <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 border-2 border-purple-300 dark:border-purple-700 rounded-2xl p-6 animate-in fade-in duration-700" style={{ animationDelay: '300ms' }}>
            <p className="text-base font-medium text-purple-900 dark:text-purple-100 flex items-start gap-3">
              <Sparkles className="h-6 w-6 flex-shrink-0 mt-0.5 text-purple-500 animate-pulse" />
              <span>
                That's it! Start browsing sitters now and add more pet details later from your profile. 🎉
              </span>
            </p>
          </div>

          <Button 
            onClick={handleQuickStart} 
            disabled={isSubmitting} 
            size="lg" 
            className="w-full h-20 text-2xl gap-3 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 animate-in zoom-in duration-500" 
            style={{ animationDelay: '400ms' }}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent"></div>
                Finding sitters...
              </>
            ) : (
              <>
                Find Perfect Sitters! 
                <ArrowRight className="h-8 w-8 animate-pulse" />
              </>
            )}
          </Button>

          <p className="text-center text-muted-foreground animate-in fade-in duration-700" style={{ animationDelay: '500ms' }}>
            <span className="text-lg">⚡ Takes 30 seconds • 🎯 Book instantly • 💝 Trusted sitters</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
