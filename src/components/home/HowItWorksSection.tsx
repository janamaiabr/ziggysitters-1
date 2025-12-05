import { Search, Calendar, Heart } from 'lucide-react';

const steps = [
  {
    icon: Search,
    number: "1",
    title: "Search",
    description: "Enter your suburb and dates to find verified sitters near you",
    color: "from-purple-500 to-indigo-500"
  },
  {
    icon: Calendar,
    number: "2", 
    title: "Book",
    description: "Choose your sitter, select services, and book securely online",
    color: "from-indigo-500 to-blue-500"
  },
  {
    icon: Heart,
    number: "3",
    title: "Relax",
    description: "Get daily photo updates and enjoy peace of mind",
    color: "from-blue-500 to-cyan-500"
  }
];

export default function HowItWorksSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-purple-50/50 dark:from-gray-900 dark:to-purple-950/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <span className="inline-block px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium mb-4">
            Simple & Easy
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              How It Works
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Book trusted pet care in just 3 simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="relative group"
            >
              {/* Connector line - hidden on mobile */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-1/2 w-full h-0.5 bg-gradient-to-r from-purple-200 to-blue-200 dark:from-purple-800 dark:to-blue-800" />
              )}
              
              <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-purple-100 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-600 group-hover:-translate-y-2">
                {/* Number badge */}
                <div className={`absolute -top-4 -right-4 w-10 h-10 rounded-full bg-gradient-to-r ${step.color} text-white font-bold text-lg flex items-center justify-center shadow-lg`}>
                  {step.number}
                </div>
                
                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold mb-3 text-foreground">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
