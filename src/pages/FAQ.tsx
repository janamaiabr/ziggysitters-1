import SEOHead from '@/components/seo/SEOHead';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Shield, Heart, Camera, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';

export default function FAQ() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What services do you offer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We offer four main services: Pet Sitting at the Sitter's Home ($30-45/day), Pet Sitting at Your Home ($40-55/day), Drop-in Visits ($20-25/visit), and Dog Walking ($25-30/hour). All prices are in NZD and include GST."
        }
      },
      {
        "@type": "Question",
        "name": "How do daily photo updates work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "When booking, you can choose to request daily photo reports. If you opt in, sitters must provide photos and updates on your pet's exercise, meals, sleep, and mood each day. This is optional and can be selected during the booking process. Sitters who fail to deliver agreed reports face a 15% payment deduction."
        }
      },
      {
        "@type": "Question",
        "name": "Are sitters insured and vetted?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "All sitters must complete verification including a police check, ID verification, and written references before accepting bookings. While sitters are encouraged to maintain their own public liability insurance, this is not mandatory. Each sitter's verification status is clearly displayed on their profile."
        }
      },
      {
        "@type": "Question",
        "name": "What's your cancellation policy?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Cancellation policies are set by individual sitters and must be agreed upon before booking. Standard policies typically allow free cancellation up to 7 days before the booking start date. Details are always shown before you confirm your booking."
        }
      },
      {
        "@type": "Question",
        "name": "How does payment work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "All payments are processed securely through Stripe. We charge a 10% platform fee on top of the sitter's rate. Payment is held securely and released to sitters after successful service completion. All prices are in NZD and include GST."
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Frequently Asked Questions - Pet Sitting in Auckland"
        description="Find answers to common questions about ZiggySitters pet care services, daily photo updates, sitter vetting, insurance, payments, and more."
        keywords="pet sitting FAQ, pet care questions, sitter insurance, daily photo updates, pet sitting Auckland"
        canonical="/faq"
        structuredData={structuredData}
      />

      <div className="container max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-muted-foreground">
            Everything you need to know about ZiggySitters pet care services
          </p>
        </div>

        {/* Services & Pricing */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-semibold">Services & Pricing</h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="services">
                <AccordionTrigger>What services do you offer?</AccordionTrigger>
                <AccordionContent>
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
                    <div>
                      <strong>Dog Walking:</strong> $25-30 per hour (NZD, incl. GST)
                      <p className="text-sm text-muted-foreground">Professional walks tailored to your dog's exercise needs.</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="payment">
                <AccordionTrigger>How does payment work?</AccordionTrigger>
                <AccordionContent>
                  All payments are processed securely through Stripe. We charge a 10% platform fee on top of the sitter's rate to cover payment processing and platform operation. Payments are held securely and released to sitters after successful service completion. All prices are in NZD and include GST.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="cancellation">
                <AccordionTrigger>What's your cancellation policy?</AccordionTrigger>
                <AccordionContent>
                  Cancellation policies are set by individual sitters and must be agreed upon before booking. Standard policies typically allow:
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>Free cancellation up to 7 days before booking start</li>
                    <li>50% refund for cancellations 3-7 days before</li>
                    <li>No refund for cancellations within 3 days of start date</li>
                  </ul>
                  <p className="mt-2">The specific policy is always shown before you confirm your booking.</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Daily Photo Updates */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Camera className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-semibold">Daily Photo Updates</h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="how-updates-work">
                <AccordionTrigger>How do daily photo updates work?</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-3">When booking, you can <strong>choose to request daily photo reports</strong>. This is completely optional based on your preference.</p>
                  <p className="mb-3">If you opt in for daily reports, sitters must provide:</p>
                  <ul className="list-disc ml-6 space-y-1">
                    <li>Photos of your pet each day</li>
                    <li>Updates on exercise and activities</li>
                    <li>Information about meals and food consumption</li>
                    <li>Notes on sleep quality and mood</li>
                    <li>Any medication administration (if applicable)</li>
                  </ul>
                  <p className="mt-3 text-sm text-muted-foreground">Reports are typically delivered via the platform by end of each day during the booking period.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="updates-guarantee">
                <AccordionTrigger>What if a sitter doesn't send the agreed reports?</AccordionTrigger>
                <AccordionContent>
                  If you've requested daily reports and the sitter fails to deliver them as agreed, they face a 15% deduction from their booking payment. This ensures accountability and peace of mind when you choose the daily update option.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="updates-optional">
                <AccordionTrigger>Do I have to request daily updates?</AccordionTrigger>
                <AccordionContent>
                  No, daily photo reports are completely optional! You can choose your communication level based on your preferences. Some pet owners love daily updates, while others prefer less frequent communication. It's entirely up to you.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Safety & Trust */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-semibold">Safety & Trust</h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="vetting">
                <AccordionTrigger>How are sitters vetted?</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-3">All sitters must complete a comprehensive verification process before accepting bookings:</p>
                  <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Police Check:</strong> Clear criminal background check from New Zealand Police</li>
                    <li><strong>ID Verification:</strong> Government-issued photo ID (passport or driver's license)</li>
                    <li><strong>Written References:</strong> References from previous pet owners or character references</li>
                    <li><strong>Profile Review:</strong> Our team reviews all profiles before approval</li>
                  </ul>
                  <p className="mt-3 text-sm bg-blue-50 p-3 rounded-lg">
                    <CheckCircle className="w-4 h-4 inline mr-1 text-primary" />
                    Verified sitters display a blue checkmark badge on their profile.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="insurance">
                <AccordionTrigger>Are sitters insured?</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-3">While all sitters are <strong>encouraged to maintain their own public liability insurance</strong>, this is not mandatory as sitters are independent service providers, not employees of ZiggySitters.</p>
                  <p className="mb-3">We recommend asking sitters about their insurance coverage when booking. Many professional pet sitters maintain:</p>
                  <ul className="list-disc ml-6 space-y-1">
                    <li>Public liability insurance</li>
                    <li>Pet care professional insurance</li>
                    <li>Business insurance (for full-time sitters)</li>
                  </ul>
                  <p className="mt-3 text-sm bg-amber-50 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4 inline mr-1 text-amber-600" />
                    <strong>Note:</strong> As sitters are independent contractors, they are responsible for their own insurance and tax obligations. ZiggySitters acts as a marketplace platform connecting pet owners with sitters.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="emergency">
                <AccordionTrigger>What happens in an emergency?</AccordionTrigger>
                <AccordionContent>
                  In case of a pet emergency, sitters will:
                  <ol className="list-decimal ml-6 mt-2 space-y-2">
                    <li>Immediately attempt to contact you using the contact details provided</li>
                    <li>If unable to reach you, contact your designated emergency contact</li>
                    <li>Act in the pet's best interests and seek veterinary care if needed</li>
                    <li>Keep you informed throughout the process</li>
                  </ol>
                  <p className="mt-3"><strong>Important:</strong> Pet owners are responsible for all veterinary costs plus any reasonable transport or time charges from the sitter. We recommend providing your vet's contact details and any relevant medical history when booking.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="disputes">
                <AccordionTrigger>How are disputes handled?</AccordionTrigger>
                <AccordionContent>
                  If issues arise during or after a booking:
                  <ol className="list-decimal ml-6 mt-2 space-y-2">
                    <li>First, try to resolve the issue directly with the sitter through our messaging system</li>
                    <li>If unresolved, contact our support team at <a href="mailto:support@ziggysitters.co.nz" className="text-primary hover:underline">support@ziggysitters.co.nz</a></li>
                    <li>We'll mediate and work toward a fair resolution</li>
                    <li>Disputes may be referred to third-party dispute resolution in line with NZ consumer law</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Booking Process */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-semibold">Booking Process</h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="how-to-book">
                <AccordionTrigger>How do I book a sitter?</AccordionTrigger>
                <AccordionContent>
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
                <AccordionTrigger>Can I book the same sitter again?</AccordionTrigger>
                <AccordionContent>
                  Yes! If you had a great experience, you can favorite sitters and easily book them again. Just visit your "Favorites" section or go directly to the sitter's profile to make a new booking.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="what-to-provide">
                <AccordionTrigger>What information do I need to provide?</AccordionTrigger>
                <AccordionContent>
                  When booking, please provide:
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
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6 text-center">
            <h3 className="text-xl font-semibold mb-2">Still have questions?</h3>
            <p className="text-muted-foreground mb-4">
              Our support team is here to help
            </p>
            <a 
              href="/contact" 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Contact Us
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
