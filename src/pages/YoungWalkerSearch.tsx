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

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterResults();
  }, [youngWalkers, regularSitters, searchSuburbs]);

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
        .select("id, first_name, last_name, suburb, city, bio, avatar_url, rating, total_reviews, is_verified")
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
    if (searchSuburbs.length === 0) {
      // Show all results when no suburbs selected
      setFilteredYoungWalkers(youngWalkers);
      setFilteredRegularSitters(regularSitters);
      return;
    }

    const searchTerms = searchSuburbs.map(s => s.toLowerCase());
    
    // Filter young walkers
    const filteredYW = youngWalkers.filter(w => 
      searchTerms.some(term => 
        w.home_suburb.toLowerCase().includes(term) ||
        w.home_city.toLowerCase().includes(term)
      )
    );
    setFilteredYoungWalkers(filteredYW);

    // Filter regular sitters
    const filteredRS = regularSitters.filter(s => 
      searchTerms.some(term => 
        (s.suburb?.toLowerCase().includes(term)) ||
        (s.city?.toLowerCase().includes(term))
      )
    );
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

      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0">
              <Dog className="mr-1 h-3 w-3" />
              Dog Walking
            </Badge>
            <h1 className="text-2xl md:text-4xl font-bold mb-4">
              Find a <span className="text-emerald-600">Dog Walker</span>
            </h1>
            <p className="text-muted-foreground mb-6 text-sm md:text-base">
              Browse young dog walkers and experienced sitters in your area
            </p>

            {/* Multi-suburb Search */}
            <div className="max-w-lg mx-auto space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Add a suburb..."
                    value={suburbInput}
                    onChange={(e) => setSuburbInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addSuburb()}
                    className="pl-10"
                  />
                </div>
                <Button onClick={addSuburb} size="icon" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Selected suburbs */}
              {searchSuburbs.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center">
                  {searchSuburbs.map(suburb => (
                    <Badge 
                      key={suburb} 
                      variant="secondary"
                      className="px-3 py-1 gap-1"
                    >
                      {suburb}
                      <button onClick={() => removeSuburb(suburb)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  <button 
                    onClick={() => setSearchSuburbs([])}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear all
                  </button>
                </div>
              )}
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
                      <Card key={walker.id} className="hover:shadow-lg transition-shadow border-emerald-100">
                        <CardHeader className="pb-3">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-12 w-12 md:h-14 md:w-14">
                              <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-lg">
                                {walker.child_first_name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-base md:text-lg truncate">
                                {walker.child_first_name} {walker.child_last_name.charAt(0)}.
                              </CardTitle>
                              <div className="flex items-center text-xs md:text-sm text-muted-foreground mt-0.5">
                                <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                                <span className="truncate">{walker.home_suburb}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  Age {walker.age}
                                </Badge>
                                <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">
                                  ${YOUNG_WALKER_CONFIG.SUGGESTED_RATE_PER_WALK}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-0">
                          {walker.bio && (
                            <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                              {walker.bio}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-1">
                            {walker.accepted_dog_sizes.map(size => (
                              <Badge key={size} variant="outline" className="text-xs">
                                {size} dogs
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center gap-2 text-xs text-emerald-600">
                            <Shield className="h-3 w-3" />
                            <span>{YOUNG_WALKER_CONFIG.MAX_WALK_DURATION}-min walks • Parent supervised</span>
                          </div>

                          <Button 
                            className="w-full bg-emerald-500 hover:bg-emerald-600" 
                            size="sm"
                            onClick={() => navigate(`/book-young-walker/${walker.id}`)}
                          >
                            Book Walk
                          </Button>
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
                      <Card key={sitter.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-12 w-12 md:h-14 md:w-14">
                              <AvatarImage src={sitter.avatar_url || undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                                {sitter.first_name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-base md:text-lg truncate">
                                {sitter.first_name} {sitter.last_name.charAt(0)}.
                              </CardTitle>
                              <div className="flex items-center text-xs md:text-sm text-muted-foreground mt-0.5">
                                <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                                <span className="truncate">{sitter.suburb || sitter.city || "Auckland"}</span>
                              </div>
                              {sitter.rating && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                  <span className="text-xs font-medium">{sitter.rating.toFixed(1)}</span>
                                  <span className="text-xs text-muted-foreground">
                                    ({sitter.total_reviews} reviews)
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-0">
                          {sitter.bio && (
                            <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                              {sitter.bio}
                            </p>
                          )}

                          {sitter.is_verified && (
                            <div className="flex items-center gap-2 text-xs text-primary">
                              <Shield className="h-3 w-3" />
                              <span>Verified sitter</span>
                            </div>
                          )}

                          <Button 
                            className="w-full" 
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/sitter/${sitter.id}`)}
                          >
                            View Profile
                          </Button>
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
      <section className="py-12 bg-gradient-to-r from-emerald-500 to-teal-500">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Want Your Child to Become a Dog Walker?
            </h2>
            <p className="text-white/90 mb-6 text-sm md:text-base">
              Help your child earn pocket money while learning responsibility. 
              Ages {YOUNG_WALKER_CONFIG.MIN_AGE}-{YOUNG_WALKER_CONFIG.MAX_AGE}, parent supervised.
            </p>
            <Button 
              size="lg"
              className="bg-white text-emerald-700 hover:bg-white/90 rounded-full font-bold"
              onClick={() => navigate("/young-walkers")}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Link to landing page */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            Looking for more info about the Young Walker program?{" "}
            <Link to="/find-young-walkers" className="text-primary hover:underline font-medium">
              Visit our Young Walker landing page →
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
