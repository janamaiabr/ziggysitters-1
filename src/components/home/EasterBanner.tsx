import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useState } from 'react';

export default function EasterBanner() {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  // Show banner until April 7, 2026
  const now = new Date();
  const cutoff = new Date('2026-04-07T23:59:59');
  if (now > cutoff) return null;

  return (
    <div className="relative bg-gradient-to-r from-yellow-100 via-pink-100 to-purple-100 border-b border-yellow-200">
      <div className="container mx-auto px-4 py-3 flex items-center justify-center gap-3 text-center">
        <span className="text-lg">🐣</span>
        <p className="text-sm md:text-base font-medium text-gray-800">
          <strong>Book your Easter pet sitter early</strong> — April 3–6 fills fast!
        </p>
        <Button
          size="sm"
          variant="default"
          onClick={() => navigate('/find-sitters')}
          className="ml-2 whitespace-nowrap"
        >
          Book Now
        </Button>
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
