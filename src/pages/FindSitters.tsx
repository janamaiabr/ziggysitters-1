import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MapPin, Star, Heart, Calendar as CalendarIcon, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const mockSitters = [
  {
    id: 1,
    name: 'Emma Wilson',
    location: 'Ponsonby, Auckland',
    rating: 4.9,
    reviews: 127,
    baseRate: 25,
    hourlyRate: 27.50, // Base rate + 10% platform fee
    services: ['Dog Walking', 'Pet Sitting', 'Overnight Care'],
    petTypes: ['Dogs', 'Cats'],
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b9c5?w=150&h=150&fit=crop&crop=face',
    verified: true,
    responseRate: 98
  },
  {
    id: 2,
    name: 'James Thompson',
    location: 'Newmarket, Auckland',
    rating: 4.8,
    reviews: 89,
    baseRate: 30,
    hourlyRate: 33, // Base rate + 10% platform fee
    services: ['Dog Walking', 'Pet Boarding', 'Drop-in Visits'],
    petTypes: ['Dogs', 'Small Pets'],
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    verified: true,
    responseRate: 95
  },
  {
    id: 3,
    name: 'Sarah Chen',
    location: 'Mount Eden, Auckland',
    rating: 5.0,
    reviews: 156,
    baseRate: 28,
    hourlyRate: 30.80, // Base rate + 10% platform fee
    services: ['Pet Sitting', 'Grooming', 'Training'],
    petTypes: ['Dogs', 'Cats', 'Birds'],
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    verified: true,
    responseRate: 100
  }
];

export default function FindSitters() {
  const [location, setLocation] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [serviceType, setServiceType] = useState('');
  const [petType, setPetType] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Search Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-6">Find Trusted Pet Sitters</h1>
            <p className="text-xl mb-8 opacity-90">
              Discover verified, loving pet sitters in your area
            </p>
            
            {/* Enhanced Search Form */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 space-y-4 border border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-white/70" />
                    <Input 
                      placeholder="Enter suburb or city"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pl-9 bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Check-in Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-white/20 border-white/30 text-white hover:bg-white/30",
                          !selectedDate && "text-white/70"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Check-out Date</label>
                  <Input 
                    type="date"
                    className="h-10 bg-white/20 border-white/30 text-white focus:bg-white/30"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Service Type</label>
                  <Select value={serviceType} onValueChange={setServiceType}>
                    <SelectTrigger className="bg-white/20 border-white/30 text-white focus:bg-white/30">
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dog-walking">Dog Walking</SelectItem>
                      <SelectItem value="pet-sitting">Pet Sitting</SelectItem>
                      <SelectItem value="overnight-care">Overnight Care</SelectItem>
                      <SelectItem value="drop-in-visits">Drop-in Visits</SelectItem>
                      <SelectItem value="pet-boarding">Pet Boarding</SelectItem>
                      <SelectItem value="grooming">Grooming</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Pet Type</label>
                  <Select value={petType} onValueChange={setPetType}>
                    <SelectTrigger className="bg-white/20 border-white/30 text-white focus:bg-white/30">
                      <SelectValue placeholder="Select pet" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dogs">Dogs</SelectItem>
                      <SelectItem value="cats">Cats</SelectItem>
                      <SelectItem value="birds">Birds</SelectItem>
                      <SelectItem value="small-pets">Small Pets</SelectItem>
                      <SelectItem value="reptiles">Reptiles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  size="lg" 
                  className="bg-white text-primary hover:bg-white/90 px-8 font-semibold"
                >
                  Search Sitters
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowFilters(!showFilters)}
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  More Filters
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Available Sitters in Auckland</h2>
          <p className="text-muted-foreground">{mockSitters.length} sitters found</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockSitters.map((sitter) => (
            <Card key={sitter.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={sitter.avatar} 
                      alt={sitter.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <CardTitle className="text-lg">{sitter.name}</CardTitle>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3 mr-1" />
                        {sitter.location}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{sitter.rating}</span>
                    <span className="text-sm text-muted-foreground">({sitter.reviews} reviews)</span>
                  </div>
                  {sitter.verified && (
                    <Badge variant="secondary" className="text-xs">Verified</Badge>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {sitter.services.slice(0, 2).map((service) => (
                      <Badge key={service} variant="outline" className="text-xs">
                        {service}
                      </Badge>
                    ))}
                    {sitter.services.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{sitter.services.length - 2} more
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total rate</span>
                      <div className="text-right">
                        <span className="font-bold text-lg">${sitter.hourlyRate}/hr</span>
                        <div className="text-xs text-muted-foreground">
                          Includes 10% platform fee
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {sitter.responseRate}% response rate
                  </div>
                </div>
                
                <Button className="w-full">View Profile</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}