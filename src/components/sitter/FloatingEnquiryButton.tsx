import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Calendar } from 'lucide-react';

interface FloatingEnquiryButtonProps {
  onEnquiryClick: () => void;
  onBookingClick: () => void;
  sitterName: string;
  isGuest?: boolean;
}

export default function FloatingEnquiryButton({ 
  onEnquiryClick, 
  onBookingClick, 
  sitterName,
  isGuest = false
}: FloatingEnquiryButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasScrolledPastHeader, setHasScrolledPastHeader] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show floating buttons after scrolling past the header (roughly 300px)
      const scrolledPast = window.scrollY > 300;
      setHasScrolledPastHeader(scrolledPast);
      
      // On mobile, always show. On desktop, only show after scrolling past header
      const isMobile = window.innerWidth < 1024;
      setIsVisible(isMobile || scrolledPast);
    };

    // Initial check
    handleScroll();
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const handleAvailabilityClick = () => {
    if (isGuest) {
      // For guests, scroll to calendar instead of requiring login
      const calendarSection = document.querySelector('[data-availability-calendar]');
      if (calendarSection) {
        calendarSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      onBookingClick();
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
      <div className="flex gap-2 bg-background/95 backdrop-blur-md p-2 rounded-full shadow-2xl border-2 border-primary/20">
        <Button
          onClick={onEnquiryClick}
          size="lg"
          variant="outline"
          className="rounded-full px-5 shadow-md hover:bg-primary/10 border-2"
        >
          <MessageCircle className="h-5 w-5 mr-2" />
          Ask {sitterName.split(' ')[0]}
        </Button>
        <Button
          onClick={handleAvailabilityClick}
          size="lg"
          className="rounded-full px-5 shadow-xl bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-400 hover:via-emerald-400 hover:to-teal-400 text-white font-bold animate-pulse-glow"
        >
          <Calendar className="h-5 w-5 mr-2" />
          {isGuest ? 'View Availability' : 'Check Availability'}
        </Button>
      </div>
    </div>
  );
}
