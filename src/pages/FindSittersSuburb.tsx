import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import SEOHead from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Shield, Calendar, Heart, ArrowRight, Search, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import EnhancedSitterCard from '@/components/search/EnhancedSitterCard';


// Suburb data for SEO content
const SUBURB_DATA: Record<string, { 
  name: string; 
  description: string;
  seoDescription: string;
  popularAreas: string[];
  avgRate: string;
}> = {
  'ponsonby': {
    name: 'Ponsonby',
    description: "Find trusted pet sitters in Ponsonby, one of Auckland's most pet-friendly suburbs.",
    seoDescription: "Looking for reliable pet sitting in Ponsonby, Auckland? Connect with verified local pet sitters for house sitting, drop-in visits and pet care. Book trusted sitters today.",
    popularAreas: ['Grey Lynn', 'Herne Bay', 'Freemans Bay'],
    avgRate: '$65-85',
  },
  'grey-lynn': {
    name: 'Grey Lynn',
    description: "Discover experienced pet sitters in Grey Lynn who love animals as much as you do.",
    seoDescription: "Need a pet sitter in Grey Lynn? Find verified, trusted pet sitters for dogs, cats and other pets. In-home pet sitting, daily visits and more.",
    popularAreas: ['Ponsonby', 'Westmere', 'Kingsland'],
    avgRate: '$60-80',
  },
  'remuera': {
    name: 'Remuera',
    description: "Premium pet sitting services in Remuera from verified local sitters.",
    seoDescription: "Remuera's trusted pet sitters. Verified professionals for house sitting, pet care and daily check-ins. Book your local sitter today.",
    popularAreas: ['Epsom', 'Newmarket', 'Mission Bay'],
    avgRate: '$70-90',
  },
  'mt-eden': {
    name: 'Mt Eden',
    description: "Connect with caring pet sitters in Mt Eden who treat your pets like family.",
    seoDescription: "Find trusted pet sitters in Mt Eden, Auckland. Verified local sitters offering house sitting, dog walking, and pet care services.",
    popularAreas: ['Kingsland', 'Sandringham', 'Epsom'],
    avgRate: '$60-80',
  },
  'parnell': {
    name: 'Parnell',
    description: "Quality pet care from experienced sitters in the heart of Parnell.",
    seoDescription: "Looking for pet sitters in Parnell? Connect with trusted, ID-verified sitters for dogs, cats and pets. Book house sitting and daily visits.",
    popularAreas: ['Newmarket', 'Remuera', 'Auckland CBD'],
    avgRate: '$65-85',
  },
  'devonport': {
    name: 'Devonport',
    description: "Beachside pet sitting from trusted Devonport locals.",
    seoDescription: "Find reliable pet sitters in Devonport on Auckland's North Shore. Trusted local sitters for house sitting, pet care and dog walking.",
    popularAreas: ['Takapuna', 'Bayswater', 'Stanley Bay'],
    avgRate: '$60-80',
  },
  'takapuna': {
    name: 'Takapuna',
    description: "North Shore's best pet sitters, right here in Takapuna.",
    seoDescription: "Takapuna pet sitters you can trust. Verified, local pet care professionals for house sitting, daily visits and more on the North Shore.",
    popularAreas: ['Devonport', 'Milford', 'Belmont'],
    avgRate: '$60-80',
  },
  'herne-bay': {
    name: 'Herne Bay',
    description: "Premium pet care from experienced sitters in beautiful Herne Bay.",
    seoDescription: "Herne Bay pet sitters offering trusted, professional pet care. ID-verified sitters for house sitting, drop-in visits and dog walking.",
    popularAreas: ['Ponsonby', 'Westmere', 'Grey Lynn'],
    avgRate: '$70-95',
  },
  'newmarket': {
    name: 'Newmarket',
    description: "Convenient pet sitting services from verified sitters in Newmarket.",
    seoDescription: "Need a pet sitter in Newmarket? Find trusted, local pet sitters for all your pet care needs. Verified sitters, easy booking.",
    popularAreas: ['Parnell', 'Epsom', 'Remuera'],
    avgRate: '$60-80',
  },
  'epsom': {
    name: 'Epsom',
    description: "Caring pet sitters in Epsom ready to look after your furry family members.",
    seoDescription: "Epsom pet sitters you can trust. Find verified local sitters for dogs, cats, and pets. House sitting, daily visits, and more.",
    popularAreas: ['Mt Eden', 'Newmarket', 'Remuera'],
    avgRate: '$60-80',
  },
  'mission-bay': {
    name: 'Mission Bay',
    description: "Beach-loving pet sitters in Mission Bay for your furry friends.",
    seoDescription: "Mission Bay pet sitting services from trusted local sitters. Verified professionals for house sitting and pet care near the beach.",
    popularAreas: ['St Heliers', 'Kohimarama', 'Orakei'],
    avgRate: '$65-85',
  },
  'kingsland': {
    name: 'Kingsland',
    description: "Local pet sitters in vibrant Kingsland who love what they do.",
    seoDescription: "Find trusted pet sitters in Kingsland, Auckland. Verified local sitters offering house sitting, drop-in visits and pet care.",
    popularAreas: ['Mt Eden', 'Grey Lynn', 'Morningside'],
    avgRate: '$55-75',
  },
};

