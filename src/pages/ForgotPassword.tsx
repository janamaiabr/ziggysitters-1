import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setSent(true);
        toast({
          title: "Reset email sent",
          description: "Check your email for a password reset link.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-center">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="text-sm text-muted-foreground text-center">
              Didn't receive the email? Check your spam folder or try again with a different email address.
            </p>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSent(false);
                  setEmail('');
                }}
                className="w-full"
              >
                Try with different email
              </Button>
              <Button asChild variant="ghost" className="w-full">
                <Link to="/auth">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to login
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Reset your password</CardTitle>
          <p className="text-muted-foreground">
            Enter your email address and we'll send you a reset link
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send reset link"}
            </Button>
            
            <Button asChild variant="ghost" className="w-full">
              <Link to="/auth">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to login
              </Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}