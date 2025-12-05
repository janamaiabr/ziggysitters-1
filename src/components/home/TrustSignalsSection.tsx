import { Shield, CreditCard, RefreshCcw, Lock, Heart, CheckCircle } from 'lucide-react';

const trustBadges = [
  {
    icon: Shield,
    title: "Verified Sitters",
    description: "All sitters are ID verified"
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description: "Powered by Stripe"
  },
  {
    icon: RefreshCcw,
    title: "Flexible Cancellation",
    description: "Cancel up to 48hrs before"
  },
  {
    icon: Lock,
    title: "Data Protected",
    description: "Your info is secure"
  },
  {
    icon: Heart,
    title: "5% to SPCA NZ",
    description: "We donate from every booking"
  },
  {
    icon: CheckCircle,
    title: "Report Guarantee",
    description: "Updates or 15% refund"
  }
];

export default function TrustSignalsSection() {
  return (
    <section className="py-12 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {trustBadges.map((badge, index) => (
            <div 
              key={index}
              className="flex flex-col items-center text-center p-4 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-3">
                <badge.icon className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-white text-sm mb-1">{badge.title}</h4>
              <p className="text-xs text-white/80">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
