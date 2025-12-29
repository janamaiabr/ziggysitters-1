import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGeoLocation } from '@/hooks/useGeoLocation';

export default function GeoLocationBanner() {
  const { isNZ, isLoading } = useGeoLocation();
  const [dismissed, setDismissed] = useState(false);

  // Don't show if loading, is NZ, or dismissed
  if (isLoading || isNZ || dismissed) {
    return null;
  }

  return (
    <div className="bg-gray-900 text-white py-2.5 px-4">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <p className="text-sm md:text-base">
          🌏 Currently in <span className="font-bold">Auckland & Hamilton, NZ</span> — expanding soon!
        </p>
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
