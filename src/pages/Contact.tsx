import { useState } from 'react';
import { Button } from '@/components/ui/button';
import SEOHead from '@/components/seo/SEOHead';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Phone, Mail, Clock, MessageCircle, HelpCircle, Shield } from 'lucide-react';
import { metaPixel } from '@/lib/metaPixel';

export default function Contact() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [testEmailLoading, setTestEmailLoading] = useState(false);

  const sendTestEmails = async () => {
    setTestEmailLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("test-all-emails");

      if (error) throw error;

      toast({
        title: "Test emails sent!",
        description: "Check janamaia@gmail.com for all test emails",
      });

      console.log("Test email results:", data);
    } catch (error) {
      console.error("Error sending test emails:", error);
      toast({
        title: "Error",
        description: "Failed to send test emails",
        variant: "destructive",
      });
    } finally {
      setTestEmailLoading(false);
    }
  };

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

      // Track contact event
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
        description: "Failed to send message. Please try again or call us directly.",
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
      <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have questions or need help? We're here for you. Get in touch and we'll respond as quickly as possible.
          </p>
        </div>

        {/* Test Emails Button - Development Only */}
        <div className="mb-8 p-4 bg-muted rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Email Testing</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Send test emails of all email types to janamaia@gmail.com
          </p>
          <Button onClick={sendTestEmails} disabled={testEmailLoading}>
            {testEmailLoading ? "Sending..." : "Send All Test Emails"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Send us a Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2">
                        Full Name *
                      </label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">
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
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-2">
                      Subject *
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      placeholder="What can we help you with?"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
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
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Quick Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Get in Touch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-600">hello@ziggysitters.co.nz</p>
                  </div>
                </div>
                
                
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-gray-600">Auckland, New Zealand</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Support Hours</p>
                    <p className="text-gray-600">Mon-Fri: 8AM-8PM NZST</p>
                    <p className="text-gray-600">Weekends: 9AM-5PM NZST</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Common Topics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Common Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium">Booking Support</h4>
                    <p className="text-sm text-gray-600">Help with bookings, cancellations, and payments</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Sitter Verification</h4>
                    <p className="text-sm text-gray-600">Questions about becoming a verified pet sitter</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Safety & Security</h4>
                    <p className="text-sm text-gray-600">Platform safety, reporting issues, and account security</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Technical Issues</h4>
                    <p className="text-sm text-gray-600">App problems, login issues, and bug reports</p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">How do I book a pet sitter?</h3>
                <p className="text-sm text-gray-600">
                  Browse verified sitters in your area, view their profiles and feedback, 
                  then send a booking request with your pet's details and dates.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Are all sitters verified?</h3>
                <p className="text-sm text-gray-600">
                  Yes, all sitters complete identity verification and profile validation 
                  before they can accept bookings on our platform.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">What if something goes wrong?</h3>
                <p className="text-sm text-gray-600">
                  Contact us immediately through our platform. We take all safety 
                  concerns seriously and will help resolve any issues.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">How do payments work?</h3>
                <p className="text-sm text-gray-600">
                  Secure payments are processed through our platform. Payment is held 
                  securely and released to sitters after successful service completion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}