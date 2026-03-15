import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import iconEaster from '@/assets/icons/icon-easter.png';

export default function EasterBanner() {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  // Show banner until April 7, 2026
  const now = new Date();
  const cutoff = new Date('2026-04-07T23:59:59');
  if (now > cutoff) return null;

  return (
    <div className="relative bg-vintage-cream border-b border-border">
      <div className="container mx-auto px-4 py-3 flex items-center justify-center gap-3 text-center">
        <img src={iconEaster} alt="" className="w-7 h-7" />
        <p className="text-sm md:text-base font-medium text-foreground font-body">
          <strong>Book your Easter pet sitter early</strong> — April 3–6 fills fast!
        </p>
        <Button
          size="sm"
          variant="default"
          onClick={() => navigate('/find-sitters')}
          className="ml-2 whitespace-nowrap font-body"
        >
          Book Now
        </Button>
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
