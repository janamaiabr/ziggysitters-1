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
      // Try Supabase insert first
      const { error } = await supabase
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

      if (error) {
        if (error.code === '23505') {
          trackGA4('form_submit', { form_name: 'sitter_lead', form_source: source, duplicate: true });
          toast({
            title: "Already registered",
            description: "This email is already on our list. We'll be in touch soon!",
          });
          setIsSubmitted(true);
          return;
        }
        // RLS or other error — use send-contact-email as fallback (edge function with service role)
        console.warn('Direct insert failed, using email fallback:', error.message);
        await supabase.functions.invoke('send-contact-email', {
          body: {
            name: formData.name,
            email: formData.email,
            subject: 'NEW SITTER LEAD (form fallback)',
            message: [
              'Name: ' + formData.name,
              'Email: ' + formData.email,
              'Phone: ' + (formData.phone || 'not provided'),
              'Suburb: ' + (formData.suburb || 'not specified'),
              'Services: ' + (formData.services.length > 0 ? formData.services.join(', ') : 'not specified'),
              'Experience: ' + (formData.experience || 'not specified'),
              'Source: ' + source,
            ].join('\n'),
          },
        });
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="name">Your name *</Label>
              <Input
                id="name"
                value={formData.name}
                onFocus={trackFormStart}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Sarah Johnson"
                required
                className="h-12 text-base"
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
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="suburb">Your suburb *</Label>
              <Select 
                value={formData.suburb} 
                onValueChange={(v) => { trackFormStart(); setFormData(prev => ({ ...prev, suburb: v })); }}
              >
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Select your suburb" />
                </SelectTrigger>
                <SelectContent>
                  {SUBURBS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full h-14 text-lg font-semibold" size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : '🐾 Join Now — It\'s Free'}
          </Button>

          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-500" /> Free to join</span>
            <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-500" /> No commitment</span>
            <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-500" /> Set your rates</span>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
