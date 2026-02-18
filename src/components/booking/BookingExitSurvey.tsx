import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { MessageCircle } from 'lucide-react';

const EXIT_REASONS = [
  { id: 'too_expensive', label: '💰 Too expensive', emoji: '💰' },
  { id: 'not_ready', label: '🕐 Not ready to book yet', emoji: '🕐' },
  { id: 'comparing', label: '🔍 Still comparing sitters', emoji: '🔍' },
  { id: 'dates_unavailable', label: '📅 My dates aren\'t available', emoji: '📅' },
  { id: 'need_more_info', label: '❓ Need more information', emoji: '❓' },
  { id: 'other', label: '💬 Other reason', emoji: '💬' },
];

interface BookingExitSurveyProps {
  sitterId: string;
  sitterName: string;
  isFormVisible: boolean;
}

export default function BookingExitSurvey({ sitterId, sitterName, isFormVisible }: BookingExitSurveyProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [otherText, setOtherText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const { user } = useAuth();

  // Only trigger once per session per sitter
  const sessionKey = `exit_survey_shown_${sitterId}`;

  const showSurvey = useCallback(() => {
    if (hasShown || sessionStorage.getItem(sessionKey)) return;
    setIsOpen(true);
    setHasShown(true);
    sessionStorage.setItem(sessionKey, 'true');
  }, [hasShown, sessionKey]);

  useEffect(() => {
    if (!isFormVisible) return;

    // Mouse leave detection (desktop)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        showSurvey();
      }
    };

    // Back button / visibility change (mobile)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && isFormVisible) {
        showSurvey();
      }
    };

    // Delay adding listeners so it doesn't fire immediately
    const timer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }, 5000); // Wait 5s after form is visible

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isFormVisible, showSurvey]);

  const handleSubmit = async () => {
    if (!selectedReason) return;

    try {
      await supabase.from('user_events').insert({
        event_name: 'booking_exit_survey',
        event_type: 'survey',
        event_data: {
          sitter_id: sitterId,
          sitter_name: sitterName,
          reason: selectedReason,
          other_text: selectedReason === 'other' ? otherText : undefined,
        },
        user_id: user ? undefined : null, // Will be set by RLS if logged in
        page_path: window.location.pathname,
        session_id: sessionStorage.getItem('search_session_id') || undefined,
      });
    } catch (e) {
      console.error('Failed to save exit survey:', e);
    }

    setSubmitted(true);
    setTimeout(() => setIsOpen(false), 2000);
  };

  if (submitted && isOpen) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-6 space-y-3">
            <div className="text-4xl">🙏</div>
            <DialogTitle className="text-xl">Thanks for your feedback!</DialogTitle>
            <DialogDescription>This helps us improve ZiggySitters for everyone.</DialogDescription>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Quick question before you go
          </DialogTitle>
          <DialogDescription>
            What's holding you back from enquiring with {sitterName.split(' ')[0]}?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          {EXIT_REASONS.map((reason) => (
            <button
              key={reason.id}
              onClick={() => setSelectedReason(reason.id)}
              className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium ${
                selectedReason === reason.id
                  ? 'border-primary bg-primary/5 text-foreground'
                  : 'border-border hover:border-primary/30 hover:bg-muted/50 text-foreground'
              }`}
            >
              {reason.label}
            </button>
          ))}
        </div>

        {selectedReason === 'other' && (
          <Textarea
            placeholder="Tell us more..."
            value={otherText}
            onChange={(e) => setOtherText(e.target.value)}
            rows={2}
            className="resize-none"
          />
        )}

        <Button
          onClick={handleSubmit}
          disabled={!selectedReason}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white"
        >
          Submit Feedback
        </Button>

        <button
          onClick={() => setIsOpen(false)}
          className="text-xs text-center text-muted-foreground hover:text-foreground w-full"
        >
          No thanks, just browsing
        </button>
      </DialogContent>
    </Dialog>
  );
}
