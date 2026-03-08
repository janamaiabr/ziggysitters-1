import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { usePetOwnerOnboarding } from '@/hooks/usePetOwnerOnboarding';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, X, Upload, Save, Heart } from 'lucide-react';

const personalityTraits = [
  'Friendly', 'Energetic', 'Calm', 'Playful', 'Shy', 'Aggressive', 'Social', 'Independent',
  'Loyal', 'Protective', 'Gentle', 'Anxious', 'Curious', 'Lazy', 'Smart', 'Stubborn'
];

const medicalConditions = [
  'Allergies', 'Arthritis', 'Diabetes', 'Heart Disease', 'Kidney Disease', 'Hip Dysplasia',
  'Epilepsy', 'Cancer', 'Eye Problems', 'Skin Conditions', 'Dental Issues', 'None'
];

const healthConditionOptions = [
  'arthritis', 'diabetes', 'heart condition', 'anxiety',
  'vision impaired', 'hearing impaired', 'post-surgical', 'other'
];

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  instructions: string;
}

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

  const toggleHealthCondition = (petIndex: number, condition: string) => {
    const current: string[] = (pets[petIndex] as any).health_conditions || [];
    const updated = current.includes(condition)
      ? current.filter(c => c !== condition)
      : [...current, condition];
    updatePet(petIndex, 'health_conditions' as any, updated);
  };

  const addMedication = (petIndex: number) => {
    const current: Medication[] = (pets[petIndex] as any).medications || [];
    updatePet(petIndex, 'medications' as any, [...current, { name: '', dosage: '', frequency: '', instructions: '' }]);
  };

  const updateMedication = (petIndex: number, medIndex: number, field: keyof Medication, value: string) => {
    const current: Medication[] = (pets[petIndex] as any).medications || [];
    const updated = current.map((m, i) => i === medIndex ? { ...m, [field]: value } : m);
    updatePet(petIndex, 'medications' as any, updated);
  };

  const removeMedication = (petIndex: number, medIndex: number) => {
    const current: Medication[] = (pets[petIndex] as any).medications || [];
    updatePet(petIndex, 'medications' as any, current.filter((_, i) => i !== medIndex));
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

                {/* Health & Special Needs Section */}
                <div className="border-t pt-4 mt-2">
                  <div className="flex items-center gap-2 mb-4">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <h4 className="font-semibold text-sm">Health &amp; Special Needs</h4>
                  </div>

                  {/* Senior pet toggle */}
                  <div className="flex items-center gap-3 mb-4">
                    <Switch
                      id={`is-senior-${index}`}
                      checked={!!(pet as any).is_senior}
                      onCheckedChange={(checked) => updatePet(index, 'is_senior' as any, checked)}
                    />
                    <Label htmlFor={`is-senior-${index}`}>Is this a senior pet? (7+ years)</Label>
                  </div>

                  {/* Health conditions multi-select chips */}
                  <div className="mb-4">
                    <Label className="mb-2 block">Health Conditions</Label>
                    <div className="flex flex-wrap gap-2">
                      {healthConditionOptions.map((condition) => {
                        const selected = ((pet as any).health_conditions || []).includes(condition);
                        return (
                          <Badge
                            key={condition}
                            variant={selected ? 'default' : 'outline'}
                            className="cursor-pointer capitalize"
                            onClick={() => toggleHealthCondition(index, condition)}
                          >
                            {condition}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  {/* Medications */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <Label>Medications</Label>
                      <Button type="button" variant="outline" size="sm" onClick={() => addMedication(index)}>
                        <PlusCircle className="w-3 h-3 mr-1" /> Add Medication
                      </Button>
                    </div>
                    {((pet as any).medications || []).map((med: Medication, medIdx: number) => (
                      <div key={medIdx} className="border rounded p-3 mb-2 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Medication {medIdx + 1}</span>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeMedication(index, medIdx)}>
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Name *</Label>
                            <Input
                              value={med.name}
                              onChange={(e) => updateMedication(index, medIdx, 'name', e.target.value)}
                              placeholder="e.g. Rimadyl"
                              className="h-8 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Dosage *</Label>
                            <Input
                              value={med.dosage}
                              onChange={(e) => updateMedication(index, medIdx, 'dosage', e.target.value)}
                              placeholder="e.g. 50mg"
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Frequency</Label>
                            <Input
                              value={med.frequency}
                              onChange={(e) => updateMedication(index, medIdx, 'frequency', e.target.value)}
                              placeholder="e.g. twice daily"
                              className="h-8 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Instructions</Label>
                            <Input
                              value={med.instructions}
                              onChange={(e) => updateMedication(index, medIdx, 'instructions', e.target.value)}
                              placeholder="e.g. with food"
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Special needs notes */}
                  <div className="mb-4">
                    <Label>Special Needs Notes</Label>
                    <Textarea
                      value={(pet as any).special_needs || ''}
                      onChange={(e) => updatePet(index, 'special_needs' as any, e.target.value)}
                      placeholder="Any special care instructions or needs..."
                    />
                  </div>

                  {/* Emergency vet */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label>Emergency Vet Name</Label>
                      <Input
                        value={(pet as any).emergency_vet_name || ''}
                        onChange={(e) => updatePet(index, 'emergency_vet_name' as any, e.target.value)}
                        placeholder="Vet clinic name"
                      />
                    </div>
                    <div>
                      <Label>Emergency Vet Phone</Label>
                      <Input
                        value={(pet as any).emergency_vet_phone || ''}
                        onChange={(e) => updatePet(index, 'emergency_vet_phone' as any, e.target.value)}
                        placeholder="+64 9 555 1234"
                      />
                    </div>
                  </div>

                  {/* Mobility level */}
                  <div className="mb-4">
                    <Label>Mobility Level</Label>
                    <Select
                      value={(pet as any).mobility_level || ''}
                      onValueChange={(value) => updatePet(index, 'mobility_level' as any, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select mobility level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Full – moves independently</SelectItem>
                        <SelectItem value="limited">Limited – some assistance needed</SelectItem>
                        <SelectItem value="assisted">Assisted – regular help required</SelectItem>
                        <SelectItem value="minimal">Minimal – mostly immobile</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Dietary requirements */}
                  <div>
                    <Label>Dietary Requirements</Label>
                    <Textarea
                      value={(pet as any).dietary_requirements || ''}
                      onChange={(e) => updatePet(index, 'dietary_requirements' as any, e.target.value)}
                      placeholder="Special diet, allergies, food restrictions..."
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