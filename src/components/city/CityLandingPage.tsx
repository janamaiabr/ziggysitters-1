import { useNavigate } from "react-router-dom";
import SEOHead from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Shield, Heart, ArrowRight, Check, Home, Clock, Users, Star, Camera, Leaf } from "lucide-react";
import { CityData } from "@/data/cityData";

interface CityLandingPageProps {
  city: CityData;
}

export default function CityLandingPage({ city }: CityLandingPageProps) {
  const navigate = useNavigate();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "ZiggySitters - " + city.name + " Pet Sitters",
    "description": "Trusted local pet sitting service in " + city.name + ", New Zealand. Find verified pet sitters for dogs, cats, and all pets.",
    "areaServed": {
      "@type": "City",
      "name": city.name,
      "containedInPlace": {
        "@type": "Country",
        "name": "New Zealand"
      }
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": city.name,
      "addressCountry": "NZ"
    },
    "priceRange": "$55-95/day",
    "serviceType": ["Pet Sitting", "House Sitting", "Drop-in Visits", "Pet Care"]
  };

  return (
    <>
      <SEOHead
        title={city.metaTitle}
        description={city.metaDescription}
        keywords={city.metaKeywords}
        canonical={"/pet-sitting-" + city.slug}
        structuredData={structuredData}
      />

      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900" />

        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-10 left-10 text-8xl animate-float">&#x1F33F;</div>
          <div className="absolute top-32 right-20 text-6xl animate-float" style={{ animationDelay: "1s" }}>&#x1F33F;</div>
          <div className="absolute bottom-20 left-1/4 text-7xl animate-float" style={{ animationDelay: "2s" }}>&#x1F43E;</div>
        </div>

        <div className="container mx-auto px-4 relative z-10 py-20">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <Badge className="bg-white/10 text-white border-white/20 backdrop-blur-sm px-4 py-2 text-sm">
                <MapPin className="w-4 h-4 mr-2" />
                100% NZ-Based Sitters
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 backdrop-blur-sm px-4 py-2 text-sm">
                <Leaf className="w-4 h-4 mr-2" />
                {city.maoriName}
              </Badge>
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-white">
              {"Pet Sitting in " + city.name + " \u2014 Trusted Local Sitters"}
            </h1>

            <p className="text-xl text-white/80 mb-8 max-w-xl leading-relaxed">
              {city.heroDescription}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Button
                size="lg"
                onClick={() => navigate("/find-sitters")}
                className="gap-2 bg-white text-emerald-900 hover:bg-white/90 font-bold text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all hover:scale-105"
              >
                Find a Sitter in {city.name}
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                size="lg"
                onClick={() => navigate("/become-sitter")}
                className="bg-emerald-500 text-white hover:bg-emerald-400 font-semibold px-8 py-6 border-2 border-emerald-400"
              >
                Become a Sitter
              </Button>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-white/70">
              <span className="flex items-center gap-2 bg-emerald-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-emerald-400/30">
                <Camera className="w-5 h-5 text-emerald-300" /> Daily Photo Updates
              </span>
              <span className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full">
                <Check className="w-5 h-5 text-emerald-400" /> NZ ID Verified
              </span>
              <span className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full">
                <Star className="w-5 h-5 text-emerald-400" /> Trusted Reviews
              </span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" className="w-full">
            <path d="M0,64 C480,120 960,0 1440,64 L1440,120 L0,120 Z" fill="hsl(var(--background))" />
          </svg>
        </div>
      </section>

      {/* Local Context Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {"Why Choose Local Pet Sitters in " + city.name + "?"}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {city.localContext}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center p-8 border-2 hover:border-emerald-500/50 transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Local Knowledge</h3>
                <p className="text-muted-foreground">
                  {"Sitters who know " + city.name + "\u2019s best parks, vet clinics, and pet-friendly spots inside out."}
                </p>
              </Card>

              <Card className="text-center p-8 border-2 hover:border-emerald-500/50 transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">NZ Verified</h3>
                <p className="text-muted-foreground">
                  Every sitter is verified with NZ documents. Real locals you can trust with your home and pets.
                </p>
              </Card>

              <Card className="text-center p-8 border-2 hover:border-emerald-500/50 transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Family Values</h3>
                <p className="text-muted-foreground">
                  Your pets are treated like family, not just another booking. The Kiwi way of caring.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Neighbourhoods Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700">
              <MapPin className="w-4 h-4 mr-2" />
              {"Covering All of " + city.name}
            </Badge>
            <h2 className="text-3xl font-bold mb-4">
              {"Pet Sitters Across " + city.name + " Neighbourhoods"}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {"Our sitters are spread across " + city.name + " so you can always find someone nearby."}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {city.neighborhoods.map((suburb) => (
                <span
                  key={suburb}
                  className="px-4 py-2.5 bg-card border border-border rounded-xl text-sm font-medium hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-600 hover:border-emerald-300 transition-all cursor-default"
                >
                  {suburb}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Parks & Vet Info */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="text-2xl">&#x1F333;</span> {"Popular Parks in " + city.name}
              </h3>
              <div className="space-y-3">
                {city.parks.map((park) => (
                  <div key={park} className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
                    <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span className="font-medium">{park}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="text-2xl">&#x1FA7A;</span> Local Vet Services
              </h3>
              <div className="p-6 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <p className="text-muted-foreground leading-relaxed">
                  {city.vetInfo}
                </p>
              </div>
              <div className="mt-6 p-6 bg-purple-50 dark:bg-purple-950/20 rounded-xl border border-purple-200 dark:border-purple-800">
                <h4 className="font-bold mb-2">Our Sitters Know the Area</h4>
                <p className="text-muted-foreground">
                  {"Every ZiggySitters sitter in " + city.name + " is familiar with local emergency vet locations and can respond quickly if your pet needs care."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              {"Pet Care Services in " + city.name}
            </h2>
            <p className="text-lg text-muted-foreground">
              Choose the care that suits your pet best
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="p-6 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 w-fit mb-4">
                <Home className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">House Sitting</h3>
              <p className="text-muted-foreground mb-4">
                Your sitter stays overnight in your home. Pets stay comfortable in their own environment.
              </p>
              <p className="text-2xl font-bold text-emerald-600">From $65<span className="text-sm font-normal text-muted-foreground">/night</span></p>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/40 w-fit mb-4">
                <Clock className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Drop-in Visits</h3>
              <p className="text-muted-foreground mb-4">
                Daily visits for feeding, cuddles, and playtime. Perfect for cats and independent pets.
              </p>
              <p className="text-2xl font-bold text-teal-600">From $35<span className="text-sm font-normal text-muted-foreground">/visit</span></p>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/40 w-fit mb-4">
                <Users className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Pet Boarding</h3>
              <p className="text-muted-foreground mb-4">
                {"Your pet stays at the sitter\u2019s home. Great for social pets who love company."}
              </p>
              <p className="text-2xl font-bold text-cyan-600">From $55<span className="text-sm font-normal text-muted-foreground">/night</span></p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800" />
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-10 left-10 text-8xl animate-float">&#x1F33F;</div>
          <div className="absolute bottom-10 right-10 text-7xl animate-bounce-slow" style={{ animationDelay: "1s" }}>&#x1F43E;</div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            {"Ready to Find Your Perfect "}
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-300">
              {city.name + " Sitter?"}
            </span>
          </h2>
          <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">
            {"Join pet owners across " + city.name + " who trust ZiggySitters with their fur babies. Book your next holiday worry-free."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/find-sitters")}
              className="gap-2 bg-white text-emerald-800 hover:bg-white/90 font-bold px-10 py-6 text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
            >
              Find Sitters Near Me
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              size="lg"
              onClick={() => navigate("/become-sitter")}
              className="bg-emerald-500 text-white hover:bg-emerald-400 font-semibold px-10 py-6 text-lg border-2 border-emerald-400"
            >
              Become a Sitter
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
