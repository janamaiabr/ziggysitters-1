import SEOHead from '@/components/seo/SEOHead';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import iconShield from '@/assets/icons/icon-shield.png';
import iconCamera from '@/assets/icons/icon-camera.png';
import iconPayment from '@/assets/icons/icon-payment.png';
import iconHeart from '@/assets/icons/icon-heart.png';
import iconQuestion from '@/assets/icons/icon-question.png';
import iconPaw from '@/assets/icons/icon-paw.png';

export default function FAQ() {
  const navigate = useNavigate();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What services do you offer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We offer three main services: Pet Sitting at the Sitter's Home ($30-45/day), Pet Sitting at Your Home ($40-55/day), and Drop-in Visits ($20-25/visit). All prices are in NZD and include GST."
        }
      },
      {
        "@type": "Question",
        "name": "How do daily photo updates work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "When booking, you can choose to request daily photo reports. If you opt in, sitters must provide photos and updates on your pet's exercise, meals, sleep, and mood each day."
        }
      },
      {
        "@type": "Question",
        "name": "Are sitters insured and vetted?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We have a three-tier verification system: New Sitters, ID Verified, and Gold Star Verified (ID + police vet check)."
        }
      },
    ]
  };

  return (
    <>
      <SEOHead
        title="Frequently Asked Questions - Pet Sitting in Auckland"
        description="Find answers to common questions about ZiggySitters pet care services, daily photo updates, sitter vetting, insurance, payments, and more."
        keywords="pet sitting FAQ, pet care questions, sitter insurance, daily photo updates, pet sitting Auckland"
        canonical="/faq"
        structuredData={structuredData}
      />
      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative min-h-[50vh] flex items-center overflow-hidden">
          <div className="absolute inset-0">
            <img src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1600&h=800&fit=crop" alt="Pet care" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
          </div>
          <div className="container mx-auto px-4 py-20 relative z-10">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-widest mb-4 font-body" style={{ color: 'hsl(152 45% 55%)' }}>Support</p>
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-[1.1] font-display mb-6">Frequently Asked Questions</h1>
              <p className="text-lg text-white/80 font-body max-w-xl">
                Everything you need to know about ZiggySitters pet care services
              </p>
            </div>
          </div>
        </section>

        {/* Services & Pricing */}
        <section className="py-20 md:py-28 bg-background">
          <div className="container max-w-4xl mx-auto px-4">
            <Card className="mb-8 border border-border bg-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <img src={iconPayment} alt="" className="w-8 h-8" />
                  <h2 className="text-2xl font-semibold font-display text-foreground">Services & Pricing</h2>
                </div>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="services">
                    <AccordionTrigger className="font-body">What services do you offer?</AccordionTrigger>
                    <AccordionContent className="font-body">
                      <div className="space-y-3">
                        <div>
                          <strong>Pet Sitting (Sitter's Home):</strong> $30-45 per day (NZD, incl. GST)
                          <p className="text-sm text-muted-foreground">Your pet stays at the sitter's home with full care and attention.</p>
                        </div>
                        <div>
                          <strong>Pet Sitting (Your Home):</strong> $40-55 per day (NZD, incl. GST)
                          <p className="text-sm text-muted-foreground">Sitter stays at your home to care for your pets in their familiar environment.</p>
                        </div>
                        <div>
                          <strong>Drop-in Visits:</strong> $20-25 per visit (NZD, incl. GST)
                          <p className="text-sm text-muted-foreground">Quick check-ins for feeding, bathroom breaks, and companionship.</p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="payment">
                    <AccordionTrigger className="font-body">How does payment work?</AccordionTrigger>
                    <AccordionContent className="font-body text-muted-foreground">
                      All payments are processed securely through Stripe. We charge a 10% platform fee on top of the sitter's rate to cover payment processing and platform operation. Payments are held securely and released to sitters after successful service completion. All prices are in NZD and include GST.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="cancellation">
                    <AccordionTrigger className="font-body">What's your cancellation policy?</AccordionTrigger>
                    <AccordionContent className="font-body text-muted-foreground">
                      <ul className="list-disc ml-6 mt-2 space-y-1">
                        <li>Cancellations at least 24 hours before start: 100% refund of sitting fee (less ZiggySitters fee)</li>
                        <li>Cancellations less than 24 hours before start: 50% refund of sitting fees (less ZiggySitters listing fee)</li>
                        <li>After job has started: No cancellation possible, all fees remain due</li>
                      </ul>
                      <p className="mt-2">Sitters and Clients may agree alternative arrangements as part of their specific agreement.</p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* Daily Photo Updates */}
            <Card className="mb-8 border border-border bg-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <img src={iconCamera} alt="" className="w-8 h-8" />
                  <h2 className="text-2xl font-semibold font-display text-foreground">Daily Photo Updates</h2>
                </div>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="how-updates-work">
                    <AccordionTrigger className="font-body">How do daily photo updates work?</AccordionTrigger>
                    <AccordionContent className="font-body text-muted-foreground">
                      <p className="mb-3">When booking, you can <strong className="text-foreground">choose to request daily photo reports</strong>. This is completely optional.</p>
                      <p className="mb-3">If you opt in, sitters must provide:</p>
                      <ul className="list-disc ml-6 space-y-1">
                        <li>Photos of your pet each day</li>
                        <li>Updates on exercise and activities</li>
                        <li>Information about meals and food consumption</li>
                        <li>Notes on sleep quality and mood</li>
                        <li>Any medication administration (if applicable)</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="updates-guarantee">
                    <AccordionTrigger className="font-body">What if a sitter doesn't send the agreed reports?</AccordionTrigger>
                    <AccordionContent className="font-body text-muted-foreground">
                      If you've requested daily reports, sitters are expected to complete them. We track report compliance and follow up with sitters who miss updates to ensure you stay informed about your pet's care.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="updates-optional">
                    <AccordionTrigger className="font-body">Do I have to request daily updates?</AccordionTrigger>
                    <AccordionContent className="font-body text-muted-foreground">
                      No, daily photo reports are completely optional! You can choose your communication level based on your preferences.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* Safety & Trust */}
            <Card className="mb-8 border border-border bg-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <img src={iconShield} alt="" className="w-8 h-8" />
                  <h2 className="text-2xl font-semibold font-display text-foreground">Safety & Trust</h2>
                </div>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="vetting">
                    <AccordionTrigger className="font-body">How are sitters vetted and verified?</AccordionTrigger>
                    <AccordionContent className="font-body text-muted-foreground">
                      <p className="mb-3">We have a three-tier verification system:</p>
                      <div className="space-y-4">
                        <div className="bg-muted p-4 rounded-lg border border-border">
                          <div className="flex items-center gap-2 mb-2">
                            <img src={iconPaw} alt="" className="w-5 h-5" />
                            <strong className="text-foreground">New Sitter</strong>
                          </div>
                          <p className="text-sm">Recently joined and completing their onboarding. Can accept bookings while working toward verification.</p>
                        </div>
                        <div className="bg-muted p-4 rounded-lg border border-border">
                          <div className="flex items-center gap-2 mb-2">
                            <img src={iconShield} alt="" className="w-5 h-5" />
                            <strong className="text-foreground">ID Verified</strong>
                          </div>
                          <p className="text-sm">Has submitted government-issued photo ID verified by our team.</p>
                        </div>
                        <div className="bg-muted p-4 rounded-lg border border-border">
                          <div className="flex items-center gap-2 mb-2">
                            <img src={iconPaw} alt="" className="w-5 h-5" />
                            <strong className="text-foreground">Gold Star Verified</strong>
                          </div>
                          <p className="text-sm">Has completed both ID verification AND police vet check. Our highest trust level.</p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="insurance">
                    <AccordionTrigger className="font-body">Are sitters insured?</AccordionTrigger>
                    <AccordionContent className="font-body text-muted-foreground">
                      <p className="mb-3">Sitters are <strong className="text-foreground">encouraged to maintain their own public liability insurance</strong>, but this is not mandatory as sitters are independent service providers.</p>
                      <p className="mb-3">We recommend asking sitters about their insurance coverage when booking.</p>
                      <div className="mt-3 bg-accent p-3 rounded-lg border border-border">
                        <p className="text-sm"><strong className="text-foreground">Note:</strong> As sitters are independent contractors, they are responsible for their own insurance and tax obligations.</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="emergency">
                    <AccordionTrigger className="font-body">What happens in an emergency?</AccordionTrigger>
                    <AccordionContent className="font-body text-muted-foreground">
                      In case of a pet emergency, sitters will:
                      <ol className="list-decimal ml-6 mt-2 space-y-2">
                        <li>Immediately attempt to contact you</li>
                        <li>If unable to reach you, contact your designated emergency contact</li>
                        <li>Act in the pet's best interests and seek veterinary care if needed</li>
                        <li>Keep you informed throughout the process</li>
                      </ol>
                      <p className="mt-3"><strong className="text-foreground">Important:</strong> Pet owners are responsible for all veterinary costs plus any reasonable transport or time charges from the sitter.</p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="disputes">
                    <AccordionTrigger className="font-body">How are disputes handled?</AccordionTrigger>
                    <AccordionContent className="font-body text-muted-foreground">
                      <ol className="list-decimal ml-6 mt-2 space-y-2">
                        <li>First, try to resolve the issue directly with the sitter through our messaging system</li>
                        <li>If unresolved, contact our support team at <a href="mailto:support@ziggysitters.com" className="text-primary hover:underline">support@ziggysitters.com</a></li>
                        <li>We'll mediate and work toward a fair resolution</li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* Booking Process */}
            <Card className="mb-8 border border-border bg-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <img src={iconHeart} alt="" className="w-8 h-8" />
                  <h2 className="text-2xl font-semibold font-display text-foreground">Booking Process</h2>
                </div>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="how-to-book">
                    <AccordionTrigger className="font-body">How do I book a sitter?</AccordionTrigger>
                    <AccordionContent className="font-body text-muted-foreground">
                      <ol className="list-decimal ml-6 space-y-2">
                        <li>Browse sitters in your area using our search filters</li>
                        <li>Review sitter profiles, ratings, and services offered</li>
                        <li>Select your desired service and dates</li>
                        <li>Choose whether you want daily photo reports (optional)</li>
                        <li>Provide pet information and any special instructions</li>
                        <li>Confirm booking and payment</li>
                        <li>Wait for sitter acceptance (usually within 24 hours)</li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="repeat-booking">
                    <AccordionTrigger className="font-body">Can I book the same sitter again?</AccordionTrigger>
                    <AccordionContent className="font-body text-muted-foreground">
                      Yes! If you had a great experience, you can favorite sitters and easily book them again from your "Favorites" section.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="what-to-provide">
                    <AccordionTrigger className="font-body">What information do I need to provide?</AccordionTrigger>
                    <AccordionContent className="font-body text-muted-foreground">
                      <ul className="list-disc ml-6 mt-2 space-y-1">
                        <li>Your contact details (phone number required)</li>
                        <li>Pet information (name, breed, age, size, temperament)</li>
                        <li>Vaccination status and medical conditions</li>
                        <li>Feeding instructions and special care needs</li>
                        <li>Emergency contact information</li>
                        <li>Your vet's contact details</li>
                        <li>Access instructions (if sitter coming to your home)</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* Contact CTA */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
              <img src={iconQuestion} alt="" className="w-12 h-12 mx-auto mb-3" />
              <h3 className="text-xl font-semibold mb-2 font-display text-foreground">Still have questions?</h3>
              <p className="text-muted-foreground mb-4 font-body">Our support team is here to help</p>
              <Button onClick={() => navigate('/contact')} className="bg-primary text-primary-foreground hover:bg-primary/90 font-body">
                Contact Us <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
