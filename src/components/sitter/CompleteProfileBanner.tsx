import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, Camera, FileText, CreditCard, Briefcase, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface CompleteProfileBannerProps {
  profile: {
    id: string;
    avatar_url?: string;
    bio?: string;
    id_document_url?: string;
    stripe_account_id?: string;
    stripe_account_enabled?: boolean;
    onboarding_completed?: boolean;
  };
  onDismiss?: () => void;
}

interface Step {
  key: string;
  label: string;
  completed: boolean;
  icon: React.ReactNode;
  action: string;
}

export default function CompleteProfileBanner({ profile, onDismiss }: CompleteProfileBannerProps) {
  const navigate = useNavigate();
  const [hasServices, setHasServices] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    checkServices();
  }, [profile.id]);

  const checkServices = async () => {
    const { data } = await supabase
      .from('sitter_services')
      .select('id')
      .eq('sitter_id', profile.id)
      .eq('is_offered', true)
      .limit(1);
    
    setHasServices((data?.length || 0) > 0);
  };

  // Don't show if onboarding is complete or dismissed
  if (profile.onboarding_completed || dismissed) {
    return null;
  }

  const steps: Step[] = [
    {
      key: 'photo',
      label: 'Profile photo',
      completed: !!profile.avatar_url,
      icon: <Camera className="h-4 w-4" />,
      action: '/profile?tab=overview',
    },
    {
      key: 'services',
      label: 'Services & rates',
      completed: hasServices,
      icon: <Briefcase className="h-4 w-4" />,
      action: '/profile?tab=services',
    },
    {
      key: 'id',
      label: 'ID verification',
      completed: !!profile.id_document_url,
      icon: <FileText className="h-4 w-4" />,
      action: '/profile?tab=verification',
    },
    {
      key: 'stripe',
      label: 'Payment setup',
      completed: !!profile.stripe_account_enabled,
      icon: <CreditCard className="h-4 w-4" />,
      action: '/profile?tab=payments',
    },
  ];

  const completedSteps = steps.filter(s => s.completed).length;
  const progress = (completedSteps / steps.length) * 100;
  const nextStep = steps.find(s => !s.completed);

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div className="bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl p-4 md:p-6 shadow-lg relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1 hover:bg-white/20 rounded-full transition-colors"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="relative z-10">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-2 bg-white/20 rounded-lg">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">Complete your profile to start earning!</h3>
            <p className="text-white/80 text-sm mt-1">
              You're {completedSteps} of {steps.length} steps done. Pet owners are searching in your area!
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span>{completedSteps} of {steps.length} complete</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-white/20" />
        </div>

        {/* Steps */}
        <div className="flex flex-wrap gap-2 mb-4">
          {steps.map((step) => (
            <div
              key={step.key}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
                step.completed 
                  ? 'bg-green-500/30 text-green-100' 
                  : 'bg-white/10 text-white/70'
              }`}
            >
              {step.completed ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                step.icon
              )}
              <span>{step.label}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        {nextStep && (
          <Button
            onClick={() => navigate(nextStep.action)}
            className="w-full sm:w-auto bg-white text-purple-600 hover:bg-white/90 font-semibold"
          >
            Continue: {nextStep.label} →
          </Button>
        )}
      </div>
    </div>
  );
}
