import { Link, useNavigate } from 'react-router-dom';
import SEOHead from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import iconLocation from '@/assets/icons/icon-location.png';
import iconShield from '@/assets/icons/icon-shield.png';
import iconHeart from '@/assets/icons/icon-heart.png';
import iconCheck from '@/assets/icons/icon-check.png';
import iconStar from '@/assets/icons/icon-star.png';
import iconCamera from '@/assets/icons/icon-camera.png';
import iconHouse from '@/assets/icons/icon-house.png';
import iconClock from '@/assets/icons/icon-clock.png';
import iconCommunity from '@/assets/icons/icon-community.png';
import iconPaw from '@/assets/icons/icon-paw.png';
import iconNum1 from '@/assets/icons/icon-num-1.png';
import iconNum2 from '@/assets/icons/icon-num-2.png';
import iconNum3 from '@/assets/icons/icon-num-3.png';
import iconNum4 from '@/assets/icons/icon-num-4.png';
import houseSittingImg from '@/assets/city/house-sitting.jpg';
import dropInVisitImg from '@/assets/city/drop-in-visit.jpg';
import petBoardingImg from '@/assets/city/pet-boarding.jpg';
import iconBoarding from '@/assets/icons/icon-boarding.png';

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

const heroPhotos = [
  { url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=600&fit=crop', alt: 'Happy golden retriever' },
  { url: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800&h=600&fit=crop', alt: 'Smiling labrador' },
  { url: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800&h=600&fit=crop', alt: 'Curious cat' },
  { url: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=800&h=600&fit=crop', alt: 'French bulldog portrait' },
];

const galleryPhotos = [
  { url: 'https://images.unsplash.com/photo-1544568100-847a948585b9?w=600&h=600&fit=crop', alt: 'Dog at beach' },
  { url: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=600&h=600&fit=crop', alt: 'Cat stretching' },
  { url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&h=600&fit=crop', alt: 'Dalmatian smiling' },
  { url: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=600&h=600&fit=crop', alt: 'Orange cat eyes' },
  { url: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=600&h=600&fit=crop', alt: 'Dog on grass' },
  { url: 'https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?w=600&h=600&fit=crop', alt: 'White cat' },
];

const servicePhotos = {
  houseSitting: houseSittingImg,
  dropIn: dropInVisitImg,
  boarding: petBoardingImg,
};

export default function AucklandPetSitters() {
  const navigate = useNavigate();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "ZiggySitters - Auckland Pet Sitters",
    "description": "New Zealand's trusted local pet sitting service. Find verified pet sitters across Auckland.",
    "areaServed": { "@type": "City", "name": "Auckland", "containedInPlace": { "@type": "Country", "name": "New Zealand" } },
    "address": { "@type": "PostalAddress", "addressLocality": "Auckland", "addressCountry": "NZ" },
    "serviceType": ["Pet Sitting", "House Sitting", "Drop-in Visits"],
  };

  return (
    <>
      <SEOHead 
        title="Pet Sitters Auckland NZ | Local Trusted Pet Care | Ziggy Sitters"
        description="Find trusted, local pet sitters across Auckland, New Zealand. Verified Kiwi sitters for dogs, cats & all pets. House sitting, drop-in visits & daily photo updates."
        keywords="pet sitter auckland, dog sitter auckland, cat sitter auckland, house sitter auckland nz, pet sitting auckland"
        canonical="/pet-sitters-auckland"
        structuredData={structuredData}
      />
      
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=1600&h=900&fit=crop" alt="Auckland harbour with pets" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/20" />
        </div>

        {/* Floating pet photos */}
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
              <Badge className="bg-white/10 text-white border-white/20 backdrop-blur-sm px-4 py-2 text-sm font-body">
                <img src={iconLocation} alt="" className="w-4 h-4 mr-2" />
                100% Kiwi-Owned
              </Badge>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 text-white animate-fade-in font-display" style={{ animationDelay: '0.1s' }}>
              <span className="block mb-2">Auckland's</span>
              <span className="block text-primary">Local</span>
              <span className="block">Pet Sitters</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-xl leading-relaxed animate-fade-in font-body" style={{ animationDelay: '0.2s' }}>
              Real locals who treat your fur babies like family. Daily photo updates so you never miss a moment.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Button 
                size="lg" 
                onClick={() => navigate('/find-sitters')}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg px-8 py-6 shadow-xl"
              >
                Find Your Local Sitter
                <span>→</span>
              </Button>
              <Button 
                size="lg" 
                variant="outline-white"
                onClick={() => navigate('/become-sitter')}
                className="font-semibold px-8 py-6"
              >
                Become a Sitter
              </Button>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-white/70 animate-fade-in font-body" style={{ animationDelay: '0.4s' }}>
              <span className="flex items-center gap-2"><img src={iconCamera} alt="" className="w-5 h-5" /> Daily Photo Updates</span>
              <span className="flex items-center gap-2"><img src={iconCheck} alt="" className="w-5 h-5" /> NZ ID Verified</span>
              <span className="flex items-center gap-2"><img src={iconStar} alt="" className="w-5 h-5" /> 5-Star Reviews</span>
            </div>
          </div>
        </div>
      </section>

      {/* Photo Gallery Section */}
      <section className="py-16 bg-background overflow-hidden">
        <div className="container mx-auto px-4 mb-8">
          <div className="text-center">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3 font-body">Gallery</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground font-display">
              Happy Pets Across Auckland
            </h2>
            <p className="text-lg text-muted-foreground font-body">Real moments from our amazing sitters and their furry guests</p>
          </div>
        </div>
        
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {galleryPhotos.map((photo, index) => (
              <div 
                key={index} 
                className="aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:scale-105 duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <img src={photo.url} alt={photo.alt} className="w-full h-full object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Local */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3 font-body">Why local</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground font-display">
              Why Kiwis Choose Local
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-body">
              Built by Auckland pet owners, for Auckland pet owners. No overseas call centres — just genuine Kiwi service.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { icon: iconLocation, title: 'Your Neighbourhood', desc: "Sitters who know your local parks, emergency vets, and what Auckland weather really means for walkies." },
              { icon: iconShield, title: 'NZ Verified', desc: "Every sitter verified with NZ documents. Real locals you can trust with your home and pets." },
              { icon: iconHeart, title: 'Family Values', desc: "Your pets are treated like family, not just another booking. That's the Kiwi way." },
            ].map((item, i) => (
              <Card key={i} className="group text-center p-8 border border-border hover:shadow-xl transition-all hover:-translate-y-1 bg-card">
                <div className="flex justify-center mb-5">
                  <img src={item.icon} alt="" className="w-14 h-14" />
                </div>
                <h3 className="text-xl font-bold mb-3 font-display text-foreground">{item.title}</h3>
                <p className="text-muted-foreground font-body">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services with photos */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3 font-body">Services</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display text-foreground">
              Pet Care Services Across Auckland
            </h2>
            <p className="text-lg text-muted-foreground font-body">
              From the Shore to South Auckland — we've got your pets sorted
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { icon: iconHouse, title: 'House Sitting', desc: "Your sitter stays overnight in your home. Pets stay comfortable, plants get watered, mail gets collected.", img: servicePhotos.houseSitting },
              { icon: iconClock, title: 'Drop-in Visits', desc: "Daily visits for feeding, cuddles, and playtime. Perfect for cats and independent pets.", img: servicePhotos.dropIn },
              { icon: iconBoarding, title: 'Pet Boarding', desc: "Your pet stays at the sitter's home. Great for social pets who love company.", img: servicePhotos.boarding },
            ].map((s) => (
              <Card key={s.title} className="group overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-border">
                <div className="relative h-48 overflow-hidden">
                  <img src={s.img} alt={s.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <img src={s.icon} alt="" className="w-10 h-10" />
                    <h3 className="text-xl font-bold font-display text-foreground">{s.title}</h3>
                  </div>
                  <p className="text-muted-foreground font-body">{s.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pets We Care For */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3 font-body">All pets</p>
            <h2 className="text-3xl font-bold mb-4 font-display text-foreground">All Creatures Great & Small</h2>
            <p className="text-muted-foreground font-body">Auckland sitters experienced with all your furry, feathered, and scaly mates</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            {['Dogs', 'Cats', 'Birds', 'Rabbits', 'Small Pets', 'Reptiles'].map((pet) => (
              <div 
                key={pet}
                className="group flex items-center gap-3 bg-card px-6 py-4 rounded-2xl shadow-md hover:shadow-xl transition-all hover:scale-105 cursor-default border border-border"
              >
                <img src={iconPaw} alt="" className="w-8 h-8" />
                <span className="font-semibold text-lg font-body text-foreground">{pet}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Auckland Suburbs - SEO */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <div className="flex justify-center mb-4">
              <img src={iconLocation} alt="" className="w-10 h-10" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display text-foreground">
              Find Sitters in Your Suburb
            </h2>
            <p className="text-lg text-muted-foreground font-body">
              Local sitters across Auckland — from Devonport to Manukau
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            {regions.map(region => {
              const regionSuburbs = AUCKLAND_SUBURBS.filter(s => s.region === region);
              return (
                <div key={region} className="mb-10">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2 font-display text-foreground">
                    <span className="w-3 h-3 rounded-full bg-primary" />
                    {region} Auckland
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {regionSuburbs.map(suburb => (
                      <Link 
                        key={suburb.slug}
                        to={`/find-sitters/${suburb.slug}`}
                        className="px-4 py-2.5 bg-card hover:bg-accent border border-border rounded-xl text-sm font-medium transition-all hover:text-accent-foreground hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 font-body"
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
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3 font-body">How it works</p>
            <h2 className="text-3xl font-bold mb-4 font-display text-foreground">Easy as — Here's How It Works</h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { icon: iconNum1, stepIcon: iconLocation, title: 'Search Locally', desc: 'Browse verified sitters in your Auckland neighbourhood' },
              { icon: iconNum2, stepIcon: iconCommunity, title: 'Have a Yarn', desc: 'Message sitters and arrange a meet & greet' },
              { icon: iconNum3, stepIcon: iconShield, title: 'Book Securely', desc: 'Book online with secure NZ payment' },
              { icon: iconNum4, stepIcon: iconCamera, title: 'Stay Connected', desc: 'Get daily photos & updates of your happy pet' },
            ].map((item) => (
              <div key={item.title} className="text-center group">
                <div className="flex justify-center mb-5">
                  <img src={item.stepIcon} alt="" className="w-14 h-14" />
                </div>
                <h3 className="font-bold mb-2 text-lg font-display text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground font-body">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-14">
            <Button 
              size="lg" 
              onClick={() => navigate('/find-sitters')}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-10 py-6 text-lg shadow-xl"
            >
              Get Started — Find Your Sitter
              <span className="ml-2">→</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-display">
            Ready to Find Your Perfect Auckland Sitter?
          </h2>
          <p className="text-xl text-secondary-foreground/60 mb-10 max-w-2xl mx-auto font-body">
            Join Auckland pet owners who trust ZiggySitters with their fur babies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/find-sitters')}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-10 py-6 text-lg shadow-xl"
            >
              Find Sitters Near Me
              <span className="ml-2">→</span>
            </Button>
            <Button 
              size="lg" 
              variant="outline-white"
              onClick={() => navigate('/how-it-works')}
              className="font-semibold px-10 py-6 text-lg"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
