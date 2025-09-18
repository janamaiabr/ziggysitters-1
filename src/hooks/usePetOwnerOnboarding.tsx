import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PetData {
  id?: string;
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'reptile' | 'rabbit';
  breed: string;
  age: number;
  gender: 'male' | 'female';
  size: 'small' | 'medium' | 'large' | 'extra_large';
  weight: number;
  personality_traits: string[];
  medical_conditions: string[];
  feeding_instructions: string;
  exercise_needs: string;
  special_care_notes: string;
  photo_urls: string[];
  is_neutered: boolean;
  vaccination_status: boolean;
  vaccination_expiry?: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
}

export function usePetOwnerOnboarding() {
  const { toast } = useToast();
  const [pets, setPets] = useState<PetData[]>([{
    name: '',
    species: 'dog',
    breed: '',
    age: 1,
    gender: 'male',
    size: 'medium',
    weight: 10,
    personality_traits: [],
    medical_conditions: [],
    feeding_instructions: '',
    exercise_needs: '',
    special_care_notes: '',
    photo_urls: [],
    is_neutered: false,
    vaccination_status: false,
    emergency_contact_name: '',
    emergency_contact_phone: ''
  }]);

  const addPet = () => {
    setPets(prev => [...prev, {
      name: '',
      species: 'dog',
      breed: '',
      age: 1,
      gender: 'male',
      size: 'medium',
      weight: 10,
      personality_traits: [],
      medical_conditions: [],
      feeding_instructions: '',
      exercise_needs: '',
      special_care_notes: '',
      photo_urls: [],
      is_neutered: false,
      vaccination_status: false,
      emergency_contact_name: '',
      emergency_contact_phone: ''
    }]);
  };

  const removePet = (index: number) => {
    if (pets.length > 1) {
      setPets(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updatePet = (index: number, field: keyof PetData, value: any) => {
    setPets(prev => prev.map((pet, i) => 
      i === index ? { ...pet, [field]: value } : pet
    ));
  };

  const uploadPetPhoto = async (index: number, file: File, userId: string) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-pet-${index}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('pet-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('pet-photos')
        .getPublicUrl(fileName);

      updatePet(index, 'photo_urls', [...pets[index].photo_urls, publicUrl]);
      
      toast({
        title: "Pet photo uploaded!",
        description: "Photo added successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const savePets = async (ownerId: string) => {
    try {
      for (const pet of pets) {
        if (!pet.name.trim()) continue;

        const petData = {
          owner_id: ownerId,
          name: pet.name,
          species: pet.species,
          breed: pet.breed,
          age: pet.age,
          gender: pet.gender,
          size: pet.size,
          weight: pet.weight,
          personality_traits: pet.personality_traits,
          medical_conditions: pet.medical_conditions,
          feeding_instructions: pet.feeding_instructions,
          exercise_needs: pet.exercise_needs,
          special_care_notes: pet.special_care_notes,
          photo_urls: pet.photo_urls,
          is_neutered: pet.is_neutered,
          vaccination_status: pet.vaccination_status,
          vaccination_expiry: pet.vaccination_expiry || null,
          emergency_contact_name: pet.emergency_contact_name,
          emergency_contact_phone: pet.emergency_contact_phone
        };

        const { error } = await supabase
          .from('pets')
          .insert(petData);

        if (error) throw error;
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  return {
    pets,
    addPet,
    removePet,
    updatePet,
    uploadPetPhoto,
    savePets
  };
}