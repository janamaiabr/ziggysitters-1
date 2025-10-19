import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Camera, Shield, CheckCircle } from 'lucide-react';
import SuburbAutocomplete from '@/components/search/SuburbAutocomplete';
import { useNavigate } from 'react-router-dom';

interface HeroSectionOriginalProps {
  location: string;
  setLocation: (value: string) => void;
  serviceType: string;
  setServiceType: (value: string) => void;
  checkIn: string;
  setCheckIn: (value: string) => void;
  checkOut: string;
  setCheckOut: (value: string) => void;
}

const trustFeatures = [
  {
    icon: Camera,
    title: 'Daily Photo Updates',
    description: 'Choose to require daily reports with photos - sitters face 15% deduction for non-compliance'
  },
  {
    icon: Shield,
    title: 'Optional Accountability',
    description: 'Request daily updates and we enforce them with payment guarantees'
  },
  {
    icon: CheckCircle,
    title: 'Transparent Care',
    description: 'When requested: detailed daily reports on exercise, food, sleep, and mood'
  }
];

const HeroSectionOriginal = ({
  location,
  setLocation,
  serviceType,
  setServiceType,
  checkIn,
  setCheckIn,
  checkOut,
  setCheckOut
}: HeroSectionOriginalProps) => {
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
    <section className="relative bg-gradient-to-br from-slate-50 to-gray-100 py-12 md:py-20 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgPGcgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIwLjAzIj4KICAgICAgPGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iNCIvPgogICAgPC9nPgogIDwvZz4KPC9zdmc+Cg==')] opacity-30"></div>
      </div>
      <div className="relative container mx-auto px-4">
        <div className="max-w-5xl mx-auto text-center text-gray-800">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Pet Sitters with Enforced Daily Updates
          </h1>
          <p className="text-lg md:text-xl mb-6 md:mb-8 text-gray-600 max-w-3xl mx-auto px-4">
            Choose to require daily photo updates from your sitter. When you do, they MUST send them or face a 15% payment reduction. Your peace of mind, your choice.
          </p>
          
          {/* Enhanced Search Bar */}
          <div className="bg-white rounded-2xl p-4 md:p-6 max-w-4xl mx-auto border border-gray-200 shadow-xl">
            {/* Mobile Optimized: Stack fields properly */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 block">Where?</label>
                  <SuburbAutocomplete
                    value={location}
                    onChange={setLocation}
                    placeholder="Enter suburb or city"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 block">Service</label>
                  <Select value={serviceType} onValueChange={setServiceType}>
                    <SelectTrigger className="h-12 border-gray-300 text-gray-800 focus:border-primary bg-white">
                      <SelectValue placeholder="What do you need?" />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-white border shadow-lg">
                      <SelectItem value="pet_sitting_sitters_home">🏠 Pet Sitting (Sitter's Home)</SelectItem>
                      <SelectItem value="pet_sitting_owners_home">🏡 Pet Sitting (Your Home)</SelectItem>
                      <SelectItem value="drop_in_visits">⏰ Drop-in Visits</SelectItem>
                      {/* DOG_WALKING <SelectItem value="dog_walking">🚶‍♂️ Dog Walking</SelectItem> END_DOG_WALKING */}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 block">Check-in</label>
                  <Input 
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="h-12 border-gray-300 text-gray-800 focus:border-primary bg-white"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 block">Check-out</label>
                  <Input 
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="h-12 border-gray-300 text-gray-800 focus:border-primary bg-white"
                    min={checkIn || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <Button 
                size="lg" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 h-12 w-full md:w-auto font-semibold text-base"
                onClick={handleSearch}
              >
                <Search className="mr-2 h-5 w-5" />
                🐾 Find Perfect Sitters
              </Button>
            </div>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 mt-8 md:mt-12 px-4">
            {trustFeatures.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2 md:space-x-3 text-gray-700">
                <feature.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                <span className="font-medium text-sm md:text-base">{feature.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSectionOriginal;
