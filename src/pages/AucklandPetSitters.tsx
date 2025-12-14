import { Link, useNavigate } from 'react-router-dom';
import SEOHead from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Shield, Calendar, Heart, ArrowRight, Check, Dog, Cat, Bird, Home, Clock, Users } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

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
    "serviceType": ["Pet Sitting", "House Sitting", "Drop-in Visits", "Pet Care"],
    "sameAs": [
      "https://www.instagram.com/ziggysitters",
      "https://www.facebook.com/ziggysitters"
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Pet Sitters Auckland NZ | Local Trusted Pet Care | Ziggy Sitters"
        description="Find trusted, local pet sitters across Auckland, New Zealand. Verified Kiwi sitters for dogs, cats & all pets. House sitting, drop-in visits & daily photo updates. Book your local sitter today!"
        keywords="pet sitter auckland, dog sitter auckland, cat sitter auckland, house sitter auckland nz, pet sitting auckland, pet care auckland, dog boarding auckland, cat boarding auckland, new zealand pet sitters"
        canonical="/pet-sitters-auckland"
        structuredData={structuredData}
      />
      
      {/* Hero Section - NZ themed */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-emerald-50 dark:to-emerald-950/20 py-20 lg:py-28 overflow-hidden">
        {/* NZ-themed decorative elements */}
        <div className="absolute top-10 right-10 text-6xl opacity-20">🥝</div>
        <div className="absolute bottom-10 left-10 text-4xl opacity-15">🐕</div>
        
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700">
              <MapPin className="w-3 h-3 mr-1" />
              100% Kiwi Owned & Operated
            </Badge>
            
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-foreground">
              <span className="block">Auckland's Most Trusted</span>
              <span className="bg-gradient-to-r from-primary via-emerald-500 to-primary bg-clip-text text-transparent">
                Pet Sitters
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Connecting Kiwi pet owners with verified local sitters across Auckland. 
              Real people, real care, real peace of mind - no overseas call centres, just genuine Kiwi hospitality for your furry family.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                size="lg" 
                onClick={() => navigate('/find-sitters')}
                className="gap-2 bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-600"
              >
                Find Your Local Sitter
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/become-sitter')}
              >
                Become a Sitter
              </Button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4 text-emerald-500" /> ID Verified Sitters
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4 text-emerald-500" /> Daily Photo Updates
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4 text-emerald-500" /> NZ Based Support
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Why Local Matters */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose a <span className="text-primary">Local Auckland</span> Service?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We're not just another pet sitting app - we're Auckland pet owners who built the service we wished existed.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="text-center p-6 border-2 hover:border-primary/50 transition-colors">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                <MapPin className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Truly Local</h3>
              <p className="text-muted-foreground">
                All our sitters live in Auckland suburbs. They know the local parks, vets, and what Auckland pets need.
              </p>
            </Card>

            <Card className="text-center p-6 border-2 hover:border-primary/50 transition-colors">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                <Shield className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">NZ Verified</h3>
              <p className="text-muted-foreground">
                Every sitter is ID verified with NZ documents. Real locals you can trust with your home and pets.
              </p>
            </Card>

            <Card className="text-center p-6 border-2 hover:border-primary/50 transition-colors">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                <Heart className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Kiwi Values</h3>
              <p className="text-muted-foreground">
                Built on Kiwi hospitality and genuine care. Your pets are treated like whānau, not just customers.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pet Sitting Services Across Auckland
            </h2>
            <p className="text-lg text-muted-foreground">
              Whatever your pets need, we've got you covered
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Home className="w-8 h-8 text-primary" />
                <h3 className="text-xl font-semibold">House Sitting</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Your sitter stays in your home overnight, keeping your pets comfortable in their own environment.
              </p>
              <p className="text-sm text-primary font-medium">From $65/night</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-8 h-8 text-primary" />
                <h3 className="text-xl font-semibold">Drop-in Visits</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Daily visits for feeding, playtime, and check-ins. Perfect for cats and independent pets.
              </p>
              <p className="text-sm text-primary font-medium">From $35/visit</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-8 h-8 text-primary" />
                <h3 className="text-xl font-semibold">Pet Boarding</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Your pet stays at the sitter's home, getting constant love and attention from experienced carers.
              </p>
              <p className="text-sm text-primary font-medium">From $55/night</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Pets We Care For */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">We Care for All Pets</h2>
            <p className="text-muted-foreground">Auckland sitters experienced with all kinds of furry, feathered, and scaled friends</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
            <Badge variant="secondary" className="text-base px-4 py-2 gap-2">
              <Dog className="w-4 h-4" /> Dogs
            </Badge>
            <Badge variant="secondary" className="text-base px-4 py-2 gap-2">
              <Cat className="w-4 h-4" /> Cats
            </Badge>
            <Badge variant="secondary" className="text-base px-4 py-2 gap-2">
              <Bird className="w-4 h-4" /> Birds
            </Badge>
            <Badge variant="secondary" className="text-base px-4 py-2">
              🐰 Rabbits
            </Badge>
            <Badge variant="secondary" className="text-base px-4 py-2">
              🐹 Small Pets
            </Badge>
            <Badge variant="secondary" className="text-base px-4 py-2">
              🦎 Reptiles
            </Badge>
            <Badge variant="secondary" className="text-base px-4 py-2">
              🐴 Horses
            </Badge>
          </div>
        </div>
      </section>

      {/* Auckland Suburbs - SEO Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Find Pet Sitters in Your Auckland Suburb
            </h2>
            <p className="text-lg text-muted-foreground">
              Local sitters across all of Auckland - from the North Shore to South Auckland
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            {regions.map(region => {
              const regionSuburbs = AUCKLAND_SUBURBS.filter(s => s.region === region);
              return (
                <div key={region} className="mb-8">
                  <h3 className="text-xl font-semibold mb-4 text-primary">
                    {region} Auckland
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {regionSuburbs.map(suburb => (
                      <Link 
                        key={suburb.slug}
                        to={`/find-sitters/${suburb.slug}`}
                        className="px-4 py-2 bg-muted hover:bg-primary/10 rounded-lg text-sm font-medium transition-colors hover:text-primary"
                      >
                        Pet Sitters in {suburb.name}
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
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How ZiggySitters Works</h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">1</div>
              <h3 className="font-semibold mb-2">Search Local Sitters</h3>
              <p className="text-sm text-muted-foreground">Browse verified sitters in your Auckland suburb</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">2</div>
              <h3 className="font-semibold mb-2">Message & Meet</h3>
              <p className="text-sm text-muted-foreground">Chat with sitters and arrange a meet & greet</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">3</div>
              <h3 className="font-semibold mb-2">Book Securely</h3>
              <p className="text-sm text-muted-foreground">Book online with secure payment protection</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">4</div>
              <h3 className="font-semibold mb-2">Get Daily Updates</h3>
              <p className="text-sm text-muted-foreground">Receive photos & updates throughout the stay</p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button 
              size="lg" 
              onClick={() => navigate('/find-sitters')}
              className="gap-2"
            >
              Get Started - Find Your Sitter
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-primary/10 via-emerald-50 to-primary/10 dark:from-primary/20 dark:via-emerald-950/30 dark:to-primary/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Find Your Perfect Auckland Sitter?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of Auckland pet owners who trust ZiggySitters for their furry family's care.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/find-sitters')}
              className="gap-2"
            >
              Find Sitters Near Me
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/how-it-works')}
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}