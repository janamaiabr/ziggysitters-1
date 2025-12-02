import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Mail, Loader2, CheckCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import SitterVerificationBadge from '@/components/sitter/SitterVerificationBadge';

export default function AdminInviteUnverifiedSitters() {
  const { toast } = useToast();
  const [selectedSitters, setSelectedSitters] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);

  const { data: unverifiedSitters, isLoading, refetch } = useQuery({
    queryKey: ['unverified-sitters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, is_verified, golden_badge_approved, onboarding_completed, created_at')
        .eq('role', 'pet_sitter')
        .eq('onboarding_completed', true)
        .or('is_verified.is.null,is_verified.eq.false')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleSelectAll = () => {
    if (selectedSitters.length === unverifiedSitters?.length) {
      setSelectedSitters([]);
    } else {
      setSelectedSitters(unverifiedSitters?.map(s => s.id) || []);
    }
  };

  const handleToggleSitter = (sitterId: string) => {
    setSelectedSitters(prev =>
      prev.includes(sitterId)
        ? prev.filter(id => id !== sitterId)
        : [...prev, sitterId]
    );
  };

  const handleSendInvitations = async () => {
    if (selectedSitters.length === 0) {
      toast({
        title: "No sitters selected",
        description: "Please select at least one sitter to send invitations to.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-unverified-sitter-invitation', {
        body: { sitter_ids: selectedSitters },
      });

      if (error) throw error;

      toast({
        title: "Invitations sent successfully!",
        description: `Sent ${data.count} invitation email(s) to unverified sitters.`,
      });

      setSelectedSitters([]);
      refetch();
    } catch (error: any) {
      console.error('Error sending invitations:', error);
      toast({
        title: "Failed to send invitations",
        description: error.message || "An error occurred while sending invitations.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSendToAll = async () => {
    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-unverified-sitter-invitation', {
        body: {},
      });

      if (error) throw error;

      toast({
        title: "Invitations sent successfully!",
        description: `Sent ${data.count} invitation email(s) to all unverified sitters.`,
      });

      refetch();
    } catch (error: any) {
      console.error('Error sending invitations:', error);
      toast({
        title: "Failed to send invitations",
        description: error.message || "An error occurred while sending invitations.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-6 h-6" />
            Invite Unverified Sitters
          </CardTitle>
          <CardDescription>
            Send invitation emails to unverified sitters encouraging them to submit documents and connect their bank accounts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {unverifiedSitters?.length || 0} unverified sitters found
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleSelectAll}
                  disabled={!unverifiedSitters?.length}
                >
                  {selectedSitters.length === unverifiedSitters?.length ? 'Deselect All' : 'Select All'}
                </Button>
                <Button
                  onClick={handleSendInvitations}
                  disabled={isSending || selectedSitters.length === 0}
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send to Selected ({selectedSitters.length})
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleSendToAll}
                  disabled={isSending || !unverifiedSitters?.length}
                  variant="default"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Send to All
                    </>
                  )}
                </Button>
              </div>
            </div>

            {unverifiedSitters && unverifiedSitters.length > 0 ? (
              <div className="space-y-2">
                {unverifiedSitters.map((sitter) => (
                  <div
                    key={sitter.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedSitters.includes(sitter.id)}
                        onCheckedChange={() => handleToggleSitter(sitter.id)}
                      />
                      <div>
                        <div className="font-medium">
                          {sitter.first_name} {sitter.last_name}
                        </div>
                        <div className="text-sm text-muted-foreground">{sitter.email}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Joined: {new Date(sitter.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <SitterVerificationBadge
                      isVerified={sitter.is_verified || false}
                      hasGoldenBadge={sitter.golden_badge_approved || false}
                      size="sm"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No unverified sitters found. All sitters are verified!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
