import { useState, useEffect } from 'react';
import { Users, Clock } from 'lucide-react';

interface UrgencyIndicatorProps {
  location?: string;
}

export default function UrgencyIndicator({ location }: UrgencyIndicatorProps) {
  const [availableSitters, setAvailableSitters] = useState(12);
  const [lastBooked, setLastBooked] = useState(2);

  // Simulate real-time data (in production, this would fetch from database)
  useEffect(() => {
    // Random available sitters between 8-18 for realism
    setAvailableSitters(Math.floor(Math.random() * 11) + 8);
    // Random hours between 1-6
    setLastBooked(Math.floor(Math.random() * 6) + 1);
  }, [location]);

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 text-sm animate-fade-in">
      <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-4 py-2 rounded-full">
        <Users className="w-4 h-4" />
        <span className="font-medium">{availableSitters} sitters available</span>
        <span className="text-green-600 dark:text-green-400">in Auckland</span>
      </div>
      
      <div className="flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-4 py-2 rounded-full">
        <Clock className="w-4 h-4" />
        <span className="font-medium">Last booked {lastBooked}h ago</span>
        <span className="animate-pulse">🔥</span>
      </div>
    </div>
  );
}
