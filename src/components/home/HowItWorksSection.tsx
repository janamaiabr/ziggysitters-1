import { Check } from 'lucide-react';

import iconPaw from '@/assets/icons/icon-paw.png';
import iconHeart from '@/assets/icons/icon-heart.png';
import iconPayment from '@/assets/icons/icon-payment.png';
import iconCamera from '@/assets/icons/icon-camera.png';
import iconShield from '@/assets/icons/icon-shield.png';

const steps = [
  {
    number: "1",
    title: "Tell Us About Your Pet",
    description: "Share your pet's personality, quirks, and needs — so we can find the right match",
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=250&fit=crop",
    icon: iconPaw,
  },
  {
    number: "2",
    title: "Free Meet & Greet",
    description: "See the chemistry in person — let your pet and their sitter connect before you commit",
    highlight: true,
    image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=250&fit=crop",
    icon: iconHeart,
  },
  {
    number: "3",
    title: "Book Your Match",
    description: "94% of owners book after their first meet & greet — secure your sitter with confidence",
    image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=250&fit=crop",
    icon: iconPayment,
  },
  {
    number: "4",
    title: "Watch the Bond Grow",
    description: "Receive morning & evening updates with photos, behavioural notes, and daily care tracking",
    image: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&h=250&fit=crop",
    icon: iconCamera,
  }
];

const trustBadges = [
  { icon: iconShield, text: "ID Verified Sitters" },
  { icon: iconPayment, text: "Secure Payment Protection" },
  { icon: iconCamera, text: "Daily Update Promise" }
];

export default function HowItWorksSection() {
  return (
    <section className="py-16 md:py-28 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3 font-body">
            Simple & Secure
          </p>
          <h2 className="text-2xl md:text-4xl font-bold font-display text-foreground mb-2 md:mb-4">
            How It Works
          </h2>
          <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto font-body">
            Book trusted pet care in 4 easy steps
          </p>
        </div>

        {/* Trust badges - hidden on mobile */}
        <div className="hidden md:flex flex-wrap justify-center gap-4 md:gap-6 mb-12">
          {trustBadges.map((badge, index) => (
            <div key={index} className="flex items-center gap-2 px-4 py-2 bg-card rounded-full shadow-sm border border-border">
              <img src={badge.icon} alt="" className="w-5 h-5" />
              <span className="text-sm font-medium text-foreground font-body">{badge.text}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="relative group"
            >
              <div className={`relative bg-card rounded-xl md:rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border ${step.highlight ? 'border-primary ring-2 ring-primary/20' : 'border-border'} hover:border-primary/30 group-hover:-translate-y-1`}>
                {/* Free badge for meet & greet */}
                {step.highlight && (
                  <div className="absolute top-1.5 left-1.5 md:top-2 md:left-2 z-20 bg-primary text-primary-foreground text-[10px] md:text-xs font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded-full font-body">
                    FREE
                  </div>
                )}
                {/* Image */}
                <div className="relative h-24 md:h-36 overflow-hidden">
                  <img 
                    src={step.image} 
                    alt={step.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  
                  {/* Number badge on image */}
                  <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 w-7 h-7 md:w-9 md:h-9 rounded-full bg-primary text-primary-foreground font-bold text-sm md:text-base flex items-center justify-center shadow-lg font-body">
                    {step.number}
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-3 md:p-5">
                  <div className="hidden md:flex w-10 h-10 rounded-xl bg-primary/10 items-center justify-center mb-3">
                    <img src={step.icon} alt="" className="w-6 h-6" />
                  </div>
                  
                  <h3 className="text-sm md:text-lg font-bold mb-1 md:mb-2 text-foreground font-body">{step.title}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed line-clamp-2 md:line-clamp-none font-body">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
