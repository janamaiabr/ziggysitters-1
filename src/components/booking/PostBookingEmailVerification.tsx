import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Mail, CheckCircle, X, Loader2, RefreshCw } from 'lucide-react';

interface PostBookingEmailVerificationProps {
  userId: string;
  email: string;
  firstName: string;
  onVerified: () => void;
  onSkip: () => void;
}

export default function PostBookingEmailVerification({
  userId,
  email,
  firstName,
  onVerified,
  onSkip,
}: PostBookingEmailVerificationProps) {
  const { toast } = useToast();
  const [code, setCode] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const sendVerificationEmail = async () => {
    if (cooldown > 0) return;
    
    setIsSending(true);
    try {
      const { error } = await supabase.functions.invoke('send-email-verification', {
        body: {
          user_id: userId,
          email: email,
          first_name: firstName,
        },
      });

      if (error) throw error;

      setEmailSent(true);
      setCooldown(60);
      
      // Start cooldown timer
      const interval = setInterval(() => {
        setCooldown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      toast({
        title: "Verification code sent!",
        description: `Check your email at ${email}`,
      });
    } catch (error: any) {
      console.error('Error sending verification email:', error);
      toast({
        title: "Failed to send verification email",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const verifyCode = async () => {
    if (code.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter the 6-digit code from your email",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-email-code', {
        body: {
          user_id: userId,
          code: code,
        },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Email verified!",
          description: "Thank you for verifying your email",
        });
        onVerified();
      } else {
        toast({
          title: "Verification failed",
          description: data.error || "Invalid code",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error verifying code:', error);
      toast({
        title: "Verification failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Verify Your Email</CardTitle>
              <CardDescription className="text-sm">
                Get booking updates and sitter responses
              </CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onSkip} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!emailSent ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Verify <strong>{email}</strong> to receive important booking notifications.
            </p>
            <Button onClick={sendVerificationEmail} disabled={isSending} className="w-full">
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Verification Code
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="code" className="text-sm">Enter 6-digit code</Label>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="text-center text-xl tracking-widest font-mono"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={verifyCode}
                disabled={isVerifying || code.length !== 6}
                className="flex-1"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Verify
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={sendVerificationEmail}
                disabled={isSending || cooldown > 0}
                title={cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
              >
                {cooldown > 0 ? (
                  <span className="text-xs">{cooldown}</span>
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}