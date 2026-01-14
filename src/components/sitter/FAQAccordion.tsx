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
      question: 'Is this a binding booking or just an enquiry?',
      answer: `This is just an enquiry — you're asking ${sitterName} about availability. No payment is required, and you're not committed to anything. Once they respond, you can discuss details, arrange a free meet & greet, and only book if you're completely happy.`
    },
    {
      question: 'What if I need to cancel after booking?',
      answer: 'If you cancel more than 48 hours before the booking starts, you receive a full refund. For cancellations within 48 hours, a partial refund may apply depending on circumstances. If something unexpected happens, reach out to us — we\'re flexible and understanding.'
    },
    {
      question: 'How does payment work? Is it secure?',
      answer: 'Payments are processed securely through Stripe. You only pay after the sitter accepts your request. Funds are held safely until the booking is completed, protecting you if anything goes wrong. Our Secure Payment Protection means you\'re covered.'
    },
    {
      question: 'Can I meet the sitter before committing?',
      answer: 'Absolutely! We strongly encourage a free meet & greet before your first booking. This lets your pet get comfortable with the sitter and gives you peace of mind. It\'s completely obligation-free — no pressure to book afterwards.'
    },
    {
      question: 'What happens if the sitter doesn\'t deliver promised updates?',
      answer: 'That\'s covered by our Daily Update Promise. If you requested daily photo updates and the sitter fails to deliver, they receive a 15% reduction in their payment. This accountability ensures sitters take the commitment seriously.'
    },
    {
      question: 'What if something goes wrong during my pet\'s stay?',
      answer: 'Our ZiggyCare Guarantee means we step in immediately if there\'s any issue. Contact our support team and we\'ll work with you and the sitter to resolve problems quickly. Your pet\'s wellbeing is our absolute priority.'
    },
    ...(hasGoldenBadge ? [{
      question: 'What does the Gold Star badge mean?',
      answer: `${sitterName} has completed both ID verification AND a police vet check. This is our highest trust level, showing extra commitment to safety and professionalism.`
    }] : []),
    ...(isVerified && !hasGoldenBadge ? [{
      question: 'What does ID Verified mean?',
      answer: `${sitterName} has submitted their ID documents, which have been reviewed and approved by our team. This confirms their identity and adds an extra layer of trust.`
    }] : []),
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
