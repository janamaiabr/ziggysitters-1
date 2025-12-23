import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, Heart, Star, Search, Shield, Sparkles } from 'lucide-react';
import SuburbAutocomplete from '@/components/search/SuburbAutocomplete';
import { useNavigate } from 'react-router-dom';
import petServicesImg from '@/assets/pet-services.jpg';
import UrgencyIndicator from './UrgencyIndicator';
import { useSearchTracking } from '@/hooks/useSearchTracking';

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
  const { saveSearchContext, trackSearch } = useSearchTracking();

  const handleSearch = () => {
    // CRITICAL: Save search context BEFORE navigation so it persists through auth
    saveSearchContext({
      location: location,
      serviceType: serviceType,
      checkIn: checkIn,
      checkOut: checkOut,
    });
    
    // Also save to sessionStorage for legacy compatibility
    if (location) sessionStorage.setItem('search_location', location);
    if (serviceType) sessionStorage.setItem('search_service_type', serviceType);
    
    // Track the search from homepage
    trackSearch({
      suburb: location || 'homepage_search',
      city: 'Auckland',
      serviceType: serviceType || 'any',
      resultsCount: 0, // Will be updated when results load
    });
    
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (serviceType) params.set('serviceType', serviceType);
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    navigate(`/find-sitters?${params.toString()}`);
  };

  return (
    <section className="relative min-h-[100svh] md:min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-950/20 dark:via-blue-950/20 dark:to-indigo-950/20">
      {/* Floating emoji animations - fewer on mobile */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-24 left-[10%] text-3xl md:text-5xl animate-bounce" style={{ animationDelay: '0s', animationDuration: '2s' }}>💜</div>
        <div className="absolute top-32 right-[15%] text-2xl md:text-4xl animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2.5s' }}>🐾</div>
        <div className="hidden md:block absolute top-48 left-[40%] text-3xl animate-bounce" style={{ animationDelay: '1s', animationDuration: '3s' }}>✨</div>
        <div className="hidden md:block absolute bottom-40 right-[35%] text-4xl animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '2.2s' }}>🎉</div>
        <div className="absolute bottom-32 left-[20%] text-3xl md:text-5xl animate-bounce" style={{ animationDelay: '2s', animationDuration: '2.8s' }}>💙</div>
        <div className="hidden lg:block absolute top-[60%] right-[10%] text-3xl animate-bounce" style={{ animationDelay: '0.8s', animationDuration: '2.3s' }}>🐕</div>
        <div className="hidden lg:block absolute top-[30%] left-[8%] text-4xl animate-bounce" style={{ animationDelay: '1.2s', animationDuration: '2.6s' }}>🐱</div>
      </div>

      {/* Playful background blobs - smaller on mobile */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-10 md:right-20 w-40 md:w-80 h-40 md:h-80 bg-purple-300 dark:bg-purple-700 rounded-full blur-3xl opacity-25 animate-pulse"></div>
        <div className="absolute bottom-20 left-5 md:left-10 w-48 md:w-96 h-48 md:h-96 bg-blue-300 dark:bg-blue-700 rounded-full blur-3xl opacity-25 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 md:w-64 h-32 md:h-64 bg-indigo-300 dark:bg-indigo-700 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      {/* SPCA Charity Badge - repositioned for mobile */}
      <div className="absolute top-24 md:top-8 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-8 z-20 animate-fade-in">
        <div className="flex items-center gap-1.5 md:gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-full px-3 md:px-5 py-2 md:py-2.5 shadow-lg font-bold text-xs md:text-sm hover:scale-105 transition-transform">
          <Heart className="w-3 h-3 md:w-4 md:h-4 fill-current" />
          <span className="hidden sm:inline">5% Donated to SPCA NZ</span>
          <span className="sm:hidden">5% to SPCA</span>
          <span className="hidden sm:inline">💜</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 pt-36 md:pt-12 md:py-20 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-center mb-6 md:mb-12">
            {/* Left side - Content */}
            <div className="space-y-5 md:space-y-8 animate-fade-in text-center lg:text-left">
              {/* Cute badge */}
              <div className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/40 dark:to-blue-900/40 border-2 border-purple-200 dark:border-purple-700 rounded-full">
                <span className="text-base md:text-xl">🐾</span>
                <span className="text-xs md:text-sm font-bold text-purple-600 dark:text-purple-400 tracking-wide uppercase">Premium Pet Care</span>
                <span className="text-base md:text-xl">🐾</span>
              </div>

              {/* Main Headline */}
              <div className="space-y-3 md:space-y-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1]">
                  <span className="block text-foreground">Never Wonder</span>
                  <span className="block text-gradient-playful py-1">{'"'}How{"'"}s My Pet?{'"'}</span>
                  <span className="block text-foreground">Again!</span>
                </h1>
                
                <p className="text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
                  <span className="text-purple-600 dark:text-purple-400 font-bold">Trusted pet sitters in Auckland & Hamilton</span> with guaranteed daily photo updates. No guessing - just peace of mind! 📸
                </p>

                {/* Quick CTA for mobile - immediately visible */}
                <div className="lg:hidden pt-2">
                  <Button 
                    size="lg" 
                    className="w-full text-base font-bold shadow-lg bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 hover:from-purple-600 hover:via-indigo-600 hover:to-blue-600"
                    onClick={handleSearch}
                  >
                    <Search className="mr-2 h-5 w-5" />
                    Find a Sitter Now
                  </Button>
                </div>
              </div>

              {/* Feature badges with emojis - smaller on mobile */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-2 md:gap-3">
                {[
                  { emoji: "📷", text: "Daily Photos", fullText: "Daily Photo Reports", gradient: "from-purple-500 to-indigo-600" },
                  { emoji: "🛡️", text: "Verified", fullText: "Verified Sitters", gradient: "from-blue-500 to-indigo-600" },
                  { emoji: "⭐", text: "4.9 Rating", fullText: "4.9 Rating", gradient: "from-indigo-500 to-purple-600" }
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center gap-1.5 md:gap-2 bg-gradient-to-r ${item.gradient} text-white rounded-full px-3 md:px-4 py-2 md:py-2.5 shadow-lg font-bold text-xs md:text-sm hover:scale-105 transition-transform cursor-default`}
                  >
                    <span className="text-sm md:text-lg">{item.emoji}</span>
                    <span className="md:hidden">{item.text}</span>
                    <span className="hidden md:inline">{item.fullText}</span>
                  </div>
                ))}
              </div>

              {/* Mobile image - shown only on mobile */}
              <div className="lg:hidden relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-xl border-4 border-purple-200 dark:border-purple-700">
                <img 
                  src={petServicesImg} 
                  alt="Happy pet with sitter" 
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-500/30 to-transparent" />
                {/* Mobile trust badge */}
                <div className="absolute bottom-3 right-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg border border-purple-200 dark:border-purple-700">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">Verified ✅</p>
                      <p className="text-[10px] text-muted-foreground">Background Checked</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Photo Display (desktop only) */}
            <div className="relative hidden lg:block animate-scale-in">
              <div className="relative w-full h-[520px]">
                {/* Main photo with playful frame */}
                <div className="absolute top-0 right-0 w-[380px] h-[320px] rounded-3xl overflow-hidden shadow-2xl border-4 border-purple-200 dark:border-purple-700 animate-float">
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-transparent z-10" />
                  <img 
                    src={petServicesImg} 
                    alt="Happy pet with sitter" 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Second photo with offset */}
                <div className="absolute top-48 left-0 w-[320px] h-[260px] rounded-3xl overflow-hidden shadow-2xl border-4 border-blue-200 dark:border-blue-700" style={{ animationDelay: '2s' }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 to-transparent z-10" />
                  <img 
                    src={petServicesImg} 
                    alt="Pet sitting service" 
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Trust badge overlay */}
                <div className="absolute bottom-8 right-8 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-2xl px-5 py-4 shadow-2xl border-2 border-purple-200 dark:border-purple-700">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">Fully Verified ✅</p>
                      <p className="text-xs text-muted-foreground">ID & Background Checked</p>
                    </div>
                  </div>
                </div>

                {/* Floating emoji decorations */}
                <div className="absolute -top-4 left-20 text-4xl animate-bounce" style={{ animationDuration: '2s' }}>🐕</div>
                <div className="absolute bottom-20 -left-4 text-3xl animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2.5s' }}>🐱</div>
              </div>
            </div>
          </div>

          {/* Search Card - Playful Design */}
          <div className="w-full flex justify-center items-center">
            <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 shadow-2xl border-2 border-purple-200 dark:border-purple-700 hover:shadow-[0_20px_60px_-15px_rgba(124,58,237,0.3)] transition-all duration-500 w-full max-w-4xl">
              <h3 className="text-lg md:text-xl lg:text-2xl font-bold mb-4 md:mb-5 text-center">
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Find Your Perfect Sitter</span>
                <span className="ml-2">🔍</span>
              </h3>
              
              {/* All fields in one row on desktop, stacked on mobile */}
              <div className="flex flex-col lg:flex-row gap-3">
                <SuburbAutocomplete
                  value={location}
                  onChange={setLocation}
                  placeholder="Enter suburb 📍"
                  className="h-12 border-2 border-purple-200 dark:border-purple-700 focus:border-purple-500 lg:flex-1"
                />
                
                <Select value={serviceType} onValueChange={setServiceType}>
                  <SelectTrigger className="h-12 w-full lg:w-[180px] text-base border-2 border-purple-200 dark:border-purple-700">
                    <SelectValue placeholder="Service type 🏠" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pet_sitting_sitters_home">At Sitter{"'"}s Home 🏡</SelectItem>
                    <SelectItem value="pet_sitting_owners_home">At Your Home 🏠</SelectItem>
                    <SelectItem value="drop_in_visits">Drop-in Visits 👋</SelectItem>
                  </SelectContent>
                </Select>
                
                <Input 
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="h-12 w-full lg:w-[150px] text-sm md:text-base border-2 border-purple-200 dark:border-purple-700"
                  min={new Date().toISOString().split('T')[0]}
                  aria-label="Check-in date"
                />
                
                <Input 
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="h-12 w-full lg:w-[150px] text-sm md:text-base border-2 border-purple-200 dark:border-purple-700"
                  min={checkIn || new Date().toISOString().split('T')[0]}
                  aria-label="Check-out date"
                />
                
                <Button 
                  size="lg" 
                  className="h-12 text-sm md:text-base font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-6 whitespace-nowrap bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 hover:from-purple-600 hover:via-indigo-600 hover:to-blue-600"
                  onClick={handleSearch}
                >
                  <Search className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  Search Sitters
                  <Sparkles className="ml-2 h-3 w-3 md:h-4 md:w-4" />
                </Button>
              </div>
              
              {/* Browse All link - quick access without search */}
              <p className="text-center mt-4 text-sm text-muted-foreground">
                or <button onClick={() => {
                  trackSearch({
                    suburb: 'browse_all',
                    city: 'Auckland',
                    serviceType: 'any',
                    resultsCount: 0,
                  });
                  navigate('/find-sitters');
                }} className="text-purple-600 dark:text-purple-400 font-semibold hover:underline">browse all available sitters →</button>
              </p>
            </div>
          </div>

          {/* Urgency Indicators */}
          <div className="mt-6 md:mt-8">
            <UrgencyIndicator location={location} />
          </div>

          {/* Social Proof - better mobile layout */}
          <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-3 md:gap-6 mt-4 md:mt-6 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-900/80 rounded-full px-3 md:px-4 py-1.5 md:py-2 shadow-md">
              <span className="font-bold text-foreground text-base md:text-lg">500+</span>
              <span className="text-xs md:text-sm">Happy Pet Owners 🎉</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-900/80 rounded-full px-3 md:px-4 py-1.5 md:py-2 shadow-md">
              <span className="font-bold text-foreground text-base md:text-lg">98%</span>
              <span className="text-xs md:text-sm">Report Completion ✅</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-900/80 rounded-full px-3 md:px-4 py-1.5 md:py-2 shadow-md">
              <span className="font-bold text-foreground text-base md:text-lg">24/7</span>
              <span className="text-xs md:text-sm">Support 💬</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSectionPlayful;