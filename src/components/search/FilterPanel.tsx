import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
  currentFilters?: any;
}

export default function FilterPanel({ isOpen, onClose, onApplyFilters, currentFilters }: FilterPanelProps) {
  const isMobile = useIsMobile();
  const [priceRange, setPriceRange] = useState(currentFilters?.priceRange || [10, 100]);
  const [verifiedOnly, setVerifiedOnly] = useState(currentFilters?.verifiedOnly || false);
  const [selectedServices, setSelectedServices] = useState<string[]>(currentFilters?.selectedServices || []);
  const [selectedPetTypes, setSelectedPetTypes] = useState<string[]>(currentFilters?.selectedPetTypes || []);

  // Dynamic price range based on selected services
  const getServicePriceRanges = () => {
    const serviceRanges: { [key: string]: [number, number] } = {
      'Dog Walking': [15, 35],
      'Pet Sitting (Your Home)': [25, 60], 
      'Pet Sitting (Sitter\'s Home)': [20, 50],
      'Drop-in Visits': [12, 30]
    };
    
    if (selectedServices.length === 0) {
      return [10, 100]; // Default range when no services selected
    }
    
    const ranges = selectedServices.map(service => serviceRanges[service] || [10, 100]);
    const minPrice = Math.min(...ranges.map(r => r[0]));
    const maxPrice = Math.max(...ranges.map(r => r[1]));
    
    return [minPrice, maxPrice];
  };

  const [minServicePrice, maxServicePrice] = getServicePriceRanges();

  const services = [
    'Dog Walking',
    'Pet Sitting (Your Home)',
    'Pet Sitting (Sitter\'s Home)',
    'Drop-in Visits'
  ];

  const petTypes = [
    'Dogs',
    'Cats', 
    'Birds',
    'Small Pets',
    'Reptiles'
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
      verifiedOnly,
      selectedServices,
      selectedPetTypes
    };
    onApplyFilters(filters);
    onClose();
  };

  const clearFilters = () => {
    setPriceRange([10, 100]);
    setVerifiedOnly(false);
    setSelectedServices([]);
    setSelectedPetTypes([]);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Price Range (per hour)
          {selectedServices.length > 0 && (
            <span className="text-xs text-muted-foreground ml-1">
              for {selectedServices.join(', ')}
            </span>
          )}
        </Label>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={maxServicePrice}
          min={minServicePrice}
          step={5}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
        {selectedServices.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Typical range for selected services: ${minServicePrice} - ${maxServicePrice}
          </p>
        )}
      </div>

      <Separator />

      {/* Services */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Services</Label>
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
          {services.map((service) => (
            <div key={service} className="flex items-center space-x-2">
              <Checkbox
                id={service}
                checked={selectedServices.includes(service)}
                onCheckedChange={() => handleServiceToggle(service)}
              />
              <Label htmlFor={service} className="text-sm">{service}</Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Pet Types */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Pet Types</Label>
        <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-3'} gap-2`}>
          {petTypes.map((petType) => (
            <div key={petType} className="flex items-center space-x-2">
              <Checkbox
                id={petType}
                checked={selectedPetTypes.includes(petType)}
                onCheckedChange={() => handlePetTypeToggle(petType)}
              />
              <Label htmlFor={petType} className="text-sm">{petType}</Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Additional Options */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="verified"
          checked={verifiedOnly}
          onCheckedChange={(checked) => setVerifiedOnly(checked === true)}
        />
        <Label htmlFor="verified" className="text-sm">Verified sitters only</Label>
      </div>

      {/* Active Filters */}
      {(selectedServices.length > 0 || selectedPetTypes.length > 0) && (
        <>
          <Separator />
          <div className="space-y-2">
            <Label className="text-sm font-medium">Active Filters</Label>
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

      {/* Action Buttons */}
      <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-3 pt-4`}>
        <Button onClick={handleApplyFilters} className="flex-1">
          Apply Filters
        </Button>
        <Button variant="outline" onClick={clearFilters} className="flex-1">
          Clear All
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile: Sheet overlay */}
      {isMobile ? (
        <Sheet open={isOpen} onOpenChange={onClose}>
          <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filter Sitters</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        /* Desktop: Fixed sidebar */
        isOpen && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl">
              <Card className="h-full border-0 rounded-none">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Filter Sitters</CardTitle>
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="overflow-y-auto flex-1 pb-24">
                  <FilterContent />
                </CardContent>
              </Card>
            </div>
          </div>
        )
      )}
    </>
  );
}