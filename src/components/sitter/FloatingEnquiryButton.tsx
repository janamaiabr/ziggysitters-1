import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Calendar } from 'lucide-react';

interface FloatingEnquiryButtonProps {
  onEnquiryClick: () => void;
  onBookingClick: () => void;
  sitterName: string;
}

export default function FloatingEnquiryButton({ onEnquiryClick, onBookingClick, sitterName }: FloatingEnquiryButtonProps) {
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

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className="flex gap-2 bg-background/95 backdrop-blur-sm p-2 rounded-full shadow-2xl border border-border/50">
        <Button
          onClick={onEnquiryClick}
          size="lg"
          variant="outline"
          className="rounded-full px-4 shadow-md hover:bg-primary/10"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Ask {sitterName.split(' ')[0]}
        </Button>
        <Button
          onClick={onBookingClick}
          size="lg"
          className="rounded-full px-4 shadow-md bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 animate-pulse-subtle"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Get a Quote
        </Button>
      </div>
    </div>
  );
}
