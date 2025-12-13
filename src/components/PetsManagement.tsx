import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { usePetOwnerOnboarding } from '@/hooks/usePetOwnerOnboarding';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, X, Upload, Save } from 'lucide-react';

const personalityTraits = [
  'Friendly', 'Energetic', 'Calm', 'Playful', 'Shy', 'Aggressive', 'Social', 'Independent',
  'Loyal', 'Protective', 'Gentle', 'Anxious', 'Curious', 'Lazy', 'Smart', 'Stubborn'
];

const medicalConditions = [
  'Allergies', 'Arthritis', 'Diabetes', 'Heart Disease', 'Kidney Disease', 'Hip Dysplasia',
  'Epilepsy', 'Cancer', 'Eye Problems', 'Skin Conditions', 'Dental Issues', 'None'
];

interface PetsManagementProps {
  profileId: string;
  userId: string;
  onPetAdded: () => void;
  autoOpen?: boolean;
}

export default function PetsManagement({ profileId, userId, onPetAdded, autoOpen = false }: PetsManagementProps) {
  const { pets, addPet, removePet, updatePet, uploadPetPhoto, savePets } = usePetOwnerOnboarding();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(autoOpen);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (pets.length === 0) {
      toast({
        title: "No pets to save",
        description: "Please add at least one pet before saving.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const result = await savePets(profileId);
      if (result.success) {
        toast({
          title: "Pets saved successfully",
          description: "Your pets have been added to your profile.",
        });
        setIsOpen(false);
        onPetAdded();
      } else {
        toast({
          title: "Failed to save pets",
          description: "Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving pets:', error);
      toast({
        title: "Error",
        description: "An error occurred while saving your pets.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = (index: number, files: FileList | null) => {
    if (files && files[0]) {
      uploadPetPhoto(index, files[0], userId);
    }
  };

  const toggleTrait = (petIndex: number, trait: string) => {
    const currentTraits = pets[petIndex].personality_traits;
    const newTraits = currentTraits.includes(trait)
      ? currentTraits.filter(t => t !== trait)
      : [...currentTraits, trait];
    updatePet(petIndex, 'personality_traits', newTraits);
  };

  const toggleCondition = (petIndex: number, condition: string) => {
    const currentConditions = pets[petIndex].medical_conditions;
    const newConditions = currentConditions.includes(condition)
      ? currentConditions.filter(c => c !== condition)
      : [...currentConditions, condition];
    updatePet(petIndex, 'medical_conditions', newConditions);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Your Pets
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Your Pets</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {pets.map((pet, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Pet {index + 1}</CardTitle>
                  {pets.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePet(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Pet Name *</Label>
                    <Input
                      value={pet.name}
                      onChange={(e) => updatePet(index, 'name', e.target.value)}
                      placeholder="Enter pet's name"
                    />
                  </div>
                  <div>
                    <Label>Species *</Label>
                    <Select value={pet.species} onValueChange={(value) => updatePet(index, 'species', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select species" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dog">Dog</SelectItem>
                        <SelectItem value="cat">Cat</SelectItem>
                        <SelectItem value="bird">Bird</SelectItem>
                        <SelectItem value="rabbit">Rabbit</SelectItem>
                        <SelectItem value="reptile">Reptile</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Breed</Label>
                    <Input
                      value={pet.breed}
                      onChange={(e) => updatePet(index, 'breed', e.target.value)}
                      placeholder="Enter breed"
                    />
                  </div>
                  <div>
                    <Label>Age (years)</Label>
                    <Input
                      type="number"
                      value={pet.age}
                      onChange={(e) => updatePet(index, 'age', parseInt(e.target.value))}
                      placeholder="Age"
                    />
                  </div>
                  <div>
                    <Label>Gender</Label>
                    <Select value={pet.gender} onValueChange={(value) => updatePet(index, 'gender', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Size</Label>
                    <Select value={pet.size} onValueChange={(value) => updatePet(index, 'size', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                        <SelectItem value="extra_large">Extra Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Weight (kg)</Label>
                    <Input
                      type="number"
                      value={pet.weight}
                      onChange={(e) => updatePet(index, 'weight', parseFloat(e.target.value))}
                      placeholder="Weight"
                    />
                  </div>
                </div>

                {/* Photo Upload */}
                <div>
                  <Label>Pet Photos</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleFileUpload(index, e.target.files)}
                      className="hidden"
                      id={`pet-photos-${index}`}
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById(`pet-photos-${index}`)?.click()}
                      className="w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Photos
                    </Button>
                    {pet.photo_urls && pet.photo_urls.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {pet.photo_urls.map((url, photoIndex) => (
                          <img
                            key={photoIndex}
                            src={url}
                            alt={`${pet.name} ${photoIndex + 1}`}
                            className="w-full h-20 object-cover rounded"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Personality Traits */}
                <div>
                  <Label>Personality Traits</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {personalityTraits.map((trait) => (
                      <Badge
                        key={trait}
                        variant={pet.personality_traits.includes(trait) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleTrait(index, trait)}
                      >
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Care Instructions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Feeding Instructions</Label>
                    <Textarea
                      value={pet.feeding_instructions}
                      onChange={(e) => updatePet(index, 'feeding_instructions', e.target.value)}
                      placeholder="Feeding schedule, food type, etc."
                    />
                  </div>
                  <div>
                    <Label>Exercise Needs</Label>
                    <Textarea
                      value={pet.exercise_needs}
                      onChange={(e) => updatePet(index, 'exercise_needs', e.target.value)}
                      placeholder="Daily walks, playtime requirements, etc."
                    />
                  </div>
                </div>

                <div>
                  <Label>Special Care Notes</Label>
                  <Textarea
                    value={pet.special_care_notes}
                    onChange={(e) => updatePet(index, 'special_care_notes', e.target.value)}
                    placeholder="Any special instructions or considerations"
                  />
                </div>

                {/* Emergency Contact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Emergency Contact Name</Label>
                    <Input
                      value={pet.emergency_contact_name}
                      onChange={(e) => updatePet(index, 'emergency_contact_name', e.target.value)}
                      placeholder="Emergency contact name"
                    />
                  </div>
                  <div>
                    <Label>Emergency Contact Phone</Label>
                    <Input
                      value={pet.emergency_contact_phone}
                      onChange={(e) => updatePet(index, 'emergency_contact_phone', e.target.value)}
                      placeholder="Emergency contact phone"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-between">
            <Button variant="outline" onClick={addPet}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Another Pet
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Pets'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}