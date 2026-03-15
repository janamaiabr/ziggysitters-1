import { useState } from 'react';
import { Button } from '@/components/ui/button';
import SEOHead from '@/components/seo/SEOHead';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import iconEmail from '@/assets/icons/icon-email.png';
import iconQuestion from '@/assets/icons/icon-question.png';
import iconShield from '@/assets/icons/icon-shield.png';
import iconMappin from '@/assets/icons/icon-mappin.png';
import iconClock from '@/assets/icons/icon-clock.png';
import { useNavigate } from 'react-router-dom';
import { metaPixel } from '@/lib/metaPixel';

import iconEmail from '@/assets/icons/icon-email.png';
import iconQuestion from '@/assets/icons/icon-question.png';
import iconShield from '@/assets/icons/icon-shield.png';

export default function Contact() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message
        }
      });

      if (error) throw error;

      metaPixel.trackContact();

      toast({
        title: "Message Sent!",
        description: "We'll get back to you within 24 hours.",
      });
      
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again or email us directly.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <>
      <SEOHead 
        title="Contact ZiggySitters - Pet Care Support & Questions"
        description="Contact ZiggySitters for pet care questions, technical support, or partnership inquiries. Get help with bookings, daily reports, and pet sitting services."
        keywords="contact pet sitters, customer support, pet care questions, ZiggySitters help"
        canonical="/contact"
      />
      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative min-h-[50vh] flex items-center overflow-hidden">
          <div className="absolute inset-0">
            <img src="https://images.unsplash.com/photo-1560807707-8cc77767d783?w=1600&h=800&fit=crop" alt="Contact us" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
          </div>
          <div className="container mx-auto px-4 py-20 relative z-10">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-widest mb-4 font-body" style={{ color: 'hsl(152 45% 55%)' }}>Get in Touch</p>
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-[1.1] font-display mb-6">Contact Us</h1>
              <p className="text-lg text-white/80 font-body max-w-xl">
                Have questions or need help? We're here for you. Get in touch and we'll respond as quickly as possible.
              </p>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-20 md:py-28 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <Card className="border border-border bg-card shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 font-display text-foreground">
                    <img src={iconEmail} alt="" className="w-8 h-8" />
                    Send us a Message
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-2 font-body text-foreground">
                          Full Name *
                        </label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="Your full name"
                          className="font-body"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-2 font-body text-foreground">
                          Email Address *
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="your.email@example.com"
                          className="font-body"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium mb-2 font-body text-foreground">
                        Subject *
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        placeholder="What can we help you with?"
                        className="font-body"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium mb-2 font-body text-foreground">
                        Message *
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        placeholder="Tell us more about your question or concern..."
                        className="font-body"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-body" 
                      disabled={loading}
                    >
                      {loading ? 'Sending...' : 'Send Message'}
                      <span className="ml-2">→</span>
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <div className="space-y-6">
                <Card className="border border-border bg-card shadow-sm">
                  <CardHeader>
                    <CardTitle className="font-display text-foreground">Get in Touch</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <img src={iconEmail} alt="" className="h-5 w-5" style={{ filter: 'hue-rotate(0deg)' }} />
                      <div>
                        <p className="font-medium font-body text-foreground">Email</p>
                        <p className="text-muted-foreground font-body">hello@ziggysitters.com</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <img src={iconMappin} alt="" className="h-5 w-5" />
                      <div>
                        <p className="font-medium font-body text-foreground">Location</p>
                        <p className="text-muted-foreground font-body">Auckland, New Zealand</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium font-body text-foreground">Support Hours</p>
                        <p className="text-muted-foreground font-body">Mon-Fri: 8AM-8PM NZST</p>
                        <p className="text-muted-foreground font-body">Weekends: 9AM-5PM NZST</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-border bg-card shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 font-display text-foreground">
                      <img src={iconQuestion} alt="" className="w-6 h-6" />
                      Common Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { title: 'Booking Support', desc: 'Help with bookings, cancellations, and payments' },
                        { title: 'Sitter Verification', desc: 'Questions about becoming a verified pet sitter' },
                        { title: 'Safety & Security', desc: 'Platform safety, reporting issues, and account security' },
                        { title: 'Technical Issues', desc: 'App problems, login issues, and bug reports' },
                      ].map((item, i) => (
                        <div key={i}>
                          <h4 className="font-medium font-body text-foreground">{item.title}</h4>
                          <p className="text-sm text-muted-foreground font-body">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-secondary text-secondary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">Looking for a Pet Sitter Instead?</h2>
            <p className="text-lg text-secondary-foreground/60 mb-8 max-w-xl mx-auto font-body">
              Browse verified sitters in your area and book with confidence.
            </p>
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-body px-10 py-6 text-lg" onClick={() => navigate('/find-sitters')}>
              Find a Sitter <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
