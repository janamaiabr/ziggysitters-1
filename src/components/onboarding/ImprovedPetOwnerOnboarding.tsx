import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { usePetOwnerOnboarding } from '@/hooks/usePetOwnerOnboarding';
import { PlusCircle, X, Upload, ChevronRight, ChevronLeft, Copy, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ImprovedPetOwnerOnboardingProps {
  profileId: string;
  userId: string;
  onComplete: (ownerId: string) => void;
}

const defaultPersonalityTraits = [
  'Friendly', 'Energetic', 'Calm', 'Playful', 'Shy', 'Social', 'Independent',
  'Loyal', 'Gentle', 'Anxious', 'Curious'
];

const defaultMedicalConditions = [
  'Allergies', 'Arthritis', 'Diabetes', 'Heart Disease', 'Hip Dysplasia', 'None'
];

export default function ImprovedPetOwnerOnboarding({ profileId, userId, onComplete }: ImprovedPetOwnerOnboardingProps) {
  const { pets, addPet, removePet, updatePet, uploadPetPhoto, savePets } = usePetOwnerOnboarding();
  const [currentPetIndex, setCurrentPetIndex] = useState(0);
  const [step, setStep] = useState<'essential' | 'detailed'>('essential');
  const [customTraits, setCustomTraits] = useState<string[]>([]);
  const [customConditions, setCustomConditions] = useState<string[]>([]);
  const [newTrait, setNewTrait] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentPet = pets[currentPetIndex];
  const allTraits = [...defaultPersonalityTraits, ...customTraits];
  const allConditions = [...defaultMedicalConditions, ...customConditions];

  // Calculate completion percentage
  const getCompletionPercentage = () => {
    let filled = 0;
    const total = 8; // Essential fields

    if (currentPet.name) filled++;
    if (currentPet.species) filled++;
    if (currentPet.breed) filled++;
    if (currentPet.age > 0) filled++;
    if (currentPet.size) filled++;
    if (currentPet.personality_traits.length > 0) filled++;
    if (currentPet.feeding_instructions) filled++;
    if (currentPet.photo_urls.length > 0) filled++;

    return Math.round((filled / total) * 100);
  };

  const isEssentialComplete = () => {
    return currentPet.name.trim() !== '';
  };

  const handleSaveAndContinue = async () => {
    if (!isEssentialComplete()) {
      return;
    }
    setIsSubmitting(true);
    const result = await savePets(profileId);
    if (result.success) {
      onComplete(profileId);
    }
    setIsSubmitting(false);
  };

  const handleSkipDetails = async () => {
    setIsSubmitting(true);
    const result = await savePets(profileId);
    if (result.success) {
      onComplete(profileId);
    }
    setIsSubmitting(false);
  };

  const handleFileUpload = (files: FileList | null) => {
    if (files && files[0]) {
      uploadPetPhoto(currentPetIndex, files[0], userId);
    }
  };

  const toggleTrait = (trait: string) => {
    const currentTraits = currentPet.personality_traits;
    const newTraits = currentTraits.includes(trait)
      ? currentTraits.filter(t => t !== trait)
      : [...currentTraits, trait];
    updatePet(currentPetIndex, 'personality_traits', newTraits);
  };

  const toggleCondition = (condition: string) => {
    const currentConditions = currentPet.medical_conditions;
    const newConditions = currentConditions.includes(condition)
      ? currentConditions.filter(c => c !== condition)
      : [...currentConditions, condition];
    updatePet(currentPetIndex, 'medical_conditions', newConditions);
  };

  const addCustomTrait = () => {
    if (newTrait.trim() && !customTraits.includes(newTrait.trim())) {
      setCustomTraits([...customTraits, newTrait.trim()]);
      toggleTrait(newTrait.trim());
      setNewTrait('');
    }
  };

  const addCustomCondition = () => {
    if (newCondition.trim() && !customConditions.includes(newCondition.trim())) {
      setCustomConditions([...customConditions, newCondition.trim()]);
      toggleCondition(newCondition.trim());
      setNewCondition('');
    }
  };

  const copyFromPreviousPet = () => {
    if (currentPetIndex > 0) {
      const previousPet = pets[currentPetIndex - 1];
      updatePet(currentPetIndex, 'species', previousPet.species);
      updatePet(currentPetIndex, 'breed', previousPet.breed);
      updatePet(currentPetIndex, 'size', previousPet.size);
      updatePet(currentPetIndex, 'gender', previousPet.gender);
      updatePet(currentPetIndex, 'personality_traits', [...previousPet.personality_traits]);
      updatePet(currentPetIndex, 'feeding_instructions', previousPet.feeding_instructions);
      updatePet(currentPetIndex, 'exercise_needs', previousPet.exercise_needs);
    }
  };

  const goToNextPet = () => {
    if (currentPetIndex < pets.length - 1) {
      setCurrentPetIndex(currentPetIndex + 1);
      setStep('essential');
    }
  };

  const goToPreviousPet = () => {
    if (currentPetIndex > 0) {
      setCurrentPetIndex(currentPetIndex - 1);
      setStep('essential');
    }
  };

  const addAnotherPet = () => {
    addPet();
    setCurrentPetIndex(pets.length);
    setStep('essential');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Tell us about your pet{pets.length > 1 ? 's' : ''}</h2>
        <p className="text-muted-foreground">This helps sitters provide the best care possible</p>
      </div>

      {/* Progress Indicator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Pet {currentPetIndex + 1} of {pets.length}
          </span>
          <span className="font-medium flex items-center gap-1">
            {getCompletionPercentage()}% complete
            {getCompletionPercentage() === 100 && <Sparkles className="h-4 w-4 text-yellow-500" />}
          </span>
        </div>
        <Progress value={getCompletionPercentage()} className="h-2" />
      </div>

      {/* Pet Navigation */}
      {pets.length > 1 && (
        <div className="flex gap-2 justify-center">
          {pets.map((pet, idx) => (
            <Button
              key={idx}
              variant={idx === currentPetIndex ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setCurrentPetIndex(idx);
                setStep('essential');
              }}
            >
              {pet.name || `Pet ${idx + 1}`}
            </Button>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">
              {step === 'essential' ? '📝 Essential Info' : '✨ Additional Details'}
            </CardTitle>
            {pets.length > 1 && currentPetIndex > 0 && step === 'essential' && (
              <Button
                variant="outline"
                size="sm"
                onClick={copyFromPreviousPet}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy from {pets[currentPetIndex - 1].name || 'previous pet'}
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 'essential' ? (
            // Essential Step
            <>
              {/* Name & Species */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Pet Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    placeholder="e.g., Buddy"
                    value={currentPet.name}
                    onChange={(e) => updatePet(currentPetIndex, 'name', e.target.value)}
                    className={!currentPet.name ? 'border-destructive' : ''}
                  />
                  {!currentPet.name && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Required to continue
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Species <span className="text-destructive">*</span>
                  </Label>
                  <Select value={currentPet.species} onValueChange={(value) => updatePet(currentPetIndex, 'species', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dog">🐕 Dog</SelectItem>
                      <SelectItem value="cat">🐱 Cat</SelectItem>
                      <SelectItem value="bird">🦜 Bird</SelectItem>
                      <SelectItem value="rabbit">🐰 Rabbit</SelectItem>
                      <SelectItem value="reptile">🦎 Reptile</SelectItem>
                      <SelectItem value="horse">🐴 Horse</SelectItem>
                      <SelectItem value="other">🐾 Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Breed, Age, Gender */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Breed</Label>
                  <Input
                    placeholder="e.g., Golden Retriever"
                    value={currentPet.breed}
                    onChange={(e) => updatePet(currentPetIndex, 'breed', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Helps sitters understand your pet better</p>
                </div>
                
                <div className="space-y-2">
                  <Label>Age (years)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="30"
                    value={currentPet.age}
                    onChange={(e) => updatePet(currentPetIndex, 'age', parseInt(e.target.value) || 0)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select value={currentPet.gender} onValueChange={(value) => updatePet(currentPetIndex, 'gender', value)}>
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

              {/* Size & Weight */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Size</Label>
                  <Select value={currentPet.size} onValueChange={(value) => updatePet(currentPetIndex, 'size', value)}>
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
                    placeholder="Optional"
                    value={currentPet.weight || ''}
                    onChange={(e) => updatePet(currentPetIndex, 'weight', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              {/* Photo Upload */}
              <div className="space-y-2">
                <Label>Pet Photo</Label>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById(`photo-upload-${currentPetIndex}`)?.click()}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Photo
                  </Button>
                  <input
                    id={`photo-upload-${currentPetIndex}`}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files)}
                  />
                  {currentPet.photo_urls.length > 0 && (
                    <Badge variant="secondary" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {currentPet.photo_urls.length} photo{currentPet.photo_urls.length > 1 ? 's' : ''} added
                    </Badge>
                  )}
                </div>
                {currentPet.photo_urls.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-2">
                    {currentPet.photo_urls.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt={`${currentPet.name} photo ${idx + 1}`}
                        className="w-20 h-20 object-cover rounded-md border"
                      />
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">A photo helps sitters recognize your pet</p>
              </div>

              {/* Personality Quick Select */}
              <div className="space-y-2">
                <Label>Personality (select all that apply)</Label>
                <div className="flex flex-wrap gap-2">
                  {allTraits.slice(0, 8).map(trait => (
                    <Badge
                      key={trait}
                      variant={currentPet.personality_traits.includes(trait) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleTrait(trait)}
                    >
                      {trait}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Helps sitters understand your pet's temperament</p>
              </div>

              {/* Feeding Instructions */}
              <div className="space-y-2">
                <Label>Feeding Instructions</Label>
                <Textarea
                  placeholder="e.g., 1 cup dry food twice daily, morning and evening"
                  value={currentPet.feeding_instructions}
                  onChange={(e) => updatePet(currentPetIndex, 'feeding_instructions', e.target.value)}
                  rows={2}
                />
              </div>

              {/* Navigation Buttons */}
              <div className="flex flex-col gap-3 pt-4">
                <div className="flex gap-3">
                  {currentPetIndex > 0 && (
                    <Button variant="outline" onClick={goToPreviousPet} className="gap-2">
                      <ChevronLeft className="h-4 w-4" />
                      Previous Pet
                    </Button>
                  )}
                  
                  {isEssentialComplete() && (
                    <Button onClick={() => setStep('detailed')} className="flex-1 gap-2">
                      Add More Details
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {isEssentialComplete() && (
                  <>
                    {currentPetIndex < pets.length - 1 ? (
                      <Button variant="outline" onClick={goToNextPet} className="gap-2">
                        Next Pet
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    ) : (
                      <>
                        <Button variant="outline" onClick={addAnotherPet} className="gap-2">
                          <PlusCircle className="h-4 w-4" />
                          Add Another Pet
                        </Button>
                        <Button onClick={handleSaveAndContinue} disabled={isSubmitting} size="lg">
                          {isSubmitting ? 'Saving...' : 'Complete Onboarding'}
                        </Button>
                      </>
                    )}
                  </>
                )}
              </div>
            </>
          ) : (
            // Detailed Step
            <>
              <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertDescription>
                  Adding these details helps sitters provide exceptional care! You can also skip and add them later from your profile.
                </AlertDescription>
              </Alert>

              {/* Exercise Needs */}
              <div className="space-y-2">
                <Label>Exercise Needs</Label>
                <Textarea
                  placeholder="e.g., Two 30-minute walks daily, loves playing fetch"
                  value={currentPet.exercise_needs}
                  onChange={(e) => updatePet(currentPetIndex, 'exercise_needs', e.target.value)}
                  rows={2}
                />
              </div>

              {/* Medical Conditions */}
              <div className="space-y-2">
                <Label>Medical Conditions</Label>
                <div className="flex flex-wrap gap-2">
                  {allConditions.map(condition => (
                    <Badge
                      key={condition}
                      variant={currentPet.medical_conditions.includes(condition) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleCondition(condition)}
                    >
                      {condition}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Add custom condition"
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCustomCondition()}
                  />
                  <Button variant="outline" size="sm" onClick={addCustomCondition}>
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Special Care Notes */}
              <div className="space-y-2">
                <Label>Special Care Instructions</Label>
                <Textarea
                  placeholder="Any special instructions sitters should know..."
                  value={currentPet.special_care_notes}
                  onChange={(e) => updatePet(currentPetIndex, 'special_care_notes', e.target.value)}
                  rows={3}
                />
              </div>

              {/* Health Status */}
              <div className="space-y-3">
                <Label>Health Status</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="neutered"
                    checked={currentPet.is_neutered}
                    onCheckedChange={(checked) => updatePet(currentPetIndex, 'is_neutered', checked)}
                  />
                  <label htmlFor="neutered" className="text-sm cursor-pointer">
                    Spayed/Neutered
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="vaccinated"
                    checked={currentPet.vaccination_status}
                    onCheckedChange={(checked) => updatePet(currentPetIndex, 'vaccination_status', checked)}
                  />
                  <label htmlFor="vaccinated" className="text-sm cursor-pointer">
                    Up to date with vaccinations
                  </label>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Emergency Contact Name</Label>
                  <Input
                    placeholder="Vet or emergency contact"
                    value={currentPet.emergency_contact_name}
                    onChange={(e) => updatePet(currentPetIndex, 'emergency_contact_name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Emergency Contact Phone</Label>
                  <Input
                    placeholder="Contact number"
                    value={currentPet.emergency_contact_phone}
                    onChange={(e) => updatePet(currentPetIndex, 'emergency_contact_phone', e.target.value)}
                  />
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex flex-col gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep('essential')} className="gap-2">
                  <ChevronLeft className="h-4 w-4" />
                  Back to Essentials
                </Button>

                {currentPetIndex < pets.length - 1 ? (
                  <Button onClick={goToNextPet} className="gap-2">
                    Next Pet
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={addAnotherPet} className="gap-2">
                      <PlusCircle className="h-4 w-4" />
                      Add Another Pet
                    </Button>
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={handleSkipDetails} disabled={isSubmitting} className="flex-1">
                        {isSubmitting ? 'Saving...' : 'Skip & Save for Later'}
                      </Button>
                      <Button onClick={handleSaveAndContinue} disabled={isSubmitting} className="flex-1">
                        {isSubmitting ? 'Saving...' : 'Complete Onboarding'}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {/* Remove Pet Button */}
          {pets.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                removePet(currentPetIndex);
                if (currentPetIndex >= pets.length - 1) {
                  setCurrentPetIndex(Math.max(0, currentPetIndex - 1));
                }
              }}
              className="text-destructive hover:text-destructive"
            >
              <X className="w-4 h-4 mr-2" />
              Remove {currentPet.name || 'this pet'}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Motivation Message */}
      {getCompletionPercentage() < 100 && step === 'essential' && (
        <Alert className="border-primary/20 bg-primary/5">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <AlertDescription>
            <strong>Great start!</strong> The more details you add, the better care your pet will receive. Complete profiles get 30% more booking requests!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
