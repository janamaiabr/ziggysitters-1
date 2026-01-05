import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  sitterName?: string;
  services?: string[];
  hasGoldenBadge?: boolean;
  isVerified?: boolean;
}

export default function FAQAccordion({ 
  sitterName = 'this sitter',
  services = [],
  hasGoldenBadge = false,
  isVerified = false
}: FAQAccordionProps) {
  const faqs: FAQ[] = [
    {
      question: 'What happens after I send an enquiry?',
      answer: `${sitterName} will receive your enquiry and typically responds within 24 hours. You can discuss dates, meet your pet, and agree on details before any payment is needed. There's no commitment until you both confirm the booking.`
    },
    {
      question: 'How does payment work?',
      answer: 'Payment is only collected after the sitter accepts your booking request. We use secure Stripe processing, and funds are held safely until the booking is completed. If there are any issues, our support team will help resolve them.'
    },
    {
      question: 'Can I meet the sitter before booking?',
      answer: 'Absolutely! We encourage a meet-and-greet before your first booking. Send a message through our platform to arrange a time. This helps ensure your pet is comfortable with the sitter.'
    },
    {
      question: 'What if I need to cancel?',
      answer: 'Cancellation policies vary by sitter. Generally, cancelling more than 48 hours before the booking starts allows for a full refund. For last-minute changes, reach out to the sitter directly to discuss options.'
    },
    {
      question: 'Will I get updates about my pet?',
      answer: 'You can request daily photo reports when making your booking. Sitters who agree to provide daily updates are accountable - if they don\'t deliver, they receive a 15% reduction in payment. This ensures transparency when you want it.'
    },
    ...(hasGoldenBadge ? [{
      question: 'What does the Gold Star badge mean?',
      answer: `${sitterName} has completed both ID verification AND a police vet check. This is our highest trust level, showing extra commitment to safety and professionalism.`
    }] : []),
    ...(isVerified && !hasGoldenBadge ? [{
      question: 'What does ID Verified mean?',
      answer: `${sitterName} has submitted their ID documents, which have been reviewed and approved by our team. This confirms their identity and adds an extra layer of trust.`
    }] : []),
    {
      question: 'What if something goes wrong?',
      answer: 'Our support team is here to help. If there\'s any issue with your booking, contact us and we\'ll work with you and the sitter to find a fair resolution. Your pet\'s wellbeing is our priority.'
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <HelpCircle className="h-5 w-5 text-primary" />
          Common Questions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-sm hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
