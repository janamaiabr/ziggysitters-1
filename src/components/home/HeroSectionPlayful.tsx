import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, Heart, Star, Search, Shield, ChevronRight } from 'lucide-react';
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
    <section className="relative min-h-[92vh] flex items-center bg-background overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/[0.03] rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
      </div>

      <div className="container mx-auto px-6 lg:px-8 py-16 md:py-24 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Charity badge */}
          <div className="mb-8 animate-fade-in">
            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full">
              <Heart className="w-4 h-4 text-primary fill-primary" />
              5% of every booking donated to SPCA NZ
            </span>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            {/* Left - Content */}
            <div className="space-y-8 animate-fade-in">
              {/* Headline */}
              <div className="space-y-5">
                <h1 className="text-[3.25rem] md:text-[4rem] lg:text-[4.5rem] font-bold tracking-tight leading-[1.08]">
                  <span className="text-foreground">Pet care you can </span>
                  <span className="text-primary">actually</span>
                  <span className="text-foreground"> trust</span>
                </h1>
                
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg">
                  Verified sitters who send daily photo updates. If they don't, they lose 15% of their pay. That's the ZiggySitters guarantee.
                </p>
              </div>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: Camera, text: "Daily photo reports" },
                  { icon: Shield, text: "ID verified" },
                  { icon: Star, text: "4.9 rating" }
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-2 bg-muted/50 rounded-full px-4 py-2.5 text-sm font-medium text-foreground"
                  >
                    <item.icon className="w-4 h-4 text-secondary" />
                    {item.text}
                  </div>
                ))}
              </div>

              {/* CTA for mobile */}
              <div className="lg:hidden">
                <Button 
                  size="lg" 
                  className="w-full h-14 text-base font-semibold rounded-xl"
                  onClick={() => document.getElementById('search-card')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Find a sitter
                  <ChevronRight className="ml-1 w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Right - Image */}
            <div className="relative hidden lg:block animate-scale-in">
              <div className="relative">
                {/* Main image */}
                <div className="relative rounded-3xl overflow-hidden shadow-[var(--shadow-primary)] aspect-[4/5]">
                  <img 
                    src={petServicesImg} 
                    alt="Happy pet with their sitter" 
                    className="w-full h-full object-cover"
                  />
                  {/* Subtle overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/10 via-transparent to-transparent" />
                </div>
                
                {/* Floating stats card */}
                <div className="absolute -bottom-6 -left-6 bg-card rounded-2xl p-5 shadow-[var(--shadow-hover)] border border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                      <Camera className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">98%</p>
                      <p className="text-sm text-muted-foreground">Report completion</p>
                    </div>
                  </div>
                </div>

                {/* Floating review card */}
                <div className="absolute -top-4 -right-4 bg-card rounded-2xl px-5 py-4 shadow-[var(--shadow-hover)] border border-border">
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-sm font-medium text-foreground">"Absolutely amazing!"</p>
                  <p className="text-xs text-muted-foreground mt-1">— Sarah M.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search Card */}
          <div id="search-card" className="mt-16 md:mt-20">
            <div className="bg-card rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-[var(--shadow-hover)] border border-border max-w-4xl mx-auto">
              <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                <div className="flex-1">
                  <label className="text-sm font-medium text-foreground mb-2 block">Location</label>
                  <SuburbAutocomplete
                    value={location}
                    onChange={setLocation}
                    placeholder="Enter suburb or city"
                    className="h-12"
                  />
                </div>
                
                <div className="lg:w-48">
                  <label className="text-sm font-medium text-foreground mb-2 block">Service</label>
                  <Select value={serviceType} onValueChange={setServiceType}>
                    <SelectTrigger className="h-12 w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pet_sitting_sitters_home">At Sitter's Home</SelectItem>
                      <SelectItem value="pet_sitting_owners_home">At Your Home</SelectItem>
                      <SelectItem value="drop_in_visits">Drop-in Visits</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="lg:w-36">
                  <label className="text-sm font-medium text-foreground mb-2 block">Check in</label>
                  <Input 
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="h-12 w-full"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div className="lg:w-36">
                  <label className="text-sm font-medium text-foreground mb-2 block">Check out</label>
                  <Input 
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="h-12 w-full"
                    min={checkIn || new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div className="lg:self-end">
                  <Button 
                    size="lg" 
                    className="w-full lg:w-auto h-12 px-8 font-semibold rounded-xl"
                    onClick={handleSearch}
                  >
                    <Search className="mr-2 h-5 w-5" />
                    Search
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Social proof */}
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10 mt-12 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-foreground">500+</span>
              <span>Happy pet owners</span>
            </div>
            <div className="w-px h-5 bg-border hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-foreground">4.9</span>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-primary text-primary" />
                ))}
              </div>
            </div>
            <div className="w-px h-5 bg-border hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-foreground">24/7</span>
              <span>Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSectionPlayful;