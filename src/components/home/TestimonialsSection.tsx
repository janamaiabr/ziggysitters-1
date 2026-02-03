import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: "Sarah M.",
    location: "Ponsonby, Auckland",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    text: "My anxious rescue cat Milo was matched with a sitter who specialises in nervous pets. The morning and evening updates showed him settling more each day — by day three he was purring on her lap. We've rebooked three times now!",
    petType: "🐱 Cat owner"
  },
  {
    name: "James T.",
    location: "Grey Lynn, Auckland", 
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    text: "ZiggySitters matched my two energetic dogs with someone who truly gets high-energy breeds. The meet-and-greet sealed it — the bond was instant. Daily updates tracking their mood and energy gave us total peace of mind.",
    petType: "🐕 Dog owner"
  },
  {
    name: "Emma L.",
    location: "Hamilton",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    text: "The personality matching is what sets ZiggySitters apart. Our senior rabbit needed gentle, patient care and that's exactly what we got. Watching the bond grow through daily updates was so reassuring. Found our person!",
    petType: "🐰 Rabbit owner"
  }
];

export default function TestimonialsSection() {
  return (
    <section className="py-10 md:py-24 bg-gradient-to-b from-purple-50/50 to-white dark:from-purple-950/20 dark:to-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6 md:mb-16">
          <span className="inline-block px-3 py-1.5 md:px-4 md:py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-xs md:text-sm font-medium mb-3 md:mb-4">
            ⭐ 4.9/5 Average Rating
          </span>
          <h2 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Where pets find their person
            </span>
          </h2>
          <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Real stories of personality matches that just clicked
          </p>
        </div>

        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-8 max-w-6xl mx-auto overflow-x-auto pb-4 md:pb-0 -mx-4 px-4 md:mx-auto snap-x snap-mandatory scrollbar-hide">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="relative bg-white dark:bg-gray-900 rounded-xl md:rounded-2xl p-4 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-purple-100 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-600 group min-w-[280px] md:min-w-0 flex-shrink-0 md:flex-shrink snap-center"
            >
              {/* Quote icon */}
              <div className="absolute -top-3 -left-1 md:-top-4 md:-left-2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
                <Quote className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              
              {/* Stars */}
              <div className="flex gap-0.5 md:gap-1 mb-3 md:mb-4 pt-2">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 md:w-5 md:h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              {/* Testimonial text - truncated on mobile */}
              <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6 leading-relaxed line-clamp-3 md:line-clamp-none">
                &ldquo;{testimonial.text}&rdquo;
              </p>
              
              {/* Author */}
              <div className="flex items-start gap-3">
                <div>
                  <p className="font-semibold text-foreground text-sm md:text-base">{testimonial.name}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">{testimonial.location}</p>
                  <p className="text-xs text-purple-600 dark:text-purple-400">{testimonial.petType}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
