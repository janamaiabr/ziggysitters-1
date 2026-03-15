import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';

import { MapPin, Star, Shield, Heart } from 'lucide-react';

export default function PetSitterWellington() {
  return (
    <>
      <Helmet>
        <title>Pet Sitter Wellington | Trusted Local Pet Sitters | ZiggySitters</title>
        <meta name="description" content="Find trusted pet sitters in Wellington, NZ. Verified local sitters for dogs, cats & more. Book online, secure payments, 24/7 support. From $50/day." />
        <meta name="keywords" content="pet sitter wellington, dog sitter wellington, cat sitter wellington, pet sitting wellington nz, house sitter wellington" />
        <link rel="canonical" href="https://ziggysitters.co.nz/pet-sitter-wellington" />
      </Helmet>
      
      <Header />
      
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/10 to-background py-16 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="text-muted-foreground">Wellington, New Zealand</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Trusted Pet Sitters in Wellington
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Find verified, loving pet sitters across Wellington region. 
              Your pets deserve the best care while you're away.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/search?city=Wellington">Find a Sitter Near You</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/become-a-sitter">Become a Sitter</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Trust Signals */}
        <section className="py-12 border-b">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-primary">100+</div>
                <div className="text-muted-foreground">Wellington Sitters</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">4.9★</div>
                <div className="text-muted-foreground">Average Rating</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">2,000+</div>
                <div className="text-muted-foreground">Happy Pets</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">100%</div>
                <div className="text-muted-foreground">Verified Sitters</div>
              </div>
            </div>
          </div>
        </section>

        {/* Wellington Areas */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-8">
              Pet Sitters Across Wellington
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                'Wellington Central', 'Lower Hutt', 'Upper Hutt', 'Porirua',
                'Kapiti Coast', 'Johnsonville', 'Karori', 'Miramar',
                'Newtown', 'Island Bay', 'Petone', 'Eastbourne'
              ].map((area) => (
                <Link 
                  key={area}
                  to={`/search?city=Wellington&suburb=${encodeURIComponent(area)}`}
                  className="p-4 border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-center"
                >
                  {area}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-8">
              Pet Sitting Services in Wellington
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-background p-6 rounded-lg border">
                <Heart className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">In-Home Pet Sitting</h3>
                <p className="text-muted-foreground mb-4">
                  Your pet stays comfortable at home while a trusted sitter visits daily.
                </p>
                <p className="font-semibold text-primary">From $50/day</p>
              </div>
              <div className="bg-background p-6 rounded-lg border">
                <Star className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Pet Boarding</h3>
                <p className="text-muted-foreground mb-4">
                  Your pet stays at the sitter's home for a home-away-from-home experience.
                </p>
                <p className="font-semibold text-primary">From $60/day</p>
              </div>
              <div className="bg-background p-6 rounded-lg border">
                <Shield className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Drop-in Visits</h3>
                <p className="text-muted-foreground mb-4">
                  Quick check-ins for feeding, playtime, and medication.
                </p>
                <p className="font-semibold text-primary">From $30/visit</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Find Your Wellington Pet Sitter?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of Wellington pet owners who trust ZiggySitters for their pet care needs.
            </p>
            <Button size="lg" asChild>
              <Link to="/search?city=Wellington">Search Wellington Sitters</Link>
            </Button>
          </div>
        </section>
      </main>
      
    </>
  );
}
