import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import SitterVerificationBadge from '@/components/sitter/SitterVerificationBadge';
import iconStar from '@/assets/icons/icon-star.png';
import iconLocation from '@/assets/icons/icon-location.png';

interface FeaturedSitter {
  id: string;
  name: string;
  location: string;
  avatar: string;
  bio: string;
  verified: boolean;
  hasGoldenBadge: boolean;
}

export default function FeaturedSittersCarousel() {
  const [sitters, setSitters] = useState<FeaturedSitter[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSitters = async () => {
      const { data, error } = await supabase
        .from('public_sitters')
        .select('id, first_name, last_name, suburb, city, avatar_url, bio, is_verified, golden_badge_approved')
        .eq('onboarding_completed', true)
        .eq('is_verified', true)
        .not('avatar_url', 'is', null)
        .neq('avatar_url', '')
        .order('golden_badge_approved', { ascending: false })
        .order('rating', { ascending: false })
        .limit(8);

      if (data && !error) {
        setSitters(data.map(s => ({
          id: s.id,
          name: `${s.first_name} ${s.last_name?.charAt(0) || ''}.`,
          location: `${s.suburb || ''}, ${s.city || 'Auckland'}`,
          avatar: s.avatar_url,
          bio: s.bio?.substring(0, 100) || 'Experienced pet sitter',
          verified: s.is_verified || false,
          hasGoldenBadge: s.golden_badge_approved || false,
        })));
      }
      setLoading(false);
    };

    fetchSitters();
  }, []);

  useEffect(() => {
    if (sitters.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % sitters.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [sitters.length]);

  const goToPrev = () => setCurrentIndex(prev => (prev - 1 + sitters.length) % sitters.length);
  const goToNext = () => setCurrentIndex(prev => (prev + 1) % sitters.length);

  if (loading) {
    return (
      <div className="flex gap-4 overflow-hidden">
        {[1, 2, 3].map(i => (
          <Card key={i} className="min-w-[300px] animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (sitters.length === 0) return null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <img src={iconStar} alt="" className="h-5 w-5" />
          Meet Our Top Sitters
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div 
          ref={carouselRef}
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {sitters.map((sitter) => (
            <div key={sitter.id} className="min-w-full px-1">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg">
                <Avatar className="h-20 w-20 ring-2 ring-primary/20">
                  <AvatarImage src={sitter.avatar} className="object-cover object-[center_20%]" />
                  <AvatarFallback className="text-lg">{sitter.name.charAt(0)}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{sitter.name}</span>
                    <SitterVerificationBadge 
                      isVerified={sitter.verified}
                      hasGoldenBadge={sitter.hasGoldenBadge}
                      size="sm"
                      showLabel={false}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <img src={iconLocation} alt="" className="h-3 w-3" />
                    {sitter.location}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                    {sitter.bio}
                  </p>
                </div>

                <Button 
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/sitter/${sitter.id}?booking=true`)}
                >
                  View
                  <span className="ml-1">→</span>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {sitters.length > 1 && (
          <>
            <Button variant="ghost" size="icon" className="absolute left-0 top-1/2 -translate-y-1/2" onClick={goToPrev}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="absolute right-0 top-1/2 -translate-y-1/2" onClick={goToNext}>
              <ChevronRight className="h-5 w-5" />
            </Button>
            <div className="flex justify-center gap-1 mt-4">
              {sitters.map((_, i) => (
                <button
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${i === currentIndex ? 'bg-primary' : 'bg-muted'}`}
                  onClick={() => setCurrentIndex(i)}
                />
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
