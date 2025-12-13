import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface FloatingEnquiryButtonProps {
  onClick: () => void;
  sitterName: string;
}

export default function FloatingEnquiryButton({ onClick, sitterName }: FloatingEnquiryButtonProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 lg:hidden">
      <div className="flex gap-2 bg-background/95 backdrop-blur-sm p-2 rounded-full shadow-lg border">
        <Button
          onClick={onClick}
          size="lg"
          className="rounded-full px-6 shadow-md"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Ask {sitterName.split(' ')[0]} a Question
        </Button>
      </div>
    </div>
  );
}
