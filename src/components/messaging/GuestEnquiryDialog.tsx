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
import { ga4 } from '@/lib/ga4';

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
      // Store as email capture for follow-up
      const { error: captureError } = await supabase.from('email_captures').upsert({
        email: email.trim().toLowerCase(),
        name: name.trim(),
        source: 'guest_enquiry',
        search_service_type: 'enquiry',
        search_location: recipientName,
      }, {
        onConflict: 'email'
      });

      if (captureError) {
        console.error('Email capture error:', captureError);
      }

      // Send email notification to sitter via edge function
      const { error: emailError } = await supabase.functions.invoke('send-message-notification', {
        body: {
          recipientId: recipientId,
          guestName: name.trim(),
          guestEmail: email.trim(),
          messagePreview: message.trim(),
          isGuestEnquiry: true
        }
      });

      if (emailError) {
        console.error('Email notification error:', emailError);
      }

      // Create in-app notification for sitter
      const { error: notifError } = await supabase.functions.invoke('create-notification', {
        body: {
          user_id: recipientId,
          type: 'enquiry',
          title: `💬 New enquiry from ${name.trim()}`,
          message: `"${message.trim().substring(0, 100)}${message.length > 100 ? '...' : ''}" — Reply to: ${email.trim()}`,
          link: '/messages',
          metadata: {
            guestName: name.trim(),
            guestEmail: email.trim(),
            isGuestEnquiry: true
          }
        }
      });

      if (notifError) {
        console.error('In-app notification error:', notifError);
      }

      setSuccess(true);
      
      // GA4 conversion event
      ga4.guestEnquiry(recipientId, recipientName);
      
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
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Message Sent!</h3>
            <p className="text-muted-foreground">
              {recipientName} has received your enquiry and will reply to <strong className="text-foreground">{email}</strong>
            </p>
            
            {/* Strong registration CTA */}
            <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-xl p-5 mt-6 border border-primary/20">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-primary" />
                <p className="text-lg font-semibold text-foreground">Create your free account</p>
              </div>
              <ul className="text-sm text-left space-y-2 mb-4">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Message sitters instantly with one click</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Track all your enquiries and bookings</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Save your favorite sitters</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Get notified when sitters reply</span>
                </li>
              </ul>
              <Button 
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-lg py-6"
                onClick={() => {
                  handleClose();
                  navigate('/auth?tab=signup&email=' + encodeURIComponent(email));
                }}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Sign Up Free — Takes 30 Seconds
              </Button>
            </div>
            
            <Button variant="ghost" onClick={handleClose} className="text-muted-foreground">
              Maybe later
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
            💬 Quick Question for {recipientName}
          </DialogTitle>
          <DialogDescription>
            No account needed — just a friendly chat. No payment, no commitment.
          </DialogDescription>
        </DialogHeader>
        
        {/* Reassurance banner */}
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-2 text-center">
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
            className="w-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-400 hover:via-emerald-400 hover:to-teal-400"
            size="lg"
          >
            <Send className="h-4 w-4 mr-2" />
            {loading ? 'Sending...' : '💬 Send Free Enquiry'}
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            ✓ Not a booking — just a question. {recipientName} will reply to your email.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
