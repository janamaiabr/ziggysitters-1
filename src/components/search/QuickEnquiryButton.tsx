import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import QuickQuestionDialog from '@/components/messaging/QuickQuestionDialog';
import GuestEnquiryDialog from '@/components/messaging/GuestEnquiryDialog';

interface QuickEnquiryButtonProps {
  sitterId: string;
  sitterName: string;
  sitterAvatar?: string;
  variant?: 'icon' | 'button';
  className?: string;
}

export default function QuickEnquiryButton({ 
  sitterId, 
  sitterName, 
  sitterAvatar,
  variant = 'icon',
  className = ''
}: QuickEnquiryButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setIsDialogOpen(true);
  };

  return (
    <>
      {variant === 'icon' ? (
        <Button
          variant="outline"
          size="icon"
          className={`h-9 w-9 rounded-full bg-background/80 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground transition-all ${className}`}
          onClick={handleClick}
          title={`Ask ${sitterName} a question`}
        >
          <MessageCircle className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          variant="outline"
          className={`${className}`}
          onClick={handleClick}
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Ask a Question
        </Button>
      )}

      {/* Show appropriate dialog based on auth state */}
      {user ? (
        <QuickQuestionDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          recipientId={sitterId}
          recipientName={sitterName}
          recipientAvatar={sitterAvatar}
        />
      ) : (
        <GuestEnquiryDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          recipientId={sitterId}
          recipientName={sitterName}
          recipientAvatar={sitterAvatar}
        />
      )}
    </>
  );
}
