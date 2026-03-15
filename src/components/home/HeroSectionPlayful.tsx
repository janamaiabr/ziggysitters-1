import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Shield, Camera, CheckCircle } from 'lucide-react';
import SuburbAutocomplete from '@/components/search/SuburbAutocomplete';
import { useNavigate } from 'react-router-dom';
import heroSitterReal from '@/assets/hero-sitter-real.jpg';
import heroPetsReal from '@/assets/hero-pets-real.jpg';
import UrgencyIndicator from './UrgencyIndicator';
import { useSearchTracking } from '@/hooks/useSearchTracking';
import CompactSteps from './CompactSteps';
import LocalSocialProof from './LocalSocialProof';

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
    saveSearchContext({
      location: location,
      serviceType: serviceType,
      checkIn: checkIn,
      checkOut: checkOut,
    });
    
    if (location) sessionStorage.setItem('search_location', location);
    if (serviceType) sessionStorage.setItem('search_service_type', serviceType);
    
    trackSearch({
      suburb: location || 'homepage_search',
      city: location || 'homepage',
      serviceType: serviceType || 'any',
      resultsCount: 0,
    });
    
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (serviceType) params.set('serviceType', serviceType);
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    navigate(`/find-sitters?${params.toString()}`);
  };

  const handleCtaClick = () => {
    const hasParams = location || serviceType || checkIn || checkOut;
    if (!hasParams) {
      const searchForm = document.getElementById('search-form');
      if (searchForm) {
        searchForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          const suburbInput = searchForm.querySelector('input');
          if (suburbInput) suburbInput.focus();
        }, 500);
        return;
      }
    }
    handleSearch();
  };

  return (
    <section className="relative min-h-[70svh] md:min-h-[80vh] flex items-center overflow-hidden bg-[#fafbfa]">
      <div className="container mx-auto px-4 py-6 md:py-20 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-6 md:gap-16 items-center mb-4 md:mb-12">
            {/* Left side - Content */}
            <div className="space-y-4 md:space-y-8 animate-fade-in text-center lg:text-left">
              <div className="space-y-3 md:space-y-5">
                <h1 className="text-[1.75rem] sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1] text-gray-900">
                  <span className="block">Find a Reliable</span>
                  <span className="block text-emerald-600">Local Pet Sitter</span>
                </h1>
                
                <p className="text-sm md:text-lg lg:text-xl text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Real people in your neighbourhood who <span className="font-bold text-gray-900">love dogs</span> and take care of your pets like their own. ID verified. Daily photo updates.
                </p>

                {/* Positioning badge */}
                <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5">
                  <span className="text-base">🐾</span>
                  <span className="text-xs md:text-sm font-semibold text-emerald-700">Local pet sitting — AU & NZ</span>
                </div>

                {/* Primary CTA */}
                <div className="pt-2 md:pt-3 space-y-2 md:space-y-3">
                  <Button 
                    size="lg" 
                    data-tour="find-sitter"
                    className="w-full lg:w-auto text-base md:text-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 py-5 md:py-7 px-6 md:px-10 bg-gray-900 hover:bg-gray-800 text-white rounded-xl min-h-[48px]"
                    onClick={handleCtaClick}
                  >
                    🐾 Find a Trusted Sitter Near Me
                  </Button>
                  <div className="flex flex-wrap justify-center lg:justify-start gap-2 md:gap-3 text-xs md:text-sm text-gray-500">
                    <span>✓ ID Verified</span>
                    <span>✓ Daily Photo Updates</span>
                    <span className="hidden sm:inline">✓ Free to browse</span>
                  </div>
                </div>
              </div>

              {/* Compact steps - hidden on mobile */}
              <div className="hidden md:block pt-2">
                <CompactSteps />
              </div>

              {/* Feature pills - hidden on mobile */}
              <div className="hidden md:flex flex-wrap justify-center lg:justify-start gap-2.5">
                <div className="flex items-center gap-2 bg-white border border-gray-200 shadow-sm rounded-full px-4 py-2 text-sm font-medium text-gray-700">
                  <Camera className="w-4 h-4 text-emerald-600" /> Daily Photo Updates
                </div>
                <div className="flex items-center gap-2 bg-white border border-gray-200 shadow-sm rounded-full px-4 py-2 text-sm font-medium text-gray-700">
                  <Shield className="w-4 h-4 text-emerald-600" /> ID Verified Sitters
                </div>
                <div className="flex items-center gap-2 bg-white border border-gray-200 shadow-sm rounded-full px-4 py-2 text-sm font-medium text-gray-700">
                  <CheckCircle className="w-4 h-4 text-emerald-600" /> Trusted Reviews
                </div>
              </div>

              {/* Mobile image */}
              <div className="lg:hidden relative w-full aspect-[16/9] rounded-xl overflow-hidden shadow-lg border border-gray-200">
                <img 
                  src={heroSitterReal} 
                  alt="Happy pet with sitter" 
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-sm rounded-lg px-2.5 py-1.5 shadow-lg border border-gray-200">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center">
                      <Shield className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-900">ID Verified ✅</p>
                      <p className="text-[9px] text-gray-500">Background Checked</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Photo Display (desktop only) */}
            <div className="relative hidden lg:block animate-scale-in">
              <div className="relative w-full h-[520px]">
                <div className="absolute top-0 right-0 w-[380px] h-[320px] rounded-2xl overflow-hidden shadow-xl border border-gray-200 animate-float">
                  <img 
                    src={heroSitterReal} 
                    alt="Happy pet with sitter" 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="absolute top-48 left-0 w-[320px] h-[260px] rounded-2xl overflow-hidden shadow-xl border border-gray-200" style={{ animationDelay: '2s' }}>
                  <img 
                    src={heroPetsReal} 
                    alt="Pet sitting service" 
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Trust badge overlay */}
                <div className="absolute bottom-8 right-8 bg-white/95 backdrop-blur-sm rounded-xl px-5 py-4 shadow-xl border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">ID Verified ✅</p>
                      <p className="text-xs text-gray-500">Background Checked</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search Card — Clean, premium design */}
          <div className="w-full flex justify-center items-center">
            <div id="search-form" className="bg-white backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-6 lg:p-8 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-500 w-full max-w-4xl">
              <h3 className="text-base md:text-xl lg:text-2xl font-bold mb-3 md:mb-5 text-center text-gray-900">
                Find a sitter near you 🔍
              </h3>
              
              <div className="flex flex-col lg:flex-row gap-2.5 md:gap-3">
                <SuburbAutocomplete
                  value={location}
                  onChange={setLocation}
                  placeholder="Enter suburb 📍"
                  className="h-11 md:h-12 border border-gray-200 focus:border-emerald-500 lg:flex-1"
                />
                
                <Select value={serviceType} onValueChange={setServiceType}>
                  <SelectTrigger className="h-11 md:h-12 w-full lg:w-[180px] text-sm md:text-base border border-gray-200">
                    <SelectValue placeholder="Service type 🏠" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pet_sitting_sitters_home">At Sitter{"'"}s Home 🏡</SelectItem>
                    <SelectItem value="pet_sitting_owners_home">At Your Home 🏠</SelectItem>
                    <SelectItem value="drop_in_visits">Drop-in Visits 👋</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="hidden md:flex gap-3">
                  <Input 
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="h-12 w-full lg:w-[150px] text-sm md:text-base border border-gray-200"
                    min={new Date().toISOString().split('T')[0]}
                    aria-label="Check-in date"
                  />
                  <Input 
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="h-12 w-full lg:w-[150px] text-sm md:text-base border border-gray-200"
                    min={checkIn || new Date().toISOString().split('T')[0]}
                    aria-label="Check-out date"
                  />
                </div>
                
                <Button 
                  size="lg" 
                  className="h-11 md:h-12 text-sm md:text-base font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-6 whitespace-nowrap bg-gray-900 hover:bg-gray-800 text-white min-h-[44px]"
                  onClick={handleSearch}
                >
                  <Search className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  View Sitters
                </Button>
              </div>
              
              <p className="text-center mt-3 md:mt-4 text-xs md:text-sm text-gray-500">
                or <button onClick={() => {
                  trackSearch({
                    suburb: 'browse_all',
                    city: 'all',
                    serviceType: 'any',
                    resultsCount: 0,
                  });
                  navigate('/find-sitters');
                }} className="text-emerald-600 font-semibold hover:underline">browse all available sitters →</button>
              </p>
            </div>
          </div>

          {/* Urgency & Social Proof - hidden on mobile */}
          <div className="hidden md:block mt-6 md:mt-8">
            <UrgencyIndicator location={location} />
          </div>

          <div className="hidden md:block mt-6 md:mt-8">
            <LocalSocialProof />
          </div>

          <div className="hidden md:block text-center mt-4">
            <p className="text-sm text-gray-500 bg-amber-50 border border-amber-200 rounded-full px-4 py-2 inline-flex items-center gap-2">
              ⏰ <span className="font-medium text-amber-700">Most owners book within 24 hours</span> of finding their sitter
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSectionPlayful;
