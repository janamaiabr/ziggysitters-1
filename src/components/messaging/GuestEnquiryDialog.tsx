import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Send, MessageCircle, Calendar, HelpCircle, Clock, Home, CheckCircle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface GuestEnquiryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
}

const QUICK_QUESTIONS = [
  {
    icon: Calendar,
    label: "Availability",
    template: "Hi! Are you available for pet sitting? I'm looking for care for my pet."
  },
  {
    icon: Home,
    label: "Your setup",
    template: "Hi! I'd love to know more about your home setup and experience with pets."
  },
  {
    icon: Clock,
    label: "Daily routine",
    template: "Hi! What does a typical day look like for pets in your care?"
  },
  {
    icon: HelpCircle,
    label: "Custom",
    template: ""
  }
];

export default function GuestEnquiryDialog({ 
  isOpen, 
  onClose, 
  recipientId, 
  recipientName,
  recipientAvatar 
}: GuestEnquiryDialogProps) {
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const selectTemplate = (template: string) => {
    setMessage(template);
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const sendEnquiry = async () => {
    if (!message.trim() || !name.trim() || !email.trim()) {
      toast({
        title: 'Please fill in all fields',
        description: 'We need your name, email and message to send your enquiry.',
        variant: 'destructive'
      });
      return;
    }

    if (!isValidEmail(email)) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address so the sitter can reply.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    
    try {
      // Store as email capture for follow-up and send notification to sitter
      await supabase.from('email_captures').upsert({
        email: email.trim().toLowerCase(),
        name: name.trim(),
        source: 'guest_enquiry',
        search_service_type: 'enquiry',
        search_location: recipientName, // Store sitter name for context
      }, {
        onConflict: 'email'
      });

      // Send notification to sitter via edge function
      const { error } = await supabase.functions.invoke('send-message-notification', {
        body: {
          recipientId: recipientId,
          guestName: name.trim(),
          guestEmail: email.trim(),
          messagePreview: message.trim(),
          isGuestEnquiry: true
        }
      });

      if (error) throw error;

      setSuccess(true);
      
      toast({
        title: 'Enquiry sent! ✨',
        description: `${recipientName} will receive your message and can reply to ${email}`,
        duration: 6000,
      });
      
    } catch (error: any) {
      console.error('Error sending enquiry:', error);
      toast({
        title: 'Failed to send',
        description: 'Please try again or create an account for the full experience.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMessage('');
    setName('');
    setEmail('');
    setSuccess(false);
    onClose();
  };

  if (success) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold">Enquiry Sent!</h3>
            <p className="text-muted-foreground">
              {recipientName} will receive your message and reply to <strong>{email}</strong>
            </p>
            
            <div className="bg-primary/5 rounded-lg p-4 mt-4">
              <p className="text-sm font-medium mb-2">Want to book directly next time?</p>
              <Button 
                className="w-full"
                onClick={() => {
                  handleClose();
                  navigate('/auth?tab=signup');
                }}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Create Free Account
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Track your bookings, save favorites, and more
              </p>
            </div>
            
            <Button variant="outline" onClick={handleClose} className="mt-2">
              Continue Browsing
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Ask {recipientName} a Question
          </DialogTitle>
          <DialogDescription>
            No account needed — just enter your details and we'll connect you.
          </DialogDescription>
        </DialogHeader>

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
                  className={`justify-start h-auto py-2 px-3 text-left ${message === q.template ? 'border-primary bg-primary/5' : ''}`}
                  onClick={() => selectTemplate(q.template)}
                >
                  <q.icon className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="text-xs">{q.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Contact details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Your name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sarah"
                className="h-10"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Your email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah@email.com"
                className="h-10"
              />
            </div>
          </div>

          {/* Message textarea */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Your message</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi! I'm looking for pet care for my dog..."
              className="min-h-[100px]"
            />
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
              ✓ Free to ask
            </Badge>
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
              ✓ No account needed
            </Badge>
            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
              ✓ Quick response
            </Badge>
          </div>

          {/* Send button */}
          <Button 
            onClick={sendEnquiry}
            disabled={!message.trim() || !name.trim() || !email.trim() || loading}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
            size="lg"
          >
            <Send className="h-4 w-4 mr-2" />
            {loading ? 'Sending...' : 'Send Enquiry'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
