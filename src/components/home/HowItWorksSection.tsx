import iconPaw from '@/assets/icons/icon-paw.png';
import iconHeart from '@/assets/icons/icon-heart.png';
import iconPayment from '@/assets/icons/icon-payment.png';
import iconCamera from '@/assets/icons/icon-camera.png';
import iconShield from '@/assets/icons/icon-shield.png';
import iconNum1 from '@/assets/icons/icon-num-1.png';
import iconNum2 from '@/assets/icons/icon-num-2.png';
import iconNum3 from '@/assets/icons/icon-num-3.png';
import iconNum4 from '@/assets/icons/icon-num-4.png';

import stepTellUs from '@/assets/home/step-tell-us.jpg';
import stepMeetGreet from '@/assets/home/step-meet-greet.jpg';
import stepBook from '@/assets/home/step-book.jpg';
import stepUpdates from '@/assets/home/step-updates.jpg';

const steps = [
  {
    title: "Tell Us About Your Pet",
    description: "Share your pet's personality, quirks, and needs — so we can find the right match",
    image: stepTellUs,
    icon: iconPaw,
    numIcon: iconNum1,
  },
  {
    title: "Free Meet & Greet",
    description: "See the chemistry in person — let your pet and their sitter connect before you commit",
    highlight: true,
    image: stepMeetGreet,
    icon: iconHeart,
    numIcon: iconNum2,
  },
  {
    title: "Book Your Match",
    description: "94% of owners book after their first meet & greet — secure your sitter with confidence",
    image: stepBook,
    icon: iconPayment,
    numIcon: iconNum3,
  },
  {
    title: "Watch the Bond Grow",
    description: "Receive morning & evening updates with photos, behavioural notes, and daily care tracking",
    image: stepUpdates,
    icon: iconCamera,
    numIcon: iconNum4,
  }
];

const trustBadges = [
  { icon: iconShield, text: "ID Vetted Sitters" },
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
            <div key={index} className="flex items-center gap-2.5 px-5 py-2.5 bg-card rounded-full shadow-sm border border-border">
              <img src={badge.icon} alt="" className="w-7 h-7" />
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
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  
                  {/* Vintage number badge on image */}
                  <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3">
                    <img src={step.numIcon} alt="" className="w-10 h-10 md:w-14 md:h-14 drop-shadow-lg" />
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-3 md:p-5">
                  <div className="hidden md:flex w-12 h-12 rounded-xl bg-vintage-cream items-center justify-center mb-3">
                    <img src={step.icon} alt="" className="w-8 h-8" />
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
