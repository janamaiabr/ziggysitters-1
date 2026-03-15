import { Shield, Camera, MapPin, Heart } from 'lucide-react';

const guarantees = [
  {
    icon: Shield,
    name: 'ID Verified Sitters',
    description: 'Every sitter provides government ID. Real people, verified locally.',
  },
  {
    icon: Camera,
    name: 'Daily Photo Updates',
    description: "See your pet's day — photos, meal notes, mood, and activity updates.",
  },
  {
    icon: MapPin,
    name: 'Local to Your Area',
    description: 'Sitters in your neighbourhood who know the parks, vets, and your community.',
  },
  {
    icon: Heart,
    name: 'People Who Love Pets',
    description: 'Every sitter is a genuine animal lover. Your pet is family, not a transaction.',
  },
];

export default function TrustGuarantees() {
  return (
    <div className="bg-card rounded-2xl p-6 md:p-10 border border-border">
      <div className="text-center mb-6 md:mb-8">
        <h3 className="text-xl md:text-2xl font-display text-foreground mb-1 md:mb-2">Why pet owners trust us</h3>
        <p className="text-xs md:text-sm text-muted-foreground font-body">Simple, transparent pet care</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {guarantees.map((g, index) => (
          <div 
            key={index}
            className="bg-muted rounded-xl p-4 md:p-5 border border-border hover:shadow-sm transition-shadow"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mb-3 md:mb-4">
              <g.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
            <h4 className="font-bold text-foreground text-sm md:text-base mb-1 md:mb-2 font-body">{g.name}</h4>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed font-body">{g.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
