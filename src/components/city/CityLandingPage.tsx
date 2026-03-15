import { useNavigate } from "react-router-dom";
import SEOHead from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CityData } from "@/data/cityData";

// Custom pet illustrations
import iconShield from "@/assets/icons/icon-shield.png";
import iconCamera from "@/assets/icons/icon-camera.png";
import iconLocation from "@/assets/icons/icon-location.png";
import iconHeart from "@/assets/icons/icon-heart.png";
import iconHouse from "@/assets/icons/icon-house.png";
import iconBowl from "@/assets/icons/icon-bowl.png";
import iconBoarding from "@/assets/icons/icon-boarding.png";
import iconStar from "@/assets/icons/icon-star.png";
import iconPaw from "@/assets/icons/icon-paw.png";
import iconCheck from "@/assets/icons/icon-check.png";

// Local genuine pet care photos
import houseSittingImg from "@/assets/city/house-sitting.jpg";
import dropInVisitImg from "@/assets/city/drop-in-visit.jpg";
import petBoardingImg from "@/assets/city/pet-boarding.jpg";
import stepBrowseImg from "@/assets/city/step-browse.jpg";
import stepMeetGreetImg from "@/assets/city/step-meet-greet.jpg";
import stepBookingImg from "@/assets/city/step-booking.jpg";
import whyUsImg from "@/assets/city/why-us.jpg";

interface CityLandingPageProps {
  city: CityData;
}

const AU_CITIES = ["sunshine-coast", "brisbane", "gold-coast"];

// City-specific hero images for genuine, location-appropriate feel
const cityHeroImages: Record<string, string> = {
  "sunshine-coast": "https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=1600&h=900&fit=crop",
  "auckland": "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=1600&h=900&fit=crop",
  "wellington": "https://images.unsplash.com/photo-1589871973318-9ca1258faa07?w=1600&h=900&fit=crop",
  "christchurch": "https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=1600&h=900&fit=crop",
  "hamilton": "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1600&h=900&fit=crop",
  "tauranga": "https://images.unsplash.com/photo-1504208434362-2b7e76ac4f4b?w=1600&h=900&fit=crop",
  "dunedin": "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&h=900&fit=crop",
};

// Genuine local pet care photos (used across all city pages)
const stepImages = [stepBrowseImg, stepMeetGreetImg, stepBookingImg];
const whyUsImage = whyUsImg;
const serviceImages = [houseSittingImg, dropInVisitImg, petBoardingImg];

const testimonials = [
  {
    name: "Sarah M.",
    location: "Auckland",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
    text: "The daily photo updates made my holiday so much more relaxing. I could see my cat was happy every single day.",
    rating: 5,
  },
  {
    name: "James T.",
    location: "Grey Lynn",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
    text: "Found a wonderful local sitter for my two dogs. The whole process was seamless from start to finish.",
    rating: 5,
  },
  {
    name: "Emma L.",
    location: "Hamilton",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
    text: "Knowing every sitter is ID verified gave me the confidence to book. My bunny was so well cared for.",
    rating: 5,
  },
];

