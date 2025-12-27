import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Clock, Shield, Star, Camera, Heart, Zap, Dog } from 'lucide-react';
import SitterVerificationBadge from '@/components/sitter/SitterVerificationBadge';
import QuickEnquiryButton from '@/components/search/QuickEnquiryButton';
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
  };
  onViewProfile: () => void;
  onSitterClick?: (sitterId: string, sitterName?: string) => void;
  showBookingDates?: boolean;
}

export default function EnhancedSitterCard({ sitter, onViewProfile, onSitterClick, showBookingDates }: EnhancedSitterCardProps) {
  // Calculate trust signals
  const hasProfilePhoto = !!sitter.image;
  const hasMultipleServices = sitter.services.length > 1;
  const hasDetailedBio = sitter.bio && sitter.bio.length > 50;
  const experienceYears = sitter.sitterServices?.[0]?.experience_years || 0;
  const maxPets = sitter.sitterServices?.[0]?.max_pets || 1;
  const hasFencedYard = sitter.sitterServices?.some(s => s.has_fenced_yard);

  const handleClick = () => {
    // Track the click for analytics - include sitter name for better context
    if (onSitterClick) {
      onSitterClick(sitter.id, sitter.name);
    }
    onViewProfile();
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full group border-border/50 hover:border-primary/30 cursor-pointer"
      onClick={handleClick}
    >
      {/* Image Section with Overlays */}
      <div className="relative">
        <div className="aspect-[4/3] bg-muted relative overflow-hidden">
          {sitter.image ? (
            <img 
              src={sitter.image} 
              alt={`${sitter.name}'s profile`}
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2">
                  <span className="text-3xl font-bold text-primary">
                    {sitter.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground font-medium">{sitter.name}</p>
              </div>
            </div>
          )}
          
          {/* Gradient overlay at bottom */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        
        {/* Top badges */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
          <div className="flex gap-1 flex-wrap">
            {sitter.isYoungWalker && (
              <Badge className="text-xs shadow-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0">
                <Dog className="w-3 h-3 mr-1" />
                Young Walker
              </Badge>
            )}
            {sitter.isYoungWalker && sitter.youngWalkerAge && (
              <Badge variant="secondary" className="text-xs shadow-lg">
                Age {sitter.youngWalkerAge}
              </Badge>
            )}
            {!sitter.isYoungWalker && experienceYears >= 2 && (
              <Badge variant="secondary" className="text-xs shadow-lg">
                {experienceYears}+ yrs exp
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Quick enquiry button - allows messaging without leaving search (only for regular sitters) */}
            {!sitter.isYoungWalker && (
              <QuickEnquiryButton
                sitterId={sitter.id}
                sitterName={sitter.name}
                sitterAvatar={sitter.image || undefined}
                variant="icon"
                className="shadow-lg"
              />
            )}
            {sitter.isYoungWalker ? (
              <Badge className="bg-green-500 text-white shadow-lg">
                <Shield className="w-3 h-3 mr-1" />
                Parent Supervised
              </Badge>
            ) : (
              <SitterVerificationBadge 
                isVerified={sitter.verified}
                hasGoldenBadge={sitter.golden_badge}
                size="sm"
              />
            )}
          </div>
        </div>
        
        {/* Bottom price tag */}
        <div className="absolute bottom-2 left-2">
          <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
            {sitter.isYoungWalker ? (
              <>
                <span className="font-bold text-emerald-600">${sitter.baseRate}</span>
                <span className="text-muted-foreground text-sm">/{YOUNG_WALKER_CONFIG.MAX_WALK_DURATION}min walk</span>
              </>
            ) : (
              <>
                <span className="text-muted-foreground text-sm">from </span>
                <span className="font-bold text-foreground">${sitter.baseRate}</span>
                <span className="text-muted-foreground text-sm">/day</span>
              </>
            )}
          </div>
        </div>
        
        {/* Photo guarantee badge - only for regular sitters */}
        {!sitter.isYoungWalker && (
          <div className="absolute bottom-2 right-2">
            <div className="bg-primary/90 text-primary-foreground px-2 py-1 rounded-full text-xs flex items-center gap-1 shadow-lg">
              <Camera className="w-3 h-3" />
              Daily photos
            </div>
          </div>
        )}
      </div>
      
      {/* Content Section */}
      <CardHeader className="pb-2 pt-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 border-2 border-primary/20 shadow-sm">
            <AvatarImage src={sitter.image} alt={sitter.name} className="object-cover" />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {sitter.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{sitter.name}</CardTitle>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="truncate">{sitter.location}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 flex flex-col flex-grow pt-0">
        {/* Bio */}
        <p className="text-sm text-muted-foreground line-clamp-2">{sitter.bio}</p>
        
        {/* Trust Signals */}
        <div className="flex flex-wrap gap-2">
          {sitter.verified && (
            <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <Shield className="w-3 h-3" />
              ID Verified
            </div>
          )}
          {hasFencedYard && (
            <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              <Heart className="w-3 h-3" />
              Fenced yard
            </div>
          )}
          {maxPets > 1 && (
            <div className="flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
              <Zap className="w-3 h-3" />
              Takes {maxPets} pets
            </div>
          )}
        </div>
        
        {/* Services */}
        <div className="flex flex-wrap gap-1">
          {sitter.services.slice(0, 2).map((service) => (
            <Badge key={service} variant="outline" className="text-xs">
              {service}
            </Badge>
          ))}
          {sitter.services.length > 2 && (
            <Badge variant="outline" className="text-xs bg-muted">
              +{sitter.services.length - 2}
            </Badge>
          )}
        </div>
        
        {/* Response time indicator */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          Usually responds within a few hours
        </div>
        
        {/* CTA Button - High visibility green for conversions */}
        <div className="mt-auto pt-3 space-y-2">
          <Button 
            className={`w-full font-bold shadow-lg group-hover:shadow-xl transition-all text-base py-5 text-white ${
              sitter.isYoungWalker 
                ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400'
                : 'bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-400 hover:via-emerald-400 hover:to-teal-400'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            {sitter.isYoungWalker ? `Book Walk – $${sitter.baseRate}` : 'Get a Quote'}
            <span className="ml-2">→</span>
          </Button>
          <p className="text-xs text-center text-muted-foreground font-medium">
            {sitter.isYoungWalker 
              ? `🐕 ${YOUNG_WALKER_CONFIG.MAX_WALK_DURATION}-min walk • Parent supervised`
              : '⚡ Usually responds within hours • No payment until confirmed'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
