import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, CheckCircle } from 'lucide-react';
import { metaPixel } from '@/lib/metaPixel';

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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    suburb: prefilledSuburb || '',
    services: [] as string[],
    experience: '',
  });

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
          toast({
            title: "Already registered",
            description: "This email is already on our list. We'll be in touch soon!",
          });
          setIsSubmitted(true);
          return;
        }
        throw error;
      }

      // Track lead
      metaPixel.trackLead({ content_category: 'Sitter Lead', content_name: source });

      setIsSubmitted(true);
      toast({
        title: "Thanks for your interest!",
        description: "We'll be in touch within 48 hours with next steps.",
      });
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
    return (
      <Card className="border-2 border-green-500/20 bg-green-500/5">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">You're on the list!</h3>
          <p className="text-muted-foreground">
            We'll email you within 48 hours with everything you need to start earning as a ZiggySitter.
          </p>
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
          Leave your details and we'll guide you through the simple signup process
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your name *</Label>
              <Input
                id="name"
                value={formData.name}
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
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="sarah@example.com"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="021 123 4567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="suburb">Your suburb</Label>
              <Select 
                value={formData.suburb} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, suburb: v }))}
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
                    onCheckedChange={() => handleServiceToggle(service.id)}
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
              onValueChange={(v) => setFormData(prev => ({ ...prev, experience: v }))}
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

          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Get Started'}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            No commitment required. We'll send you info about becoming a sitter.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
