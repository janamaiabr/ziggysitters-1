import { Link, useNavigate } from 'react-router-dom';
import SEOHead from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Shield, Heart, ArrowRight, Check, Dog, Cat, Bird, Home, Clock, Users, Star, Camera, Leaf } from 'lucide-react';

// Auckland suburbs for SEO
const AUCKLAND_SUBURBS = [
  { name: 'Ponsonby', slug: 'ponsonby', region: 'Central' },
  { name: 'Grey Lynn', slug: 'grey-lynn', region: 'Central' },
  { name: 'Remuera', slug: 'remuera', region: 'Central' },
  { name: 'Mt Eden', slug: 'mt-eden', region: 'Central' },
  { name: 'Parnell', slug: 'parnell', region: 'Central' },
  { name: 'Newmarket', slug: 'newmarket', region: 'Central' },
  { name: 'Epsom', slug: 'epsom', region: 'Central' },
  { name: 'Kingsland', slug: 'kingsland', region: 'Central' },
  { name: 'Herne Bay', slug: 'herne-bay', region: 'Central' },
  { name: 'Westmere', slug: 'westmere', region: 'Central' },
  { name: 'Devonport', slug: 'devonport', region: 'North Shore' },
  { name: 'Takapuna', slug: 'takapuna', region: 'North Shore' },
  { name: 'Milford', slug: 'milford', region: 'North Shore' },
  { name: 'Albany', slug: 'albany', region: 'North Shore' },
  { name: 'Birkenhead', slug: 'birkenhead', region: 'North Shore' },
  { name: 'Mission Bay', slug: 'mission-bay', region: 'East' },
  { name: 'St Heliers', slug: 'st-heliers', region: 'East' },
  { name: 'Kohimarama', slug: 'kohimarama', region: 'East' },
  { name: 'Orakei', slug: 'orakei', region: 'East' },
  { name: 'Howick', slug: 'howick', region: 'East' },
  { name: 'Mt Albert', slug: 'mt-albert', region: 'West' },
  { name: 'Henderson', slug: 'henderson', region: 'West' },
  { name: 'New Lynn', slug: 'new-lynn', region: 'West' },
  { name: 'Te Atatu', slug: 'te-atatu', region: 'West' },
  { name: 'Titirangi', slug: 'titirangi', region: 'West' },
  { name: 'Onehunga', slug: 'onehunga', region: 'South' },
  { name: 'Royal Oak', slug: 'royal-oak', region: 'South' },
  { name: 'Mt Roskill', slug: 'mt-roskill', region: 'South' },
  { name: 'Manukau', slug: 'manukau', region: 'South' },
  { name: 'Botany', slug: 'botany', region: 'South' },
];

const regions = ['Central', 'North Shore', 'East', 'West', 'South'];

