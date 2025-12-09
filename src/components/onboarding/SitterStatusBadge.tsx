import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, AlertCircle, FileText, DollarSign, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface SitterStatusBadgeProps {
  profile: any;
  stripeStatus?: {
    connected: boolean;
    enabled: boolean;
    onboarding_completed: boolean;
    payout_ready?: boolean;
  };
  onNavigate?: (tab: string) => void;
}

export function SitterStatusBadge({ profile, stripeStatus, onNavigate }: SitterStatusBadgeProps) {
  const navigate = useNavigate();
  const getStatusInfo = () => {
    // Check if profile needs completion
    const hasBasicInfo = profile.first_name && profile.last_name && profile.phone && profile.address;
    const hasIdDocument = !!profile.id_document_url;
    const hasPoliceVet = !!profile.blue_card_document_url;
    // Accept if onboarding is completed, even if not fully enabled yet (Stripe verification pending)
    const hasStripeConnected = stripeStatus?.onboarding_completed || stripeStatus?.enabled;
    const isVerified = profile.is_verified || profile.verification_status === 'verified';

    // Priority order of statuses
    if (!hasBasicInfo) {
      return {
        status: 'Step 1: Complete Your Profile',
        description: 'Add your phone number and address to continue setup',
        icon: FileText,
        variant: 'destructive' as const,
        color: 'text-destructive',
        action: 'Go to Profile Settings'
      };
    }

    if (!hasIdDocument) {
      return {
        status: 'Step 2: Upload ID Document',
        description: 'Upload your ID (driver\'s license or passport) - this is required before your profile can be approved',
        icon: Shield,
        variant: 'destructive' as const,
        color: 'text-destructive',
        action: 'Upload Documents'
      };
    }

    if (!hasStripeConnected) {
      return {
        status: 'Step 3: Connect Bank Account',
        description: 'Connect via Stripe to receive payments - you don\'t need an NZBN, just your personal bank details',
        icon: DollarSign,
        variant: 'default' as const,
        color: 'text-yellow-600',
        action: 'Connect Bank Account'
      };
    }

    if (!isVerified && profile.verification_status === 'pending') {
      return {
        status: 'Almost There! Awaiting Approval',
        description: 'Your documents have been submitted and are being reviewed by our team. We\'ll notify you via email once approved (usually within 1-2 business days). You can still complete your Police Vet check to earn a Gold Badge.',
        icon: Clock,
        variant: 'secondary' as const,
        color: 'text-blue-600',
        action: hasPoliceVet ? null : 'Upload Police Vet (Optional)'
      };
    }

    if (profile.verification_status === 'rejected') {
      return {
        status: 'Verification Required',
        description: 'Your verification was not successful. Please re-upload documents or contact support',
        icon: AlertCircle,
        variant: 'destructive' as const,
        color: 'text-destructive',
        action: 'Re-upload Documents'
      };
    }

    if (isVerified) {
      return {
        status: 'Verified & Active',
        description: 'Your profile is active and visible to pet owners',
        icon: CheckCircle2,
        variant: 'default' as const,
        color: 'text-green-600',
        action: null
      };
    }

    return {
      status: 'Setup In Progress',
      description: 'Continue setting up your profile',
      icon: Clock,
      variant: 'secondary' as const,
      color: 'text-blue-600',
      action: 'Continue Setup'
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  const handleActionClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (statusInfo.action === 'Upload Documents' || statusInfo.action === 'Re-upload Documents') {
      if (onNavigate) {
        onNavigate('verification');
      } else {
        navigate('/profile?tab=verification');
      }
    } else if (statusInfo.action === 'Connect Bank Account') {
      if (onNavigate) {
        onNavigate('payments');
      } else {
        navigate('/profile?tab=payments');
      }
    } else if (statusInfo.action === 'Go to Profile Settings') {
      if (onNavigate) {
        onNavigate('overview');
      } else {
        navigate('/profile');
      }
    }
  };

  return (
    <Alert className={`
      ${statusInfo.variant === 'destructive' ? 'bg-destructive/10 border-destructive/50' : ''}
      ${statusInfo.variant === 'secondary' ? 'bg-blue-50 border-blue-200' : ''}
      ${statusInfo.variant === 'default' && statusInfo.color === 'text-green-600' ? 'bg-green-50 border-green-200' : ''}
      ${statusInfo.variant === 'default' && statusInfo.color === 'text-yellow-600' ? 'bg-yellow-50 border-yellow-200' : ''}
    `}>
      <div className="flex items-start gap-3">
        <StatusIcon className={`w-5 h-5 ${statusInfo.color} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`font-semibold ${statusInfo.color}`}>
              {statusInfo.status}
            </span>
          </div>
          <AlertDescription className="text-sm">
            {statusInfo.description}
          </AlertDescription>
          {statusInfo.action && (
            <Button 
              onClick={handleActionClick}
              className="mt-3"
              variant={statusInfo.variant === 'destructive' ? 'destructive' : 'default'}
              size="sm"
              type="button"
            >
              {statusInfo.action}
            </Button>
          )}
        </div>
      </div>
    </Alert>
  );
}
