import { Search, MessageCircle, CreditCard, Camera } from 'lucide-react';

const steps = [
  { icon: Search, label: 'Search', number: '1' },
  { icon: MessageCircle, label: 'Meet & Greet (Free)', number: '2' },
  { icon: CreditCard, label: 'Book Securely', number: '3' },
  { icon: Camera, label: 'Get Daily Updates', number: '4' },
];

export default function CompactSteps() {
  return (
    <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-900 rounded-full px-3 py-1.5 shadow-sm border border-border">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
              {step.number}
            </div>
            <step.icon className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">{step.label}</span>
          </div>
          
          {/* Arrow connector */}
          {index < steps.length - 1 && (
            <span className="text-muted-foreground hidden md:inline">→</span>
          )}
        </div>
      ))}
    </div>
  );
}