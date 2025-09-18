import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { usePetOwnerOnboarding } from '@/hooks/usePetOwnerOnboarding';
import { PlusCircle, X, Upload } from 'lucide-react';

interface PetOwnerOnboardingProps {
  userId: string;
  onComplete: (ownerId: string) => void;
}

const personalityTraits = [
  'Friendly', 'Energetic', 'Calm', 'Playful', 'Shy', 'Aggressive', 'Social', 'Independent',
  'Loyal', 'Protective', 'Gentle', 'Anxious', 'Curious', 'Lazy', 'Smart', 'Stubborn'
];

const medicalConditions = [
  'Allergies', 'Arthritis', 'Diabetes', 'Heart Disease', 'Kidney Disease', 'Hip Dysplasia',
  'Epilepsy', 'Cancer', 'Eye Problems', 'Skin Conditions', 'Dental Issues', 'None'
];

export default function PetOwnerOnboarding({ userId, onComplete }: PetOwnerOnboardingProps) {
  const { pets, addPet, removePet, updatePet, uploadPetPhoto, savePets } = usePetOwnerOnboarding();

  const handleSave = async () => {
    const result = await savePets(userId);
    if (result.success) {
      onComplete(userId);
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
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Tell us about your pets</h2>
        <p className="text-muted-foreground">This helps sitters provide the best care</p>
      </div>

      {pets.map((pet, index) => (
        <Card key={index} className="relative">
          {pets.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              onClick={() => removePet(index)}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
          
          <CardHeader>
            <CardTitle className="text-lg">Pet #{index + 1}</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Pet Name *</Label>
                <Input
                  placeholder="e.g., Buddy"
                  value={pet.name}
                  onChange={(e) => updatePet(index, 'name', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Species *</Label>
                <Select value={pet.species} onValueChange={(value) => updatePet(index, 'species', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dog">🐕 Dog</SelectItem>
                    <SelectItem value="cat">🐱 Cat</SelectItem>
                    <SelectItem value="bird">🦜 Bird</SelectItem>
                    <SelectItem value="small_pet">🐹 Small Pet</SelectItem>
                    <SelectItem value="reptile">🦎 Reptile</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Breed</Label>
                <Input
                  placeholder="e.g., Golden Retriever"
                  value={pet.breed}
                  onChange={(e) => updatePet(index, 'breed', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Age (years)</Label>
                <Input
                  type="number"
                  min="0"
                  max="30"
                  value={pet.age}
                  onChange={(e) => updatePet(index, 'age', parseInt(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={pet.gender} onValueChange={(value) => updatePet(index, 'gender', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Size</Label>
                <Select value={pet.size} onValueChange={(value) => updatePet(index, 'size', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (under 10kg)</SelectItem>
                    <SelectItem value="medium">Medium (10-25kg)</SelectItem>
                    <SelectItem value="large">Large (25-40kg)</SelectItem>
                    <SelectItem value="extra_large">Extra Large (40kg+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={pet.weight}
                  onChange={(e) => updatePet(index, 'weight', parseFloat(e.target.value))}
                />
              </div>
            </div>

            {/* Photos */}
            <div className="space-y-2">
              <Label>Pet Photos</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileUpload(index, e.target.files)}
                  className="hidden"
                  id={`pet-photos-${index}`}
                />
                <Label htmlFor={`pet-photos-${index}`} className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg hover:border-gray-400">
                    <Upload className="w-4 h-4" />
                    <span>Upload Photos</span>
                  </div>
                </Label>
              </div>
              {pet.photo_urls.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {pet.photo_urls.map((url, photoIndex) => (
                    <img
                      key={photoIndex}
                      src={url}
                      alt={`${pet.name} photo ${photoIndex + 1}`}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Personality Traits */}
            <div className="space-y-2">
              <Label>Personality Traits</Label>
              <div className="flex flex-wrap gap-2">
                {personalityTraits.map((trait) => (
                  <Badge
                    key={trait}
                    variant={pet.personality_traits.includes(trait) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleTrait(index, trait)}
                  >
                    {trait}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Medical Conditions */}
            <div className="space-y-2">
              <Label>Medical Conditions</Label>
              <div className="flex flex-wrap gap-2">
                {medicalConditions.map((condition) => (
                  <Badge
                    key={condition}
                    variant={pet.medical_conditions.includes(condition) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleCondition(index, condition)}
                  >
                    {condition}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Care Instructions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Feeding Instructions</Label>
                <Textarea
                  placeholder="e.g., 2 cups dry food twice daily"
                  value={pet.feeding_instructions}
                  onChange={(e) => updatePet(index, 'feeding_instructions', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Exercise Needs</Label>
                <Textarea
                  placeholder="e.g., 2 walks daily, loves playing fetch"
                  value={pet.exercise_needs}
                  onChange={(e) => updatePet(index, 'exercise_needs', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Special Care Notes</Label>
              <Textarea
                placeholder="Any special instructions or notes for the sitter"
                value={pet.special_care_notes}
                onChange={(e) => updatePet(index, 'special_care_notes', e.target.value)}
              />
            </div>

            {/* Health Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`neutered-${index}`}
                  checked={pet.is_neutered}
                  onCheckedChange={(checked) => updatePet(index, 'is_neutered', checked)}
                />
                <Label htmlFor={`neutered-${index}`}>Spayed/Neutered</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`vaccinated-${index}`}
                  checked={pet.vaccination_status}
                  onCheckedChange={(checked) => updatePet(index, 'vaccination_status', checked)}
                />
                <Label htmlFor={`vaccinated-${index}`}>Up to date with vaccinations</Label>
              </div>
            </div>

            {pet.vaccination_status && (
              <div className="space-y-2">
                <Label>Vaccination Expiry Date</Label>
                <Input
                  type="date"
                  value={pet.vaccination_expiry || ''}
                  onChange={(e) => updatePet(index, 'vaccination_expiry', e.target.value)}
                />
              </div>
            )}

            {/* Emergency Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Emergency Contact Name</Label>
                <Input
                  placeholder="Veterinarian or emergency contact"
                  value={pet.emergency_contact_name}
                  onChange={(e) => updatePet(index, 'emergency_contact_name', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Emergency Contact Phone</Label>
                <Input
                  type="tel"
                  placeholder="Phone number"
                  value={pet.emergency_contact_phone}
                  onChange={(e) => updatePet(index, 'emergency_contact_phone', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={addPet}
          className="flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Add Another Pet
        </Button>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="px-8">
          Save Pets & Continue
        </Button>
      </div>
    </div>
  );
}