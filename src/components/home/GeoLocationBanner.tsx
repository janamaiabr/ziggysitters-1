import { useState } from 'react';
import { X, MapPin, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGeoLocation } from '@/hooks/useGeoLocation';

export default function GeoLocationBanner() {
  const { isNZ, isLoading, country } = useGeoLocation();
  const [dismissed, setDismissed] = useState(false);

  // Don't show if loading, is NZ, or dismissed
  if (isLoading || isNZ || dismissed) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Globe className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm md:text-base">
            We currently serve <span className="font-bold">Auckland & Hamilton, NZ</span> only.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20 flex-shrink-0"
          onClick={() => setDismissed(true)}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
