import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Shield
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
  // Computed age from DOB
  age?: number;
}

export default function YoungWalkerSearch() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [walkers, setWalkers] = useState<YoungWalker[]>([]);
  const [filteredWalkers, setFilteredWalkers] = useState<YoungWalker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchSuburb, setSearchSuburb] = useState(searchParams.get("suburb") || "");

  useEffect(() => {
    fetchWalkers();
  }, []);

  useEffect(() => {
    filterWalkers();
  }, [walkers, searchSuburb]);

  const fetchWalkers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("young_walkers")
        .select("*")
        .eq("status", "active");

      if (error) throw error;

      // Calculate age from DOB
      const walkersWithAge = (data || []).map(walker => {
        const today = new Date();
        const birthDate = new Date(walker.child_date_of_birth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return { ...walker, age };
      });

      setWalkers(walkersWithAge);
    } catch (error: any) {
      console.error("Error fetching walkers:", error);
      toast({
        title: "Error",
        description: "Failed to load young walkers.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterWalkers = () => {
    let filtered = [...walkers];
    
    if (searchSuburb.trim()) {
      const search = searchSuburb.toLowerCase();
      filtered = filtered.filter(w => 
        w.home_suburb.toLowerCase().includes(search) ||
        w.home_city.toLowerCase().includes(search)
      );
    }

    setFilteredWalkers(filtered);
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
        title="Find Young Dog Walkers | Auckland | ZiggySitters"
        description="Find local young dog walkers in Auckland. Affordable dog walking for small to medium dogs. Safe, parent-supervised walks."
        canonical="/search-young-walkers"
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              <Dog className="mr-1 h-3 w-3" />
              Young Walker Program
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Find a <span className="text-primary">Young Dog Walker</span>
            </h1>
            <p className="text-muted-foreground mb-8">
              Local young people providing affordable, safe dog walks for well-behaved small and medium dogs.
            </p>

            {/* Search */}
            <div className="flex max-w-md mx-auto gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Enter your suburb..."
                  value={searchSuburb}
                  onChange={(e) => setSearchSuburb(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={filterWalkers}>Search</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading young walkers...</p>
            </div>
          ) : filteredWalkers.length === 0 ? (
            <div className="text-center py-12">
              <Dog className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Young Walkers Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchSuburb 
                  ? `We don't have any young walkers in ${searchSuburb} yet.`
                  : "There are no young walkers available at the moment."
                }
              </p>
              <Button variant="outline" onClick={() => navigate("/find-sitters")}>
                Try Regular Sitters Instead
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-muted-foreground">
                  {filteredWalkers.length} young walker{filteredWalkers.length !== 1 ? "s" : ""} found
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredWalkers.map((walker) => (
                  <Card key={walker.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarFallback className="bg-primary/10 text-primary text-lg">
                            {walker.child_first_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            {walker.child_first_name} {walker.child_last_name.charAt(0)}.
                          </CardTitle>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {walker.home_suburb}, {walker.home_city}
                          </div>
                          {walker.age && (
                            <Badge variant="secondary" className="mt-2">
                              Age {walker.age}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {walker.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {walker.bio}
                        </p>
                      )}

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-medium">${walker.rate_per_walk}</span>
                          <span className="text-muted-foreground">per walk</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{walker.max_walk_duration_mins} min walks</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{getAvailabilityText(walker)}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {walker.accepted_dog_sizes.map(size => (
                          <Badge key={size} variant="outline" className="text-xs">
                            {size} dogs
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-green-600">
                        <Shield className="h-3 w-3" />
                        <span>Parent-supervised walks</span>
                      </div>

                      <Button 
                        className="w-full" 
                        onClick={() => navigate(`/book-young-walker/${walker.id}`)}
                      >
                        Book Walk
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Info Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <Shield className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Safe & Supervised</h2>
            <p className="text-muted-foreground mb-6">
              All Young Walker bookings are for small to medium, well-behaved dogs only. 
              Walks are parent-supervised and limited to 30 minutes in the local neighbourhood.
            </p>
            <Button variant="outline" onClick={() => navigate("/find-young-walkers")}>
              Learn More About Young Walkers
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
