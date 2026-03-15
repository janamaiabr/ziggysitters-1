import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, ArrowRight, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';

import SEOHead from '@/components/seo/SEOHead';

const faqs = [
  {
    category: '🚀 Getting Started',
    questions: [
      {
        q: 'Do I need to own my home or have a fenced yard?',
        a: 'No — home ownership is NOT required. A fenced yard is optional. You can offer pet sitting at the pet owner\'s home (house sitting), which is actually the most popular service. Many of our top-earning sitters don\'t have fenced yards at all.',
      },
      {
        q: 'How do I get my profile live and visible to pet owners?',
        a: 'You need to complete four steps: (1) Upload a profile photo, (2) Set your services and rates, (3) Upload your ID document for verification, and (4) Connect your bank account via Stripe to receive payments. Once our team reviews your ID (usually within 1–2 business days), your profile will go live.',
      },
      {
        q: 'How long does verification take?',
        a: 'ID verification typically takes 1–2 business days. You\'ll receive an email notification as soon as you\'re approved. While you wait, you can finish setting up your profile, add photos, and write your bio.',
      },
      {
        q: 'What ID do I need to upload?',
        a: 'A clear photo of your driver\'s licence or passport. The image must show all four corners and the text must be legible. This is required by law for anyone handling payments and helps build trust with pet owners.',
      },
      {
        q: 'What is the Golden Badge and do I need it?',
        a: 'The Golden Badge is awarded to sitters who complete a police vet check (background check). It\'s optional but highly recommended — sitters with a Golden Badge receive on average 3x more bookings. You can apply for it after your profile is approved.',
      },
    ],
  },
  {
    category: '📅 Bookings',
    questions: [
      {
        q: 'How does a booking request work?',
        a: 'A pet owner sends you a booking request. You\'ll receive an email and in-app notification. You have 48 hours to accept or decline. If you don\'t respond within 48 hours, the booking expires automatically. Once you accept, the owner pays and the booking is confirmed.',
      },
      {
        q: 'What happens if I need to cancel a confirmed booking?',
        a: 'Cancelling a confirmed booking negatively impacts your response rate and ranking in search results. In cases of emergency, please contact us immediately so we can help rehome the booking. Repeated cancellations may result in your account being suspended.',
      },
      {
        q: 'Can I set my own rates?',
        a: 'Yes, completely. You set your own rates for each service type (house sitting, drop-in visits, overnight stays, etc.). We suggest checking what other sitters in your suburb charge to stay competitive. Most Auckland sitters charge $55–$85/night for house sitting.',
      },
      {
        q: 'Do I need to do a meet & greet before the booking?',
        a: 'It\'s strongly recommended but not mandatory. A free meet & greet before the first booking builds trust with the pet owner, reduces the risk of the booking being cancelled, and ensures you\'re comfortable with the pet. It\'s one of the best things you can do to get 5-star reviews.',
      },
      {
        q: 'How do I set my availability?',
        a: 'Go to your profile and use the Calendar tab to mark dates you\'re available or unavailable. Sitters with up-to-date availability appear more frequently in search results. Pet owners can also see your availability when booking.',
      },
    ],
  },
  {
    category: '💰 Payments',
    questions: [
      {
        q: 'Why do I need to connect Stripe?',
        a: 'Stripe is the payment platform we use to send your earnings directly to your bank account. It\'s secure, trusted by millions of businesses, and legally required for us to process payouts. You don\'t need a business number — just your personal bank account details.',
      },
      {
        q: 'When do I get paid?',
        a: 'Payment is released to your Stripe account shortly after the booking is marked as completed. From there, it typically takes 2–5 business days to appear in your bank account depending on your bank.',
      },
      {
        q: 'Does ZiggySitters take a commission?',
        a: 'Yes. ZiggySitters charges a platform fee on each booking. This covers payment processing, customer support, insurance, marketing that brings you bookings, and platform maintenance. You set your own rate and the platform fee is shown transparently at checkout.',
      },
      {
        q: 'What if a payment goes wrong?',
        a: 'Contact us immediately via the Help section or email support@ziggysitters.com. Our team monitors all payments and can manually verify and release funds if there\'s a technical issue.',
      },
    ],
  },
  {
    category: '📸 Daily Reports',
    questions: [
      {
        q: 'What are daily reports and are they required?',
        a: 'Daily reports are photo updates you send to the pet owner each day of a multi-day booking. They\'re required for all house sitting and overnight bookings. Reports include: photos of the pet, food and water status, exercise notes, mood, and any medication given.',
      },
      {
        q: 'How do I submit a daily report?',
        a: 'Log into the ZiggySitters app, go to "My Bookings", open the active booking, and tap "Submit Daily Report". You\'ll fill in a short form and upload at least one photo. The owner receives it automatically by email.',
      },
      {
        q: 'What happens if I forget to submit a report?',
        a: 'You\'ll receive a reminder notification. Missing reports can result in a penalty deducted from your payout and will negatively affect your rating. Pet owners plan their day around receiving these updates — think of it as your professional commitment.',
      },
      {
        q: 'What should I include in my photos?',
        a: 'Happy, clear photos of the pet in natural light work best. Show the pet eating, playing, resting, or on a walk. Avoid blurry or dark photos. Owners love seeing their pet\'s face — it gives them real peace of mind while they\'re away.',
      },
    ],
  },
  {
    category: '⭐ Your Profile & Getting Bookings',
    questions: [
      {
        q: 'Why am I not getting any enquiries?',
        a: 'The most common reasons are: (1) Your profile photo doesn\'t show your face clearly — face photos convert 5x better, (2) Your bio is too short or generic, (3) You haven\'t set your location correctly so you don\'t appear on the map, (4) Your rates are too high compared to nearby sitters, or (5) Your availability calendar isn\'t updated.',
      },
      {
        q: 'How important is my profile photo?',
        a: 'Extremely important. Sitters with a clear, friendly face photo get significantly more bookings than those without. Upload a photo where you\'re smiling with a pet if possible. Add multiple photos — 3 or more photos showing you with animals dramatically increases your enquiry rate.',
      },
      {
        q: 'What should I write in my bio?',
        a: 'Mention your suburb, your experience with animals, why you love pets, any specific breeds or species you\'re great with, and what makes you trustworthy. Be personal and warm — pet owners are choosing someone to care for a family member. Aim for at least 100 words.',
      },
      {
        q: 'Why doesn\'t my pin appear on the sitter map?',
        a: 'You need to set your location using the map picker in your profile settings. Simply typing your suburb isn\'t enough — you must use the location tool to drop a pin, which sets your geographic coordinates. Without this, you\'re invisible on the map view.',
      },
      {
        q: 'How do reviews work?',
        a: 'After a booking is completed, the pet owner is automatically prompted to leave a review. You\'ll receive a star rating and written comment. Reviews are public on your profile. The more completed bookings you have, the more reviews you\'ll accumulate. New sitters display a "New to Ziggy" badge so owners know you\'re just starting out.',
      },
      {
        q: 'Can I keep conversations with owners off the platform?',
        a: 'Please keep all communications within ZiggySitters. This protects both you and the pet owner, ensures disputes can be resolved fairly, and is required by our Terms of Service. Payments made outside the platform are not covered by any protection.',
      },
    ],
  },
  {
    category: '🛡️ Safety & Trust',
    questions: [
      {
        q: 'What if something goes wrong during a booking?',
        a: 'Contact us immediately at support@ziggysitters.com. We recommend all sitters save this number. In a veterinary emergency, take the pet to the nearest vet and contact the owner. Keep the vet receipt — you may be reimbursed if the owner pre-approved emergency care.',
      },
      {
        q: 'Am I responsible if a pet gets hurt?',
        a: 'As a sitter, you have a duty of care. Negligence (leaving a gate open, using the wrong food, skipping medication) can result in liability. We strongly recommend reading the pet\'s care instructions thoroughly before the booking starts and confirming all details at the meet & greet.',
      },
      {
        q: 'Can I decline a booking if I\'m not comfortable with the pet?',
        a: 'Yes. You\'re never obligated to accept a booking. If a pet has aggressive behaviour, complex medical needs you\'re not trained for, or you simply don\'t feel confident, decline respectfully. It\'s better to decline than to accept and have a difficult situation.',
      },
    ],
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-accent/50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="font-medium text-foreground leading-snug">{question}</span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed border-t border-border bg-accent/20">
          <p className="pt-4">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function SitterFAQ() {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead
        title="Sitter FAQ – Everything You Need to Know | ZiggySitters"
        description="Answers to the most common questions from pet sitters on ZiggySitters. Learn about getting started, bookings, payments, daily reports, and more."
        canonical="https://ziggysitters.com/sitter-faq"
      />
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-accent/20 py-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <HelpCircle className="h-4 w-4" />
              Sitter Help Centre
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Sitter FAQ
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Everything you need to know about becoming a successful pet sitter on ZiggySitters — from your first booking to getting paid.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => navigate('/become-sitter')} className="gap-2">
                Become a Sitter <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => navigate('/contact')}>
                Contact Support
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ Sections */}
        <section className="max-w-3xl mx-auto px-4 py-16">
          <div className="space-y-12">
            {faqs.map((section) => (
              <div key={section.category}>
                <h2 className="text-xl font-bold text-foreground mb-4">{section.category}</h2>
                <div className="space-y-3">
                  {section.questions.map((item) => (
                    <FAQItem key={item.q} question={item.q} answer={item.a} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
            <h3 className="text-xl font-bold text-foreground mb-2">Still have questions?</h3>
            <p className="text-muted-foreground mb-6">
              Our team is happy to help you get set up. Reach out and we'll respond within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => navigate('/contact')} className="gap-2">
                Contact Us <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => navigate('/profile')}>
                Go to My Profile
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
