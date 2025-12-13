import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Send, MessageCircle, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Conversation {
  partnerId: string;
  partnerName: string;
  partnerAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  recipient_id: string;
  created_at: string;
  is_read: boolean;
}

export default function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  useEffect(() => {
    if (userProfile) {
      fetchConversations();
    }
  }, [userProfile]);

  useEffect(() => {
    if (selectedConversation && userProfile) {
      fetchMessages(selectedConversation);
      markMessagesAsRead(selectedConversation);
    }
  }, [selectedConversation, userProfile]);

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

  const fetchConversations = async () => {
    if (!userProfile) return;

    // Get all messages involving this user
    const { data: allMessages, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userProfile.id},recipient_id.eq.${userProfile.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      setLoading(false);
      return;
    }

    // Group by conversation partner
    const conversationMap = new Map<string, { messages: any[], partnerId: string }>();
    
    allMessages?.forEach(msg => {
      const partnerId = msg.sender_id === userProfile.id ? msg.recipient_id : msg.sender_id;
      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, { messages: [], partnerId });
      }
      conversationMap.get(partnerId)!.messages.push(msg);
    });

    // Fetch partner profiles
    const partnerIds = Array.from(conversationMap.keys());
    if (partnerIds.length === 0) {
      setLoading(false);
      return;
    }

    const { data: partners } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, avatar_url')
      .in('id', partnerIds);

    // Build conversation list
    const conversationList: Conversation[] = [];
    conversationMap.forEach((conv, partnerId) => {
      const partner = partners?.find(p => p.id === partnerId);
      const lastMsg = conv.messages[0];
      const unreadCount = conv.messages.filter(m => 
        m.recipient_id === userProfile.id && !m.is_read
      ).length;

      conversationList.push({
        partnerId,
        partnerName: partner ? `${partner.first_name} ${partner.last_name}` : 'Unknown User',
        partnerAvatar: partner?.avatar_url,
        lastMessage: lastMsg.content,
        lastMessageTime: lastMsg.created_at,
        unreadCount
      });
    });

    // Sort by most recent
    conversationList.sort((a, b) => 
      new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    );

    setConversations(conversationList);
    setLoading(false);
  };

  const fetchMessages = async (partnerId: string) => {
    if (!userProfile) return;

    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${userProfile.id},recipient_id.eq.${partnerId}),and(sender_id.eq.${partnerId},recipient_id.eq.${userProfile.id})`)
      .order('created_at', { ascending: true });

    setMessages(data || []);
  };

  const markMessagesAsRead = async (partnerId: string) => {
    if (!userProfile) return;

    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('recipient_id', userProfile.id)
      .eq('sender_id', partnerId);

    // Update local conversation unread count
    setConversations(prev => prev.map(conv => 
      conv.partnerId === partnerId ? { ...conv, unreadCount: 0 } : conv
    ));
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !userProfile || !selectedConversation) return;

    setSendingMessage(true);
    
    const { error } = await supabase
      .from('messages')
      .insert([{
        content: newMessage.trim(),
        sender_id: userProfile.id,
        recipient_id: selectedConversation
      }]);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message.',
        variant: 'destructive'
      });
    } else {
      setNewMessage('');
      fetchMessages(selectedConversation);
      
      // Trigger email notification
      try {
        await supabase.functions.invoke('send-message-notification', {
          body: {
            recipientId: selectedConversation,
            senderId: userProfile.id,
            senderName: `${userProfile.first_name} ${userProfile.last_name}`,
            messagePreview: newMessage.trim().substring(0, 100)
          }
        });
      } catch (e) {
        console.log('Email notification failed:', e);
      }
    }
    
    setSendingMessage(false);
  };

  const selectedPartner = conversations.find(c => c.partnerId === selectedConversation);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="pt-6 text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Sign in to view messages</h2>
              <Button onClick={() => navigate('/auth')}>Sign In</Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)] min-h-[500px]">
          {/* Conversations List */}
          <Card className={`lg:col-span-1 ${selectedConversation ? 'hidden lg:block' : ''}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Messages
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-350px)]">
                {loading ? (
                  <div className="p-4 text-center text-muted-foreground">Loading...</div>
                ) : conversations.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No messages yet</p>
                    <p className="text-sm mt-2">Start a conversation by contacting a sitter!</p>
                  </div>
                ) : (
                  conversations.map(conv => (
                    <div
                      key={conv.partnerId}
                      onClick={() => setSelectedConversation(conv.partnerId)}
                      className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedConversation === conv.partnerId ? 'bg-muted' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={conv.partnerAvatar} className="object-cover" />
                          <AvatarFallback>
                            {conv.partnerName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium truncate">{conv.partnerName}</span>
                            {conv.unreadCount > 0 && (
                              <Badge variant="default" className="ml-2">
                                {conv.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {conv.lastMessage}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(conv.lastMessageTime), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Message Thread */}
          <Card className={`lg:col-span-2 flex flex-col ${!selectedConversation ? 'hidden lg:flex' : ''}`}>
            {selectedConversation && selectedPartner ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="lg:hidden"
                      onClick={() => setSelectedConversation(null)}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={selectedPartner.partnerAvatar} className="object-cover" />
                      <AvatarFallback>
                        {selectedPartner.partnerName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-lg">{selectedPartner.partnerName}</CardTitle>
                  </div>
                </CardHeader>
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map(message => {
                      const isOwn = message.sender_id === userProfile?.id;
                      return (
                        <div 
                          key={message.id} 
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[80%]`}>
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
                              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      placeholder="Type your message..."
                      className="flex-1 min-h-[40px] max-h-[100px]"
                      rows={1}
                    />
                    <Button 
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || sendingMessage}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a conversation to view messages</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
