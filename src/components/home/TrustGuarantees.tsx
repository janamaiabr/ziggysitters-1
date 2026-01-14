import { Camera, Shield, CreditCard, Clock, CheckCircle } from 'lucide-react';

interface TrustGuarantee {
  icon: React.ElementType;
  name: string;
  description: string;
  color: string;
}

const guarantees: TrustGuarantee[] = [
  {
    icon: Camera,
    name: 'Daily Update Promise',
    description: 'Request daily photos & videos — if your sitter doesn\'t deliver, they receive a 15% pay reduction. Your peace of mind, guaranteed.',
    color: 'from-blue-500 to-indigo-500'
  },
  {
    icon: Shield,
    name: 'ZiggyCare Guarantee',
    description: 'Every sitter is ID verified. Issues? Our support team steps in immediately to help resolve any concerns.',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: CreditCard,
    name: 'Secure Payment Protection',
    description: 'Pay only when your sitter accepts. Funds held securely until booking completes. Stripe-powered security.',
    color: 'from-green-500 to-emerald-500'
  }
];

export default function TrustGuarantees() {
  return (
    <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 rounded-2xl p-6 md:p-8 border border-primary/10">
      <div className="text-center mb-6">
        <h3 className="text-xl md:text-2xl font-bold mb-2">Your Peace of Mind, Guaranteed</h3>
        <p className="text-sm text-muted-foreground">Not just features — binding promises that protect you</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {guarantees.map((guarantee, index) => (
          <div 
            key={index}
            className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-border hover:shadow-md transition-shadow"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${guarantee.color} flex items-center justify-center mb-4`}>
              <guarantee.icon className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-bold text-foreground mb-2">{guarantee.name}</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{guarantee.description}</p>
          </div>
        ))}
      </div>
      
      {/* Meet & Greet callout */}
      <div className="mt-6 flex items-center justify-center gap-3 bg-white dark:bg-gray-900 rounded-xl p-4 border border-green-200 dark:border-green-800">
        <Clock className="w-5 h-5 text-green-600" />
        <p className="text-sm">
          <span className="font-semibold text-green-700 dark:text-green-400">Free Meet & Greet:</span>
          <span className="text-muted-foreground"> Arrange a no-obligation meeting before you book — we encourage it!</span>
        </p>
      </div>
    </div>
  );
}