export default function CityLandingPage({ city }: CityLandingPageProps) {
  const navigate = useNavigate();
  const isAU = AU_CITIES.includes(city.slug);
  const countryName = isAU ? "Australia" : "New Zealand";
  const countryCode = isAU ? "AU" : "NZ";

  const heroImage = cityHeroImages[city.slug] || cityHeroImages["hamilton"];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "ZiggySitters - " + city.name + " Pet Sitters",
    description: "Trusted local pet sitting service in " + city.name + ", " + countryName,
    areaServed: { "@type": "City", name: city.name, containedInPlace: { "@type": "Country", name: countryName } },
    address: { "@type": "PostalAddress", addressLocality: city.name, addressCountry: countryCode },
    serviceType: ["Pet Sitting", "House Sitting", "Drop-in Visits"],
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

      {/* Hero: Full-bleed photography with overlay */}
      <section className="relative min-h-[75vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt={"Pet sitting in " + city.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/30" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-24 md:py-32">
          <div className="max-w-2xl">
            <p className="text-primary-foreground/80 font-body text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: 'hsl(152 45% 55%)' }}>
              {city.name}, {countryName}
            </p>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6 font-display">
              Local Pet Sitters{" "}
              <span className="block">in {city.name}</span>
            </h1>

            <p className="text-lg text-white/80 font-body mb-8 max-w-lg leading-relaxed">
              {city.heroDescription}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-body font-semibold px-8 py-6 text-lg shadow-lg"
                onClick={() => navigate("/find-sitters")}
              >
                Find a Sitter
                <span className="ml-2">→</span>
              </Button>
              <Button
                size="lg"
                variant="outline-white"
                className="font-body px-8 py-6 text-lg"
                onClick={() => navigate("/become-sitter")}
              >
                Become a Sitter
              </Button>
            </div>

            {/* Inline trust markers */}
            <div className="flex flex-wrap gap-4 mt-8 text-sm text-white/70 font-body">
              <span className="flex items-center gap-1.5"><img src={iconCheck} alt="" className="h-4 w-4" /> ID Verified</span>
              <span className="flex items-center gap-1.5"><img src={iconCheck} alt="" className="h-4 w-4" /> Daily Photo Updates</span>
              <span className="flex items-center gap-1.5"><img src={iconCheck} alt="" className="h-4 w-4" /> Local Sitters Only</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works with custom illustrations */}
      <section className="py-20 md:py-28 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3 font-body">How it works</p>
            <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground">
              Simple, trusted pet care
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12 md:gap-16">
            {[
              {
                step: "01",
                title: "Search your area",
                desc: "Browse verified sitters in " + city.name + ". Read reviews, see photos, and find someone your pet will love.",
                img: stepImages[0],
                icon: iconLocation,
              },
              {
                step: "02",
                title: "Book with confidence",
                desc: "Every sitter is ID verified. Message them before booking, agree on dates, and pay securely through the platform.",
                img: stepImages[1],
                icon: iconShield,
              },
              {
                step: "03",
                title: "Relax & enjoy updates",
                desc: "Receive daily photo updates and notes about meals, mood, and activity. Your pet is in great hands.",
                img: stepImages[2],
                icon: iconCamera,
              },
            ].map((item) => (
              <div key={item.step} className="group text-center">
                <div className="aspect-[3/2] rounded-2xl overflow-hidden mb-6 shadow-sm">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="flex justify-center mb-3">
                  <img src={item.icon} alt="" className="w-12 h-12" />
                </div>
                <span className="text-xs font-body font-bold text-primary tracking-widest">{item.step}</span>
                <h3 className="text-xl font-bold font-display text-foreground mt-1 mb-2">{item.title}</h3>
                <p className="text-[15px] text-muted-foreground font-body leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why pet owners choose us — split image + text with custom icons */}
      <section className="py-20 md:py-28 bg-muted">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-lg">
                <img
                  src={whyUsImage}
                  alt="Happy dog with local sitter"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 bg-card rounded-xl p-4 md:p-5 shadow-xl border border-border max-w-[220px]">
                <div className="flex items-center gap-2 mb-2">
                  <img src={iconStar} alt="" className="w-8 h-8" />
                  <span className="text-xs text-muted-foreground font-body">4.9/5 avg rating</span>
                </div>
                <p className="text-xs text-muted-foreground font-body italic">"Best decision we ever made for our pup."</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3 font-body">Why {city.name} pet owners choose us</p>
              <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-6 leading-tight">
                Local people who genuinely love your pets
              </h2>
              <p className="text-muted-foreground font-body mb-8 leading-relaxed">
                {city.localContext}
              </p>

              <div className="space-y-4">
                {[
                  { icon: iconShield, text: "Every sitter is ID verified with " + (isAU ? "Australian" : "NZ") + " documents" },
                  { icon: iconCamera, text: "Daily photo updates so you never have to wonder" },
                  { icon: iconLocation, text: "Local sitters who know " + city.name + "'s parks, vets, and pet spots" },
                  { icon: iconStar, text: "Transparent reviews from real pet owners" },
                  { icon: iconPaw, text: "Secure payments — your money is protected" },
                ].map((item) => (
                  <div key={item.text} className="flex items-start gap-3">
                    <img src={item.icon} alt="" className="w-8 h-8 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground font-body">{item.text}</p>
                  </div>
                ))}
              </div>

              <Button
                size="lg"
                className="mt-8 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-body font-semibold px-8 py-6 text-base"
                onClick={() => navigate("/find-sitters")}
              >
                Browse Sitters in {city.name}
                <span className="ml-2">→</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-28 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3 font-body">Testimonials</p>
            <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground">
              What pet parents are saying
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-card rounded-2xl p-6 md:p-8 border border-border hover:shadow-md transition-shadow">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <img key={j} src={iconStar} alt="" className="w-4 h-4" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground font-body italic leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <img src={t.avatar} alt={t.name} className="w-9 h-9 rounded-full object-cover" loading="lazy" />
                  <div>
                    <p className="text-sm font-semibold text-foreground font-body">{t.name}</p>
                    <p className="text-xs text-muted-foreground font-body">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services with custom pet illustrations */}
      <section className="py-20 md:py-28 bg-muted">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3 font-body">Services</p>
            <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground">
              Pet care, your way
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                title: "House Sitting",
                desc: "Your sitter stays overnight in your home. Pets stay comfortable in their own environment with their routine intact.",
                img: serviceImages[0],
                icon: iconHouse,
              },
              {
                title: "Drop-in Visits",
                desc: "Daily visits for feeding, cuddles, and playtime. Perfect for cats and independent pets who prefer their own space.",
                img: serviceImages[1],
                icon: iconBowl,
              },
              {
                title: "Pet Boarding",
                desc: "Your pet stays at the sitter's home. Great for social pets who love company and new adventures.",
                img: serviceImages[2],
                icon: iconBoarding,
              },
            ].map((s) => (
              <div key={s.title} className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-lg transition-all duration-300">
                <div className="aspect-[3/2] overflow-hidden">
                  <img
                    src={s.img}
                    alt={s.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <img src={s.icon} alt="" className="w-10 h-10" />
                    <h3 className="text-lg font-bold font-display text-foreground">{s.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground font-body leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 md:py-20 bg-background border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-4">
              <img src={iconLocation} alt="" className="w-14 h-14" />
            </div>
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3 font-body">Neighbourhoods</p>
            <h2 className="text-3xl font-bold font-display text-foreground mb-3">
              Pet sitters across {city.name}
            </h2>
            <p className="text-muted-foreground mb-8 font-body">
              Our sitters are spread across {city.name} so you can always find someone nearby.
            </p>
          </div>

          {/* Map embed */}
          <div className="rounded-2xl overflow-hidden shadow-lg border border-border mb-8 aspect-[16/7]">
            <iframe
              title={"Map of " + city.name}
              src={"https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=" + encodeURIComponent(city.name + ", " + countryName) + "&zoom=11&maptype=roadmap"}
              className="w-full h-full border-0"
              loading="lazy"
              allowFullScreen
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {city.neighborhoods.map((suburb) => (
              <Badge
                key={suburb}
                variant="outline"
                className="bg-card border-border text-muted-foreground text-sm font-normal font-body px-4 py-2 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-colors cursor-default"
              >
                {suburb}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-secondary py-24 text-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl md:text-5xl font-bold font-display text-secondary-foreground mb-4 leading-tight">
            Your pet deserves the best
          </h2>
          <p className="text-secondary-foreground/60 mb-8 text-lg font-body">
            Join pet owners across {city.name} who trust ZiggySitters for reliable, local pet care.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-body font-semibold shadow-lg px-10 py-6 text-lg"
              onClick={() => navigate("/find-sitters")}
            >
              Find Sitters Near Me
              <span className="ml-2">→</span>
            </Button>
            <Button
              size="lg"
              variant="outline-white"
              className="font-body px-10 py-6 text-lg"
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
