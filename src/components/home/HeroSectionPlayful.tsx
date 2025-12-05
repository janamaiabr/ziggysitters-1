import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Camera, Heart, Star, Search, Shield, Award } from 'lucide-react';
import SuburbAutocomplete from '@/components/search/SuburbAutocomplete';
import { useNavigate } from 'react-router-dom';
import petServicesImg from '@/assets/pet-services.jpg';

interface HeroSectionPlayfulProps {
  location: string;
  setLocation: (value: string) => void;
  serviceType: string;
  setServiceType: (value: string) => void;
  checkIn: string;
  setCheckIn: (value: string) => void;
  checkOut: string;
  setCheckOut: (value: string) => void;
}

const HeroSectionPlayful = ({
  location,
  setLocation,
  serviceType,
  setServiceType,
  checkIn,
  setCheckIn,
  checkOut,
  setCheckOut
}: HeroSectionPlayfulProps) => {
  const navigate = useNavigate();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (serviceType) params.set('serviceType', serviceType);
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    navigate(`/find-sitters?${params.toString()}`);
  };

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-background">
      {/* Luxury background pattern */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Subtle diagonal lines pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              hsl(var(--foreground)) 0px,
              hsl(var(--foreground)) 1px,
              transparent 1px,
              transparent 60px
            )`
          }}
        />
        {/* Warm gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/40 via-transparent to-primary/5" />
        {/* Gold accent glow */}
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px]" />
      </div>

      {/* SPCA Charity Badge - Top Left */}
      <div className="absolute top-6 left-6 md:top-8 md:left-8 z-20 animate-fade-in">
        <Badge className="bg-secondary text-secondary-foreground border-none px-5 py-2.5 text-sm font-medium shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2 rounded-full">
          <Heart className="w-4 h-4 fill-current" />
          5% Donated to SPCA NZ
        </Badge>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-20 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 md:gap-16 items-center mb-8 md:mb-12">
            {/* Left side - Content */}
            <div className="space-y-8 animate-fade-in">
              {/* Luxury badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent border border-border rounded-full">
                <Award className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground tracking-wide uppercase">Premium Pet Care</span>
              </div>

              {/* Main Headline - Luxury Typography */}
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-semibold tracking-tight leading-[1.1]">
                  <span className="block text-foreground">Never Wonder</span>
                  <span className="block text-gradient-gold py-1">"How's My Pet?"</span>
                  <span className="block text-foreground">Again.</span>
                </h1>
                
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl font-body">
                  Experience peace of mind with <span className="text-foreground font-medium">guaranteed daily updates</span>. Our sitters must deliver photo reports, or face a 15% payment reduction.
                </p>
              </div>

              {/* Luxury Value Props */}
              <div className="flex flex-wrap gap-4">
                {[
                  { icon: Camera, text: "Daily Photo Reports" },
                  { icon: Shield, text: "Verified Sitters" },
                  { icon: Star, text: "4.9★ Excellence" }
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-3 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300"
                  >
                    <item.icon className="w-5 h-5 text-primary" />
                    <span className="font-medium text-foreground">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side - Elegant Photo Display */}
            <div className="relative hidden lg:block animate-scale-in">
              <div className="relative w-full h-[520px]">
                {/* Main large photo with luxury frame */}
                <div className="absolute top-0 right-0 w-[380px] h-[320px] rounded-2xl overflow-hidden shadow-[var(--shadow-hover)] border-luxury animate-float">
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary/20 to-transparent z-10" />
                  <img 
                    src={petServicesImg} 
                    alt="Happy pet with sitter" 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Second photo with offset */}
                <div className="absolute top-48 left-0 w-[320px] h-[260px] rounded-2xl overflow-hidden shadow-[var(--shadow-hover)] border-luxury" style={{ animationDelay: '2s' }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary/20 to-transparent z-10" />
                  <img 
                    src={petServicesImg} 
                    alt="Pet sitting service" 
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Decorative gold accent */}
                <div className="absolute -bottom-4 right-20 w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 blur-2xl" />
                
                {/* Trust badge overlay */}
                <div className="absolute bottom-8 right-8 bg-card/95 backdrop-blur-sm rounded-xl px-5 py-4 shadow-lg border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Fully Verified</p>
                      <p className="text-xs text-muted-foreground">ID & Background Checked</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search Card - Luxury Design */}
          <div className="w-full flex justify-center items-center">
            <div className="bg-card rounded-2xl p-6 md:p-8 shadow-[var(--shadow-soft)] border border-border hover:shadow-[var(--shadow-hover)] transition-all duration-500 w-full max-w-4xl border-luxury">
              <h3 className="text-xl md:text-2xl font-display font-semibold mb-5 text-center text-foreground">Find Your Perfect Sitter</h3>
              
              <div className="flex flex-col lg:flex-row gap-3 items-stretch">
                <SuburbAutocomplete
                  value={location}
                  onChange={setLocation}
                  placeholder="Enter suburb or city"
                  className="h-12 font-body"
                />
                
                <Select value={serviceType} onValueChange={setServiceType}>
                  <SelectTrigger className="h-12 w-full lg:w-[200px] text-base font-body">
                    <SelectValue placeholder="Service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pet_sitting_sitters_home">At Sitter's Home</SelectItem>
                    <SelectItem value="pet_sitting_owners_home">At Your Home</SelectItem>
                    <SelectItem value="drop_in_visits">Drop-in Visits</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="relative w-full lg:w-[180px]">
                  <Input 
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="h-12 w-full text-base font-body [&::-webkit-datetime-edit]:opacity-0 [&::-webkit-datetime-edit]:focus:opacity-100 [&:not(:placeholder-shown)]:!opacity-100"
                    style={{
                      opacity: checkIn ? 1 : undefined
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    aria-label="Check-in date"
                  />
                  {!checkIn && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-base pointer-events-none select-none font-body">
                      Check-in
                    </span>
                  )}
                </div>
                
                <div className="relative w-full lg:w-[180px]">
                  <Input 
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="h-12 w-full text-base font-body [&::-webkit-datetime-edit]:opacity-0 [&::-webkit-datetime-edit]:focus:opacity-100 [&:not(:placeholder-shown)]:!opacity-100"
                    style={{
                      opacity: checkOut ? 1 : undefined
                    }}
                    min={checkIn || new Date().toISOString().split('T')[0]}
                    aria-label="Check-out date"
                  />
                  {!checkOut && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-base pointer-events-none select-none font-body">
                      Check-out
                    </span>
                  )}
                </div>
                
                <Button 
                  size="lg" 
                  className="w-full lg:w-auto min-h-[48px] h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] px-8 whitespace-nowrap bg-secondary hover:bg-secondary/90 text-secondary-foreground font-body"
                  onClick={handleSearch}
                >
                  <Search className="mr-2 h-5 w-5" />
                  Search Sitters
                </Button>
              </div>
            </div>
          </div>

          {/* Social Proof */}
          <div className="flex justify-center items-center gap-8 mt-8 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground text-lg">500+</span>
              <span>Happy Pet Owners</span>
            </div>
            <div className="w-px h-6 bg-border" />
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground text-lg">98%</span>
              <span>Report Completion</span>
            </div>
            <div className="w-px h-6 bg-border hidden md:block" />
            <div className="hidden md:flex items-center gap-2">
              <span className="font-semibold text-foreground text-lg">24/7</span>
              <span>Support Available</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSectionPlayful;