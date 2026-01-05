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

  const handleCtaClick = () => {
    // On mobile, if no search params entered, scroll to search form
    const hasParams = location || serviceType || checkIn || checkOut;
    if (!hasParams) {
      const searchForm = document.getElementById('search-form');
      if (searchForm) {
        searchForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Focus the suburb input after scroll
        setTimeout(() => {
          const suburbInput = searchForm.querySelector('input');
          if (suburbInput) suburbInput.focus();
        }, 500);
        return;
      }
    }
    // If params exist or no form found, proceed with search
    handleSearch();
  };

  return (
    <section className="relative min-h-[85svh] md:min-h-[80vh] flex items-center overflow-hidden bg-background">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/40 via-background to-blue-50/40 dark:from-green-950/10 dark:via-background dark:to-blue-950/10" />

      <div className="container mx-auto px-4 py-12 md:py-20 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-center mb-6 md:mb-12">
            {/* Left side - Content */}
            <div className="space-y-6 md:space-y-8 animate-fade-in text-center lg:text-left">

              {/* Main Headline */}
              <div className="space-y-4 md:space-y-5">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1]">
                  <span className="block text-foreground">Never Wonder</span>
                  <span className="block text-gradient-playful py-1">{'"'}How{"'"}s My Pet?{'"'}</span>
                  <span className="block text-foreground">Again!</span>
                </h1>
                
                <p className="text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
                  A pet sitting platform <span className="font-bold text-foreground">built for pets, not humans</span>. ID-verified sitters send you daily photo updates so you never have to wonder how they{"'"}re doing.
                </p>

                {/* Primary CTA - Green gradient */}
                <div className="pt-3 space-y-3">
                  <Button 
                    size="lg" 
                    className="w-full lg:w-auto text-lg md:text-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 py-6 md:py-7 px-8 md:px-10 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white rounded-xl"
                    onClick={handleCtaClick}
                  >
                    🐾 Find Your Perfect Sitter
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    No payment required • Free to browse
                  </p>
                </div>
              </div>

              {/* Feature pills */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-2.5">
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-border shadow-sm rounded-full px-4 py-2 text-sm font-medium">
                  <span>📷</span> Daily Photo Reports
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-border shadow-sm rounded-full px-4 py-2 text-sm font-medium">
                  <span>🛡️</span> ID Verified
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-border shadow-sm rounded-full px-4 py-2 text-sm font-medium">
                  <Heart className="w-4 h-4 text-pink-500 fill-pink-500" /> 5% to SPCA NZ
                </div>
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
            <div id="search-form" className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 shadow-2xl border-2 border-purple-200 dark:border-purple-700 hover:shadow-[0_20px_60px_-15px_rgba(124,58,237,0.3)] transition-all duration-500 w-full max-w-4xl">
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
                  View Available Sitters
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