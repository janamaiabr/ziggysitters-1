import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { PawPrint, X, Plus, Loader2 } from 'lucide-react';
import { useProfile } from '@/contexts/ProfileContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export default function AddPetsPrompt() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dismissed, setDismissed] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [petName, setPetName] = useState('');
  const [petSpecies, setPetSpecies] = useState<string>('dog');
  const [petBreed, setPetBreed] = useState('');
  const [saving, setSaving] = useState(false);

  // Check if user has pets
  const { data: pets, refetch: refetchPets } = useQuery({
    queryKey: ['user-pets', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await supabase
        .from('pets')
        .select('id')
        .eq('owner_id', profile.id);
      return data || [];
    },
    enabled: !!profile?.id && profile?.role === 'pet_owner',
  });

  // Don't show if not logged in, not a pet owner, already has pets, or dismissed
  if (!user || !profile || profile.role !== 'pet_owner' || (pets && pets.length > 0) || dismissed) {
    return null;
  }

  // Check if dismissed this session
  const sessionDismissed = sessionStorage.getItem('addPetsPromptDismissed');
  if (sessionDismissed) {
    return null;
  }

  const handleDismiss = () => {
    sessionStorage.setItem('addPetsPromptDismissed', 'true');
    setDismissed(true);
  };

  const handleAddPet = async () => {
    if (!petName.trim()) {
      toast({
        title: 'Pet name required',
        description: 'Please enter your pet\'s name',
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('pets')
        .insert({
          owner_id: profile.id,
          name: petName.trim(),
          species: petSpecies as any,
          breed: petBreed.trim() || null,
        });

      if (error) throw error;

      toast({
        title: 'Pet added!',
        description: `${petName} has been added. You can add more details from your profile.`,
      });

      setPetName('');
      setPetBreed('');
      setShowDialog(false);
      refetchPets();
      queryClient.invalidateQueries({ queryKey: ['user-pets'] });
    } catch (error: any) {
      toast({
        title: 'Failed to add pet',
        description: error.message || 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-3 mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center flex-shrink-0">
            <PawPrint className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <span className="font-medium">Tip:</span> Add your pet's details to help sitters prepare for your booking
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDialog(true)}
            className="text-amber-700 hover:text-amber-900 hover:bg-amber-100 dark:text-amber-300 dark:hover:text-amber-100 dark:hover:bg-amber-900/50"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Pet
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="h-6 w-6 text-amber-500 hover:text-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/50"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PawPrint className="w-5 h-5 text-primary" />
              Add Your Pet
            </DialogTitle>
            <DialogDescription>
              Add your pet's basic info. You can add more details later from your profile.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="pet-name">Pet Name *</Label>
              <Input
                id="pet-name"
                placeholder="e.g., Buddy"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                autoFocus
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pet-species">Type of Pet *</Label>
              <Select value={petSpecies} onValueChange={setPetSpecies}>
                <SelectTrigger id="pet-species">
                  <SelectValue placeholder="Select pet type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dog">Dog</SelectItem>
                  <SelectItem value="cat">Cat</SelectItem>
                  <SelectItem value="bird">Bird</SelectItem>
                  <SelectItem value="rabbit">Rabbit</SelectItem>
                  <SelectItem value="fish">Fish</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pet-breed">Breed (optional)</Label>
              <Input
                id="pet-breed"
                placeholder="e.g., Golden Retriever"
                value={petBreed}
                onChange={(e) => setPetBreed(e.target.value)}
              />
            </div>
            
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowDialog(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleAddPet}
                disabled={saving || !petName.trim()}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Pet
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
