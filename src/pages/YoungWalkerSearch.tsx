import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import SEOHead from "@/components/seo/SEOHead";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { YOUNG_WALKER_CONFIG } from "@/config/features";
import SitterVerificationBadge from "@/components/sitter/SitterVerificationBadge";
import { 
  Dog, 
  MapPin, 
  Clock, 
  Star,
  Search,
  Calendar,
  DollarSign,
  Shield,
  Sparkles,
  ArrowRight,
  Plus,
  X
} from "lucide-react";

interface YoungWalker {
  id: string;
  child_first_name: string;
  child_last_name: string;
  home_suburb: string;
  home_city: string;
  rate_per_walk: number;
  max_walk_duration_mins: number;
  accepted_dog_sizes: string[];
  available_after_school: boolean;
  available_weekends: boolean;
  available_school_holidays: boolean;
  bio: string | null;
  experience_with_dogs: string | null;
  status: string;
  age?: number;
}

interface RegularSitter {
  id: string;
  first_name: string;
  last_name: string;
  suburb: string | null;
  city: string | null;
  bio: string | null;
  avatar_url: string | null;
  rating: number | null;
  total_reviews: number | null;
  is_verified: boolean | null;
  golden_badge_approved: boolean | null;
}

export default function YoungWalkerSearch() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [youngWalkers, setYoungWalkers] = useState<YoungWalker[]>([]);
  const [regularSitters, setRegularSitters] = useState<RegularSitter[]>([]);
  const [filteredYoungWalkers, setFilteredYoungWalkers] = useState<YoungWalker[]>([]);
  const [filteredRegularSitters, setFilteredRegularSitters] = useState<RegularSitter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchSuburbs, setSearchSuburbs] = useState<string[]>(
    searchParams.get("suburb") ? [searchParams.get("suburb")!] : []
  );
  const [suburbInput, setSuburbInput] = useState("");
  const [nameSearch, setNameSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterResults();
  }, [youngWalkers, regularSitters, searchSuburbs, nameSearch]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch young walkers
      const { data: walkersData, error: walkersError } = await supabase
        .from("young_walkers")
        .select("*")
        .eq("status", "active");

      if (walkersError) throw walkersError;

      // Calculate age from DOB
      const walkersWithAge = (walkersData || []).map(walker => {
        const today = new Date();
        const birthDate = new Date(walker.child_date_of_birth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return { ...walker, age };
      });

      setYoungWalkers(walkersWithAge);

      // Fetch regular sitters using public_sitters view (RLS-safe)
      const { data: sittersData, error: sittersError } = await supabase
        .from("public_sitters")
        .select("id, first_name, last_name, suburb, city, bio, avatar_url, rating, total_reviews, is_verified, golden_badge_approved")
        .eq("onboarding_completed", true);

      if (sittersError) throw sittersError;
      setRegularSitters(sittersData || []);

    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load walkers.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterResults = () => {
    let filteredYW = [...youngWalkers];
    let filteredRS = [...regularSitters];

    // Filter by name search
    if (nameSearch.trim()) {
      const searchName = nameSearch.toLowerCase().trim();
      filteredYW = filteredYW.filter(w => 
        w.child_first_name.toLowerCase().includes(searchName) ||
        w.child_last_name.toLowerCase().includes(searchName)
      );
      filteredRS = filteredRS.filter(s => 
        s.first_name.toLowerCase().includes(searchName) ||
        s.last_name.toLowerCase().includes(searchName)
      );
    }

    // Filter by suburbs
    if (searchSuburbs.length > 0) {
      const searchTerms = searchSuburbs.map(s => s.toLowerCase());
      
      filteredYW = filteredYW.filter(w => 
        searchTerms.some(term => 
          w.home_suburb.toLowerCase().includes(term) ||
          w.home_city.toLowerCase().includes(term)
        )
      );

      filteredRS = filteredRS.filter(s => 
        searchTerms.some(term => 
          (s.suburb?.toLowerCase().includes(term)) ||
          (s.city?.toLowerCase().includes(term))
        )
      );
    }

    setFilteredYoungWalkers(filteredYW);
    setFilteredRegularSitters(filteredRS);
  };

  const addSuburb = () => {
    if (suburbInput.trim() && !searchSuburbs.includes(suburbInput.trim())) {
      setSearchSuburbs([...searchSuburbs, suburbInput.trim()]);
      setSuburbInput("");
    }
  };

  const removeSuburb = (suburb: string) => {
    setSearchSuburbs(searchSuburbs.filter(s => s !== suburb));
  };

  const getAvailabilityText = (walker: YoungWalker): string => {
    const times = [];
    if (walker.available_after_school) times.push("After school");
    if (walker.available_weekends) times.push("Weekends");
    if (walker.available_school_holidays) times.push("Holidays");
    return times.join(", ") || "Contact for availability";
  };

  return (
    <>
      <SEOHead 
        title="Find Dog Walkers | Young Walkers & Regular Sitters | Auckland | ZiggySitters"
        description="Find local dog walkers in Auckland. Browse young dog walkers and experienced regular sitters. Affordable dog walking options."
        canonical="/search-young-walkers"
      />

      {/* Hero Section - Matching YoungWalkers style */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-16 md:py-20">
        {/* Decorative blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/50 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-200/50 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <div className="text-center lg:text-left">
              <Badge className="mb-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 text-base px-4 py-2">
                <Dog className="h-4 w-4 mr-2" />
                Dog Walking Made Easy
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-800 mb-6 leading-tight">
                Find Your Pup's
                <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
                  Perfect Walking Buddy 🐕
                </span>
              </h1>
              
              <p className="text-xl text-slate-600 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                From enthusiastic young walkers at <span className="font-bold text-emerald-600">${YOUNG_WALKER_CONFIG.SUGGESTED_RATE_PER_WALK}</span> per walk to experienced sitters — your furry friend is in good hands.
              </p>

              {/* Trust indicators */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-slate-600 text-sm">
                <div className="flex items-center gap-2 bg-white/80 rounded-full px-4 py-2 shadow-sm">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>Parent Supervised</span>
                </div>
                <div className="flex items-center gap-2 bg-white/80 rounded-full px-4 py-2 shadow-sm">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span>{YOUNG_WALKER_CONFIG.MAX_WALK_DURATION}-min Walks</span>
                </div>
                <div className="flex items-center gap-2 bg-white/80 rounded-full px-4 py-2 shadow-sm">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span>From ${YOUNG_WALKER_CONFIG.SUGGESTED_RATE_PER_WALK}/walk</span>
                </div>
              </div>
            </div>

            {/* Right - Image */}
            <div className="relative hidden lg:block">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80" 
                  alt="Happy dog ready for a walk"
                  className="rounded-3xl shadow-2xl w-full h-[400px] object-cover"
                />
                
                {/* Floating card - price */}
                <div className="absolute -left-8 top-16 bg-white rounded-2xl shadow-xl p-4 animate-bounce" style={{ animationDuration: '3s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-emerald-600">${YOUNG_WALKER_CONFIG.SUGGESTED_RATE_PER_WALK}</p>
                      <p className="text-xs text-slate-500">per walk</p>
                    </div>
                  </div>
                </div>
                
                {/* Floating card - walks */}
                <div className="absolute -right-4 bottom-16 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl shadow-xl px-6 py-4">
                  <p className="font-bold text-lg">{YOUNG_WALKER_CONFIG.MAX_WALK_DURATION} mins</p>
                  <p className="text-sm text-white/80">Local walks</p>
                </div>

                {/* Decorative paw prints */}
                <div className="absolute -top-6 right-12 text-5xl opacity-20">🐾</div>
                <div className="absolute -bottom-4 left-20 text-4xl opacity-20">🐾</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search/Filter Bar - More Prominent */}
      <section className="py-8 bg-white border-b-2 shadow-md sticky top-0 z-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 shadow-lg border border-emerald-200">
              <div className="flex items-center gap-2 mb-4">
                <Search className="h-5 w-5 text-emerald-600" />
                <h3 className="font-bold text-lg text-slate-800">Find a Dog Walker</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                {/* Suburb Search */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Suburb / Neighbourhood
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="e.g. Ponsonby, Grey Lynn..."
                      value={suburbInput}
                      onChange={(e) => setSuburbInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addSuburb()}
                      className="h-11 bg-white"
                    />
                    <Button 
                      type="button" 
                      variant="secondary" 
                      size="icon"
                      onClick={addSuburb}
                      className="h-11 w-11"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {searchSuburbs.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {searchSuburbs.map((suburb) => (
                        <Badge key={suburb} variant="secondary" className="pr-1 bg-emerald-100 text-emerald-800">
                          {suburb}
                          <button 
                            onClick={() => removeSuburb(suburb)}
                            className="ml-1 hover:bg-emerald-200 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Name Search */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                    <Search className="h-3 w-3" /> Walker Name (optional)
                  </label>
                  <Input
                    type="text"
                    placeholder="Search by name..."
                    value={nameSearch}
                    onChange={(e) => setNameSearch(e.target.value)}
                    className="h-11 bg-white"
                  />
                </div>
              </div>

              {/* Results summary */}
              <div className="mt-4 pt-4 border-t border-emerald-200 text-sm text-slate-600">
                Showing <span className="font-bold text-emerald-700">{filteredYoungWalkers.length}</span> young walkers 
                and <span className="font-bold text-emerald-700">{filteredRegularSitters.length}</span> regular sitters
                {searchSuburbs.length > 0 && ` in ${searchSuburbs.join(", ")}`}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading dog walkers...</p>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Young Walkers Section */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Young Dog Walkers</h2>
                    <p className="text-sm text-muted-foreground">
                      ${YOUNG_WALKER_CONFIG.SUGGESTED_RATE_PER_WALK} per {YOUNG_WALKER_CONFIG.MAX_WALK_DURATION}-min walk • Ages {YOUNG_WALKER_CONFIG.MIN_AGE}-{YOUNG_WALKER_CONFIG.MAX_AGE}
                    </p>
                  </div>
                </div>

                {filteredYoungWalkers.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="py-8 text-center">
                      <Dog className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <p className="font-medium mb-1">No Young Walkers Found</p>
                      <p className="text-sm text-muted-foreground">
                        {searchSuburbs.length > 0 
                          ? "Try searching in different suburbs"
                          : "No young walkers available yet"
                        }
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {filteredYoungWalkers.map((walker) => (
                      <Card 
                        key={walker.id} 
                        className="overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full group border-emerald-200/50 hover:border-emerald-400/50 cursor-pointer"
                        onClick={() => navigate(`/book-young-walker/${walker.id}`)}
                      >
                        {/* Image Section */}
                        <div className="relative">
                          <div className="aspect-[4/3] bg-gradient-to-br from-emerald-100 to-teal-100 relative overflow-hidden">
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="text-center">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-2 shadow-lg">
                                  <span className="text-3xl font-bold text-white">
                                    {walker.child_first_name.charAt(0)}
                                  </span>
                                </div>
                                <p className="text-sm text-emerald-700 font-medium">{walker.child_first_name}</p>
                              </div>
                            </div>
                            {/* Gradient overlay */}
                            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent" />
                          </div>
                          
                          {/* Top badges */}
                          <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                            <Badge className="bg-white/90 text-emerald-700 shadow-lg text-xs">
                              Age {walker.age}
                            </Badge>
                            <Badge className="bg-emerald-500 text-white shadow-lg">
                              <Shield className="w-3 h-3 mr-1" />
                              Parent Supervised
                            </Badge>
                          </div>
                          
                          {/* Bottom price tag */}
                          <div className="absolute bottom-2 left-2">
                            <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
                              <span className="font-bold text-emerald-600">${YOUNG_WALKER_CONFIG.SUGGESTED_RATE_PER_WALK}</span>
                              <span className="text-muted-foreground text-sm">/{YOUNG_WALKER_CONFIG.MAX_WALK_DURATION}min</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Content Section */}
                        <CardHeader className="pb-2 pt-4">
                          <CardTitle className="text-lg">{walker.child_first_name} {walker.child_last_name.charAt(0)}.</CardTitle>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="w-3 h-3 mr-1" />
                            {walker.home_suburb}, {walker.home_city}
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-3 flex flex-col flex-grow pt-0">
                          {walker.bio && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{walker.bio}</p>
                          )}
                          
                          {/* Dog sizes */}
                          <div className="flex flex-wrap gap-1">
                            {walker.accepted_dog_sizes.map(size => (
                              <Badge key={size} variant="outline" className="text-xs">
                                {size} dogs
                              </Badge>
                            ))}
                          </div>
                          
                          {/* Availability */}
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {getAvailabilityText(walker)}
                          </div>
                          
                          {/* CTA Button */}
                          <div className="mt-auto pt-3">
                            <Button 
                              className="w-full font-bold shadow-lg group-hover:shadow-xl transition-all text-base py-5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400 text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/book-young-walker/${walker.id}`);
                              }}
                            >
                              Book Walk – ${YOUNG_WALKER_CONFIG.SUGGESTED_RATE_PER_WALK}
                              <span className="ml-2">→</span>
                            </Button>
                            <p className="text-xs text-center text-muted-foreground font-medium mt-2">
                              🐕 {YOUNG_WALKER_CONFIG.MAX_WALK_DURATION}-min walk • Safe & supervised
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Regular Sitters Section */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-primary to-primary/80 rounded-xl">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Regular Pet Sitters</h2>
                    <p className="text-sm text-muted-foreground">
                      Experienced sitters who may offer dog walking & more
                    </p>
                  </div>
                </div>

                {filteredRegularSitters.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="py-8 text-center">
                      <Dog className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <p className="font-medium mb-1">No Sitters Found</p>
                      <p className="text-sm text-muted-foreground">
                        {searchSuburbs.length > 0 
                          ? "Try searching in different suburbs"
                          : "No sitters available in this area"
                        }
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {filteredRegularSitters.slice(0, 6).map((sitter) => (
                      <Card 
                        key={sitter.id} 
                        className="overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full group border-border/50 hover:border-primary/30 cursor-pointer"
                        onClick={() => navigate(`/sitter/${sitter.id}`)}
                      >
                        {/* Image Section */}
                        <div className="relative">
                          <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                            {sitter.avatar_url ? (
                              <img 
                                src={sitter.avatar_url} 
                                alt={`${sitter.first_name}'s profile`}
                                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                                <div className="text-center">
                                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2">
                                    <span className="text-3xl font-bold text-primary">
                                      {sitter.first_name.charAt(0)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-muted-foreground font-medium">{sitter.first_name}</p>
                                </div>
                              </div>
                            )}
                            {/* Gradient overlay */}
                            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
                          </div>
                          
                          {/* Top badges - Using proper verification badge */}
                          <div className="absolute top-2 right-2">
                            <SitterVerificationBadge 
                              isVerified={sitter.is_verified || false}
                              hasGoldenBadge={sitter.golden_badge_approved || false}
                              size="sm"
                              showLabel={true}
                            />
                          </div>
                        </div>
                        
                        {/* Content Section */}
                        <CardHeader className="pb-2 pt-4">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{sitter.first_name} {sitter.last_name.charAt(0)}.</CardTitle>
                            {/* Rating */}
                            {sitter.rating && sitter.total_reviews && sitter.total_reviews > 0 && (
                              <div className="flex items-center gap-1 text-sm">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">{sitter.rating.toFixed(1)}</span>
                                <span className="text-muted-foreground">({sitter.total_reviews})</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="w-3 h-3 mr-1" />
                            {sitter.suburb || sitter.city || "Auckland"}
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-3 flex flex-col flex-grow pt-0">
                          {sitter.bio && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{sitter.bio}</p>
                          )}
                          
                          {/* Response time */}
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            Usually responds within hours
                          </div>
                          
                          {/* CTA Button */}
                          <div className="mt-auto pt-3">
                            <Button 
                              className="w-full font-bold shadow-lg group-hover:shadow-xl transition-all text-base py-5 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-400 hover:via-emerald-400 hover:to-teal-400 text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/sitter/${sitter.id}`);
                              }}
                            >
                              Get a Quote
                              <span className="ml-2">→</span>
                            </Button>
                            <p className="text-xs text-center text-muted-foreground font-medium mt-2">
                              ⚡ No payment until confirmed
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {filteredRegularSitters.length > 6 && (
                  <div className="text-center mt-6">
                    <Button variant="outline" onClick={() => navigate("/find-sitters")}>
                      View All {filteredRegularSitters.length} Sitters
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-6xl">🐕</div>
          <div className="absolute bottom-10 right-10 text-6xl">🐾</div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-2xl mx-auto">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 mr-1" />
              Great Opportunity
            </Badge>
            
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Want Your Child to Become a Dog Walker?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Help your child earn <span className="font-bold">${YOUNG_WALKER_CONFIG.SUGGESTED_RATE_PER_WALK}</span> per walk while learning responsibility and building confidence. 
              Ages {YOUNG_WALKER_CONFIG.MIN_AGE}-{YOUNG_WALKER_CONFIG.MAX_AGE}, fully parent supervised.
            </p>
            <Button 
              size="lg"
              className="bg-white text-emerald-700 hover:bg-white/90 rounded-full font-bold text-lg px-8 py-6 shadow-xl"
              onClick={() => navigate("/young-walkers")}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Learn More About the Program
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
