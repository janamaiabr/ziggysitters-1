import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Calendar } from 'lucide-react';

interface FloatingEnquiryButtonProps {
  onEnquiryClick: () => void;
  onBookingClick: () => void;
  sitterName: string;
}

export default function FloatingEnquiryButton({ onEnquiryClick, onBookingClick, sitterName }: FloatingEnquiryButtonProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 lg:hidden">
      <div className="flex gap-2 bg-background/95 backdrop-blur-sm p-2 rounded-full shadow-lg border">
        <Button
          onClick={onEnquiryClick}
          size="lg"
          variant="outline"
          className="rounded-full px-4 shadow-md"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Ask
        </Button>
        <Button
          onClick={onBookingClick}
          size="lg"
          className="rounded-full px-4 shadow-md bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Get a Quote
        </Button>
      </div>
    </div>
  );
}
