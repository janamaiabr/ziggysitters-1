import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Heart, DollarSign, Calendar, Shield, Star, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import heroImage from '@/assets/hero-image.jpg';

const benefits = [
  {
    icon: DollarSign,
    title: 'Earn Extra Income',
    description: 'Set your own rates and earn money doing what you love'
  },
  {
    icon: Calendar,
    title: 'Flexible Schedule',
    description: 'Work when you want, control your availability'
  },
  {
    icon: Heart,
    title: 'Love for Animals',
    description: 'Spend time with adorable pets every day'
  },
  {
    icon: Shield,
    title: 'Insurance Coverage',
    description: 'Protected by comprehensive insurance policies'
  }
];

const steps = [
  {
    step: 1,
    title: 'Create Your Profile',
    description: 'Tell us about yourself, your experience, and upload photos'
  },
  {
    step: 2,
    title: 'Get Verified',
    description: 'Complete background check and identity verification'
  },
  {
    step: 3,
    title: 'Set Your Services',
    description: 'Choose what services to offer and set your rates'
  },
  {
    step: 4,
    title: 'Start Earning',
    description: 'Receive booking requests and start caring for pets'
  }
];

export default function BecomeSitter() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    experience: '',
    bio: '',
    services: [],
    hasYard: false,
    petExperience: ''
  });

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const handleSubmitApplication = async () => {
    // Validate required fields
    if (!formData.name || !formData.email || !formData.phone || !formData.bio || !formData.petExperience) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields to submit your application.",
        variant: "destructive",
      });
      return;
    }

    if (formData.services.length === 0) {
      toast({
        title: "Services Required",
        description: "Please select at least one service you'd like to offer.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call - replace with actual submission logic later
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Application Submitted!",
        description: "Thank you for your application. We'll review it and get back to you within 48 hours.",
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        location: '',
        experience: '',
        bio: '',
        services: [],
        hasYard: false,
        petExperience: ''
      });

      // Navigate to success page or home
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary to-secondary text-primary-foreground py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-30"
          style={{ backgroundImage: `url(${heroImage})` }}
        ></div>
        <div className="relative container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Turn Your Love for Pets Into Income
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of pet sitters earning money while caring for adorable pets in their community
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 px-8">
                Get Started Today
              </Button>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-accent/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Become a ZiggySitter?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join our community of trusted pet sitters and enjoy the benefits of flexible, rewarding work
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
                    <benefit.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground">
              Getting started is simple and straightforward
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="text-center relative">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary text-primary-foreground rounded-full mb-6 font-bold text-lg">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                  {index < steps.length - 1 && (
                    <ArrowRight className="hidden lg:block absolute top-6 -right-4 w-6 h-6 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Application Form */}
      <div className="py-20 bg-accent/5">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Start Your Application</CardTitle>
                <p className="text-muted-foreground">
                  Tell us about yourself to get started as a pet sitter
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <Input 
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input 
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone Number</label>
                    <Input 
                      placeholder="+64 21 123 456"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location</label>
                    <Input 
                      placeholder="Auckland, New Zealand"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Pet Experience</label>
                  <Select value={formData.petExperience} onValueChange={(value) => setFormData(prev => ({ ...prev, petExperience: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">New to pet sitting</SelectItem>
                      <SelectItem value="some">Some experience with pets</SelectItem>
                      <SelectItem value="experienced">Very experienced</SelectItem>
                      <SelectItem value="professional">Professional pet care background</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tell us about yourself</label>
                  <Textarea 
                    placeholder="Share your experience with pets, what makes you a great sitter, and why you want to join ZiggySitters..."
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                  />
                </div>
                
                <div className="space-y-4">
                  <label className="text-sm font-medium">Services you'd like to offer:</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Dog Walking', 'Pet Sitting', 'Overnight Care', 'Drop-in Visits', 'Pet Boarding', 'Grooming'].map((service) => (
                      <div key={service} className="flex items-center space-x-2">
                        <Checkbox 
                          id={service}
                          checked={formData.services.includes(service)}
                          onCheckedChange={() => handleServiceToggle(service)}
                        />
                        <label htmlFor={service} className="text-sm">{service}</label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="yard"
                    checked={formData.hasYard}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasYard: !!checked }))}
                  />
                  <label htmlFor="yard" className="text-sm">I have a secure, fenced yard</label>
                </div>
                
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleSubmitApplication}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </Button>
                
                <p className="text-xs text-muted-foreground text-center">
                  By submitting this application, you agree to our Terms of Service and Privacy Policy.
                  All sitters are subject to background checks and verification.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Success Stories */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Success Stories</h2>
            <p className="text-lg text-muted-foreground">
              Hear from our amazing pet sitters
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: 'Sarah M.',
                earnings: '$800/month',
                quote: 'I love spending time with dogs and earning extra income. ZiggySitters has been amazing!',
                rating: 5
              },
              {
                name: 'Mike T.',
                earnings: '$1,200/month',
                quote: 'The flexible schedule works perfectly with my day job. Great platform and support.',
                rating: 5
              },
              {
                name: 'Emma L.',
                earnings: '$950/month',
                quote: 'Being a ZiggySitter has been so rewarding. I get to help pet owners while doing what I love.',
                rating: 5
              }
            ].map((story, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-8">
                  <div className="flex justify-center mb-4">
                    {[...Array(story.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 italic">"{story.quote}"</p>
                  <div className="space-y-2">
                    <p className="font-semibold">{story.name}</p>
                    <Badge variant="secondary">{story.earnings}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}