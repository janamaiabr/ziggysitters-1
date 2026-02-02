import { useNavigate } from "react-router-dom";
import SEOHead from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Shield, Heart, ArrowRight, CheckCircle, Star, Camera, Users } from "lucide-react";

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
      <section className="bg-gradient-to-b from-emerald-50 to-background dark:from-emerald-950/20 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700 px-4 py-2">
              <Shield className="w-4 h-4 mr-2" />
              100% NZ-Based
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Trusted NZ Sitters</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every ZiggySitters pet sitter lives in New Zealand, is verified with NZ documents, and has been personally vetted. Meet some of our amazing team.
            </p>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-12 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-3">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-white text-sm">Local to NZ</h4>
              <p className="text-xs text-white/70">Every sitter lives here</p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-3">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-white text-sm">ID Verified</h4>
              <p className="text-xs text-white/70">NZ document checks</p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-3">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-white text-sm">Daily Updates</h4>
              <p className="text-xs text-white/70">Photo reports included</p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-3">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-white text-sm">Pet Lovers</h4>
              <p className="text-xs text-white/70">Genuine animal lovers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sitter Profiles Grid */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet Our Sitters</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real Kiwis who are passionate about caring for your pets
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {sitterProfiles.map((sitter) => (
              <Card key={sitter.name} className="overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden shadow-lg flex-shrink-0">
                      <img src={sitter.image} alt={sitter.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold">{sitter.name}</h3>
                        {sitter.verified && (
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {sitter.location}
                      </div>
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                    {sitter.bio}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {sitter.specialties.map((spec) => (
                      <Badge key={spec} variant="secondary" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-bold text-sm">{sitter.rating}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{sitter.experience} experience</span>
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
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
      <section className="py-16 bg-gradient-to-br from-emerald-800 to-teal-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-10 left-10 text-8xl animate-float">&#x1F33F;</div>
          <div className="absolute bottom-10 right-10 text-7xl animate-float" style={{ animationDelay: "1s" }}>&#x1F43E;</div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Find Your Perfect NZ Sitter
          </h2>
          <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
            Browse all our verified sitters and find the perfect match for your pet.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/find-sitters")}
              className="gap-2 bg-white text-emerald-800 hover:bg-white/90 font-bold px-10 py-6 text-lg shadow-xl"
            >
              Browse All Sitters
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              size="lg"
              onClick={() => navigate("/become-sitter")}
              className="bg-emerald-500 text-white hover:bg-emerald-400 font-semibold px-10 py-6 text-lg border-2 border-emerald-400"
            >
              Join as a Sitter
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
