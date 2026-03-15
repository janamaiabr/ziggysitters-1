import iconShield from '@/assets/icons/icon-shield.png';
import iconCreditcard from '@/assets/icons/icon-creditcard.png';
import iconRefresh from '@/assets/icons/icon-refresh.png';
import iconLock from '@/assets/icons/icon-lock.png';
import iconHeart from '@/assets/icons/icon-heart.png';
import iconCheck from '@/assets/icons/icon-check.png';

const trustBadges = [
  {
    icon: iconShield,
    title: "Vetted Sitters",
    description: "All sitters are ID vetted"
  },
  {
    icon: iconCreditcard,
    title: "Secure Payments",
    description: "Powered by Stripe"
  },
  {
    icon: iconRefresh,
    title: "Flexible Cancellation",
    description: "Cancel up to 48hrs before"
  },
  {
    icon: iconLock,
    title: "Data Protected",
    description: "Your info is secure"
  },
  {
    icon: iconHeart,
    title: "5% to SPCA NZ",
    description: "We donate from every booking"
  },
  {
    icon: iconCheck,
    title: "Report Guarantee",
    description: "Updates or 15% refund"
  }
];

export default function TrustSignalsSection() {
  return (
    <section className="py-12 md:py-16 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {trustBadges.map((badge, index) => (
            <div 
              key={index}
              className="flex flex-col items-center text-center p-4 rounded-xl bg-secondary-foreground/5 hover:bg-secondary-foreground/10 transition-all duration-300"
            >
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-secondary-foreground/10 flex items-center justify-center mb-3">
                <img src={badge.icon} alt="" className="w-9 h-9 md:w-10 md:h-10" />
              </div>
              <h4 className="font-semibold text-secondary-foreground text-sm mb-1 font-body">{badge.title}</h4>
              <p className="text-xs text-secondary-foreground/60 font-body">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
