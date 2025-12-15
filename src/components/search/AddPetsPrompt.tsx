import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PawPrint, X } from 'lucide-react';
import { useProfile } from '@/contexts/ProfileContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';

export default function AddPetsPrompt() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const [dismissed, setDismissed] = useState(false);

  // Check if user has pets
  const { data: pets } = useQuery({
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

  return (
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
          onClick={() => navigate('/profile')}
          className="text-amber-700 hover:text-amber-900 hover:bg-amber-100 dark:text-amber-300 dark:hover:text-amber-100 dark:hover:bg-amber-900/50"
        >
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
  );
}
