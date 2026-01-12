import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Send, MessageCircle, Calendar, HelpCircle, Clock, Home } from 'lucide-react';

interface QuickQuestionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
}

const QUICK_QUESTIONS = [
  {
    icon: Calendar,
    label: "Check availability",
    template: "Hi! Are you available from [start date] to [end date]? I have a [pet type] that needs care."
  },
  {
    icon: Home,
    label: "About your home",
    template: "Hi! I'd love to know more about your home setup. Do you have a fenced yard? Are there other pets in your home?"
  },
  {
    icon: Clock,
    label: "Daily routine",
    template: "Hi! Could you tell me about the daily routine you provide for pets? How much time do they spend exercising/playing?"
  },
  {
    icon: HelpCircle,
    label: "Custom question",
    template: ""
  }
];

export default function QuickQuestionDialog({ 
  isOpen, 
  onClose, 
  recipientId, 
  recipientName,
  recipientAvatar 
}: QuickQuestionDialogProps) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  React.useEffect(() => {
    if (isOpen && user) {
      fetchUserProfile();
    }
  }, [isOpen, user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (data) {
      setUserProfile(data);
    }
  };

  const selectTemplate = (template: string) => {
    setMessage(template);
  };

  const sendMessage = async () => {
    if (!message.trim() || !user || !userProfile) return;

    setLoading(true);
    
    const { error } = await supabase
      .from('messages')
      .insert([{
        content: message.trim(),
        sender_id: userProfile.id,
        recipient_id: recipientId
      }]);

    if (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Enquiry sent!',
        description: `${recipientName} will be notified and can respond to you directly.`
      });
      
      // Trigger email notification
      try {
        await supabase.functions.invoke('send-message-notification', {
          body: {
            recipientId: recipientId,
            senderId: userProfile.id,
            senderName: `${userProfile.first_name} ${userProfile.last_name}`,
            messagePreview: message.trim().substring(0, 100)
          }
        });
      } catch (e) {
        console.log('Email notification failed:', e);
      }

      // Create in-app notification
      try {
        await supabase.functions.invoke('create-notification', {
          body: {
            user_id: recipientId,
            type: 'message',
            title: `New enquiry from ${userProfile.first_name}`,
            message: message.trim().substring(0, 140),
            link: '/messages',
            metadata: {
              source: 'quick_question_dialog'
            }
          }
        });
      } catch (e) {
        console.log('In-app notification failed:', e);
      }
      
      setMessage('');
      onClose();
    }
    
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            💬 Quick Question for {recipientName}
          </DialogTitle>
          <DialogDescription>
            Just a friendly chat — no commitment, no payment details needed. Most sitters respond within a few hours.
          </DialogDescription>
        </DialogHeader>
        
        {/* Reassurance banner */}
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-2 text-center mb-2">
          <p className="text-xs font-medium text-green-700 dark:text-green-300">
            🛡️ This is not a booking — just a conversation starter
          </p>
        </div>

        <div className="space-y-4">
          {/* Quick question buttons */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Quick questions:</p>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_QUESTIONS.map((q, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  className="justify-start h-auto py-2 px-3 text-left"
                  onClick={() => selectTemplate(q.template)}
                >
                  <q.icon className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="text-xs">{q.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Message textarea */}
          <div className="space-y-2">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message or select a quick question above..."
              className="min-h-[120px]"
            />
            <p className="text-xs text-muted-foreground">
              Tip: Include your dates and pet details for a faster response
            </p>
          </div>

          {/* Send button */}
          <Button 
            onClick={sendMessage}
            disabled={!message.trim() || loading}
            className="w-full"
            size="lg"
          >
            <Send className="h-4 w-4 mr-2" />
            {loading ? 'Sending...' : 'Send Enquiry'}
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            No commitment required • Free to ask questions
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
