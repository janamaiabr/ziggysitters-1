import { Star } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SitterVerificationBadgeProps {
  isVerified?: boolean;
  hasGoldenBadge?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

/**
 * Star-based trust system:
 * ⭐      = New Sitter (onboarded, no ID yet)
 * ⭐⭐    = ID Verified
 * ⭐⭐⭐  = Gold Star (police vet check approved)
 */
export default function SitterVerificationBadge({ 
  isVerified = false, 
  hasGoldenBadge = false,
  size = 'md',
  showLabel = true
}: SitterVerificationBadgeProps) {
  const starCount = hasGoldenBadge ? 3 : isVerified ? 2 : 1;
  
  const starSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4.5 w-4.5',
    lg: 'h-5.5 w-5.5'
  };

  const containerPadding = {
    sm: 'px-2 py-0.5',
    md: 'px-3 py-1',
    lg: 'px-4 py-1.5'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const labels: Record<number, string> = {
    1: 'New Sitter',
    2: 'Vetted',
    3: 'Gold Star'
  };

  const tooltips: Record<number, { title: string; description: string }> = {
    1: {
      title: '⭐ 1-Star Sitter',
      description: 'This sitter has completed onboarding. Upload ID to reach ⭐⭐!'
    },
    2: {
      title: '⭐⭐ 2-Star Sitter',
      description: 'ID verified by our team. Submit a police vet check to reach ⭐⭐⭐!'
    },
    3: {
      title: '⭐⭐⭐ 3-Star Sitter',
      description: 'Our highest trust level — ID verified AND police vet check approved.'
    }
  };

  const bgClasses: Record<number, string> = {
    1: 'bg-white/95 backdrop-blur-sm border-2 border-gray-300 text-gray-700 shadow-md',
    2: 'bg-blue-600 text-white border-0',
    3: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white border-0'
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={`inline-flex items-center gap-1 rounded-full ${containerPadding[size]} ${bgClasses[starCount]} cursor-help`}
          >
            <div className="flex items-center -space-x-0.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <Star
                  key={i}
                  className={`${starSizes[size]} ${
                    i < starCount
                      ? starCount === 3
                        ? 'fill-white text-white drop-shadow-sm'
                        : starCount === 2
                        ? 'fill-white text-white'
                        : 'fill-yellow-400 text-yellow-400'
                      : starCount === 1
                      ? 'text-gray-300'
                      : 'text-white/40'
                  }`}
                />
              ))}
            </div>
            {showLabel && (
              <span className={`${textSizes[size]} font-semibold ml-0.5`}>
                {labels[starCount]}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="font-semibold mb-1">{tooltips[starCount].title}</p>
          <p className="text-xs">{tooltips[starCount].description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
