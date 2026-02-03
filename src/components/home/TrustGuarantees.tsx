import { Heart, Users, Camera, RefreshCw } from 'lucide-react';

interface TrustGuarantee {
  icon: React.ElementType;
  name: string;
  description: string;
  color: string;
}

const guarantees: TrustGuarantee[] = [
  {
    icon: Heart,
    name: 'Personality-Matched Sitters',
    description: 'We match your pet with a sitter who understands their unique temperament, energy level, and needs.',
    color: 'from-pink-500 to-rose-500'
  },
  {
    icon: Users,
    name: 'Meet Before You Commit',
    description: 'Every booking starts with a free meet & greet — see the chemistry before you decide.',
    color: 'from-purple-500 to-indigo-500'
  },
  {
    icon: Camera,
    name: 'Daily Updates Guaranteed',
    description: 'Morning and evening photo updates so you never wonder how your pet is doing. Compliance-backed.',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: RefreshCw,
    name: 'Book Them Again Anytime',
    description: 'Found your pet\'s person? Rebook the same sitter with one click — consistency your pet can count on.',
    color: 'from-green-500 to-emerald-500'
  }
];

export default function TrustGuarantees() {
  return (
    <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 rounded-xl md:rounded-2xl p-4 md:p-8 border border-primary/10">
      <div className="text-center mb-4 md:mb-6">
        <h3 className="text-lg md:text-2xl font-bold mb-1 md:mb-2">Where Pets Find Their Person</h3>
        <p className="text-xs md:text-sm text-muted-foreground">Everything your pet deserves, guaranteed</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        {guarantees.map((guarantee, index) => (
          <div 
            key={index}
            className="bg-white dark:bg-gray-900 rounded-xl p-3.5 md:p-5 shadow-sm border border-border hover:shadow-md transition-shadow"
          >
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-r ${guarantee.color} flex items-center justify-center flex-shrink-0 mb-3 md:mb-4`}>
              <guarantee.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-foreground text-sm md:text-base mb-0.5 md:mb-2">{guarantee.name}</h4>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{guarantee.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
