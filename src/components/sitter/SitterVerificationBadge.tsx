import { Badge } from '@/components/ui/badge';
import { Shield, ShieldCheck, Star } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SitterVerificationBadgeProps {
  isVerified?: boolean;
  hasGoldenBadge?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function SitterVerificationBadge({ 
  isVerified = false, 
  hasGoldenBadge = false,
  size = 'md',
  showLabel = true
}: SitterVerificationBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  // Gold Star Badge (highest level - vet check approved)
  if (hasGoldenBadge) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              className={`bg-gradient-to-r from-yellow-400 to-amber-500 text-white border-0 ${sizeClasses[size]} inline-flex items-center gap-1.5`}
            >
              <Star className={`${iconSizes[size]} fill-current`} />
              {showLabel && 'Gold Star Verified'}
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="font-semibold mb-1">🌟 Gold Star Sitter</p>
            <p className="text-xs">This sitter has completed both ID verification AND police vet check. Our highest trust level.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Verified Badge (ID documents approved)
  if (isVerified) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              className={`bg-blue-600 text-white border-0 ${sizeClasses[size]} inline-flex items-center gap-1.5`}
            >
              <ShieldCheck className={iconSizes[size]} />
              {showLabel && 'ID Verified'}
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="font-semibold mb-1">✓ ID Verified</p>
            <p className="text-xs">This sitter has submitted and had their ID documents approved by our team.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // New/Unverified (completed onboarding but no ID submitted yet)
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline"
            className={`border-gray-300 text-gray-600 ${sizeClasses[size]} inline-flex items-center gap-1.5`}
          >
            <Shield className={iconSizes[size]} />
            {showLabel && 'New Sitter'}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="font-semibold mb-1">🆕 New Sitter</p>
          <p className="text-xs">This sitter has joined the platform but hasn't submitted ID verification yet. You can still book them!</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
