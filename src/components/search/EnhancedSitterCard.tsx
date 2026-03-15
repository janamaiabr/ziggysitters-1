import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Shield, Star, Dog } from 'lucide-react';
import { YOUNG_WALKER_CONFIG } from '@/config/features';

const COMPETENCY_TAG_LABELS: Record<string, string> = {
  medication_admin: 'Meds',
  first_aid_certified: 'First Aid',
  senior_pet_experience: 'Senior Pets',
  anxiety_specialist: 'Anxiety',
  post_surgical_care: 'Post-Surgery',
  diabetic_pet_care: 'Diabetic Care',
  mobility_assistance: 'Mobility',
};

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
    competency_tags?: string[] | null;
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
      className="overflow-hidden hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/30 cursor-pointer group"
      onClick={handleClick}
    >
      {/* Large photo — vertical aspect ratio */}
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        {sitter.image ? (
          <img 
            src={sitter.image} 
            alt={sitter.name}
            className="w-full h-full object-cover object-[center_20%] group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/10">
            <span className="text-4xl font-bold text-primary/40">
              {sitter.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
        )}

        {/* Overlay gradient at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Price badge — top right */}
        <div className="absolute top-3 right-3">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-sm">
            <span className="font-bold text-foreground">${sitter.baseRate}</span>
            <span className="text-xs text-muted-foreground">/{sitter.isYoungWalker ? 'walk' : 'day'}</span>
          </div>
        </div>

        {/* Verification badges — top left */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {sitter.golden_badge && (
            <div className="bg-amber-500/90 backdrop-blur-sm rounded-lg px-2.5 py-1 flex items-center gap-1 shadow-sm">
              <Star className="w-3 h-3 fill-white text-white" />
              <span className="text-xs font-semibold text-white">Vetted</span>
            </div>
          )}
          {sitter.verified && !sitter.golden_badge && (
            <div className="bg-primary/90 backdrop-blur-sm rounded-lg px-2.5 py-1 flex items-center gap-1 shadow-sm">
              <Shield className="w-3 h-3 text-white" />
              <span className="text-xs font-semibold text-white">Verified</span>
            </div>
          )}
        </div>

        {/* Name + location on photo */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-bold text-lg text-white mb-0.5">{sitter.name}</h3>
          <div className="flex items-center text-sm text-white/80">
            <MapPin className="w-3 h-3 mr-1 shrink-0" />
            <span className="truncate">{sitter.location}</span>
          </div>
        </div>
      </div>

      {/* Info below photo */}
      <div className="p-4">
        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-2">
          {sitter.feedback_count && sitter.feedback_count > 0 ? (
            <div className="flex items-center gap-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`h-3.5 w-3.5 ${
                      s <= Math.round(sitter.rating || 0)
                        ? 'fill-amber-400 text-amber-400'
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
            <span className="text-xs text-muted-foreground">· {experienceYears}+ yrs</span>
          )}
        </div>

        {/* Bio */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{sitter.bio}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {sitter.services.slice(0, 2).map((service) => (
            <Badge key={service} variant="outline" className="text-[10px] py-0 px-1.5 h-5 font-normal">
              {service.replace('Pet Sitting ', '').replace('(', '').replace(')', '')}
            </Badge>
          ))}
          {hasFencedYard && (
            <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-5 text-primary border-primary/20 font-normal">
              Fenced yard
            </Badge>
          )}
          {sitter.competency_tags?.slice(0, 2).map((tag) => (
            COMPETENCY_TAG_LABELS[tag] ? (
              <Badge
                key={tag}
                variant="outline"
                className="text-[10px] py-0 px-1.5 h-5 font-normal"
                data-testid={`competency-badge-${tag}`}
              >
                {COMPETENCY_TAG_LABELS[tag]}
              </Badge>
            ) : null
          ))}
        </div>
      </div>
    </Card>
  );
}
