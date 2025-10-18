import { useState, useEffect } from 'react';
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
import petServicesImg from '@/assets/pet-services.jpg';

export default function Auth() {
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
  const redirectUrl = searchParams.get('redirect') || '/welcome';

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate(redirectUrl);
    }
  }, [user, navigate, redirectUrl]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs are not empty or spaces-only
    if (!formData.email.trim() || !formData.password.trim()) {
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
        toast({
          title: "Sign In Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
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

  const executeSignUp = async () => {
    setIsLoading(true);

    try {
      // Trim all values before sending to API
      const { error } = await signUp(
        formData.email.trim(), 
        formData.password.trim(), 
        formData.firstName.trim(), 
        formData.lastName.trim()
      );
      
      if (error) {
        if (error.message.includes('already registered')) {
          toast({
            title: "Account Already Exists",
            description: "An account with this email already exists. Please sign in instead.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sign Up Failed",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        // Send welcome email
        try {
          await supabase.functions.invoke('send-welcome-email', {
            body: {
              email: formData.email,
              firstName: formData.firstName,
              role: 'pet_owner' // Default role, will be updated during onboarding
            }
          });
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
          // Don't block signup if email fails
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
    
    // Validate inputs are not empty or spaces-only
    if (!formData.firstName.trim() || !formData.lastName.trim() || 
        !formData.email.trim() || !formData.password.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please fill in all fields with valid information.",
        variant: "destructive",
      });
      return;
    }
    
    // Show terms acceptance dialog
    setPendingAuthAction(() => executeSignUp);
    setShowTerms(true);
  };

  const handleTermsAccept = async () => {
    setShowTerms(false);
    if (pendingAuthAction) {
      await pendingAuthAction();
      setPendingAuthAction(null);
    }
  };

  const handleTermsDecline = () => {
    setShowTerms(false);
    setPendingAuthAction(null);
    toast({
      title: "Terms Required",
      description: "You must accept the Terms of Service to create an account.",
      variant: "destructive",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [e.target.name]: value
    }));
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-gradient-to-br from-accent via-background to-secondary/10 overflow-hidden">
      {/* Playful background blobs - matching hero */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-secondary/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-xl relative z-10">
        <div className="text-center mb-6 md:mb-8 animate-fade-in">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm border border-primary/30 rounded-full px-4 py-2 md:px-5 md:py-2.5 shadow-lg mb-4 md:mb-6">
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            <span className="text-xs md:text-sm font-bold text-primary">Trusted by 10,000+ Pet Parents</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3 md:mb-4 leading-tight px-4">
            <span className="block">Join Our</span>
            <span className="block relative inline-block my-1">
              <span className="relative z-10">Pet-Loving</span>
              <span className="absolute bottom-0 md:bottom-1 left-0 w-full h-2 md:h-3 lg:h-4 bg-primary/20 -rotate-1"></span>
            </span>
            <span className="block">Community</span>
          </h1>
          
          <p className="text-muted-foreground text-sm md:text-base lg:text-lg mb-4 md:mb-6 px-4">
            Connect with verified pet sitters who treat your furry friends like family
          </p>

          {/* Feature badges */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-4 md:mb-6 px-4">
            {[
              { icon: Shield, text: "Verified Sitters", color: "bg-blue-50 text-blue-600 border-blue-200" },
              { icon: Heart, text: "Happy Pets", color: "bg-pink-50 text-pink-600 border-pink-200" },
              { icon: Sparkles, text: "Daily Updates", color: "bg-yellow-50 text-yellow-600 border-yellow-200" }
            ].map((item, idx) => (
              <div 
                key={idx} 
                className={`flex items-center gap-1.5 md:gap-2 ${item.color} rounded-full px-2.5 py-1.5 md:px-4 md:py-2 shadow-sm border-2 font-semibold text-xs md:text-sm hover:scale-105 transition-transform`}
              >
                <item.icon className="w-3 h-3 md:w-4 md:h-4" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <Card className="shadow-[var(--shadow-hover)] border-border/50 backdrop-blur-sm animate-scale-in">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl text-center font-bold">Get Started</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1">
                <TabsTrigger value="signin" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
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
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]" disabled={isLoading}>
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>
                  
                  <div className="text-center">
                    <Link 
                      to="/forgot-password" 
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-firstName">First Name</Label>
                      <Input
                        id="signup-firstName"
                        name="firstName"
                        type="text"
                        placeholder="First name"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        pattern=".*\S+.*"
                        title="First name cannot be empty or contain only spaces"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-lastName">Last Name</Label>
                      <Input
                        id="signup-lastName"
                        name="lastName"
                        type="text"
                        placeholder="Last name"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        pattern=".*\S+.*"
                        title="Last name cannot be empty or contain only spaces"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
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
                        placeholder="Create a password (min 6 characters)"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {formData.password && formData.password.length > 0 && formData.password.length < 6 && (
                      <p className="text-sm text-destructive">Password must be at least 6 characters</p>
                    )}
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]" 
                    disabled={isLoading || (formData.password && formData.password.length < 6)}
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 pt-4 border-t border-border/50 text-center text-sm text-muted-foreground">
              <p>By continuing, you agree to our <Link to="/terms-of-service" className="text-primary hover:underline">Terms of Service</Link> and <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>.</p>
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