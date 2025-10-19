import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, Shield, Star, TrendingUp, Search, CheckCircle2, Zap } from 'lucide-react';
import SuburbAutocomplete from '@/components/search/SuburbAutocomplete';
import { useNavigate } from 'react-router-dom';

interface HeroSectionV2Props {
  location: string;
  setLocation: (value: string) => void;
  serviceType: string;
  setServiceType: (value: string) => void;
  checkIn: string;
  setCheckIn: (value: string) => void;
  checkOut: string;
  setCheckOut: (value: string) => void;
}

const HeroSectionV2 = ({
  location,
  setLocation,
  serviceType,
  setServiceType,
  checkIn,
  setCheckIn,
  checkOut,
  setCheckOut
}: HeroSectionV2Props) => {
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
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-20 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Trust Badge */}
          <div className="flex justify-center mb-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-2 shadow-lg">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Premium</span>
            </div>
          </div>

          {/* Main Headline */}
          <div className="text-center mb-8 space-y-4 animate-fade-in">
            <div className="text-lg md:text-xl text-primary font-bold mb-2">
              New Zealand's Pet Sitting Platform
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight">
              <span className="block mb-2">Never Wonder</span>
              <span className="block bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient">
                "How's My Pet?"
              </span>
              <span className="block text-4xl md:text-6xl lg:text-7xl mt-4">Again.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-medium leading-relaxed">
              Choose to require daily photo updates and they're <span className="text-primary font-bold">enforceable</span>. 
              When you request them, sitters must deliver or face a 15% payment reduction.
            </p>
          </div>

          {/* Value Props - Quick Glance */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-10 animate-fade-in">
            {[
              { icon: Camera, text: "Optional Daily Updates", color: "text-blue-600" },
              { icon: Shield, text: "15% Penalty if Requested", color: "text-green-600" },
              { icon: Star, text: "4.9★ Verified Sitters", color: "text-yellow-600" }
            ].map((item, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-full px-4 py-3 shadow-md border border-border hover:shadow-lg transition-all hover:scale-105"
              >
                <item.icon className={`w-5 h-5 ${item.color}`} />
                <span className="font-semibold text-sm md:text-base">{item.text}</span>
              </div>
            ))}
          </div>

          {/* Enhanced Search Card */}
          <div className="max-w-4xl mx-auto mb-8 animate-scale-in">
            <div className="bg-card/95 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-2xl border border-border/50">
              <div className="mb-6">
                <h3 className="text-xl md:text-2xl font-bold text-center mb-2">Find Your Peace of Mind</h3>
                <p className="text-center text-muted-foreground text-sm">Book a sitter and choose if you want daily updates enforced</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Search className="w-4 h-4 text-primary" />
                      Location
                    </label>
                    <SuburbAutocomplete
                      value={location}
                      onChange={setLocation}
                      placeholder="Enter suburb or city"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Service Type</label>
                    <Select value={serviceType} onValueChange={setServiceType}>
                      <SelectTrigger className="h-12 border-border bg-background hover:border-primary transition-colors">
                        <SelectValue placeholder="What do you need?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pet_sitting_sitters_home">🏠 Pet Sitting (Sitter's Home)</SelectItem>
                        <SelectItem value="pet_sitting_owners_home">🏡 Pet Sitting (Your Home)</SelectItem>
                        <SelectItem value="drop_in_visits">⏰ Drop-in Visits</SelectItem>
                        {/* DOG_WALKING <SelectItem value="dog_walking">🚶‍♂️ Dog Walking</SelectItem> END_DOG_WALKING */}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Check-in</label>
                    <Input 
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="h-12 border-border bg-background hover:border-primary transition-colors"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Check-out</label>
                    <Input 
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="h-12 border-border bg-background hover:border-primary transition-colors"
                      min={checkIn || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button 
                  size="lg" 
                  className="flex-1 h-12 sm:h-14 text-base sm:text-lg font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 bg-primary"
                  onClick={handleSearch}
                >
                  <Search className="mr-2 h-5 w-5" />
                  Find Accountable Sitters
                </Button>
              </div>

              {/* Social Proof */}
              <div className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>500+ Happy Owners</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span>98% Report Rate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </section>
  );
};

export default HeroSectionV2;
