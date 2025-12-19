import { Search, UserCheck, CreditCard, Camera, Shield, CheckCircle } from 'lucide-react';

const steps = [
  {
    icon: Search,
    number: "1",
    title: "Search Sitters",
    description: "Enter your suburb and dates to find verified local pet lovers near you",
    color: "from-teal-500 to-cyan-500",
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=250&fit=crop"
  },
  {
    icon: UserCheck,
    number: "2", 
    title: "Review Profiles",
    description: "Read reviews, view photos, and choose the perfect match for your pet",
    color: "from-cyan-500 to-blue-500",
    image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=250&fit=crop"
  },
  {
    icon: CreditCard,
    number: "3",
    title: "Book & Pay Securely",
    description: "Simple, transparent pricing with no hidden fees — pay safely online",
    color: "from-blue-500 to-indigo-500",
    image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=250&fit=crop"
  },
  {
    icon: Camera,
    number: "4",
    title: "Daily Photo Updates",
    description: "Receive guaranteed daily photos — because they're part of your family",
    color: "from-indigo-500 to-violet-500",
    image: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&h=250&fit=crop"
  }
];

const trustBadges = [
  { icon: Shield, text: "Verified Sitters" },
  { icon: CheckCircle, text: "Secure Payments" },
  { icon: Camera, text: "Daily Updates Guaranteed" }
];

export default function HowItWorksSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white via-teal-50/30 to-blue-50/50 dark:from-gray-900 dark:via-teal-950/10 dark:to-blue-950/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <span className="inline-block px-4 py-2 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-full text-sm font-medium mb-4">
            Simple & Secure
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
              How It Works
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Book trusted pet care in 4 easy steps — with complete peace of mind
          </p>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-12">
          {trustBadges.map((badge, index) => (
            <div key={index} className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-sm border border-teal-100 dark:border-teal-800">
              <badge.icon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{badge.text}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="relative group"
            >
              {/* Connector line - hidden on mobile and tablet */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-24 left-1/2 w-full h-0.5 bg-gradient-to-r from-teal-200 to-blue-200 dark:from-teal-800 dark:to-blue-800" />
              )}
              
              <div className="relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-teal-100 dark:border-teal-800 hover:border-teal-300 dark:hover:border-teal-600 group-hover:-translate-y-2">
                {/* Image */}
                <div className="relative h-32 md:h-36 overflow-hidden">
                  <img 
                    src={step.image} 
                    alt={step.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  
                  {/* Number badge on image */}
                  <div className={`absolute bottom-3 right-3 w-9 h-9 rounded-full bg-gradient-to-r ${step.color} text-white font-bold text-base flex items-center justify-center shadow-lg`}>
                    {step.number}
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-5">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${step.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                    <step.icon className="w-5 h-5 text-white" />
                  </div>
                  
                  <h3 className="text-lg font-bold mb-2 text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom assurance message */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground italic">
            "Real local pet lovers, verified and endorsed for your peace of mind"
          </p>
        </div>
      </div>
    </section>
  );
}
