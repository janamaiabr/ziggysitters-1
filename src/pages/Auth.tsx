import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, PawPrint, Sparkles, Heart, Shield } from 'lucide-react';
import TermsAcceptance from '@/components/TermsAcceptance';
import { supabase } from '@/integrations/supabase/client';
import { metaPixel } from '@/lib/metaPixel';
import { useBehaviorTracking, linkSessionEventsToUser, getSessionId } from '@/hooks/useBehaviorTracking';
import petServicesImg from '@/assets/pet-services.jpg';

export default function Auth() {
  const { trackAction, trackFormInteraction, trackDropoff } = useBehaviorTracking();
  const formStartTime = useRef<number | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [pendingAuthAction, setPendingAuthAction] = useState<(() => Promise<void>) | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });

  const defaultTab = searchParams.get('tab') || 'signin';
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [noAccountMessage, setNoAccountMessage] = useState(false);
  // Always redirect new signups to onboarding to collect profile info
  const redirectUrl = searchParams.get('redirect') || '/onboarding';

  // Track page view and form interactions
  useEffect(() => {
    trackAction('auth_page_viewed', { 
      default_tab: defaultTab,
      has_redirect: !!searchParams.get('redirect'),
    });
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    trackFormInteraction('signin_form', 'submitted');
    
    // Validate inputs are not empty or spaces-only
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
      // Trim values before sending to API
      const { error } = await signIn(formData.email.trim(), formData.password.trim());
      
      if (error) {
        trackAction('signin_failed', { error: error.message });
        
        // Handle invalid credentials - stay on signin tab, don't auto-switch
        if (error.message.includes('Invalid login credentials')) {
          // Could be: 1) Wrong password, 2) No account exists, 3) Unconfirmed email
          // Show clear message but DON'T auto-switch to signup - it's confusing
          toast({
            title: "Invalid Email or Password",
            description: "Please check your credentials and try again. If you forgot your password, use the link below.",
            variant: "destructive",
          });
        } else if (error.message.includes('Email not confirmed')) {
          toast({
            title: "Email Not Confirmed",
            description: "Please check your email for the confirmation link, or we can resend it.",
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
                    toast({
                      title: "Confirmation Email Sent! 📧",
                      description: "Check your inbox and spam folder.",
                    });
                  }
                }}
                className="ml-2"
              >
                Resend
              </Button>
            ),
          });
        } else {
          toast({
            title: "Sign In Failed",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        trackAction('signin_completed');
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
        navigate(redirectUrl);
      }
    } catch (error) {
      trackAction('signin_error', { error: 'unexpected' });
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!formData.email.trim()) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email.trim(),
      });
      
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Confirmation Email Sent! 📧",
          description: "Please check your inbox and spam folder for the confirmation link.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend confirmation email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const executeSignUp = async () => {
    setIsLoading(true);
    const signupStartTime = Date.now();

    try {
      // Trim all values before sending to API
      const { error } = await signUp(
        formData.email.trim(), 
        formData.password.trim(),
        formData.firstName.trim(),
        formData.lastName.trim()
      );
      
      if (error) {
        trackAction('signup_failed', { 
          error: error.message, 
          time_spent_seconds: Math.round((Date.now() - signupStartTime) / 1000) 
        });
        
        if (error.message.includes('already registered')) {
          // Check if this might be an unconfirmed account
          // Offer to resend confirmation email
          toast({
            title: "Account Already Exists",
            description: "If you haven't confirmed your email yet, we can resend the confirmation link.",
            action: (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleResendConfirmation}
                className="ml-2"
              >
                Resend Email
              </Button>
            ),
          });
          // Also switch to sign-in tab in case they forgot they have an account
          setActiveTab('signin');
        } else {
          toast({
            title: "Sign Up Failed",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        // Track successful signup
        trackAction('signup_completed', {
          time_to_signup_seconds: formStartTime.current 
            ? Math.round((Date.now() - formStartTime.current) / 1000) 
            : null,
        });
        // Get the newly created user session
        const { data: { session } } = await supabase.auth.getSession();
        
        // Save terms acceptance to database using edge function for proper permissions
        if (session?.user?.id) {
          try {
            // Wait for the profile to be created by the trigger
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Use edge function to save terms acceptance with elevated privileges
            const { error: termsError } = await supabase.functions.invoke('save-terms-acceptance', {
              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },
            });
            
            if (termsError) {
              console.error('Error saving terms acceptance:', termsError);
            } else {
              console.log('✅ Terms acceptance saved to database during signup');
            }
            
            // Link anonymous searches to the new user profile
            const sessionId = sessionStorage.getItem('search_session_id');
            if (sessionId) {
              // Get the profile ID for this user
              const { data: profile } = await supabase
                .from('profiles')
                .select('id')
                .eq('user_id', session.user.id)
                .single();
              
              if (profile?.id) {
                // Update any anonymous searches from this session to link to the user
                const { error: linkError } = await supabase
                  .from('search_events')
                  .update({ user_id: profile.id })
                  .eq('session_id', sessionId)
                  .is('user_id', null);
                
                if (linkError) {
                  console.error('Error linking anonymous searches:', linkError);
                } else {
                  console.log('✅ Linked anonymous searches to user profile');
                }
                
                // Also link ALL behavior tracking events from this session
                await linkSessionEventsToUser(profile.id);
                console.log('✅ Linked behavior tracking events to user profile');
              }
            }
          } catch (error) {
            console.error('Error saving terms acceptance:', error);
            // Don't fail signup if this fails
          }
        }
        
        // Send admin notification about new signup immediately
        // This ensures admins know about ALL signups, even if users abandon onboarding
        try {
          const behaviorSessionId = sessionStorage.getItem('ziggy_session_id');
          const searchSessionId = sessionStorage.getItem('search_session_id');
          const sessionId = behaviorSessionId || searchSessionId;
          
          await supabase.functions.invoke('send-new-user-admin-notification', {
            body: {
              email: formData.email.trim(),
              firstName: formData.firstName.trim(),
              lastName: formData.lastName.trim(),
              sessionId: sessionId,
            }
          });
          console.log('Admin notification sent for new signup');
        } catch (notifyError) {
          console.error('Failed to send admin signup notification:', notifyError);
          // Don't block signup if notification fails
        }
        
        // Track registration completion
        metaPixel.trackCompleteRegistration();
        
        toast({
          title: "Account Created!",
          description: "Welcome to ZiggySitters! Check your email for next steps.",
        });
        navigate(redirectUrl);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Track form start if not already started
    if (!formStartTime.current) {
      formStartTime.current = Date.now();
    }
    
    trackFormInteraction('signup_form', 'submitted');
    
    // Validate inputs are not empty or spaces-only
    if (!formData.email.trim() || !formData.password.trim() || !formData.firstName.trim() || !formData.lastName.trim()) {
      trackAction('signup_validation_failed', { 
        reason: 'empty_fields',
        fields_filled: {
          email: !!formData.email.trim(),
          password: !!formData.password.trim(),
          firstName: !!formData.firstName.trim(),
          lastName: !!formData.lastName.trim(),
        }
      });
      toast({
        title: "Invalid Input",
        description: "Please fill in all fields with valid information.",
        variant: "destructive",
      });
      return;
    }
    
    trackAction('signup_terms_shown');
    // Show terms acceptance dialog
    setPendingAuthAction(() => executeSignUp);
    setShowTerms(true);
  };

  const handleTermsAccept = async () => {
    trackAction('terms_accepted');
    setShowTerms(false);
    if (pendingAuthAction) {
      // Set a flag in localStorage (persists across refreshes) that terms were just accepted
      localStorage.setItem('terms_accepted_during_signup', 'true');
      await pendingAuthAction();
      setPendingAuthAction(null);
    }
  };

  const handleTermsDecline = () => {
    trackAction('terms_declined');
    trackDropoff('signup', 'terms_declined');
    setShowTerms(false);
    setPendingAuthAction(null);
    toast({
      title: "Terms Required",
      description: "You must accept the Terms of Service to create an account.",
      variant: "destructive",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Track first interaction with form
    if (!formStartTime.current) {
      formStartTime.current = Date.now();
      trackFormInteraction('signup_form', 'started');
    }
    
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [e.target.name]: value
    }));
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-950/20 dark:via-blue-950/20 dark:to-indigo-950/20 overflow-hidden">
      {/* Subtle background decoration - no animations for better performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-20 left-1/4 text-5xl">💜</div>
        <div className="absolute top-32 right-1/4 text-4xl">🐾</div>
        <div className="absolute top-40 left-1/3 text-3xl">✨</div>
        <div className="absolute bottom-32 right-1/3 text-4xl">🎉</div>
        <div className="absolute bottom-20 left-1/4 text-5xl">💙</div>
      </div>

      {/* Subtle background blobs - no animations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-20 w-80 h-80 bg-purple-300 dark:bg-purple-700 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-300 dark:bg-blue-700 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-300 dark:bg-indigo-700 rounded-full blur-3xl opacity-15"></div>
      </div>

      <div className="w-full max-w-xl relative z-10 space-y-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
        {/* Cute header section */}
        <div className="text-center space-y-6 relative">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-full blur-3xl opacity-40 animate-pulse"></div>
            <div className="relative inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900 rounded-full shadow-2xl animate-bounce" style={{ animationDuration: '1.5s' }}>
              <Heart className="h-10 w-10 md:h-12 md:w-12 text-pink-500 dark:text-pink-400" fill="currentColor" />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 bg-clip-text text-transparent animate-in slide-in-from-top-4 duration-500">
              Welcome to ZiggySitters! 🎉
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-md mx-auto animate-in fade-in duration-700" style={{ animationDelay: '200ms' }}>
              Join our pawsome community today! 🐾
            </p>
          </div>

          {/* Feature badges with emojis */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 animate-in fade-in duration-700" style={{ animationDelay: '300ms' }}>
            {[
              { emoji: "🛡️", text: "Verified Sitters", gradient: "from-blue-500 to-indigo-600" },
              { emoji: "💜", text: "Happy Pets", gradient: "from-purple-500 to-purple-600" },
              { emoji: "✨", text: "Daily Updates", gradient: "from-indigo-500 to-blue-600" }
            ].map((item, idx) => (
              <div 
                key={idx} 
                className={`flex items-center gap-2 bg-gradient-to-r ${item.gradient} text-white rounded-full px-4 py-2 shadow-lg font-bold text-sm hover:scale-110 transition-transform cursor-default`}
              >
                <span className="text-lg">{item.emoji}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <Card className="border-2 border-purple-200 dark:border-purple-800 shadow-2xl overflow-hidden relative transform transition-all hover:scale-[1.01] animate-scale-in">
          {/* Super Decorative Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-950/20 dark:via-blue-950/20 dark:to-indigo-950/20 opacity-60"></div>
          <div className="absolute top-0 right-0 w-40 h-40 bg-purple-300 dark:bg-purple-700 rounded-full blur-3xl opacity-25 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-300 dark:bg-blue-700 rounded-full blur-3xl opacity-25 animate-pulse" style={{ animationDelay: '1s' }}></div>

          <CardHeader className="space-y-4 pb-6 relative">
            <CardTitle className="flex items-center justify-center gap-3 text-3xl">
              <span className="text-4xl animate-bounce">🐾</span>
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Get Started
              </span>
              <span className="text-4xl animate-bounce" style={{ animationDelay: '0.3s' }}>🐾</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 relative">
            <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setNoAccountMessage(false); }} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/40 dark:to-blue-900/40 p-1.5 h-auto">
                <TabsTrigger 
                  value="signin" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white py-3 text-base font-bold transition-all hover:scale-105"
                >
                  Sign In ✨
                </TabsTrigger>
                <TabsTrigger 
                  value="signup" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white py-3 text-base font-bold transition-all hover:scale-105"
                >
                  Sign Up 🎉
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-6 animate-in fade-in slide-in-from-left duration-500">
                <form onSubmit={handleSignIn} className="space-y-5">
                  <div className="space-y-3">
                    <Label htmlFor="signin-email" className="text-lg font-bold flex items-center gap-2">
                      <span className="text-2xl">📧</span>
                      Email
                    </Label>
                    <Input
                      id="signin-email"
                      name="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="h-14 text-lg border-2 border-purple-300 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-500 bg-white/90 dark:bg-gray-900/90 backdrop-blur transition-all hover:shadow-lg"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="signin-password" className="text-lg font-bold flex items-center gap-2">
                      <span className="text-2xl">🔐</span>
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="h-14 text-lg border-2 border-purple-300 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-500 bg-white/90 dark:bg-gray-900/90 backdrop-blur transition-all hover:shadow-lg"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </Button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-16 text-xl gap-3 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 hover:from-purple-600 hover:via-indigo-600 hover:to-blue-600 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-3 border-white border-t-transparent"></div>
                        Signing In...
                      </>
                    ) : (
                      <>
                        Sign In <Sparkles className="h-6 w-6 animate-pulse" />
                      </>
                    )}
                  </Button>
                  
                  <div className="text-center">
                    <Link 
                      to="/forgot-password" 
                      className="text-base text-purple-600 dark:text-purple-400 hover:underline font-semibold"
                    >
                      Forgot your password? 🤔
                    </Link>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
                {noAccountMessage && (
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center animate-in fade-in duration-300">
                    <p className="text-green-800 dark:text-green-200 font-medium">
                      ✨ No worries! We've kept your email - just add your name and password to get started!
                    </p>
                  </div>
                )}
                <form onSubmit={handleSignUp} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label htmlFor="signup-firstName" className="text-base font-bold flex items-center gap-1">
                        <span className="text-xl">👤</span>
                        First Name
                      </Label>
                      <Input
                        id="signup-firstName"
                        name="firstName"
                        type="text"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="h-12 border-2 border-purple-300 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-500 bg-white/90 dark:bg-gray-900/90 backdrop-blur transition-all hover:shadow-lg"
                        required
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="signup-lastName" className="text-base font-bold flex items-center gap-1">
                        <span className="text-xl">👤</span>
                        Last Name
                      </Label>
                      <Input
                        id="signup-lastName"
                        name="lastName"
                        type="text"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="h-12 border-2 border-purple-300 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-500 bg-white/90 dark:bg-gray-900/90 backdrop-blur transition-all hover:shadow-lg"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="signup-email" className="text-lg font-bold flex items-center gap-2">
                      <span className="text-2xl">📧</span>
                      Email
                    </Label>
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="h-14 text-lg border-2 border-purple-300 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-500 bg-white/90 dark:bg-gray-900/90 backdrop-blur transition-all hover:shadow-lg"
                        required
                      />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="signup-password" className="text-lg font-bold flex items-center gap-2">
                      <span className="text-2xl">🔐</span>
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password (min 6 characters)"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="h-14 text-lg border-2 border-purple-300 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-500 bg-white/90 dark:bg-gray-900/90 backdrop-blur transition-all hover:shadow-lg"
                        required
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </Button>
                    </div>
                    {formData.password && formData.password.length > 0 && formData.password.length < 6 && (
                      <p className="text-sm text-red-500 font-semibold flex items-center gap-1">
                        ⚠️ Password must be at least 6 characters
                      </p>
                    )}
                  </div>

                  <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/40 dark:to-blue-900/40 border-2 border-purple-300 dark:border-purple-700 rounded-2xl p-4">
                    <p className="text-sm font-medium text-purple-900 dark:text-purple-100 flex items-start gap-2">
                      <Sparkles className="h-5 w-5 flex-shrink-0 mt-0.5 text-purple-500 animate-pulse" />
                      <span>
                        Join thousands of happy pet parents finding trusted sitters! 🎉
                      </span>
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-16 text-xl gap-3 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 hover:from-purple-600 hover:via-indigo-600 hover:to-blue-600 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105" 
                    disabled={isLoading || (formData.password && formData.password.length < 6)}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-3 border-white border-t-transparent"></div>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Account <Sparkles className="h-6 w-6 animate-pulse" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 pt-4 border-t border-purple-200 dark:border-purple-800 text-center text-sm">
              <p className="text-muted-foreground">
                By continuing, you agree to our{' '}
                <Link to="/terms-of-service" className="text-purple-600 dark:text-purple-400 hover:underline font-semibold">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link to="/privacy-policy" className="text-purple-600 dark:text-purple-400 hover:underline font-semibold">
                  Privacy Policy
                </Link>
                . 💜
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <TermsAcceptance
        isOpen={showTerms}
        onAccept={handleTermsAccept}
        onDecline={handleTermsDecline}
      />
    </div>
  );
}