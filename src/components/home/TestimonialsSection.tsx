import iconStar from '@/assets/icons/icon-star.png';
import testimonialSarah from '@/assets/testimonial-sarah.jpg';
import testimonialJames from '@/assets/testimonial-james.jpg';
import testimonialEmma from '@/assets/testimonial-emma.jpg';

const testimonials = [
  {
    name: "Sarah M.",
    location: "Ponsonby, Auckland",
    avatar: testimonialSarah,
    rating: 5,
    text: "The daily photo updates were amazing! I was so worried leaving my cat for the first time, but seeing her happy every day made my holiday stress-free. Will definitely use ZiggySitters again!",
    petType: "Cat owner"
  },
  {
    name: "James T.",
    location: "Grey Lynn, Auckland",
    avatar: testimonialJames,
    rating: 5,
    text: "Found a wonderful sitter for my two dogs. The booking process was so easy, and the sitter sent photos and videos every single day. My dogs were clearly having a blast!",
    petType: "Dog owner"
  },
  {
    name: "Emma L.",
    location: "Hamilton",
    avatar: testimonialEmma,
    rating: 5,
    text: "Best pet sitting service in NZ! The accountability guarantee gave me confidence - knowing the sitter's payment depends on sending updates. My bunny was so well cared for.",
    petType: "Rabbit owner"
  }
];

export default function TestimonialsSection() {
  return (
    <section className="py-16 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3 font-body">Testimonials</p>
          <h2 className="text-3xl md:text-5xl font-display mb-3 md:mb-4 text-foreground">
            Loved by Pet Parents
          </h2>
          <p className="text-sm md:text-lg text-muted-foreground max-w-xl mx-auto font-body">
            Real stories from pet owners across New Zealand
          </p>
        </div>

        <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-8 max-w-5xl mx-auto overflow-x-auto pb-4 md:pb-0 -mx-4 px-4 md:mx-auto snap-x snap-mandatory scrollbar-hide">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative bg-card rounded-2xl p-6 md:p-8 border border-border hover:shadow-lg transition-all duration-300 group min-w-[300px] md:min-w-0 flex-shrink-0 md:flex-shrink snap-center"
            >
              <div className="flex gap-0.5 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <img key={i} src={iconStar} alt="" className="w-5 h-5" />
                ))}
              </div>

              <p className="text-sm md:text-[15px] text-muted-foreground mb-6 leading-relaxed line-clamp-4 md:line-clamp-none font-body italic">
                "{testimonial.text}"
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  loading="lazy"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-foreground text-sm font-body">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground font-body">{testimonial.location} · {testimonial.petType}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
