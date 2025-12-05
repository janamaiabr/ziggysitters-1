import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Gift, Copy, CheckCircle, Users, DollarSign, Share2 } from 'lucide-react';

interface Referral {
  id: string;
  referral_code: string;
  referred_email: string | null;
  status: string;
  created_at: string;
}

interface ReferralProgramProps {
  profileId: string;
  firstName: string;
}

export default function ReferralProgram({ profileId, firstName }: ReferralProgramProps) {
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchOrCreateReferralCode();
    fetchReferrals();
  }, [profileId]);

  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${firstName.toUpperCase().slice(0, 3)}${code}`;
  };

  const fetchOrCreateReferralCode = async () => {
    try {
      // Check for existing referral code
      const { data: existing } = await supabase
        .from('referrals')
        .select('referral_code')
        .eq('referrer_id', profileId)
        .is('referred_email', null)
        .limit(1)
        .single();

      if (existing?.referral_code) {
        setReferralCode(existing.referral_code);
      } else {
        // Create new referral code
        const newCode = generateCode();
        const { error } = await supabase
          .from('referrals')
          .insert({
            referrer_id: profileId,
            referral_code: newCode,
          });

        if (!error) {
          setReferralCode(newCode);
        }
      }
    } catch (error) {
      console.error('Error with referral code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReferrals = async () => {
    const { data } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', profileId)
      .not('referred_email', 'is', null)
      .order('created_at', { ascending: false });

    if (data) {
      setReferrals(data);
    }
  };

  const copyToClipboard = async () => {
    const link = `${window.location.origin}/become-sitter?ref=${referralCode}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    toast({
      title: "Link copied!",
      description: "Share it with friends who'd love to become pet sitters.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = async () => {
    const link = `${window.location.origin}/become-sitter?ref=${referralCode}`;
    const text = `Join me as a pet sitter on ZiggySitters! Use my referral link and we both get $20 credit: ${link}`;
    
    if (navigator.share) {
      await navigator.share({ text, url: link });
    } else {
      copyToClipboard();
    }
  };

  const completedReferrals = referrals.filter(r => r.status === 'completed' || r.status === 'credited').length;
  const pendingReferrals = referrals.filter(r => r.status === 'pending' || r.status === 'signed_up').length;
  const totalEarned = completedReferrals * 20;

  if (isLoading) {
    return <Card className="animate-pulse h-64" />;
  }

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-primary" />
          Refer a Friend, Earn $20
        </CardTitle>
        <CardDescription>
          Invite friends to become sitters. When they complete their first booking, you both get $20!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <Users className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-2xl font-bold">{referrals.length}</p>
            <p className="text-xs text-muted-foreground">Invited</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <CheckCircle className="w-5 h-5 mx-auto mb-1 text-green-500" />
            <p className="text-2xl font-bold">{completedReferrals}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div className="text-center p-3 bg-primary/10 rounded-lg">
            <DollarSign className="w-5 h-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">${totalEarned}</p>
            <p className="text-xs text-muted-foreground">Earned</p>
          </div>
        </div>

        {/* Referral Link */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Your referral link</label>
          <div className="flex gap-2">
            <Input
              readOnly
              value={`${window.location.origin}/become-sitter?ref=${referralCode}`}
              className="font-mono text-sm"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={copyToClipboard}
              className="shrink-0"
            >
              {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <Button onClick={shareLink} className="w-full">
          <Share2 className="w-4 h-4 mr-2" />
          Share Your Link
        </Button>

        {/* Recent Referrals */}
        {referrals.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Recent Referrals</h4>
            <div className="space-y-2">
              {referrals.slice(0, 5).map((referral) => (
                <div key={referral.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                  <span className="text-sm">{referral.referred_email}</span>
                  <Badge variant={
                    referral.status === 'completed' || referral.status === 'credited' 
                      ? 'default' 
                      : 'secondary'
                  }>
                    {referral.status === 'credited' ? 'Completed' : referral.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {pendingReferrals > 0 && (
          <p className="text-xs text-muted-foreground text-center">
            {pendingReferrals} referral(s) pending - they need to complete their first booking
          </p>
        )}
      </CardContent>
    </Card>
  );
}
