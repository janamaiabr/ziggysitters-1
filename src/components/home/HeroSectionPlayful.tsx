import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, Heart, Star, Search, Sparkles } from 'lucide-react';
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
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-gradient-to-br from-accent via-background to-secondary/10">
      {/* Playful background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-secondary/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-20 relative z-10">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Content */}
            <div className="space-y-6 animate-fade-in">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm border border-primary/30 rounded-full px-5 py-2.5 shadow-lg">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold text-primary">Premium Pet Care</span>
              </div>

              {/* Main Headline */}
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight">
                  <span className="block">Never Wonder</span>
                  <span className="block relative inline-block">
                    <span className="relative z-10">"How's My Pet?"</span>
                    <span className="absolute bottom-2 left-0 w-full h-4 bg-primary/20 -rotate-1"></span>
                  </span>
                  <span className="block mt-2">Again.</span>
                </h1>
                
                <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-medium">
                  Daily photo updates aren't optional—they're <span className="text-primary relative">guaranteed<span className="absolute bottom-0 left-0 w-full h-1 bg-primary/30"></span></span>. No updates? Sitters get paid less. It's that simple.
                </p>
              </div>

              {/* Value Props */}
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: Camera, text: "Daily Photos", color: "bg-blue-50 text-blue-600 border-blue-200" },
                  { icon: Heart, text: "98% Happy Owners", color: "bg-pink-50 text-pink-600 border-pink-200" },
                  { icon: Star, text: "4.9★ Sitters", color: "bg-yellow-50 text-yellow-600 border-yellow-200" }
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center gap-2 ${item.color} rounded-full px-4 py-2.5 shadow-sm border-2 font-semibold text-sm hover:scale-105 transition-transform`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side - Tilted Photos Collage */}
            <div className="relative hidden lg:block animate-scale-in">
              <div className="relative w-full h-[600px]">
                {/* Main large photo - tilted right */}
                <div className="absolute top-0 right-0 w-[380px] h-[280px] rotate-3 shadow-[var(--shadow-hover)] rounded-2xl overflow-hidden border-8 border-white bg-white">
                  <img 
                    src={petServicesImg} 
                    alt="Happy pet with sitter" 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Second photo - tilted left */}
                <div className="absolute top-48 left-0 w-[340px] h-[260px] -rotate-6 shadow-[var(--shadow-hover)] rounded-2xl overflow-hidden border-8 border-white bg-white">
                  <img 
                    src={petServicesImg} 
                    alt="Pet sitting service" 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Third smaller photo - top left */}
                <div className="absolute top-8 left-12 w-[200px] h-[200px] rotate-12 shadow-lg rounded-2xl overflow-hidden border-8 border-white bg-white">
                  <img 
                    src={petServicesImg} 
                    alt="Happy dog" 
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Decorative paw prints */}
                <div className="absolute bottom-4 right-4 text-primary/10 text-8xl">🐾</div>
              </div>
            </div>
          </div>

          {/* Search Card - Centered Below Content */}
          <div className="w-full flex justify-center items-center">
            <div className="bg-card rounded-3xl p-6 shadow-[var(--shadow-soft)] border border-border/50 hover:shadow-[var(--shadow-hover)] transition-shadow">
              <h3 className="text-xl font-bold mb-4 text-center">Find Your Peace of Mind</h3>
              
              <div className="flex flex-col lg:flex-row gap-3 items-stretch">
                <SuburbAutocomplete
                  value={location}
                  onChange={setLocation}
                  placeholder="Enter suburb or city"
                />
                
                <Select value={serviceType} onValueChange={setServiceType}>
                  <SelectTrigger className="h-11 w-full lg:w-[180px]">
                    <SelectValue placeholder="Service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pet_sitting_sitters_home">🏠 At Sitter's Home</SelectItem>
                    <SelectItem value="pet_sitting_owners_home">🏡 At Your Home</SelectItem>
                    <SelectItem value="drop_in_visits">⏰ Drop-in Visits</SelectItem>
                    <SelectItem value="dog_walking">🚶‍♂️ Dog Walking</SelectItem>
                  </SelectContent>
                </Select>
                
                <Input 
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="h-11 w-full lg:w-[180px]"
                  min={new Date().toISOString().split('T')[0]}
                  placeholder="Check-in"
                />
                
                <Input 
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="h-11 w-full lg:w-[180px]"
                  min={checkIn || new Date().toISOString().split('T')[0]}
                  placeholder="Check-out"
                />
                
                <Button 
                  size="lg" 
                  className="w-full lg:w-auto h-11 text-base font-bold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] px-8 whitespace-nowrap"
                  onClick={handleSearch}
                >
                  <Search className="mr-2 h-5 w-5" />
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSectionPlayful;
