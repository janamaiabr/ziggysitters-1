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
    <div className="bg-muted/80 border-b border-border py-2 px-4">
      <div className="container mx-auto flex items-center justify-center gap-4">
        <p className="text-sm text-muted-foreground">
          🌏 Now in <span className="font-medium text-foreground">NZ + Sunshine Coast, QLD</span> — expanding!
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground flex-shrink-0"
          onClick={() => setDismissed(true)}
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
