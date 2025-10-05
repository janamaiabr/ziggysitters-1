import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEOHead from '@/components/seo/SEOHead';
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
import { metaPixel } from '@/lib/metaPixel';

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
    title: 'Platform Security',
    description: 'Safe and secure platform with verified user profiles'
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
    description: 'Complete profile verification and identity confirmation'
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
      
      // Track lead submission
      metaPixel.trackLead({ content_category: 'Become Sitter' });
      
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
    <>
      <SEOHead 
        title="Become a Pet Sitter - Earn Money Caring for Pets | ZiggySitters"
        description="Join ZiggySitters as a verified pet sitter. Earn money providing pet care with daily reporting requirements. Apply now to start your pet sitting career in Auckland."
        keywords="become pet sitter, pet sitting jobs Auckland, earn money pet care, verified pet sitter application"
        canonical="/become-sitter"
      />
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
            <div className="flex justify-center">
              <Button 
                size="lg" 
                variant="solid-white"
                className="px-12"
                onClick={() => navigate('/auth')}
              >
                Join Now
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

      {/* Daily Reports Accountability Section */}
      <div className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">Our Commitment to Quality</Badge>
              <h2 className="text-3xl font-bold mb-4">Daily Reports: Your Promise of Excellence</h2>
              <p className="text-lg text-muted-foreground">
                We ensure pet owners get the peace of mind they deserve—and you get the credit for your great work
              </p>
            </div>
            
            <Card className="border-2 border-primary/20">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">You're Already Doing Amazing Work</h3>
                      <p className="text-muted-foreground">
                        As a caring sitter, you naturally want to keep pet owners updated. Our daily report system simply makes it official—and helps you stand out from the crowd.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Heart className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Why Pet Owners Choose ZiggySitters</h3>
                      <p className="text-muted-foreground">
                        Pet owners love our platform because they're <strong>guaranteed</strong> daily photo updates. This means more bookings for you and happier clients who leave 5-star reviews.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">The 15% Accountability Standard</h3>
                      <p className="text-muted-foreground mb-3">
                        To maintain our platform's promise of daily updates, we have a simple policy: complete all daily reports and earn <strong>100% payment</strong>. Miss a report, and there's a 15% deduction.
                      </p>
                      <p className="text-muted-foreground">
                        This isn't a punishment—it's what sets us apart from other platforms and keeps pet owners coming back. When you consistently send reports, you build trust, get better reviews, and earn more repeat bookings.
                      </p>
                    </div>
                  </div>

                  <div className="bg-primary/5 rounded-lg p-6 mt-6">
                    <p className="text-center font-semibold text-lg mb-2">
                      ✨ The Reality: Most Sitters Send Reports Anyway
                    </p>
                    <p className="text-center text-muted-foreground">
                      98% of our sitters complete their daily reports without issue because they're already caring, communicative professionals. The policy simply ensures pet owners always get the peace of mind they're paying for.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
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

      {/* Call to Action - Simplified */}
      <div className="py-20 bg-accent/5">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Ready to Start Earning?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join our community of trusted pet sitters and start caring for pets in your area.
            </p>
            <Button 
              size="lg" 
              className="px-12"
              onClick={() => navigate('/auth')}
            >
              Join Now
            </Button>
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
    </>
  );
}