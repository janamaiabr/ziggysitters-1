import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, AlertCircle, FileText, DollarSign, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

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
  const getStatusInfo = () => {
    // Check if profile needs completion
    const hasBasicInfo = profile.first_name && profile.last_name && profile.phone && profile.address;
    const hasDocuments = profile.id_document_url || profile.blue_card_document_url;
    // Accept if onboarding is completed, even if not fully enabled yet (Stripe verification pending)
    const hasStripeConnected = stripeStatus?.onboarding_completed || stripeStatus?.enabled;
    const isVerified = profile.is_verified || profile.verification_status === 'verified';

    // Priority order of statuses
    if (!hasBasicInfo) {
      return {
        status: 'Profile Incomplete',
        description: 'Complete your basic profile information to continue',
        icon: FileText,
        variant: 'destructive' as const,
        color: 'text-destructive',
        action: 'Go to Profile Settings'
      };
    }

    if (!hasDocuments) {
      return {
        status: 'Documents Required',
        description: 'Upload verification documents (ID and/or Police Vet) to proceed',
        icon: Shield,
        variant: 'destructive' as const,
        color: 'text-destructive',
        action: 'Upload Documents'
      };
    }

    if (!hasStripeConnected) {
      return {
        status: 'Payment Setup Needed',
        description: 'Connect your bank account to receive payments for bookings',
        icon: DollarSign,
        variant: 'default' as const,
        color: 'text-yellow-600',
        action: 'Connect Bank Account'
      };
    }

    if (!isVerified && profile.verification_status === 'pending') {
      return {
        status: 'Pending Admin Approval',
        description: 'Your profile and documents are being reviewed by our team (1-2 business days)',
        icon: Clock,
        variant: 'secondary' as const,
        color: 'text-blue-600',
        action: null
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

  const handleActionClick = () => {
    if (!onNavigate) return;
    
    if (statusInfo.action === 'Upload Documents' || statusInfo.action === 'Re-upload Documents') {
      // Navigate to verification tab
      onNavigate('verification');
    } else if (statusInfo.action === 'Connect Bank Account') {
      // Navigate to payments tab
      onNavigate('payments');
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
            >
              {statusInfo.action}
            </Button>
          )}
        </div>
      </div>
    </Alert>
  );
}
