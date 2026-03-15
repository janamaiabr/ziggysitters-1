import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SEOHead from '@/components/seo/SEOHead';
import iconQuestion from '@/assets/icons/icon-question.png';

const faqs = [
  {
    category: 'Getting Started',
    questions: [
      { q: 'Do I need to own my home or have a fenced yard?', a: "No — home ownership is NOT required. A fenced yard is optional. You can offer pet sitting at the pet owner's home (house sitting), which is actually the most popular service." },
      { q: 'How do I get my profile live and visible to pet owners?', a: "You need to complete four steps: (1) Upload a profile photo, (2) Set your services and rates, (3) Upload your ID document for verification, and (4) Connect your bank account via Stripe to receive payments. Once our team reviews your ID (usually within 1-2 business days), your profile will go live." },
      { q: 'How long does verification take?', a: "ID verification typically takes 1-2 business days. You'll receive an email notification as soon as you're approved." },
      { q: 'What ID do I need to upload?', a: "A clear photo of your driver's licence or passport. The image must show all four corners and the text must be legible." },
      { q: 'What is the Golden Badge and do I need it?', a: "The Golden Badge is awarded to sitters who complete a police vet check. It's optional but highly recommended — sitters with a Golden Badge receive on average 3x more bookings." },
    ],
  },
  {
    category: 'Bookings',
    questions: [
      { q: 'How does a booking request work?', a: "A pet owner sends you a booking request. You'll receive an email and in-app notification. You have 48 hours to accept or decline." },
      { q: 'What happens if I need to cancel a confirmed booking?', a: "Cancelling a confirmed booking negatively impacts your response rate and ranking. In emergencies, contact us immediately." },
      { q: 'Can I set my own rates?', a: "Yes, completely. You set your own rates for each service type. Most Auckland sitters charge $55-$85/night for house sitting." },
      { q: 'Do I need to do a meet & greet before the booking?', a: "Strongly recommended but not mandatory. It builds trust and reduces the risk of cancellation." },
      { q: 'How do I set my availability?', a: "Go to your profile and use the Calendar tab to mark dates you're available or unavailable." },
    ],
  },
  {
    category: 'Payments',
    questions: [
      { q: 'Why do I need to connect Stripe?', a: "Stripe is the payment platform we use to send your earnings directly to your bank account. It's secure and trusted by millions of businesses." },
      { q: 'When do I get paid?', a: "Payment is released to your Stripe account shortly after the booking is marked as completed. It typically takes 2-5 business days to appear in your bank." },
      { q: 'Does ZiggySitters take a commission?', a: "Yes. ZiggySitters charges a platform fee on each booking. This covers payment processing, customer support, marketing, and platform maintenance." },
      { q: 'What if a payment goes wrong?', a: "Contact us immediately via the Help section or email support@ziggysitters.com." },
    ],
  },
  {
    category: 'Daily Reports',
    questions: [
      { q: 'What are daily reports and are they required?', a: "Daily reports are photo updates you send to the pet owner each day of a multi-day booking. They're required for all house sitting and overnight bookings." },
      { q: 'How do I submit a daily report?', a: "Log into the app, go to 'My Bookings', open the active booking, and tap 'Submit Daily Report'. Upload at least one photo." },
      { q: 'What happens if I forget to submit a report?', a: "You'll receive a reminder notification. Missing reports can result in a penalty deducted from your payout." },
      { q: 'What should I include in my photos?', a: "Happy, clear photos of the pet in natural light. Show the pet eating, playing, resting, or on a walk." },
    ],
  },
  {
    category: 'Your Profile & Getting Bookings',
    questions: [
      { q: 'Why am I not getting any enquiries?', a: "Common reasons: (1) Profile photo doesn't show your face clearly, (2) Bio is too short, (3) Location not set correctly, (4) Rates too high vs nearby sitters, or (5) Availability calendar not updated." },
      { q: 'How important is my profile photo?', a: "Extremely important. Sitters with a clear, friendly face photo get significantly more bookings." },
      { q: 'What should I write in my bio?', a: "Mention your suburb, experience with animals, why you love pets, and what makes you trustworthy. Aim for at least 100 words." },
      { q: "Why doesn't my pin appear on the sitter map?", a: "You need to set your location using the map picker in your profile settings. Simply typing your suburb isn't enough." },
      { q: 'How do reviews work?', a: "After a booking is completed, the pet owner is automatically prompted to leave a review. Reviews are public on your profile." },
    ],
  },
  {
    category: 'Safety & Trust',
    questions: [
      { q: 'What if something goes wrong during a booking?', a: "Contact us immediately at support@ziggysitters.com. In a veterinary emergency, take the pet to the nearest vet and contact the owner." },
      { q: 'Am I responsible if a pet gets hurt?', a: "As a sitter, you have a duty of care. Negligence can result in liability. Read the pet's care instructions thoroughly." },
      { q: "Can I decline a booking if I'm not comfortable?", a: "Yes. You're never obligated to accept. If you don't feel confident, decline respectfully." },
    ],
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      <button className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-accent/50 transition-colors" onClick={() => setOpen(!open)}>
        <span className="font-medium text-foreground leading-snug font-body">{question}</span>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed border-t border-border bg-muted/30">
          <p className="pt-4 font-body">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function SitterFAQ() {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead title="Sitter FAQ | ZiggySitters" description="Answers to common questions from pet sitters on ZiggySitters." canonical="https://ziggysitters.com/sitter-faq" />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="py-20 md:py-28 bg-muted">
          <div className="max-w-3xl mx-auto text-center px-4">
            <div className="flex justify-center mb-6">
              <img src={iconQuestion} alt="" className="w-14 h-14" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-display">Sitter FAQ</h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto font-body">
              Everything you need to know about becoming a successful pet sitter on ZiggySitters.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => navigate('/become-sitter')} className="bg-primary text-primary-foreground hover:bg-primary/90 font-body">
                Become a Sitter <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button variant="outline" className="border-border font-body" onClick={() => navigate('/contact')}>Contact Support</Button>
            </div>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-4 py-16">
          <div className="space-y-12">
            {faqs.map((section) => (
              <div key={section.category}>
                <h2 className="text-xl font-bold text-foreground mb-4 font-display">{section.category}</h2>
                <div className="space-y-3">
                  {section.questions.map((item) => (<FAQItem key={item.q} question={item.q} answer={item.a} />))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
            <h3 className="text-xl font-bold text-foreground mb-2 font-display">Still have questions?</h3>
            <p className="text-muted-foreground mb-6 font-body">Our team is happy to help. We'll respond within 24 hours.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => navigate('/contact')} className="bg-primary text-primary-foreground hover:bg-primary/90 font-body">
                Contact Us <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button variant="outline" className="border-border font-body" onClick={() => navigate('/profile')}>Go to My Profile</Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
