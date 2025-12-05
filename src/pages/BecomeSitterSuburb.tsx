import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import SEOHead from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, DollarSign, MapPin, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';
import EarningsCalculator from '@/components/sitter-recruitment/EarningsCalculator';
import SitterLeadForm from '@/components/sitter-recruitment/SitterLeadForm';

const SUBURB_DATA: Record<string, { 
  name: string; 
  demandLevel: 'high' | 'very-high' | 'moderate';
  avgEarnings: number;
  searchesLastMonth: number;
  description: string;
}> = {
  'grey-lynn': {
    name: 'Grey Lynn',
    demandLevel: 'very-high',
    avgEarnings: 1100,
    searchesLastMonth: 45,
    description: "Grey Lynn is one of Auckland's most pet-friendly neighbourhoods with lots of dog owners needing trusted sitters.",
  },
  'ponsonby': {
    name: 'Ponsonby',
    demandLevel: 'very-high',
    avgEarnings: 1200,
    searchesLastMonth: 52,
    description: "Ponsonby residents love their pets and are willing to pay premium rates for quality pet care.",
  },
  'mt-eden': {
    name: 'Mt Eden',
    demandLevel: 'high',
    avgEarnings: 1000,
    searchesLastMonth: 38,
    description: "Mt Eden has a strong community of pet owners looking for local, trusted pet sitters.",
  },
  'parnell': {
    name: 'Parnell',
    demandLevel: 'high',
    avgEarnings: 1150,
    searchesLastMonth: 35,
    description: "Parnell's affluent residents often travel and need reliable pet care services.",
  },
  'remuera': {
    name: 'Remuera',
    demandLevel: 'very-high',
    avgEarnings: 1300,
    searchesLastMonth: 48,
    description: "Remuera has some of Auckland's highest demand for pet sitters with excellent earning potential.",
  },
  'herne-bay': {
    name: 'Herne Bay',
    demandLevel: 'very-high',
    avgEarnings: 1350,
    searchesLastMonth: 32,
    description: "Herne Bay residents pay premium rates and are looking for experienced, trustworthy sitters.",
  },
  'devonport': {
    name: 'Devonport',
    demandLevel: 'high',
    avgEarnings: 1050,
    searchesLastMonth: 28,
    description: "Devonport's beach-side community loves their pets and values quality pet care.",
  },
  'takapuna': {
    name: 'Takapuna',
    demandLevel: 'high',
    avgEarnings: 1000,
    searchesLastMonth: 41,
    description: "Takapuna has growing demand for pet sitters, especially for drop-in visits and day care.",
  },
};

export default function BecomeSitterSuburb() {
  const { suburb } = useParams<{ suburb: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const referralCode = searchParams.get('ref');
  
  const suburbData = suburb ? SUBURB_DATA[suburb] : null;

  if (!suburbData) {
    // Redirect to main become-sitter page if suburb not found
    navigate('/become-sitter');
    return null;
  }

  const getDemandBadge = () => {
    if (suburbData.demandLevel === 'very-high') {
      return <Badge className="bg-red-500">🔥 Very High Demand</Badge>;
    }
    if (suburbData.demandLevel === 'high') {
      return <Badge className="bg-orange-500">High Demand</Badge>;
    }
    return <Badge variant="secondary">Growing Demand</Badge>;
  };

  return (
    <>
      <SEOHead 
        title={`Pet Sitting Jobs in ${suburbData.name} | Earn $${suburbData.avgEarnings}/month | ZiggySitters`}
        description={`Become a pet sitter in ${suburbData.name}, Auckland. ${suburbData.searchesLastMonth}+ pet owners searched last month. Earn up to $${suburbData.avgEarnings}/month caring for pets in your neighbourhood.`}
        keywords={`pet sitting jobs ${suburbData.name}, become pet sitter ${suburbData.name}, pet care ${suburbData.name} Auckland, earn money pet sitting`}
        canonical={`/become-sitter/${suburb}`}
      />
      
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="text-lg font-medium">{suburbData.name}, Auckland</span>
                {getDemandBadge()}
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
                <span className="block">Pet Sitting Jobs in</span>
                <span className="block bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                  {suburbData.name}
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-3xl mx-auto">
                {suburbData.description}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
                <div className="bg-background/80 backdrop-blur rounded-lg p-4 border">
                  <TrendingUp className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold">{suburbData.searchesLastMonth}+</p>
                  <p className="text-xs text-muted-foreground">Searches/month</p>
                </div>
                <div className="bg-background/80 backdrop-blur rounded-lg p-4 border">
                  <DollarSign className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold">${suburbData.avgEarnings}</p>
                  <p className="text-xs text-muted-foreground">Avg. monthly</p>
                </div>
                <div className="bg-background/80 backdrop-blur rounded-lg p-4 border">
                  <Heart className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold">Low</p>
                  <p className="text-xs text-muted-foreground">Competition</p>
                </div>
              </div>

              <Button 
                size="lg" 
                className="px-12"
                onClick={() => document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Start Earning in {suburbData.name}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>

        {/* Why This Suburb */}
        <section className="py-16 bg-accent/10">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-center mb-8">
                Why Become a Pet Sitter in {suburbData.name}?
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <CheckCircle className="w-8 h-8 text-green-500 mb-4" />
                    <h3 className="font-semibold mb-2">High Demand, Low Supply</h3>
                    <p className="text-muted-foreground text-sm">
                      {suburbData.name} has {suburbData.searchesLastMonth}+ pet owners searching for sitters 
                      each month, but few local sitters to meet demand.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <DollarSign className="w-8 h-8 text-green-500 mb-4" />
                    <h3 className="font-semibold mb-2">Premium Rates</h3>
                    <p className="text-muted-foreground text-sm">
                      Pet owners in {suburbData.name} are willing to pay above-average rates 
                      for quality, local pet care services.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <MapPin className="w-8 h-8 text-green-500 mb-4" />
                    <h3 className="font-semibold mb-2">Work Locally</h3>
                    <p className="text-muted-foreground text-sm">
                      Care for pets right in your neighbourhood. No long commutes - 
                      most clients are within walking distance.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <Heart className="w-8 h-8 text-green-500 mb-4" />
                    <h3 className="font-semibold mb-2">Build Your Reputation</h3>
                    <p className="text-muted-foreground text-sm">
                      {suburbData.name} is a tight-knit community. Happy clients 
                      lead to word-of-mouth referrals and repeat bookings.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Calculator + Form */}
        <section className="py-16" id="lead-form">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold mb-6">Calculate Your Earnings</h2>
                <EarningsCalculator />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold mb-6">Get Started Today</h2>
                <SitterLeadForm 
                  source={`suburb_page_${suburb}`} 
                  prefilledSuburb={suburbData.name}
                />
                {referralCode && (
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Referred by a friend? You'll both get $20 credit!
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Ready to Start Earning in {suburbData.name}?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Join ZiggySitters today and start caring for pets in your neighbourhood. 
              It takes less than 10 minutes to set up your profile.
            </p>
            <Button size="lg" onClick={() => navigate('/auth')}>
              Create Your Profile Now
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
