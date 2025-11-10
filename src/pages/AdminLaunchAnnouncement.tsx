import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/contexts/ProfileContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Rocket, ArrowLeft, Send, CheckCircle2, AlertCircle, Clock, Sparkles, Mail, Eye } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AdminNav } from '@/components/admin/AdminNav';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const getEmailHTML = (firstName: string, isSitter: boolean) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.7; 
          color: #333; 
          margin: 0; 
          padding: 0;
          background: #f5f5f5;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: white;
        }
        .header { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
        }
        .header h1 {
          margin: 0;
          font-size: 32px;
          font-weight: bold;
        }
        .banner {
          background: linear-gradient(45deg, #ffd700, #ffed4e);
          color: #333;
          text-align: center;
          padding: 15px;
          font-weight: bold;
          font-size: 18px;
        }
        .content { 
          padding: 40px 30px; 
        }
        .content h2 {
          color: #667eea;
          font-size: 24px;
          margin-bottom: 15px;
        }
        .highlight-box {
          background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
          border-left: 4px solid #667eea;
          padding: 20px;
          margin: 25px 0;
          border-radius: 5px;
        }
        .features {
          margin: 30px 0;
        }
        .feature-item {
          display: flex;
          align-items: start;
          margin: 15px 0;
          padding: 15px;
          background: #f9f9f9;
          border-radius: 8px;
        }
        .feature-icon {
          font-size: 24px;
          margin-right: 15px;
          min-width: 30px;
        }
        .button { 
          display: inline-block; 
          padding: 16px 40px; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white !important; 
          text-decoration: none; 
          border-radius: 30px; 
          margin: 25px 0;
          font-weight: bold;
          font-size: 16px;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          transition: transform 0.2s;
        }
        .cta-section {
          text-align: center;
          background: linear-gradient(135deg, #667eea10 0%, #764ba210 100%);
          padding: 30px;
          border-radius: 10px;
          margin: 30px 0;
        }
        .footer { 
          text-align: center; 
          padding: 30px; 
          background: #f9f9f9;
          color: #666; 
          font-size: 13px; 
        }
        .footer-links {
          margin: 15px 0;
        }
        .footer-links a {
          color: #667eea;
          text-decoration: none;
          margin: 0 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="banner">
          🚀 WE'RE OFFICIALLY LIVE! 🚀
        </div>
        
        <div class="header">
          <h1>Welcome to the Future of Pet Care!</h1>
          <p style="font-size: 18px; margin-top: 15px; opacity: 0.95;">
            ZiggySitters is now fully operational and ready to serve you
          </p>
        </div>

        <div class="content">
          <h2>Hi ${firstName}! 🎊</h2>
          
          <p style="font-size: 16px;">
            We're thrilled to announce that <strong>ZiggySitters is officially LIVE</strong> and ready to transform 
            the way you ${isSitter ? 'provide pet care services' : 'care for your beloved pets'}!
          </p>

          <div class="highlight-box">
            <h3 style="margin-top: 0; color: #667eea;">What This Means for You:</h3>
            ${isSitter ? `
              <p>✨ <strong>Start Accepting Real Bookings:</strong> Pet owners are actively searching for trusted sitters like you</p>
              <p>💰 <strong>Earn Real Income:</strong> All payments are now processed securely through Stripe</p>
              <p>🌟 <strong>Build Your Reputation:</strong> Start receiving reviews and growing your profile</p>
              <p>📅 <strong>Flexible Schedule:</strong> Set your availability and work on your terms</p>
            ` : `
              <p>🐾 <strong>Find Your Perfect Sitter:</strong> Browse verified, experienced pet sitters in your area</p>
              <p>🔒 <strong>Book with Confidence:</strong> All sitters are background-checked and verified</p>
              <p>📸 <strong>Stay Connected:</strong> Receive daily photo updates and reports during bookings</p>
              <p>💳 <strong>Secure Payments:</strong> Safe, encrypted payment processing through Stripe</p>
            `}
          </div>

          <h2>Why Choose ZiggySitters?</h2>
          
          <div class="features">
            <div class="feature-item">
              <div class="feature-icon">🛡️</div>
              <div>
                <strong>Verified & Trusted</strong>
                <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">
                  All sitters undergo thorough background checks and document verification
                </p>
              </div>
            </div>

            <div class="feature-item">
              <div class="feature-icon">💬</div>
              <div>
                <strong>Real-Time Communication</strong>
                <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">
                  Chat directly with ${isSitter ? 'pet owners' : 'sitters'} and receive instant updates
                </p>
              </div>
            </div>

            <div class="feature-item">
              <div class="feature-icon">📱</div>
              <div>
                <strong>Easy to Use</strong>
                <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">
                  Simple, intuitive platform designed for ${isSitter ? 'managing bookings' : 'booking services'} in minutes
                </p>
              </div>
            </div>

            <div class="feature-item">
              <div class="feature-icon">💳</div>
              <div>
                <strong>Secure Payments</strong>
                <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">
                  Enterprise-grade payment security powered by Stripe
                </p>
              </div>
            </div>
          </div>

          <div class="cta-section">
            <h2 style="margin-top: 0; color: #667eea;">Ready to Get Started?</h2>
            <p style="font-size: 16px; margin-bottom: 25px;">
              ${isSitter 
                ? 'Start accepting bookings today and turn your love for pets into income!' 
                : 'Find the perfect sitter for your furry friend and book with confidence!'}
            </p>
            <center>
              <a href="https://ziggysitters.com/${isSitter ? 'profile' : 'find-sitters'}" class="button">
                ${isSitter ? '🚀 View My Dashboard' : '🔍 Find a Sitter Now'}
              </a>
            </center>
          </div>

          <div class="highlight-box">
            <h3 style="margin-top: 0;">💡 Quick Tips to Get Started:</h3>
            <ol style="margin: 10px 0; padding-left: 20px;">
              ${isSitter ? `
                <li>Complete your profile with photos and detailed descriptions</li>
                <li>Set your availability calendar</li>
                <li>Ensure your Stripe account is fully verified</li>
                <li>Respond quickly to booking requests to build your reputation</li>
              ` : `
                <li>Complete your profile and add your pet's information</li>
                <li>Browse sitters in your area</li>
                <li>Read reviews and check sitter profiles</li>
                <li>Book your first service with confidence!</li>
              `}
            </ol>
          </div>

          <p style="font-size: 16px; margin-top: 30px;">
            Thank you for being part of our community! We're excited to see the amazing connections 
            between pets and sitters that will happen on our platform.
          </p>

          <p style="font-size: 16px;">
            Have questions? Our support team is here to help you every step of the way.
          </p>

          <p style="font-size: 16px; margin-top: 25px;">
            <strong>Welcome to ZiggySitters - Where Every Pet Gets the Love They Deserve! 🐾</strong>
          </p>

          <p style="margin-top: 30px;">
            Warm regards,<br>
            <strong>The ZiggySitters Team</strong>
          </p>
        </div>

        <div class="footer">
          <p><strong>ZiggySitters</strong></p>
          <div class="footer-links">
            <a href="https://ziggysitters.com/about">About Us</a> |
            <a href="https://ziggysitters.com/how-it-works">How It Works</a> |
            <a href="https://ziggysitters.com/faq">FAQ</a> |
            <a href="https://ziggysitters.com/contact">Contact</a>
          </div>
          <p style="margin-top: 15px;">© 2025 ZiggySitters. All rights reserved.</p>
          <p style="font-size: 11px; color: #999; margin-top: 10px;">
            You're receiving this email because you have a ZiggySitters account.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export default function AdminLaunchAnnouncement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<any>(null);

  // Redirect non-admins
  if (profile?.role !== 'admin') {
    navigate('/');
    return null;
  }

  const sendEmails = async () => {
    if (!confirm('Are you sure you want to send the launch announcement to ALL users? This cannot be undone.')) {
      return;
    }

    setSending(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke('send-launch-announcement', {
        body: {},
      });

      if (error) throw error;

      setResults(data);
      
      toast({
        title: "Launch Announcement Sent! 🚀",
        description: `Successfully sent ${data.emails_sent} launch emails`,
      });
    } catch (error: any) {
      console.error('Error sending launch announcement:', error);
      toast({
        title: "Error Sending Emails",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <AdminNav />
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Dashboard
          </Button>

          <Card className="border-primary/20">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-purple-500/10">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Rocket className="h-7 w-7 text-primary" />
                Send Launch Announcement
              </CardTitle>
              <CardDescription className="text-base">
                Send a beautiful launch announcement email to all registered users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 mt-6">
              <Alert className="border-primary/30 bg-primary/5">
                <Sparkles className="h-4 w-4 text-primary" />
                <AlertTitle>Platform Launch Email</AlertTitle>
                <AlertDescription>
                  This will send a professionally designed email to all users (excluding test accounts) 
                  announcing that ZiggySitters is officially live and ready for use. The email is customized 
                  based on user role (pet owner vs pet sitter).
                </AlertDescription>
              </Alert>

              <Tabs defaultValue="preview" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="preview">
                    <Eye className="h-4 w-4 mr-2" />
                    Email Preview
                  </TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                </TabsList>
                
                <TabsContent value="preview" className="space-y-4">
                  <Alert>
                    <Sparkles className="h-4 w-4" />
                    <AlertTitle>Preview Both Versions</AlertTitle>
                    <AlertDescription>
                      The email content is personalized based on user role. Switch between tabs to see both versions.
                    </AlertDescription>
                  </Alert>
                  
                  <Tabs defaultValue="owner" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="owner">Pet Owner Version</TabsTrigger>
                      <TabsTrigger value="sitter">Pet Sitter Version</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="owner" className="mt-4">
                      <div className="border rounded-lg overflow-hidden">
                        <iframe
                          srcDoc={getEmailHTML('John', false)}
                          className="w-full h-[600px] bg-white"
                          title="Pet Owner Email Preview"
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="sitter" className="mt-4">
                      <div className="border rounded-lg overflow-hidden">
                        <iframe
                          srcDoc={getEmailHTML('Sarah', true)}
                          className="w-full h-[600px] bg-white"
                          title="Pet Sitter Email Preview"
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </TabsContent>
                
                <TabsContent value="details" className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Mail className="h-5 w-5 text-primary" />
                      Email Highlights:
                    </h3>
                    <div className="grid gap-3">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-medium mb-2">🎨 Beautiful Design</h4>
                        <p className="text-sm text-muted-foreground">
                          Gradient headers, professional layout, responsive design that looks great on all devices
                        </p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-medium mb-2">🎯 Role-Specific Content</h4>
                        <p className="text-sm text-muted-foreground">
                          Personalized messaging for pet owners (find sitters) and pet sitters (accept bookings)
                        </p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-medium mb-2">✨ Value Propositions</h4>
                        <p className="text-sm text-muted-foreground">
                          Highlights key features: verified sitters, secure payments, real-time updates, daily reports
                        </p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-medium mb-2">🚀 Clear Call-to-Action</h4>
                        <p className="text-sm text-muted-foreground">
                          Direct buttons to dashboard (sitters) or find sitters page (owners) to drive engagement
                        </p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-medium mb-2">💡 Quick Start Tips</h4>
                        <p className="text-sm text-muted-foreground">
                          Step-by-step guidance to help users get started immediately
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  This email will be sent to ALL users in the system (excluding test accounts). 
                  Make sure you're ready to go live before sending. This action cannot be undone.
                </AlertDescription>
              </Alert>

              <Button 
                onClick={sendEmails}
                disabled={sending}
                size="lg"
                className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
              >
                {sending ? (
                  <>
                    <Clock className="h-5 w-5 mr-2 animate-spin" />
                    Sending Launch Emails...
                  </>
                ) : (
                  <>
                    <Rocket className="h-5 w-5 mr-2" />
                    Send Launch Announcement to All Users
                  </>
                )}
              </Button>

              {results && (
                <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle>🎉 Launch Announcement Sent Successfully!</AlertTitle>
                  <AlertDescription>
                    <div className="mt-2 space-y-2">
                      <p><strong>Total Users:</strong> {results.total_users}</p>
                      <p><strong>Emails Sent:</strong> {results.emails_sent}</p>
                      
                      {results.results && results.results.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-semibold mb-2">Detailed Results:</h4>
                          <div className="space-y-1 max-h-64 overflow-y-auto">
                            {results.results.map((result: any, index: number) => (
                              <div 
                                key={index}
                                className={`text-xs p-2 rounded ${
                                  result.status === 'sent' 
                                    ? 'bg-green-100 dark:bg-green-900/20' 
                                    : 'bg-red-100 dark:bg-red-900/20'
                                }`}
                              >
                                <strong>{result.name}</strong> ({result.email}) - {result.status}
                                {result.error && <span className="text-red-600"> - {result.error}</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
