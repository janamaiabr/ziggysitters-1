import iconShield from '@/assets/icons/icon-shield.png';
import iconCamera from '@/assets/icons/icon-camera.png';
import iconMappin from '@/assets/icons/icon-mappin.png';
import iconHeart from '@/assets/icons/icon-heart.png';

const guarantees = [
  {
    icon: iconShield,
    name: 'ID Verified Sitters',
    description: 'Every sitter provides government ID. Real people, verified locally.',
  },
  {
    icon: iconCamera,
    name: 'Daily Photo Updates',
    description: "See your pet's day — photos, meal notes, mood, and activity updates.",
  },
  {
    icon: iconMappin,
    name: 'Local to Your Area',
    description: 'Sitters in your neighbourhood who know the parks, vets, and your community.',
  },
  {
    icon: iconHeart,
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
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-vintage-cream flex items-center justify-center flex-shrink-0 mb-3 md:mb-4">
              <img src={g.icon} alt="" className="w-9 h-9 md:w-10 md:h-10" />
            </div>
            <h4 className="font-bold text-foreground text-sm md:text-base mb-1 md:mb-2 font-body">{g.name}</h4>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed font-body">{g.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
