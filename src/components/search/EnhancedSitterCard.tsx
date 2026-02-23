import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Shield, Star, Sparkles, Dog } from 'lucide-react';
import SitterVerificationBadge from '@/components/sitter/SitterVerificationBadge';
import { YOUNG_WALKER_CONFIG } from '@/config/features';

interface EnhancedSitterCardProps {
  sitter: {
    id: string;
    name: string;
    location: string;
    baseRate: number;
    bio: string;
    image: string | null;
    services: string[];
    verified: boolean;
    golden_badge: boolean;
    sitterServices?: any[];
    isYoungWalker?: boolean;
    youngWalkerAge?: number;
    acceptedDogSizes?: string[];
    rating?: number | null;
    feedback_count?: number | null;
  };
  onViewProfile: () => void;
  onSitterClick?: (sitterId: string, sitterName?: string) => void;
  showBookingDates?: boolean;
  isTopSitter?: boolean;
}

export default function EnhancedSitterCard({ sitter, onViewProfile, onSitterClick, isTopSitter }: EnhancedSitterCardProps) {
  const experienceYears = sitter.sitterServices?.[0]?.experience_years || 0;
  const hasFencedYard = sitter.sitterServices?.some(s => s.has_fenced_yard);

  const handleClick = () => {
    if (onSitterClick) onSitterClick(sitter.id, sitter.name);
    onViewProfile();
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-all duration-200 border-border/50 hover:border-primary/30 cursor-pointer"
      onClick={handleClick}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex gap-3">
          {/* Avatar — left side */}
          <div className="shrink-0">
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-2 border-primary/10">
              <AvatarImage src={sitter.image} alt={sitter.name} className="object-cover" />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                {sitter.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Info — right side */}
          <div className="flex-1 min-w-0">
            {/* Name + verification */}
            <div className="flex items-center gap-1.5 mb-0.5">
              <h3 className="font-semibold text-base truncate">{sitter.name}</h3>
              {sitter.golden_badge && (
                <span title="Police vetted" className="text-amber-500">⭐</span>
              )}
              {sitter.verified && !sitter.golden_badge && (
                <Shield className="w-3.5 h-3.5 text-green-500 shrink-0" />
              )}
            </div>

            {/* Location */}
            <div className="flex items-center text-sm text-muted-foreground mb-1">
              <MapPin className="w-3 h-3 mr-1 shrink-0" />
              <span className="truncate">{sitter.location}</span>
            </div>

            {/* Rating or New */}
            <div className="flex items-center gap-1.5 mb-1.5">
              {sitter.feedback_count && sitter.feedback_count > 0 ? (
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-3 w-3 ${
                          s <= Math.round(sitter.rating || 0)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground/30'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">({sitter.feedback_count})</span>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">New sitter</span>
              )}
              {experienceYears >= 2 && (
                <span className="text-xs text-muted-foreground">· {experienceYears}+ yrs exp</span>
              )}
            </div>

            {/* Bio — 2 lines max */}
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{sitter.bio}</p>

            {/* Tags row — compact */}
            <div className="flex flex-wrap gap-1 mb-2">
              {sitter.isYoungWalker && (
                <Badge className="text-[10px] py-0 px-1.5 h-5 bg-emerald-100 text-emerald-700 border-0">
                  <Dog className="w-2.5 h-2.5 mr-0.5" /> Young Walker
                </Badge>
              )}
              {sitter.services.slice(0, 2).map((service) => (
                <Badge key={service} variant="outline" className="text-[10px] py-0 px-1.5 h-5">
                  {service.replace('Pet Sitting ', '').replace('(', '').replace(')', '')}
                </Badge>
              ))}
              {hasFencedYard && (
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-5 text-blue-600 border-blue-200">
                  Fenced yard
                </Badge>
              )}
            </div>

            {/* Price + CTA row */}
            <div className="flex items-center justify-between gap-2">
              <div>
                {sitter.isYoungWalker ? (
                  <span className="font-bold text-emerald-600">${sitter.baseRate}<span className="text-xs font-normal text-muted-foreground">/walk</span></span>
                ) : (
                  <span className="font-bold">${sitter.baseRate}<span className="text-xs font-normal text-muted-foreground">/day</span></span>
                )}
              </div>
              <Button 
                size="sm"
                className="text-xs font-semibold px-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white shadow-sm"
                onClick={(e) => { e.stopPropagation(); handleClick(); }}
              >
                View Profile →
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
