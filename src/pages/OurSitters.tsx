import { useNavigate } from "react-router-dom";
import SEOHead from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import iconLocation from "@/assets/icons/icon-location.png";
import iconShield from "@/assets/icons/icon-shield.png";
import iconHeart from "@/assets/icons/icon-heart.png";
import iconCheck from "@/assets/icons/icon-check.png";
import iconStar from "@/assets/icons/icon-star.png";
import iconCamera from "@/assets/icons/icon-camera.png";

const sitterProfiles = [
  {
    name: "Sarah M.",
    location: "Ponsonby, Auckland",
    bio: "Dog mum of two rescue pups. I treat every pet like my own family. Walking, feeding, and endless cuddles guaranteed!",
    specialties: ["Dogs", "Cats", "Small Pets"],
    experience: "5+ years",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=face",
    verified: true,
    rating: 5.0,
  },
  {
    name: "James T.",
    location: "Kelburn, Wellington",
    bio: "Retired teacher who loves animals. My garden is fully fenced and I have experience with anxious and senior pets.",
    specialties: ["Dogs", "Cats", "Birds"],
    experience: "8+ years",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
    verified: true,
    rating: 4.9,
  },
  {
    name: "Aroha K.",
    location: "Merivale, Christchurch",
    bio: "Vet nurse by day, pet sitter on weekends. Your pets get professional-level care and all the aroha they deserve.",
    specialties: ["Dogs", "Cats", "Reptiles"],
    experience: "6+ years",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face",
    verified: true,
    rating: 5.0,
  },
  {
    name: "Mike R.",
    location: "Hamilton East, Hamilton",
    bio: "Keen outdoors person with a big backyard. I love taking dogs on trail walks along the Waikato River. Active pets welcome!",
    specialties: ["Dogs", "Large Breeds"],
    experience: "4+ years",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
    verified: true,
    rating: 4.8,
  },
  {
    name: "Emma L.",
    location: "Mount Maunganui, Tauranga",
    bio: "Beach lover with three cats of my own. I specialise in cat care and understand how felines really tick. Indoor and outdoor cats welcome.",
    specialties: ["Cats", "Small Pets", "Birds"],
    experience: "3+ years",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=face",
    verified: true,
    rating: 4.9,
  },
  {
    name: "David W.",
    location: "Roslyn, Dunedin",
    bio: "Animal lover and university lecturer. Quiet, safe home perfect for nervous or senior pets. Daily photo updates always included.",
    specialties: ["Dogs", "Cats", "Senior Pets"],
    experience: "7+ years",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face",
    verified: true,
    rating: 5.0,
  },
];

export default function OurSitters() {
  const navigate = useNavigate();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "ZiggySitters - Our NZ-Based Pet Sitters",
    "description": "Meet our trusted, vetted, 100% New Zealand-based pet sitters",
    "numberOfItems": sitterProfiles.length,
  };

  return (
    <>
      <SEOHead
        title="Our Sitters | 100% NZ-Based Pet Sitters | ZiggySitters"
        description="Meet our trusted, vetted, 100% New Zealand-based pet sitters. Local sitters across Auckland, Wellington, Christchurch, Hamilton, Tauranga and Dunedin."
        keywords="nz pet sitters, new zealand pet sitters, trusted pet sitters, verified pet sitters nz, local pet care"
        canonical="/our-sitters"
        structuredData={structuredData}
      />

      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1544568100-847a948585b9?w=1600&h=800&fit=crop" alt="Happy pets with sitters" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        </div>
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest mb-4 font-body" style={{ color: 'hsl(152 45% 55%)' }}>100% NZ-Based</p>
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-[1.1] mb-6 font-display">
              Our Trusted NZ Sitters
            </h1>
            <p className="text-lg text-white/80 font-body max-w-xl">
              Every ZiggySitters pet sitter lives in New Zealand, is verified with NZ documents, and has been personally vetted.
            </p>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-12 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { icon: iconLocation, label: "Local to NZ", desc: "Every sitter lives here" },
              { icon: iconCheck, label: "ID Verified", desc: "NZ document checks" },
              { icon: iconCamera, label: "Daily Updates", desc: "Photo reports included" },
              { icon: iconHeart, label: "Pet Lovers", desc: "Genuine animal lovers" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center p-4">
                <img src={item.icon} alt="" className="w-10 h-10 mb-3 brightness-0 invert" />
                <h4 className="font-bold text-secondary-foreground text-sm font-body">{item.label}</h4>
                <p className="text-xs text-secondary-foreground/60 font-body">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sitter Profiles Grid */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3 font-body">Our team</p>
            <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">Meet Our Sitters</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-body">
              Real Kiwis who are passionate about caring for your pets
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {sitterProfiles.map((sitter) => (
              <Card key={sitter.name} className="overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 border border-border">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden shadow-lg flex-shrink-0">
                      <img src={sitter.image} alt={sitter.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold font-display text-foreground">{sitter.name}</h3>
                        {sitter.verified && (
                          <img src={iconCheck} alt="Verified" className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground font-body">
                        <img src={iconLocation} alt="" className="w-3 h-3" />
                        {sitter.location}
                      </div>
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-4 text-sm leading-relaxed font-body">
                    {sitter.bio}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {sitter.specialties.map((spec) => (
                      <Badge key={spec} variant="secondary" className="text-xs font-body">
                        {spec}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-1">
                      <img src={iconStar} alt="" className="w-4 h-4" />
                      <span className="font-bold text-sm font-body text-foreground">{sitter.rating}</span>
                    </div>
                    <span className="text-xs text-muted-foreground font-body">{sitter.experience} experience</span>
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-body">
                      NZ Verified
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-6">
            Find Your Perfect NZ Sitter
          </h2>
          <p className="text-xl text-secondary-foreground/60 mb-8 max-w-2xl mx-auto font-body">
            Browse all our verified sitters and find the perfect match for your pet.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/find-sitters")}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-body font-bold px-10 py-6 text-lg shadow-xl"
            >
              Browse All Sitters
              <span className="ml-2">→</span>
            </Button>
            <Button
              size="lg"
              variant="outline-white"
              onClick={() => navigate("/become-sitter")}
              className="font-body px-10 py-6 text-lg"
            >
              Join as a Sitter
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
