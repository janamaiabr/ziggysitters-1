import { Link, useNavigate } from 'react-router-dom';
import SEOHead from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Shield, Heart, ArrowRight, Check, Dog, Cat, Bird, Home, Clock, Users } from 'lucide-react';

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
      
      {/* Hero Section - Authentic Kiwi feel */}
      <section className="relative py-20 lg:py-28 overflow-hidden bg-[#1a3a2f]">
        {/* Silver fern pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTUwIDEwQzUwIDEwIDMwIDMwIDMwIDUwQzMwIDcwIDUwIDkwIDUwIDkwQzUwIDkwIDcwIDcwIDcwIDUwQzcwIDMwIDUwIDEwIDUwIDEwWiIgc3Ryb2tlPSJ3aGl0ZSIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+')] bg-repeat" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-white/10 text-white border-white/20 backdrop-blur-sm px-4 py-2">
              <MapPin className="w-4 h-4 mr-2" />
              Proudly Kiwi-Owned & Operated
            </Badge>
            
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-white">
              <span className="block mb-2">Tāmaki Makaurau's</span>
              <span className="block text-emerald-400">
                Trusted Pet Sitters
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
              Real locals. Real care. Real peace of mind. We connect Auckland pet owners with verified neighbourhood sitters who treat your fur babies like whānau.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <Button 
                size="lg" 
                onClick={() => navigate('/find-sitters')}
                className="gap-2 bg-white text-[#1a3a2f] hover:bg-white/90 font-semibold text-base px-8"
              >
                Find Your Local Sitter
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/become-sitter')}
                className="border-white/30 text-white hover:bg-white/10"
              >
                Become a Sitter
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-white/70">
              <span className="flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-400" /> NZ ID Verified
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-400" /> Daily Photo Updates
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-400" /> Local Auckland Support
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Why Local - Kiwi values */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Why Kiwis Choose <span className="text-emerald-600">Local</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built by Auckland pet owners, for Auckland pet owners. No overseas call centres - just genuine Kiwi service.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="text-center p-8 border-2 hover:border-emerald-500/50 transition-all hover:shadow-lg">
              <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                <MapPin className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Your Neighbourhood</h3>
              <p className="text-muted-foreground">
                Sitters who know your local parks, emergency vets, and what Auckland weather really means for walkies.
              </p>
            </Card>

            <Card className="text-center p-8 border-2 hover:border-emerald-500/50 transition-all hover:shadow-lg">
              <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                <Shield className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">NZ Verified</h3>
              <p className="text-muted-foreground">
                Every sitter verified with NZ documents. Real locals you can trust with your home and pets - sweet as.
              </p>
            </Card>

            <Card className="text-center p-8 border-2 hover:border-emerald-500/50 transition-all hover:shadow-lg">
              <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                <Heart className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Whānau Values</h3>
              <p className="text-muted-foreground">
                Your pets are treated like family, not just another booking. That's the Kiwi way.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pet Care Services Across Auckland
            </h2>
            <p className="text-lg text-muted-foreground">
              From the Shore to South Auckland - we've got your pets sorted
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Home className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">House Sitting</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Your sitter stays overnight in your home. Pets stay comfortable, plants get watered, mail gets collected.
              </p>
              <p className="text-lg font-semibold text-primary">From $65/night</p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Drop-in Visits</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Daily visits for feeding, cuddles, and playtime. Perfect for cats and independent pets.
              </p>
              <p className="text-lg font-semibold text-primary">From $35/visit</p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Pet Boarding</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Your pet stays at the sitter's home. Great for social pets who love company.
              </p>
              <p className="text-lg font-semibold text-primary">From $55/night</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Pets We Care For */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">All Creatures Great & Small</h2>
            <p className="text-muted-foreground">Auckland sitters experienced with all your furry, feathered, and scaly mates</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            <Badge variant="secondary" className="text-base px-5 py-2.5 gap-2">
              <Dog className="w-4 h-4" /> Dogs
            </Badge>
            <Badge variant="secondary" className="text-base px-5 py-2.5 gap-2">
              <Cat className="w-4 h-4" /> Cats
            </Badge>
            <Badge variant="secondary" className="text-base px-5 py-2.5 gap-2">
              <Bird className="w-4 h-4" /> Birds
            </Badge>
            <Badge variant="secondary" className="text-base px-5 py-2.5">
              🐰 Rabbits
            </Badge>
            <Badge variant="secondary" className="text-base px-5 py-2.5">
              🐹 Small Pets
            </Badge>
            <Badge variant="secondary" className="text-base px-5 py-2.5">
              🦎 Reptiles
            </Badge>
            <Badge variant="secondary" className="text-base px-5 py-2.5">
              🐴 Horses
            </Badge>
          </div>
        </div>
      </section>

      {/* Auckland Suburbs - SEO */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Find Sitters in Your Auckland Suburb
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
                  <h3 className="text-xl font-bold mb-4 text-emerald-600 dark:text-emerald-400">
                    {region} Auckland
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {regionSuburbs.map(suburb => (
                      <Link 
                        key={suburb.slug}
                        to={`/find-sitters/${suburb.slug}`}
                        className="px-4 py-2.5 bg-background hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-border rounded-lg text-sm font-medium transition-all hover:text-emerald-600 hover:border-emerald-300"
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
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-4">Easy as - Here's How It Works</h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xl">1</div>
              <h3 className="font-bold mb-2 text-lg">Search Locally</h3>
              <p className="text-sm text-muted-foreground">Browse verified sitters in your Auckland neighbourhood</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xl">2</div>
              <h3 className="font-bold mb-2 text-lg">Have a Yarn</h3>
              <p className="text-sm text-muted-foreground">Message sitters and arrange a meet & greet</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xl">3</div>
              <h3 className="font-bold mb-2 text-lg">Book Securely</h3>
              <p className="text-sm text-muted-foreground">Book online with secure NZ payment</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xl">4</div>
              <h3 className="font-bold mb-2 text-lg">Stay Connected</h3>
              <p className="text-sm text-muted-foreground">Get daily photos & updates of your happy pet</p>
            </div>
          </div>

          <div className="text-center mt-14">
            <Button 
              size="lg" 
              onClick={() => navigate('/find-sitters')}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8"
            >
              Get Started - Find Your Sitter
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-[#1a3a2f] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Find Your Perfect Auckland Sitter?
          </h2>
          <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto">
            Join thousands of Auckland pet owners who trust ZiggySitters with their fur babies. It's time to book your next holiday worry-free.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/find-sitters')}
              className="gap-2 bg-white text-[#1a3a2f] hover:bg-white/90 font-semibold px-8"
            >
              Find Sitters Near Me
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/how-it-works')}
              className="border-white/30 text-white hover:bg-white/10"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}