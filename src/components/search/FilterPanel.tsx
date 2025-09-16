import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { X } from 'lucide-react';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
}

export default function FilterPanel({ isOpen, onClose, onApplyFilters }: FilterPanelProps) {
  const [priceRange, setPriceRange] = useState([20, 50]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedPetTypes, setSelectedPetTypes] = useState<string[]>([]);
  const [rating, setRating] = useState([4]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [availableToday, setAvailableToday] = useState(false);

  const services = [
    'Dog Walking',
    'Pet Sitting',
    'Overnight Care',
    'Drop-in Visits',
    'Pet Boarding',
    'Grooming',
    'Training'
  ];

  const petTypes = [
    'Dogs',
    'Cats',
    'Birds',
    'Small Pets',
    'Reptiles',
    'Fish'
  ];

  const handleServiceToggle = (service: string) => {
    setSelectedServices(prev => 
      prev.includes(service) 
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  const handlePetTypeToggle = (petType: string) => {
    setSelectedPetTypes(prev => 
      prev.includes(petType) 
        ? prev.filter(p => p !== petType)
        : [...prev, petType]
    );
  };

  const handleApplyFilters = () => {
    const filters = {
      priceRange,
      selectedServices,
      selectedPetTypes,
      rating: rating[0],
      verifiedOnly,
      availableToday
    };
    onApplyFilters(filters);
    onClose();
  };

  const handleClearAll = () => {
    setPriceRange([20, 50]);
    setSelectedServices([]);
    setSelectedPetTypes([]);
    setRating([4]);
    setVerifiedOnly(false);
    setAvailableToday(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
      <div className="bg-background w-full max-w-md h-full overflow-y-auto">
        <Card className="h-full rounded-none border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>Filters</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Removed price and rating filters */}

            {/* Services */}
            <div>
              <h3 className="font-medium mb-4">Services</h3>
              <div className="space-y-3">
                {services.map((service) => (
                  <div key={service} className="flex items-center space-x-2">
                    <Checkbox
                      id={service}
                      checked={selectedServices.includes(service)}
                      onCheckedChange={() => handleServiceToggle(service)}
                    />
                    <label htmlFor={service} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {service}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Pet Types */}
            <div>
              <h3 className="font-medium mb-4">Pet Types</h3>
              <div className="space-y-3">
                {petTypes.map((petType) => (
                  <div key={petType} className="flex items-center space-x-2">
                    <Checkbox
                      id={petType}
                      checked={selectedPetTypes.includes(petType)}
                      onCheckedChange={() => handlePetTypeToggle(petType)}
                    />
                    <label htmlFor={petType} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {petType}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Additional Options */}
            <div>
              <h3 className="font-medium mb-4">Additional Options</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                    <Checkbox
                      id="verified"
                      checked={verifiedOnly}
                      onCheckedChange={(checked) => setVerifiedOnly(checked === true)}
                    />
                  <label htmlFor="verified" className="text-sm font-medium leading-none">
                    Verified sitters only
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox
                      id="available"
                      checked={availableToday}
                      onCheckedChange={(checked) => setAvailableToday(checked === true)}
                    />
                  <label htmlFor="available" className="text-sm font-medium leading-none">
                    Available today
                  </label>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {(selectedServices.length > 0 || selectedPetTypes.length > 0) && (
              <>
                <Separator />
                <div>
                  <h3 className="font-medium mb-4">Active Filters</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedServices.map((service) => (
                      <Badge key={service} variant="secondary" className="text-xs">
                        {service}
                        <button
                          onClick={() => handleServiceToggle(service)}
                          className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                    {selectedPetTypes.map((petType) => (
                      <Badge key={petType} variant="outline" className="text-xs">
                        {petType}
                        <button
                          onClick={() => handlePetTypeToggle(petType)}
                          className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>

          {/* Footer */}
          <div className="p-6 pt-0 space-y-3">
            <Button className="w-full" onClick={handleApplyFilters}>
              Apply Filters
            </Button>
            <Button variant="outline" className="w-full" onClick={handleClearAll}>
              Clear All
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}