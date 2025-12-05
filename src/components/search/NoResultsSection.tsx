import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Bell, Mail, ArrowRight, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import SitterVerificationBadge from '@/components/sitter/SitterVerificationBadge';

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
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

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

      setIsSubscribed(true);
      toast.success("We'll notify you when a sitter becomes available!");
    } catch (error) {
      console.error('Error saving email:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const serviceTypeLabels: Record<string, string> = {
    pet_sitting_owners_home: 'Pet Sitting (Your Home)',
    pet_sitting_sitters_home: "Pet Sitting (Sitter's Home)",
    drop_in_visits: 'Drop-in Visits',
  };

  return (
    <div className="py-8 space-y-8">
      {/* Main No Results Message */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="w-20 h-20 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
          <span className="text-4xl">🔍</span>
        </div>
        <h3 className="text-2xl font-bold mb-2 text-foreground">
          No sitters found in {searchLocation || 'your area'}
        </h3>
        <p className="text-muted-foreground mb-4">
          {searchServiceType && (
            <>for <span className="font-medium">{serviceTypeLabels[searchServiceType] || searchServiceType}</span></>
          )}
        </p>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          <Button variant="outline" onClick={onClearFilters}>
            Clear filters & see all
          </Button>
        </div>
      </div>

      {/* Notify Me Section */}
      {!isSubscribed ? (
        <Card className="max-w-lg mx-auto border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Get notified when a sitter joins</h4>
                <p className="text-sm text-muted-foreground">
                  We're actively recruiting sitters in {searchLocation || 'your area'}
                </p>
              </div>
            </div>
            <form onSubmit={handleNotifyMe} className="space-y-3">
              <Input
                type="text"
                placeholder="Your name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-background"
              />
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background"
                />
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Notify Me'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                We'll only email you when a matching sitter becomes available
              </p>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="max-w-lg mx-auto border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-green-900">You're on the list!</h4>
            <p className="text-sm text-green-700">
              We'll email you when a sitter becomes available in {searchLocation || 'your area'}
            </p>
          </CardContent>
        </Card>
      )}

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
                onClick={() => onViewSitter(sitter.id)}
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
