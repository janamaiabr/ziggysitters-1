import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Clock, CheckCircle2 } from 'lucide-react';
import iconPaw from '@/assets/icons/icon-paw.png';
import { supabase } from '@/integrations/supabase/client';
import { metaPixel } from '@/lib/metaPixel';
import { ga4 } from '@/lib/ga4';
import { useBehaviorTracking, linkSessionEventsToUser, getSessionId } from '@/hooks/useBehaviorTracking';

export default function Auth() {
  const { trackAction, trackFormInteraction, trackDropoff } = useBehaviorTracking();
  const formStartTime = useRef<number | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const defaultTab = searchParams.get('tab') || 'signin';
  const [activeTab, setActiveTab] = useState(defaultTab);
  const redirectUrl = searchParams.get('redirect') || '/onboarding';
  const intendedRole = searchParams.get('role') || '';

  useEffect(() => {
    trackAction('auth_page_viewed', {
      default_tab: defaultTab,
      has_redirect: !!searchParams.get('redirect'),
    });
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    trackFormInteraction('signin_form', 'submitted');

    if (!formData.email.trim() || !formData.password.trim()) {
      trackAction('signin_validation_failed', { reason: 'empty_fields' });
      toast({
        title: "Invalid Input",
        description: "Please enter valid email and password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signIn(formData.email.trim(), formData.password.trim());
      if (error) {
        trackAction('signin_failed', { error: error.message });
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: "Invalid Email or Password",
            description: "Please check your credentials and try again.",
            variant: "destructive",
          });
        } else if (error.message.includes('Email not confirmed')) {
          toast({
            title: "Email Not Confirmed",
            description: "Check your email for the confirmation link.",
            action: (
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const { error } = await supabase.auth.resend({
                    type: 'signup',
                    email: formData.email.trim(),
                  });
                  if (!error) {
                    toast({ title: "Confirmation Email Sent!", description: "Check your inbox and spam folder." });
                  }
                }}
                className="ml-2"
              >
                Resend
              </Button>
            ),
          });
        } else {
          toast({ title: "Sign In Failed", description: error.message, variant: "destructive" });
        }
      } else {
        trackAction('signin_completed');
        toast({ title: "Welcome back!", description: "You have successfully signed in." });
        navigate(redirectUrl);
      }
    } catch (error) {
      trackAction('signin_error', { error: 'unexpected' });
      toast({ title: "Error", description: "An unexpected error occurred. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formStartTime.current) {
      formStartTime.current = Date.now();
    }

    trackFormInteraction('signup_form', 'submitted');

    if (!formData.email.trim() || !formData.password.trim()) {
      trackAction('signup_validation_failed', {
        reason: 'empty_fields',
        fields_filled: {
          email: !!formData.email.trim(),
          password: !!formData.password.trim(),
        }
      });
      toast({
        title: "Invalid Input",
        description: "Please enter your email and choose a password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const signupStartTime = Date.now();

    try {
      const { error } = await signUp(formData.email.trim(), formData.password.trim());

      if (error) {
        trackAction('signup_failed', {
          error: error.message,
          time_spent_seconds: Math.round((Date.now() - signupStartTime) / 1000)
        });

        if (error.message.includes('already registered')) {
          toast({
            title: "Account Already Exists",
            description: "Try signing in instead, or reset your password.",
          });
          setActiveTab('signin');
        } else {
          toast({ title: "Sign Up Failed", description: error.message, variant: "destructive" });
        }
      } else {
        trackAction('signup_completed', {
          time_to_signup_seconds: formStartTime.current
            ? Math.round((Date.now() - formStartTime.current) / 1000)
            : null,
        });
        ga4.completeSignup('email');

        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user?.id) {
          try {
            await new Promise(resolve => setTimeout(resolve, 1000));

            const { error: termsError } = await supabase.functions.invoke('save-terms-acceptance', {
              headers: { Authorization: `Bearer ${session.access_token}` },
            });
            if (termsError) console.error('Error saving terms acceptance:', termsError);

            const sessionId = sessionStorage.getItem('search_session_id');
            if (sessionId) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('id')
                .eq('user_id', session.user.id)
                .single();

              if (profile?.id) {
                await supabase
                  .from('search_events')
                  .update({ user_id: profile.id })
                  .eq('session_id', sessionId)
                  .is('user_id', null);

                await linkSessionEventsToUser(profile.id);
              }
            }
          } catch (err) {
            console.error('Post-signup linking error:', err);
          }
        }

        try {
          // Notify via Formspree (reliable, always works)
          fetch('https://formspree.io/f/xpwzgkby', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: formData.email.trim(),
              source: 'ziggy-signup',
              timestamp: new Date().toISOString(),
            }),
          }).catch(() => {});

          // Also try Supabase notification
          const behaviorSessionId = sessionStorage.getItem('ziggy_session_id');
          const searchSessionId = sessionStorage.getItem('search_session_id');
          await supabase.functions.invoke('send-new-user-admin-notification', {
            body: {
              email: formData.email.trim(),
              firstName: '',
              lastName: '',
              sessionId: behaviorSessionId || searchSessionId,
            }
          });
        } catch (notifyError) {
          console.error('Failed to send admin signup notification:', notifyError);
        }

        metaPixel.trackCompleteRegistration();

        toast({
          title: "Account Created",
          description: "Welcome to ZiggySitters! Let's set up your profile.",
        });
        // Pass intended role to onboarding if specified
        if (intendedRole) {
          localStorage.setItem('onboarding_data', JSON.stringify({ role: intendedRole, city: 'Auckland' }));
        }
        navigate(redirectUrl);
      }
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formStartTime.current) {
      formStartTime.current = Date.now();
      trackFormInteraction('signup_form', 'started');
    }
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md relative z-10 space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full shadow-sm">
            <img src={iconPaw} alt="" className="h-8 w-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            ZiggySitters
          </h1>
          <p className="text-muted-foreground">
            Trusted pet care in your neighbourhood
          </p>
        </div>

        <Card className="border border-border shadow-xl">
          <CardContent className="pt-6 space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              {/* SIGN IN */}
              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="h-12"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="h-12"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 text-base"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>
                  <div className="text-center">
                    <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                      Forgot your password?
                    </Link>
                  </div>
                </form>
              </TabsContent>

              {/* SIGN UP - simplified to email + password only */}
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  {/* Progress indicator */}
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</div>
                      <span className="font-medium text-primary">Create account</span>
                    </div>
                    <div className="w-8 h-px bg-border"></div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-7 h-7 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-bold">2</div>
                      <span>Set up profile</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="h-12"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min 6 characters"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="h-12"
                        required
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {formData.password && formData.password.length > 0 && formData.password.length < 6 && (
                      <p className="text-xs text-red-500">Password must be at least 6 characters</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base"
                    disabled={isLoading || (formData.password.length > 0 && formData.password.length < 6)}
                  >
                    {isLoading ? "Creating Account..." : "Create Free Account"}
                  </Button>

                  {/* Takes 30 seconds + trust signals */}
                  <div className="flex flex-col items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Takes 30 seconds</span>
                      <span className="mx-1">&middot;</span>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>100% free</span>
                    </div>
                  </div>
                </form>
              </TabsContent>
            </Tabs>

            <div className="pt-3 border-t text-center text-xs text-muted-foreground">
              By continuing, you agree to our{' '}
              <Link to="/terms-of-service" className="text-primary hover:underline">
                Terms
              </Link>
              {' '}and{' '}
              <Link to="/privacy-policy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              .
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
