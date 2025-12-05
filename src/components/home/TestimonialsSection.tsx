import { Star, Quote } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const testimonials = [
  {
    name: "Sarah M.",
    location: "Ponsonby, Auckland",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    text: "The daily photo updates were amazing! I was so worried leaving my cat for the first time, but seeing her happy every day made my holiday stress-free. Will definitely use ZiggySitters again!",
    petType: "🐱 Cat owner"
  },
  {
    name: "James T.",
    location: "Grey Lynn, Auckland", 
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    text: "Found a wonderful sitter for my two dogs. The booking process was so easy, and the sitter sent photos and videos every single day. My dogs were clearly having a blast!",
    petType: "🐕 Dog owner"
  },
  {
    name: "Emma L.",
    location: "Hamilton",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    text: "Best pet sitting service in NZ! The accountability guarantee gave me confidence - knowing the sitter's payment depends on sending updates. My bunny was so well cared for.",
    petType: "🐰 Rabbit owner"
  }
];

export default function TestimonialsSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-purple-50/50 to-white dark:from-purple-950/20 dark:to-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <span className="inline-block px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-sm font-medium mb-4">
            ⭐ 4.9/5 Average Rating
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Loved by Pet Parents
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See what other pet owners are saying about ZiggySitters
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="relative bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-purple-100 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-600 group"
            >
              {/* Quote icon */}
              <div className="absolute -top-4 -left-2 w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
                <Quote className="w-5 h-5 text-white" />
              </div>
              
              {/* Stars */}
              <div className="flex gap-1 mb-4 pt-2">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              {/* Testimonial text */}
              <p className="text-muted-foreground mb-6 leading-relaxed">
                "{testimonial.text}"
              </p>
              
              {/* Author */}
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-purple-200">
                  <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                  <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.location}</p>
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
