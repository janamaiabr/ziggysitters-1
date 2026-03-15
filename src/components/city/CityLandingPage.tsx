import { useNavigate } from "react-router-dom";
import SEOHead from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Shield, Heart, ArrowRight, Check, Home, Clock, Users, Star, Camera, CheckCircle } from "lucide-react";
import { CityData } from "@/data/cityData";

interface CityLandingPageProps {
  city: CityData;
}

const AU_CITIES = ["sunshine-coast", "brisbane", "gold-coast"];

export default function CityLandingPage({ city }: CityLandingPageProps) {
  const navigate = useNavigate();
  const isAU = AU_CITIES.includes(city.slug);
  const countryName = isAU ? "Australia" : "New Zealand";
  const countryCode = isAU ? "AU" : "NZ";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "ZiggySitters - " + city.name + " Pet Sitters",
    "description": "Trusted local pet sitting service in " + city.name + ", " + countryName + ". Find verified pet sitters for dogs, cats, and all pets.",
    "areaServed": {
      "@type": "City",
      "name": city.name,
      "containedInPlace": {
        "@type": "Country",
        "name": countryName
      }
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": city.name,
      "addressCountry": countryCode
    },
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

      {/* Hero Section — Clean white/off-white premium design */}
      <section className="relative bg-[#f8faf8] border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                <MapPin className="h-3.5 w-3.5" />
                {city.name}, {countryName}
              </div>
              {city.maoriName && (
                <div className="inline-flex items-center gap-2 bg-gray-50 text-gray-600 border border-gray-200 rounded-full px-4 py-1.5 text-sm font-medium mb-6 ml-2">
                  {city.maoriName}
                </div>
              )}

              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold leading-[1.1] text-gray-900 mb-6 tracking-tight">
                Reliable Pet Sitters in{" "}
                <span className="text-emerald-600">{city.name}</span>
              </h1>

              <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                {city.heroDescription}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Button
                  size="lg"
                  className="bg-gray-900 hover:bg-gray-800 text-white font-semibold shadow-sm px-8 py-6 text-lg"
                  onClick={() => navigate("/find-sitters")}
                >
                  Find a Sitter in {city.name}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-6 text-lg"
                  onClick={() => navigate("/become-sitter")}
                >
                  Become a Sitter
                </Button>
              </div>
            </div>

            {/* Trust signals grid */}
            <div className="grid grid-cols-2 gap-3 max-w-xs w-full">
              {[
                { icon: <Shield className="h-5 w-5 text-emerald-600" />, label: "ID Verified" },
                { icon: <Camera className="h-5 w-5 text-emerald-600" />, label: "Daily Photo Updates" },
                { icon: <MapPin className="h-5 w-5 text-emerald-600" />, label: "Local Sitters" },
                { icon: <Heart className="h-5 w-5 text-emerald-600" />, label: "Must Love Dogs" },
              ].map(item => (
                <div
                  key={item.label}
                  className="bg-white rounded-xl p-4 text-center border border-gray-200 shadow-sm"
                >
                  <div className="flex justify-center mb-2">{item.icon}</div>
                  <div className="text-sm font-medium text-gray-700">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Local Section */}
      <section className="py-20 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              {"Why pet owners in " + city.name + " choose ZiggySitters"}
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              {city.localContext}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <MapPin className="h-6 w-6" />,
                title: "Local Knowledge",
                description: "Sitters who know " + city.name + "'s best parks, vet clinics, and pet-friendly spots inside out."
              },
              {
                icon: <Shield className="h-6 w-6" />,
                title: "ID Verified",
                description: "Every sitter is verified with " + (isAU ? "Australian" : "NZ") + " documents. Real locals you can trust."
              },
              {
                icon: <Camera className="h-6 w-6" />,
                title: "Daily Photo Updates",
                description: "See exactly how your pet is doing — photos, notes on meals, mood, and activity."
              },
              {
                icon: <Heart className="h-6 w-6" />,
                title: "People Who Love Pets",
                description: "Every sitter genuinely loves animals. Your pet is treated like family, not just a booking."
              },
              {
                icon: <Star className="h-6 w-6" />,
                title: "Trusted Reviews",
                description: "Read honest reviews from other " + city.name + " pet owners before you book."
              },
              {
                icon: <Users className="h-6 w-6" />,
                title: "Your Neighbourhood",
                description: "Find sitters right in your neighbourhood — no driving across town."
              }
            ].map(feature => (
              <div key={feature.title} className="group">
                <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-lg">{feature.title}</h3>
                <p className="text-[15px] text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Neighbourhoods Section */}
      <section className="bg-[#fafbfa] py-16 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
            {"Pet Sitters Across " + city.name}
          </h2>
          <p className="text-gray-500 mb-8 text-lg">
            {"Our sitters are spread across " + city.name + " so you can always find someone nearby."}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {city.neighborhoods.map((suburb) => (
              <Badge
                key={suburb}
                variant="outline"
                className="bg-white border-gray-200 text-gray-600 text-sm font-normal px-4 py-2 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors cursor-default"
              >
                {suburb}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Parks & Vet Info */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">
                {"Popular Parks in " + city.name}
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {city.parks.map((park) => (
                  <div key={park} className="flex items-center gap-3 text-[15px] text-gray-700">
                    <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    {park}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <Card className="bg-white border-gray-200 shadow-sm">
                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2 text-lg">Local Vet Services</h3>
                  <p className="text-[15px] text-gray-500 leading-relaxed">{city.vetInfo}</p>
                </div>
              </Card>
              <Card className="bg-white border-gray-200 shadow-sm">
                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2 text-lg">Our Sitters Know the Area</h3>
                  <p className="text-[15px] text-gray-500 leading-relaxed">
                    {"Every ZiggySitters sitter in " + city.name + " is familiar with local emergency vet locations and can respond quickly if your pet needs care."}
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Services — No prices */}
      <section className="bg-[#fafbfa] py-20 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              {"Pet Care Services in " + city.name}
            </h2>
            <p className="text-gray-500 text-lg">
              Choose the care that suits your pet best
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Home className="h-6 w-6 text-emerald-600" />,
                title: "House Sitting",
                description: "Your sitter stays overnight in your home. Pets stay comfortable in their own environment with their routine intact.",
                bg: "bg-emerald-50"
              },
              {
                icon: <Clock className="h-6 w-6 text-teal-600" />,
                title: "Drop-in Visits",
                description: "Daily visits for feeding, cuddles, and playtime. Perfect for cats and independent pets who prefer their own space.",
                bg: "bg-teal-50"
              },
              {
                icon: <Users className="h-6 w-6 text-cyan-600" />,
                title: "Pet Boarding",
                description: "Your pet stays at the sitter's home. Great for social pets who love company and new adventures.",
                bg: "bg-cyan-50"
              }
            ].map(service => (
              <Card key={service.title} className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className={"inline-flex items-center justify-center w-12 h-12 rounded-xl " + service.bg + " mb-4"}>
                    {service.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-lg">{service.title}</h3>
                  <p className="text-[15px] text-gray-500 leading-relaxed">{service.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 py-20 text-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            {"Find your pet's perfect sitter in "}
            <span className="text-emerald-400">{city.name}</span>
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            {"Join pet owners across " + city.name + " who trust ZiggySitters. ID verified. Daily photo updates. Local people who love pets."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg px-10 py-6 text-lg"
              onClick={() => navigate("/find-sitters")}
            >
              Find Sitters Near Me
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800 px-10 py-6 text-lg"
              onClick={() => navigate("/become-sitter")}
            >
              Become a Sitter
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