interface SitterProfile {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  bio: string | null;
  suburb: string | null;
  city: string | null;
  rating: number | null;
  total_reviews: number | null;
  is_verified: boolean | null;
  golden_badge_approved: boolean | null;
  services: string[];
  pet_types: string[];
  baseRate: number | null;
  sitterServices?: any[];
}

export default function FindSittersSuburb() {
  const { suburb } = useParams<{ suburb: string }>();
  const navigate = useNavigate();
  const [sitters, setSitters] = useState<SitterProfile[]>([]);
  const [nearbySitters, setNearbySitters] = useState<SitterProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const suburbData = suburb ? SUBURB_DATA[suburb] : null;
  const suburbName = suburbData?.name || suburb?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Auckland';

  useEffect(() => {
    fetchSitters();
  }, [suburb]);

  const fetchSitters = async () => {
    try {
      setLoading(true);
      
      // Fetch all verified sitters with their services
      const { data: sittersData } = await supabase.rpc('get_public_sitters');
      
      const { data: servicesData } = await supabase
        .from('sitter_services')
        .select('sitter_id, service_type, daily_rate, overnight_rate, accepted_pet_species, is_offered, experience_years, max_pets, has_fenced_yard')
        .eq('is_offered', true);

      if (!sittersData) {
        setSitters([]);
        return;
      }

      // Map sitters with their services
      const sittersWithServices = sittersData
        .filter(s => s.is_verified && s.onboarding_completed)
        .map(sitter => {
          const sitterServices = servicesData?.filter(s => s.sitter_id === sitter.id) || [];
          const serviceNames = sitterServices.map(s => {
            switch (s.service_type) {
              case 'pet_sitting_owners_home': return 'Pet Sitting (Your Home)';
              case 'pet_sitting_sitters_home': return "Pet Sitting (Sitter's Home)";
              case 'drop_in_visits': return 'Drop-in Visits';
              default: return s.service_type;
            }
          });
          
          const petTypes = [...new Set(sitterServices.flatMap(s => s.accepted_pet_species || []))];
          const rates = sitterServices.map(s => s.daily_rate || s.overnight_rate).filter(Boolean);
          const baseRate = rates.length > 0 ? Math.min(...rates) : null;

          return {
            ...sitter,
            services: serviceNames,
            pet_types: petTypes,
            baseRate,
            sitterServices,
          };
        });

      // Filter by suburb (case insensitive match)
      const suburbLower = suburbName.toLowerCase();
      const matchingSitters = sittersWithServices.filter(s => 
        s.suburb?.toLowerCase().includes(suburbLower) ||
        suburbLower.includes(s.suburb?.toLowerCase() || '')
      );

      // Get nearby sitters (from different suburbs)
      const otherSitters = sittersWithServices.filter(s => 
        !s.suburb?.toLowerCase().includes(suburbLower) &&
        !suburbLower.includes(s.suburb?.toLowerCase() || '')
      ).slice(0, 6);

      setSitters(matchingSitters);
      setNearbySitters(otherSitters);
    } catch (error) {
      console.error('Error fetching sitters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookSitter = (sitterId: string) => {
    navigate(`/sitter/${sitterId}`);
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": `Pet Sitters in ${suburbName}, Auckland`,
    "description": suburbData?.seoDescription || `Find trusted pet sitters in ${suburbName}, Auckland. Verified local sitters for dogs, cats and pets.`,
    "areaServed": {
      "@type": "City",
      "name": "Auckland",
      "containsPlace": {
        "@type": "AdministrativeArea",
        "name": suburbName
      }
    },
    "serviceType": ["Pet Sitting", "House Sitting", "Dog Walking", "Drop-in Visits"]
  };

  const mapSitterToCardProps = (sitter: SitterProfile) => ({
    id: sitter.id,
    name: `${sitter.first_name} ${sitter.last_name?.charAt(0) || ''}.`,
    location: `${sitter.suburb || ''}, ${sitter.city || 'Auckland'}`,
    baseRate: sitter.baseRate || 0,
    bio: sitter.bio || '',
    image: sitter.avatar_url,
    services: sitter.services,
    verified: sitter.is_verified || false,
    golden_badge: sitter.golden_badge_approved || false,
    sitterServices: sitter.sitterServices,
  });

  // Total sitters available (local + nearby)
  const totalSitters = sitters.length + nearbySitters.length;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title={`Pet Sitters in ${suburbName} | Trusted Local Pet Care | Ziggy Sitters`}
        description={suburbData?.seoDescription || `Find trusted, verified pet sitters in ${suburbName}, Auckland. Book reliable local sitters for dogs, cats and pets. House sitting, drop-in visits and more.`}
        keywords={`pet sitter ${suburbName}, dog sitter ${suburbName}, cat sitter ${suburbName}, house sitter ${suburbName}, pet care Auckland, ${suburbName} pet sitting`}
        canonical={`/find-sitters/${suburb}`}
        structuredData={structuredData}
      />
      
      {/* Hero Section - Compact with sitter count */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-10 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <MapPin className="w-3 h-3 mr-1" />
              {suburbName}, Auckland
            </Badge>
            
            <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-foreground">
              Pet Sitters in {suburbName}
            </h1>
            
            <p className="text-lg text-muted-foreground mb-4 max-w-2xl mx-auto">
              {suburbData?.description || `Find trusted, verified pet sitters in ${suburbName} who will care for your pets like family.`}
            </p>

            {/* Show sitter availability count immediately */}
            {!loading && (
              <p className="text-primary font-semibold text-lg mb-2">
                {sitters.length > 0 
                  ? `${sitters.length} sitter${sitters.length > 1 ? 's' : ''} available in ${suburbName}`
                  : totalSitters > 0 
                    ? `${totalSitters} sitters available nearby`
                    : 'Searching for sitters...'
                }
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              No payment required • Free to browse & enquire
            </p>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-12 bg-muted/30 border-y">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <Shield className="w-8 h-8 text-primary" />
              <span className="font-semibold">ID Verified</span>
              <span className="text-sm text-muted-foreground">All sitters checked</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Star className="w-8 h-8 text-amber-500" />
              <span className="font-semibold">5-Star Reviews</span>
              <span className="text-sm text-muted-foreground">Trusted by pet owners</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Calendar className="w-8 h-8 text-primary" />
              <span className="font-semibold">Daily Updates</span>
              <span className="text-sm text-muted-foreground">Photos & reports</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Heart className="w-8 h-8 text-rose-500" />
              <span className="font-semibold">Local Sitters</span>
              <span className="text-sm text-muted-foreground">In your neighbourhood</span>
            </div>
          </div>
        </div>
      </section>

      {/* Sitters Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">
            {sitters.length > 0 
              ? `Pet Sitters Available in ${suburbName}` 
              : `Pet Sitters Near ${suburbName}`
            }
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-32 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : sitters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sitters.map(sitter => (
                <EnhancedSitterCard
                  key={sitter.id}
                  sitter={mapSitterToCardProps(sitter)}
                  onViewProfile={() => handleBookSitter(sitter.id)}
                />
              ))}
            </div>
          ) : nearbySitters.length > 0 ? (
            // No exact suburb match but have nearby sitters - show them directly
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nearbySitters.map(sitter => (
                <EnhancedSitterCard
                  key={sitter.id}
                  sitter={mapSitterToCardProps(sitter)}
                  onViewProfile={() => handleBookSitter(sitter.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No sitters in {suburbName} yet</h3>
              <p className="text-muted-foreground mb-6">
                We're growing! Check out all available sitters.
              </p>
              <Button onClick={() => navigate('/find-sitters')}>
                View All Auckland Sitters
              </Button>
            </div>
          )}

          {/* Nearby Sitters */}
          {nearbySitters.length > 0 && (
            <div className="mt-16">
              <h3 className="text-xl font-semibold mb-6">
                {sitters.length > 0 ? 'More Sitters Nearby' : `Sitters in Nearby Suburbs`}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nearbySitters.map(sitter => (
                  <EnhancedSitterCard
                    key={sitter.id}
                    sitter={mapSitterToCardProps(sitter)}
                    onViewProfile={() => handleBookSitter(sitter.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">
              Why Choose Ziggy Sitters in {suburbName}?
            </h2>
            
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="mb-4">
                Finding reliable pet care in {suburbName} shouldn't be stressful. Ziggy Sitters connects 
                you with verified, local pet sitters who understand the {suburbName} community and can 
                provide the personalized care your pets deserve.
              </p>
              
              <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">
                Pet Sitting Services in {suburbName}
              </h3>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span><strong>House Sitting</strong> - Sitters stay in your home while you're away</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span><strong>Drop-in Visits</strong> - Daily check-ins for feeding and playtime</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span><strong>Pet Boarding</strong> - Your pet stays at the sitter's home</span>
                </li>
              </ul>

              {suburbData?.popularAreas && (
                <>
                  <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">
                    Also Serving Nearby Areas
                  </h3>
                  <p className="mb-4">
                    Our {suburbName} pet sitters also serve nearby suburbs including{' '}
                    {suburbData.popularAreas.join(', ')}. Search for sitters in these areas too.
                  </p>
                </>
              )}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                onClick={() => navigate(`/find-sitters?location=${encodeURIComponent(suburbName)}`)}
                className="gap-2"
              >
                View Available Sitters
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate(`/become-sitter/${suburb}`)}
              >
                Become a Sitter in {suburbName}
              </Button>
            </div>
          </div>
        </div>
      </section>

      
    </div>
  );
}