// Hero floating photos (unique set)
const heroPhotos = [
  { url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=600&fit=crop', alt: 'Happy golden retriever' },
  { url: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800&h=600&fit=crop', alt: 'Smiling labrador' },
  { url: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800&h=600&fit=crop', alt: 'Curious cat' },
  { url: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=800&h=600&fit=crop', alt: 'French bulldog portrait' },
];

// Gallery photos (different set)
const galleryPhotos = [
  { url: 'https://images.unsplash.com/photo-1544568100-847a948585b9?w=600&h=600&fit=crop', alt: 'Dog at beach' },
  { url: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=600&h=600&fit=crop', alt: 'Cat stretching' },
  { url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&h=600&fit=crop', alt: 'Dalmatian smiling' },
  { url: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=600&h=600&fit=crop', alt: 'Orange cat eyes' },
  { url: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=600&h=600&fit=crop', alt: 'Dog on grass' },
  { url: 'https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?w=600&h=600&fit=crop', alt: 'White cat' },
];

// Service card photos (unique set)
const servicePhotos = {
  houseSitting: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800&h=500&fit=crop',
  dropIn: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=800&h=500&fit=crop',
  boarding: 'https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=800&h=500&fit=crop',
};

export default function AucklandPetSitters() {
  const navigate = useNavigate();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "ZiggySitters - Auckland Pet Sitters",
    "description": "New Zealand's trusted local pet sitting service. Find verified pet sitters across Auckland for dogs, cats, and all pets. Kiwi-owned and operated.",
    "areaServed": {
      "@type": "City",
      "name": "Auckland",
      "containedInPlace": {
        "@type": "Country",
        "name": "New Zealand"
      }
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Auckland",
      "addressCountry": "NZ"
    },
    "priceRange": "$55-95/day",
    "serviceType": ["Pet Sitting", "House Sitting", "Drop-in Visits", "Pet Care"]
  };

  return (
    <>
      <SEOHead 
        title="Pet Sitters Auckland NZ | Local Trusted Pet Care | Ziggy Sitters"
        description="Find trusted, local pet sitters across Auckland, New Zealand. Verified Kiwi sitters for dogs, cats & all pets. House sitting, drop-in visits & daily photo updates. Book your local sitter today!"
        keywords="pet sitter auckland, dog sitter auckland, cat sitter auckland, house sitter auckland nz, pet sitting auckland, pet care auckland, dog boarding auckland, cat boarding auckland, new zealand pet sitters"
        canonical="/pet-sitters-auckland"
        structuredData={structuredData}
      />
      
      {/* Hero Section with photo collage */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900" />
        
        {/* Animated NZ elements - silver ferns, kiwis, pohutukawa */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          {/* Silver ferns */}
          <div className="absolute top-10 left-10 text-8xl animate-float" style={{ animationDelay: '0s' }}>🌿</div>
          <div className="absolute top-32 right-20 text-6xl animate-float" style={{ animationDelay: '1s' }}>🌿</div>
          <div className="absolute bottom-20 left-1/4 text-7xl animate-float" style={{ animationDelay: '2s' }}>🌿</div>
          
          {/* Kiwi birds */}
          <div className="absolute top-1/3 left-[8%] text-5xl animate-bounce-slow" style={{ animationDelay: '0.5s' }}>🥝</div>
          <div className="absolute bottom-1/4 right-[15%] text-4xl animate-bounce-slow" style={{ animationDelay: '1.5s' }}>🥝</div>
          
          {/* Pohutukawa flowers */}
          <div className="absolute top-20 left-1/3 text-5xl animate-float" style={{ animationDelay: '0.8s' }}>🌺</div>
          <div className="absolute bottom-32 left-[12%] text-4xl animate-float" style={{ animationDelay: '1.2s' }}>🌺</div>
          
          {/* Paw prints scattered */}
          <div className="absolute top-1/2 right-[45%] text-3xl animate-float opacity-50" style={{ animationDelay: '0.3s' }}>🐾</div>
          <div className="absolute top-[60%] left-[5%] text-2xl animate-float opacity-40" style={{ animationDelay: '1.8s' }}>🐾</div>
        </div>

        {/* Floating pet photos - LARGER */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-16 right-[3%] w-44 h-44 md:w-64 md:h-64 lg:w-72 lg:h-72 rounded-3xl overflow-hidden shadow-2xl rotate-6 animate-float opacity-90" style={{ animationDelay: '0.5s' }}>
            <img src={heroPhotos[0].url} alt={heroPhotos[0].alt} className="w-full h-full object-cover" />
          </div>
          <div className="absolute top-48 right-[22%] w-32 h-32 md:w-44 md:h-44 lg:w-52 lg:h-52 rounded-3xl overflow-hidden shadow-2xl -rotate-3 animate-float opacity-85" style={{ animationDelay: '1.5s' }}>
            <img src={heroPhotos[1].url} alt={heroPhotos[1].alt} className="w-full h-full object-cover" />
          </div>
          <div className="absolute bottom-28 right-[8%] w-36 h-36 md:w-52 md:h-52 lg:w-60 lg:h-60 rounded-3xl overflow-hidden shadow-2xl rotate-12 animate-float opacity-85" style={{ animationDelay: '2s' }}>
            <img src={heroPhotos[2].url} alt={heroPhotos[2].alt} className="w-full h-full object-cover" />
          </div>
          <div className="hidden lg:block absolute bottom-16 right-[28%] w-40 h-40 lg:w-48 lg:h-48 rounded-3xl overflow-hidden shadow-2xl -rotate-6 animate-float opacity-75" style={{ animationDelay: '0.8s' }}>
            <img src={heroPhotos[3].url} alt={heroPhotos[3].alt} className="w-full h-full object-cover" />
          </div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10 py-20">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6 animate-fade-in">
              <Badge className="bg-white/10 text-white border-white/20 backdrop-blur-sm px-4 py-2 text-sm">
                <MapPin className="w-4 h-4 mr-2" />
                100% Kiwi-Owned
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 backdrop-blur-sm px-4 py-2 text-sm">
                <Leaf className="w-4 h-4 mr-2" />
                Tāmaki Makaurau
              </Badge>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 text-white animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <span className="block mb-2">Auckland's</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300">
                Most Trusted
              </span>
              <span className="block">Pet Sitters</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-xl leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Real locals who treat your fur babies like whānau. From Devonport to Manukau, find your perfect match.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Button 
                size="lg" 
                onClick={() => navigate('/find-sitters')}
                className="gap-2 bg-white text-emerald-900 hover:bg-white/90 font-bold text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all hover:scale-105"
              >
                Find Your Local Sitter
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                onClick={() => navigate('/become-sitter')}
                className="bg-emerald-500 text-white hover:bg-emerald-400 font-semibold px-8 py-6 border-2 border-emerald-400"
              >
                Become a Sitter
              </Button>
            </div>

            {/* Trust indicators with animation */}
            <div className="flex flex-wrap gap-6 text-sm text-white/70 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <span className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full">
                <Check className="w-5 h-5 text-emerald-400" /> NZ ID Verified
              </span>
              <span className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full">
                <Camera className="w-5 h-5 text-emerald-400" /> Daily Photo Updates
              </span>
              <span className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full">
                <Star className="w-5 h-5 text-emerald-400" /> 5-Star Reviews
              </span>
            </div>
          </div>
        </div>
        
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" className="w-full">
            <path d="M0,64 C480,120 960,0 1440,64 L1440,120 L0,120 Z" fill="hsl(var(--background))" />
          </svg>
        </div>
      </section>

      {/* Photo Gallery Section */}
      <section className="py-16 bg-background overflow-hidden">
        <div className="container mx-auto px-4 mb-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Happy Pets Across <span className="text-emerald-600">Auckland</span>
            </h2>
            <p className="text-lg text-muted-foreground">Real moments from our amazing sitters and their furry guests</p>
          </div>
        </div>
        
        {/* Photo grid - unique gallery photos */}
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {galleryPhotos.map((photo, index) => (
              <div 
                key={index} 
                className="aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:scale-105 duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <img src={photo.url} alt={photo.alt} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Local - Kiwi values with icons */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700">
              🥝 100% NZ Made
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Why Kiwis Choose <span className="text-emerald-600">Local</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built by Auckland pet owners, for Auckland pet owners. No overseas call centres - just genuine Kiwi service.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="relative overflow-hidden group text-center p-8 border-2 hover:border-emerald-500/50 transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
              <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                <MapPin className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Your Neighbourhood</h3>
              <p className="text-muted-foreground">
                Sitters who know your local parks, emergency vets, and what Auckland weather really means for walkies.
              </p>
            </Card>

            <Card className="relative overflow-hidden group text-center p-8 border-2 hover:border-emerald-500/50 transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-500/10 to-transparent rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
              <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">NZ Verified</h3>
              <p className="text-muted-foreground">
                Every sitter verified with NZ documents. Real locals you can trust with your home and pets - sweet as.
              </p>
            </Card>

            <Card className="relative overflow-hidden group text-center p-8 border-2 hover:border-emerald-500/50 transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-500/10 to-transparent rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
              <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Whānau Values</h3>
              <p className="text-muted-foreground">
                Your pets are treated like family, not just another booking. That's the Kiwi way.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Services with photos */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pet Care Services Across Auckland
            </h2>
            <p className="text-lg text-muted-foreground">
              From the Shore to South Auckland - we've got your pets sorted
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={servicePhotos.houseSitting}
                  alt="Pet sitting at home"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <Badge className="bg-white/90 text-emerald-700">Most Popular</Badge>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                    <Home className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold">House Sitting</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Your sitter stays overnight in your home. Pets stay comfortable, plants get watered, mail gets collected.
                </p>
                <p className="text-2xl font-bold text-emerald-600">From $65<span className="text-sm font-normal text-muted-foreground">/night</span></p>
              </div>
            </Card>

            <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={servicePhotos.dropIn}
                  alt="Cat drop-in visit"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/40">
                    <Clock className="w-5 h-5 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-bold">Drop-in Visits</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Daily visits for feeding, cuddles, and playtime. Perfect for cats and independent pets.
                </p>
                <p className="text-2xl font-bold text-teal-600">From $35<span className="text-sm font-normal text-muted-foreground">/visit</span></p>
              </div>
            </Card>

            <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={servicePhotos.boarding}
                  alt="Dogs at sitter's home"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/40">
                    <Users className="w-5 h-5 text-cyan-600" />
                  </div>
                  <h3 className="text-xl font-bold">Pet Boarding</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Your pet stays at the sitter's home. Great for social pets who love company.
                </p>
                <p className="text-2xl font-bold text-cyan-600">From $55<span className="text-sm font-normal text-muted-foreground">/night</span></p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Pets We Care For with fun icons */}
      <section className="py-16 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">All Creatures Great & Small</h2>
            <p className="text-muted-foreground">Auckland sitters experienced with all your furry, feathered, and scaly mates</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            {[
              { icon: <Dog className="w-6 h-6" />, label: 'Dogs', color: 'from-amber-400 to-orange-500' },
              { icon: <Cat className="w-6 h-6" />, label: 'Cats', color: 'from-purple-400 to-pink-500' },
              { icon: <Bird className="w-6 h-6" />, label: 'Birds', color: 'from-cyan-400 to-blue-500' },
              { icon: '🐰', label: 'Rabbits', color: 'from-pink-400 to-rose-500' },
              { icon: '🐹', label: 'Small Pets', color: 'from-yellow-400 to-amber-500' },
              { icon: '🦎', label: 'Reptiles', color: 'from-green-400 to-emerald-500' },
              { icon: '🐴', label: 'Horses', color: 'from-amber-500 to-brown-600' },
            ].map((pet, index) => (
              <div 
                key={pet.label}
                className="group flex items-center gap-3 bg-white dark:bg-card px-6 py-4 rounded-2xl shadow-md hover:shadow-xl transition-all hover:scale-105 cursor-default"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${pet.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                  {typeof pet.icon === 'string' ? <span className="text-2xl">{pet.icon}</span> : pet.icon}
                </div>
                <span className="font-semibold text-lg">{pet.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Auckland Suburbs - SEO */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
              <MapPin className="w-4 h-4 mr-2" />
              30+ Auckland Suburbs
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Find Sitters in Your Suburb
            </h2>
            <p className="text-lg text-muted-foreground">
              Local sitters across the motu - from Devonport to Manukau
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            {regions.map(region => {
              const regionSuburbs = AUCKLAND_SUBURBS.filter(s => s.region === region);
              return (
                <div key={region} className="mb-10">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    {region} Auckland
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {regionSuburbs.map(suburb => (
                      <Link 
                        key={suburb.slug}
                        to={`/find-sitters/${suburb.slug}`}
                        className="px-4 py-2.5 bg-card hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-border rounded-xl text-sm font-medium transition-all hover:text-emerald-600 hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5"
                      >
                        {suburb.name}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-4">Easy as - Here's How It Works</h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { step: 1, title: 'Search Locally', desc: 'Browse verified sitters in your Auckland neighbourhood', icon: MapPin },
              { step: 2, title: 'Have a Yarn', desc: 'Message sitters and arrange a meet & greet', icon: Users },
              { step: 3, title: 'Book Securely', desc: 'Book online with secure NZ payment', icon: Shield },
              { step: 4, title: 'Stay Connected', desc: 'Get daily photos & updates of your happy pet', icon: Camera },
            ].map((item, index) => (
              <div key={item.step} className="text-center group">
                <div className="relative inline-block mb-5">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <item.icon className="w-10 h-10" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white dark:bg-card border-2 border-emerald-500 flex items-center justify-center font-bold text-emerald-600 shadow-md">
                    {item.step}
                  </div>
                </div>
                <h3 className="font-bold mb-2 text-lg">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-14">
            <Button 
              size="lg" 
              onClick={() => navigate('/find-sitters')}
              className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-10 py-6 text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
            >
              Get Started - Find Your Sitter
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24 overflow-hidden">
        {/* Background with gradient and pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800" />
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-10 left-10 text-8xl animate-float">🌿</div>
          <div className="absolute bottom-10 right-10 text-7xl animate-bounce-slow" style={{ animationDelay: '1s' }}>🥝</div>
          <div className="absolute top-1/2 left-1/4 text-6xl animate-float" style={{ animationDelay: '2s' }}>🌿</div>
          <div className="absolute top-20 right-1/4 text-5xl animate-float" style={{ animationDelay: '0.5s' }}>🌺</div>
          <div className="absolute bottom-1/3 left-[15%] text-4xl animate-bounce-slow" style={{ animationDelay: '1.5s' }}>🐾</div>
          <div className="absolute top-1/3 right-[10%] text-3xl animate-float" style={{ animationDelay: '2.5s' }}>🐾</div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Ready to Find Your Perfect
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-300">Auckland Sitter?</span>
          </h2>
          <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">
            Join thousands of Auckland pet owners who trust ZiggySitters with their fur babies. Book your next holiday worry-free.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/find-sitters')}
              className="gap-2 bg-white text-emerald-800 hover:bg-white/90 font-bold px-10 py-6 text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
            >
              Find Sitters Near Me
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              onClick={() => navigate('/how-it-works')}
              className="bg-emerald-500 text-white hover:bg-emerald-400 font-semibold px-10 py-6 text-lg border-2 border-emerald-400"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
