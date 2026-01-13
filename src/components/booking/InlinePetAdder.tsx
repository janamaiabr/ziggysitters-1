import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PawPrint, Plus, Loader2, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface InlinePetAdderProps {
  profileId: string;
  onPetAdded: (pet: { id: string; name: string; species: string }) => void;
}

export default function InlinePetAdder({ profileId, onPetAdded }: InlinePetAdderProps) {
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [petName, setPetName] = useState('');
  const [petSpecies, setPetSpecies] = useState<string>('dog');
  const [saving, setSaving] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleAddPet = async () => {
    if (!petName.trim()) {
      toast({
        title: 'Pet name required',
        description: "What's your pet's name?",
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('pets')
        .insert({
          owner_id: profileId,
          name: petName.trim(),
          species: petSpecies as any,
        })
        .select('id, name, species')
        .single();

      if (error) throw error;

      toast({
        title: '🎉 Pet added!',
        description: `${petName} is ready to be cared for`,
      });

      onPetAdded(data);
      setPetName('');
      setIsAdding(false);
      setJustAdded(true);
      
      // Reset "just added" state after 3 seconds
      setTimeout(() => setJustAdded(false), 3000);
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

  if (justAdded) {
    return (
      <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-3 flex items-center gap-2">
        <Check className="w-5 h-5 text-green-600" />
        <span className="text-sm text-green-700 dark:text-green-300 font-medium">
          Pet added! They're now selected below.
        </span>
      </div>
    );
  }

  if (!isAdding) {
    return (
      <button
        type="button"
        onClick={() => setIsAdding(true)}
        className="w-full bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-2 border-dashed border-amber-300 dark:border-amber-700 rounded-lg p-4 hover:border-amber-400 dark:hover:border-amber-600 transition-all group"
      >
        <div className="flex items-center justify-center gap-3">
          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <PawPrint className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-amber-800 dark:text-amber-200">
              Add your pet first
            </p>
            <p className="text-sm text-amber-600 dark:text-amber-400">
              Just takes 10 seconds → helps sitters prepare
            </p>
          </div>
          <Plus className="w-5 h-5 text-amber-500 ml-auto" />
        </div>
      </button>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <PawPrint className="w-5 h-5 text-amber-600" />
        <span className="font-semibold text-amber-800 dark:text-amber-200">Quick pet add</span>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <Input
          placeholder="Pet's name"
          value={petName}
          onChange={(e) => setPetName(e.target.value)}
          autoFocus
          className="bg-white dark:bg-background"
        />
        <Select value={petSpecies} onValueChange={setPetSpecies}>
          <SelectTrigger className="bg-white dark:bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dog">🐕 Dog</SelectItem>
            <SelectItem value="cat">🐱 Cat</SelectItem>
            <SelectItem value="bird">🐦 Bird</SelectItem>
            <SelectItem value="rabbit">🐰 Rabbit</SelectItem>
            <SelectItem value="other">🐾 Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsAdding(false)}
          disabled={saving}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleAddPet}
          disabled={saving || !petName.trim()}
          className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-1" />
              Add Pet
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
