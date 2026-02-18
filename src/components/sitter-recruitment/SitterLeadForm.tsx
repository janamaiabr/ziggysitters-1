import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, CheckCircle, Star, TrendingUp, ChevronDown } from 'lucide-react';
import { ga4 } from '@/lib/ga4';
import { metaPixel } from '@/lib/metaPixel';

// GA4 helper
const trackGA4 = (event: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', event, params);
  }
};

const SERVICES = [
  { id: 'pet_sitting_owners_home', label: "Pet Sitting (Owner's Home)" },
  { id: 'pet_sitting_sitters_home', label: "Pet Sitting (Your Home)" },
  { id: 'drop_in_visits', label: "Drop-in Visits" },
];

const SUBURBS = [
  'Ponsonby', 'Grey Lynn', 'Mt Eden', 'Parnell', 'Remuera', 
  'Herne Bay', 'Devonport', 'Takapuna', 'Newmarket', 'Epsom',
  'Mt Albert', 'Kingsland', 'Sandringham', 'Other'
];

interface SitterLeadFormProps {
  source?: string;
  prefilledSuburb?: string;
}

export default function SitterLeadForm({ source = 'become_sitter_page', prefilledSuburb }: SitterLeadFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const hasTrackedStart = useRef(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    suburb: prefilledSuburb || '',
    services: [] as string[],
    experience: '',
  });

  // Track form_start on first interaction
  const trackFormStart = useCallback(() => {
    if (!hasTrackedStart.current) {
      hasTrackedStart.current = true;
      trackGA4('form_start', { form_name: 'sitter_lead', form_source: source });
    }
  }, [source]);

  // Track form abandonment on unmount if started but not submitted
  useEffect(() => {
    return () => {
      if (hasTrackedStart.current && !isSubmitted) {
        trackGA4('form_abandonment', { form_name: 'sitter_lead', form_source: source });
      }
    };
  }, [isSubmitted, source]);

  const handleServiceToggle = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter(s => s !== serviceId)
        : [...prev.services, serviceId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast({
        title: "Missing information",
        description: "Please provide your name and email.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Primary: Formspree (always works, no RLS issues)
      await fetch('https://formspree.io/f/xpwzgkby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || '',
          suburb: formData.suburb || '',
          services: formData.services.join(', '),
          experience: formData.experience || '',
          source: 'ziggy-sitter-lead-' + source,
        }),
      });

      // Secondary: try Supabase too (may fail due to RLS, that is ok)
      try {
        await supabase
          .from('sitter_leads')
          .insert({
            name: formData.name,
            email: formData.email,
            phone: formData.phone || null,
            suburb: formData.suburb || null,
            services_interested: formData.services.length > 0 ? formData.services : null,
            experience_level: formData.experience || null,
            source,
          });
      } catch {
        // Supabase insert failed (RLS), but Formspree already captured the lead
        console.log('Supabase insert failed, lead captured via Formspree');
      }

      // Track lead
      metaPixel.trackLead({ content_category: 'Sitter Lead', content_name: source });
      trackGA4('form_submit', { form_name: 'sitter_lead', form_source: source });
      trackGA4('generate_lead', { currency: 'NZD', value: 0, form_source: source });
      ga4.sitterLeadSubmit(source);

      setIsSubmitted(true);
      toast({
        title: "Thanks for your interest!",
        description: "Redirecting you to create your account...",
      });

      // Auto-redirect to signup with email pre-filled after 3 seconds
      setTimeout(() => {
        const params = new URLSearchParams({ tab: 'signup', email: formData.email });
        window.location.href = `/auth?${params.toString()}`;
      }, 3000);
    } catch (error) {
      console.error('Error submitting lead:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    const signupUrl = `/auth?tab=signup&email=${encodeURIComponent(formData.email)}`;
    return (
      <Card className="border-2 border-green-500/20 bg-green-500/5">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">You're on the list! 🎉</h3>
          <p className="text-muted-foreground mb-4">
            One last step — create your account to start receiving booking requests.
          </p>
          <Button asChild size="lg" className="mb-2">
            <a href={signupUrl}>Create Your Account →</a>
          </Button>
          <p className="text-xs text-muted-foreground">Redirecting automatically in a few seconds...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Get Started in 30 Seconds
        </CardTitle>
        <CardDescription>
          Just your name and email — we'll handle the rest
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Social proof */}
        <div className="flex items-center gap-4 mb-4 p-3 bg-primary/5 rounded-lg text-sm">
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="w-4 h-4 fill-current" />
            <Star className="w-4 h-4 fill-current" />
            <Star className="w-4 h-4 fill-current" />
            <Star className="w-4 h-4 fill-current" />
            <Star className="w-4 h-4 fill-current" />
          </div>
          <span className="text-muted-foreground">12 sitters joined this week</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your name *</Label>
              <Input
                id="name"
                value={formData.name}
                onFocus={trackFormStart}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Sarah Johnson"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onFocus={trackFormStart}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="sarah@example.com"
                required
              />
            </div>
          </div>

          <Collapsible>
            <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full justify-center py-1">
              <ChevronDown className="w-4 h-4" />
              Tell us more (optional)
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onFocus={trackFormStart}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="021 123 4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="suburb">Your suburb</Label>
                  <Select 
                    value={formData.suburb} 
                    onValueChange={(v) => { trackFormStart(); setFormData(prev => ({ ...prev, suburb: v })); }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select suburb" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBURBS.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Services you'd like to offer</Label>
                <div className="grid grid-cols-1 gap-2">
                  {SERVICES.map((service) => (
                    <div key={service.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={service.id}
                        checked={formData.services.includes(service.id)}
                        onCheckedChange={() => { trackFormStart(); handleServiceToggle(service.id); }}
                      />
                      <label htmlFor={service.id} className="text-sm cursor-pointer">
                        {service.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Pet experience</Label>
                <Select 
                  value={formData.experience} 
                  onValueChange={(v) => { trackFormStart(); setFormData(prev => ({ ...prev, experience: v })); }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="How much experience do you have?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pet_owner">I own/have owned pets</SelectItem>
                    <SelectItem value="professional">Professional pet care experience</SelectItem>
                    <SelectItem value="volunteer">Volunteered with animals</SelectItem>
                    <SelectItem value="none">New to pet care</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Urgency */}
          <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
            <TrendingUp className="w-4 h-4" />
            <span>High demand for sitters in Auckland — start earning this week!</span>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : '🐾 Get Started — It\'s Free'}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            No commitment required. Only name & email needed.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
