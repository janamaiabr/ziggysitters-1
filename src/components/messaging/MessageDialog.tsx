import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Send, MessageCircle } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  recipient_id: string;
  created_at: string;
  is_read: boolean;
  sender_profile?: {
    first_name: string;
    avatar_url?: string;
  };
}

interface MessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
}

export default function MessageDialog({ 
  isOpen, 
  onClose, 
  recipientId, 
  recipientName,
  recipientAvatar 
}: MessageDialogProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && user) {
      fetchUserProfile();
      fetchMessages();
    }
  }, [isOpen, user, recipientId]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (data) {
      setUserProfile(data);
    }
  };

  const fetchMessages = async () => {
    if (!user || !userProfile) return;

    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender_profile:profiles!messages_sender_id_fkey(first_name, avatar_url)
      `)
      .or(`and(sender_id.eq.${userProfile.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${userProfile.id})`)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    setMessages(data || []);
    
    // Mark messages as read
    await markMessagesAsRead();
  };

  const markMessagesAsRead = async () => {
    if (!userProfile) return;

    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('recipient_id', userProfile.id)
      .eq('sender_id', recipientId);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !userProfile) return;

    setLoading(true);
    
    const { error } = await supabase
      .from('messages')
      .insert([{
        content: newMessage.trim(),
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
      setNewMessage('');
      fetchMessages();
      toast({
        title: 'Message sent!',
        description: 'Your message has been delivered.'
      });
    }
    
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md h-[600px] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage 
                src={recipientAvatar} 
                className="object-cover"
              />
              <AvatarFallback>
                {recipientName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <span>Message {recipientName}</span>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const isOwn = message.sender_id === userProfile?.id;
                return (
                  <div 
                    key={message.id} 
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] ${isOwn ? 'order-2' : 'order-1'}`}>
                      <div 
                        className={`rounded-lg px-3 py-2 ${
                          isOwn 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 px-1">
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 min-h-[40px] max-h-[100px]"
              rows={1}
            />
            <Button 
              onClick={sendMessage}
              disabled={!newMessage.trim() || loading}
              size="sm"
              className="h-10"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}