import { Shield, Camera, MapPin, Heart } from 'lucide-react';

interface TrustGuarantee {
  icon: React.ElementType;
  name: string;
  description: string;
}

const guarantees: TrustGuarantee[] = [
  {
    icon: Shield,
    name: 'ID Verified Sitters',
    description: 'Every sitter provides government ID. Real people, verified locally.',
  },
  {
    icon: Camera,
    name: 'Daily Photo Updates',
    description: 'See your pet\'s day — photos, meal notes, mood, and activity updates.',
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
  }
];

export default function TrustGuarantees() {
  return (
    <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-8 border border-gray-200 shadow-sm">
      <div className="text-center mb-4 md:mb-6">
        <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">Why pet owners trust us</h3>
        <p className="text-xs md:text-sm text-gray-500">Simple, transparent pet care</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        {guarantees.map((guarantee, index) => (
          <div 
            key={index}
            className="bg-[#fafbfa] rounded-xl p-3.5 md:p-5 border border-gray-100 hover:shadow-sm transition-shadow"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 mb-3 md:mb-4">
              <guarantee.icon className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm md:text-base mb-0.5 md:mb-2">{guarantee.name}</h4>
              <p className="text-xs md:text-sm text-gray-500 leading-relaxed">{guarantee.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
