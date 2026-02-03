import { Brain, Users, Camera, RefreshCw, Clock } from 'lucide-react';

interface TrustGuarantee {
  icon: React.ElementType;
  name: string;
  description: string;
  color: string;
}

const guarantees: TrustGuarantee[] = [
  {
    icon: Brain,
    name: 'Personality-matched sitters',
    description: 'Not just who\'s available — we show you sitters who specialise in pets exactly like yours.',
    color: 'from-purple-500 to-indigo-500'
  },
  {
    icon: Users,
    name: 'Meet before you commit',
    description: 'See the chemistry firsthand. Free meet & greet so your pet can decide before you book.',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Camera,
    name: 'Daily updates guaranteed',
    description: 'Morning and evening updates with photos — watch them settle, day by day. Payment tied to compliance.',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: RefreshCw,
    name: 'Book them again anytime',
    description: 'Keep their person, forever. Once you find the right match, they\'re always just a booking away.',
    color: 'from-orange-500 to-pink-500'
  }
];

export default function TrustGuarantees() {
  return (
    <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 rounded-xl md:rounded-2xl p-4 md:p-8 border border-primary/10">
      <div className="text-center mb-4 md:mb-6">
        <h3 className="text-lg md:text-2xl font-bold mb-1 md:mb-2">Matched on personality, not just proximity</h3>
        <p className="text-xs md:text-sm text-muted-foreground">Every pet has a personality. We match them with sitters who truly get them.</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        {guarantees.map((guarantee, index) => (
          <div 
            key={index}
            className="bg-white dark:bg-gray-900 rounded-xl p-3.5 md:p-5 shadow-sm border border-border hover:shadow-md transition-shadow flex md:block items-start gap-3"
          >
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-r ${guarantee.color} flex items-center justify-center flex-shrink-0 md:mb-4`}>
              <guarantee.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-foreground text-sm md:text-base mb-0.5 md:mb-2">{guarantee.name}</h4>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{guarantee.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Meet & Greet callout */}
      <div className="mt-4 md:mt-6 flex items-center justify-center gap-2 md:gap-3 bg-white dark:bg-gray-900 rounded-xl p-3 md:p-4 border border-green-200 dark:border-green-800">
        <Clock className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0" />
        <p className="text-xs md:text-sm">
          <span className="font-semibold text-green-700 dark:text-green-400">Free Meet & Greet:</span>
          <span className="text-muted-foreground"> No-obligation meeting before you book!</span>
        </p>
      </div>
    </div>
  );
}