import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Camera, 
  FileText, 
  DollarSign, 
  User, 
  CheckCircle, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProfileCompletionCardProps {
  profile: {
    bio?: string | null;
    avatar_url?: string | null;
    phone?: string | null;
    address?: string | null;
    suburb?: string | null;
    id_document_url?: string | null;
    blue_card_document_url?: string | null;
  };
  portfolioPhotosCount: number;
  servicesCount: number;
}

export default function ProfileCompletionCard({ 
  profile, 
  portfolioPhotosCount, 
  servicesCount 
}: ProfileCompletionCardProps) {
  const navigate = useNavigate();

  // Calculate completion items
  const completionItems = [
    {
      id: 'photo',
      label: 'Profile photo',
      completed: !!profile.avatar_url,
      icon: Camera,
      action: () => navigate('/profile?tab=overview'),
      tip: 'Profiles with photos get 3x more enquiries'
    },
    {
      id: 'bio',
      label: 'Bio (50+ chars)',
      completed: profile.bio && profile.bio.length >= 50,
      icon: User,
      action: () => navigate('/profile?tab=overview'),
      tip: 'Tell pet owners about yourself and your experience'
    },
    {
      id: 'services',
      label: 'Services & rates',
      completed: servicesCount > 0,
      icon: DollarSign,
      action: () => navigate('/profile?tab=services'),
      tip: 'Set your rates to appear in search results'
    },
    {
      id: 'portfolio',
      label: 'Portfolio photos (3+)',
      completed: portfolioPhotosCount >= 3,
      icon: Camera,
      action: () => navigate('/profile?tab=portfolio'),
      tip: 'Show pet owners examples of your care'
    },
    {
      id: 'id_doc',
      label: 'ID verification',
      completed: !!profile.id_document_url,
      icon: FileText,
      action: () => navigate('/profile?tab=verification'),
      tip: 'Get the verified badge to build trust'
    },
    {
      id: 'contact',
      label: 'Contact details',
      completed: !!profile.phone && !!profile.address,
      icon: User,
      action: () => navigate('/profile?tab=overview'),
      tip: 'Required to receive booking notifications'
    },
  ];

  const completedCount = completionItems.filter(item => item.completed).length;
  const totalCount = completionItems.length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  // Don't show if 100% complete
  if (percentage === 100) {
    return null;
  }

  // Find next incomplete item
  const nextIncomplete = completionItems.find(item => !item.completed);

  return (
    <Card className="border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          Complete Your Profile
          <span className="ml-auto text-sm font-normal text-muted-foreground">
            {completedCount}/{totalCount}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div className="space-y-2">
          <Progress value={percentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {percentage}% complete • Complete profiles get <strong>5x more bookings</strong>
          </p>
        </div>

        {/* Checklist */}
        <div className="grid grid-cols-2 gap-2">
          {completionItems.map((item) => (
            <button
              key={item.id}
              onClick={item.action}
              className={`flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors ${
                item.completed 
                  ? 'text-green-700 dark:text-green-400 bg-green-100/50 dark:bg-green-900/20' 
                  : 'text-amber-700 dark:text-amber-400 bg-amber-100/50 dark:bg-amber-900/20 hover:bg-amber-200/50 dark:hover:bg-amber-800/30'
              }`}
            >
              {item.completed ? (
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
              )}
              <span className={item.completed ? 'line-through opacity-70' : ''}>
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* Next action */}
        {nextIncomplete && (
          <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
              💡 Next step: {nextIncomplete.label}
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              {nextIncomplete.tip}
            </p>
            <Button 
              size="sm" 
              onClick={nextIncomplete.action}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white"
            >
              Complete Now
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
