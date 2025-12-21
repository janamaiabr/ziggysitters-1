import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Bell, Mail, ArrowRight, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import SitterVerificationBadge from '@/components/sitter/SitterVerificationBadge';
import { useEventTracking } from '@/hooks/useEventTracking';

interface NoResultsSectionProps {
  searchLocation: string;
  searchServiceType: string;
  nearbySitters: any[];
  onClearFilters: () => void;
  onViewSitter: (sitterId: string) => void;
}

export default function NoResultsSection({
  searchLocation,
  searchServiceType,
  nearbySitters,
  onClearFilters,
  onViewSitter
}: NoResultsSectionProps) {
  const { trackEvent, trackConversion } = useEventTracking();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Track when no results page is shown
  useEffect(() => {
    trackEvent({
      eventType: 'search',
      eventName: 'no_results_shown',
      eventData: {
        location: searchLocation,
        service_type: searchServiceType,
        nearby_sitters_count: nearbySitters?.length || 0
      }
    });
  }, [searchLocation, searchServiceType]);

  const handleNotifyMe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('email_captures').insert({
        email,
        name: name || null,
        search_location: searchLocation,
        search_service_type: searchServiceType,
        source: 'no_results_notify',
      });

      if (error) throw error;

      // Track email capture conversion
      trackConversion('email_capture_no_results', {
        location: searchLocation,
        service_type: searchServiceType,
        has_name: !!name
      });

      setIsSubscribed(true);
      toast.success("We'll notify you when a sitter becomes available!");
    } catch (error) {
      console.error('Error saving email:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNearbySitterClick = (sitterId: string, sitterName: string) => {
    trackEvent({
      eventType: 'button_click',
      eventName: 'nearby_sitter_click',
      eventData: {
        sitter_id: sitterId,
        sitter_name: sitterName,
        from_location: searchLocation
      }
    });
    onViewSitter(sitterId);
  };

  const serviceTypeLabels: Record<string, string> = {
    pet_sitting_owners_home: 'Pet Sitting (Your Home)',
    pet_sitting_sitters_home: "Pet Sitting (Sitter's Home)",
    drop_in_visits: 'Drop-in Visits',
  };

  return (
    <div className="py-8 space-y-8">
      {/* Notify Me Section - NOW FIRST AND PROMINENT */}
      {!isSubscribed ? (
        <Card className="max-w-xl mx-auto border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 shadow-xl">
          <CardContent className="p-6 md:p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <Bell className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                No sitters in {searchLocation || 'your area'} yet
              </h3>
              <p className="text-muted-foreground">
                But don't worry! We're actively recruiting sitters nearby.
                <span className="block font-medium text-primary mt-1">Be the first to know when one joins!</span>
              </p>
            </div>
            <form onSubmit={handleNotifyMe} className="space-y-4">
              <Input
                type="text"
                placeholder="Your name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-background h-12 text-base"
              />
              <Input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background h-12 text-base"
              />
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full h-12 text-base font-bold bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
              >
                {isSubmitting ? 'Saving...' : '🔔 Notify Me When Available'}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                We'll only email you when a matching sitter becomes available. No spam, ever.
              </p>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="max-w-xl mx-auto border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="text-xl font-bold text-green-900 mb-2">You're on the list! 🎉</h4>
            <p className="text-green-700">
              We'll email you the moment a sitter becomes available in {searchLocation || 'your area'}
            </p>
          </CardContent>
        </Card>
      )}
      
      {/* Secondary message with clear all option */}
      <div className="text-center">
        <p className="text-muted-foreground mb-3">
          {searchServiceType && (
            <>Looking for <span className="font-medium">{serviceTypeLabels[searchServiceType] || searchServiceType}</span>? </>
          )}
          Try expanding your search.
        </p>
        <Button variant="outline" onClick={onClearFilters}>
          View all available sitters
        </Button>
      </div>


      {/* Nearby Sitters Section */}
      {nearbySitters.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-primary" />
            <h4 className="text-lg font-semibold text-foreground">
              Sitters in nearby areas
            </h4>
            <Badge variant="secondary" className="ml-2">
              {nearbySitters.length} available
            </Badge>
          </div>
          <p className="text-muted-foreground mb-6">
            These sitters are close by and may be able to help
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nearbySitters.slice(0, 6).map((sitter) => (
              <Card 
                key={sitter.id} 
                className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => handleNearbySitterClick(sitter.id, sitter.name)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-14 w-14 border-2 border-primary/20">
                      <AvatarImage src={sitter.image} alt={sitter.name} className="object-cover" />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {sitter.name.split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h5 className="font-semibold text-foreground truncate">{sitter.name}</h5>
                        <SitterVerificationBadge 
                          isVerified={sitter.verified}
                          hasGoldenBadge={sitter.golden_badge}
                          size="sm"
                        />
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="truncate">{sitter.location}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">
                          From ${sitter.baseRate}/hr
                        </span>
                        <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Become a Sitter CTA */}
      <Card className="max-w-2xl mx-auto bg-gradient-to-r from-secondary/10 to-primary/10 border-0 mt-8">
        <CardContent className="p-6 text-center">
          <h4 className="font-bold text-lg mb-2 text-foreground">Know someone who loves pets?</h4>
          <p className="text-muted-foreground mb-4">
            Help us grow our sitter network in {searchLocation || 'Auckland'}. 
            Earn money doing what you love!
          </p>
          <Button variant="outline" asChild>
            <a href="/become-sitter">Become a Pet Sitter</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
