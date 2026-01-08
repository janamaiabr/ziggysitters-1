import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/contexts/ProfileContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowLeft, Calendar, Clock, DollarSign, MapPin, 
  User, Mail, Phone, FileText, AlertCircle, CheckCircle,
  Home, PawPrint, Plus, Edit2, Trash2, Upload, X
} from 'lucide-react';
import { format, addDays, startOfDay } from 'date-fns';
import DailyReportForm from '@/components/daily-reports/DailyReportForm';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  size: string;
  gender?: string;
  weight?: number;
  photo_urls: string[];
  personality_traits: string[];
  medical_conditions: string[];
  feeding_instructions: string;
  exercise_needs: string;
  special_care_notes: string;
  is_neutered?: boolean;
  vaccination_status?: boolean;
}

interface Booking {
  id: string;
  booking_reference: string;
  service_type: string;
  start_date: string;
  end_date: string;
  start_time: string | null;
  end_time: string | null;
  total_amount: number;
  platform_fee: number;
  status: string;
  payment_status: string;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  special_instructions: string;
  requires_daily_reports: boolean;
  daily_reports_required: number;
  daily_reports_completed: number;
  created_at: string;
  owner: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
    suburb: string;
    city: string;
    avatar_url: string;
  };
  sitter: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    avatar_url: string;
  };
  pet_ids: string[];
}

const serviceLabels: Record<string, string> = {
  'pet_sitting_sitters_home': 'Pet Sitting (Sitter\'s Home)',
  'pet_sitting_owners_home': 'Pet Sitting (Owner\'s Home)', 
  'drop_in_visits': 'Drop-in Visits',
  'dog_walking': 'Dog Walking',
};

const statusColors: Record<string, string> = {
  'pending': 'bg-yellow-500',
  'awaiting_payment': 'bg-orange-500',
  'confirmed': 'bg-blue-500',
  'in_progress': 'bg-purple-500',
  'completed': 'bg-green-500',
  'cancelled': 'bg-red-500',
};

export default function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [selectedReportDate, setSelectedReportDate] = useState<Date | null>(null);
  const [dailyReports, setDailyReports] = useState<any[]>([]);
  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [editingPhotos, setEditingPhotos] = useState<string[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchBookingDetails();
    }
  }, [id]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch booking
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (bookingError) throw bookingError;
      
      if (!bookingData) {
        throw new Error('Booking not found');
      }

      // Fetch owner profile
      const { data: ownerData, error: ownerError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, phone, address, suburb, city, avatar_url')
        .eq('id', bookingData.owner_id)
        .maybeSingle();

      if (ownerError) throw ownerError;
      if (!ownerData) throw new Error('Owner profile not found');

      // Fetch sitter profile
      const { data: sitterData, error: sitterError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, phone, avatar_url')
        .eq('id', bookingData.sitter_id)
        .maybeSingle();

      if (sitterError) throw sitterError;
      if (!sitterData) throw new Error('Sitter profile not found');

      // Combine the data
      const fullBookingData = {
        ...bookingData,
        owner: ownerData,
        sitter: sitterData
      };
      
      setBooking(fullBookingData);

      // Fetch pets
      if (bookingData.pet_ids && bookingData.pet_ids.length > 0) {
        const { data: petsData, error: petsError } = await supabase
          .from('pets')
          .select('*')
          .in('id', bookingData.pet_ids);

        if (petsError) throw petsError;
        setPets(petsData || []);
      }

      // Fetch daily reports for this booking (only for sitters)
      if (profile?.id === sitterData.id && bookingData?.requires_daily_reports) {
        const { data: reportsData, error: reportsError } = await supabase
          .from('daily_reports')
          .select('*')
          .eq('booking_id', id)
          .order('report_date', { ascending: true });

        if (!reportsError && reportsData) {
          setDailyReports(reportsData);
        }
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
      console.error('Error details:', { 
        message: error instanceof Error ? error.message : 'Unknown error',
        bookingId: id,
        userId: user?.id,
        profileId: profile?.id
      });
      
      // Show more specific error message
      const errorMessage = error instanceof Error ? error.message : 'Failed to load booking details';
      
      toast({
        title: 'Error Loading Booking',
        description: errorMessage,
        variant: 'destructive',
        duration: 6000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptBooking = async () => {
    if (!booking) return;
    
    // Check Stripe setup before accepting
    if (profile?.role === 'pet_sitter') {
      const { data: sitterProfile } = await supabase
        .from('profiles')
        .select('stripe_account_id, stripe_account_enabled')
        .eq('id', profile.id)
        .single();

      if (!sitterProfile?.stripe_account_id || !sitterProfile?.stripe_account_enabled) {
        toast({
          title: 'Stripe Setup Required',
          description: 'You must complete your Stripe Connect setup before accepting bookings. Please go to Profile > Payments.',
          variant: 'destructive',
          duration: 7000,
        });
        navigate('/profile?tab=payments');
        return;
      }
    }
    
    setActionLoading(true);
    try {
      const { data: result, error: rpcError } = await supabase.rpc('accept_booking', {
        booking_id: booking.id
      });

      // Handle new JSON response format
      if (rpcError) throw rpcError;
      
      const response = result as { success: boolean; error?: string; error_code?: string };
      
      if (!response.success) {
        if (response.error_code === 'STRIPE_NOT_CONNECTED' || response.error_code === 'STRIPE_NOT_ENABLED') {
          toast({
            title: 'Stripe Setup Required',
            description: response.error,
            variant: 'destructive',
            duration: 7000,
          });
          navigate('/profile?tab=payments');
          return;
        }
        throw new Error(response.error || 'Failed to accept booking');
      }

      if (!booking.owner) {
        throw new Error('Owner information not available');
      }

      console.log('Sending booking acceptance email to:', booking.owner.email);
      
      const { data: emailData, error: emailError } = await supabase.functions.invoke('send-booking-acceptance-email', {
        body: {
          owner_email: booking.owner.email,
          owner_name: `${booking.owner.first_name} ${booking.owner.last_name}`,
          sitter_name: `${booking.sitter.first_name} ${booking.sitter.last_name}`,
          service_type: booking.service_type,
          start_date: booking.start_date,
          end_date: booking.end_date,
          booking_reference: booking.booking_reference,
          total_amount: booking.total_amount,
        },
      });

      if (emailError) {
        console.error('Email sending error:', emailError);
        // Don't fail the whole operation if email fails
        toast({
          title: 'Booking Accepted',
          description: 'Booking accepted but email notification may not have been sent.',
          variant: 'default',
        });
      } else {
        console.log('Email sent successfully:', emailData);
        toast({
          title: 'Booking Accepted',
          description: 'The pet owner has been notified and will complete payment.',
        });
      }

      fetchBookingDetails();
    } catch (error: any) {
      console.error('Accept booking error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to accept booking',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePhoto = async (reportId: string, photoUrl: string) => {
    try {
      const report = dailyReports.find(r => r.id === reportId);
      if (!report) return;

      const updatedPhotos = report.photo_urls.filter((url: string) => url !== photoUrl);
      
      if (updatedPhotos.length === 0) {
        toast({
          title: "Cannot delete",
          description: "At least one photo is required in the report",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('daily_reports')
        .update({ photo_urls: updatedPhotos })
        .eq('id', reportId);

      if (error) throw error;

      // Delete from storage
      const filePath = photoUrl.split('/').slice(-2).join('/');
      await supabase.storage.from('pet-photos').remove([filePath]);

      await fetchBookingDetails();
      toast({
        title: "Photo deleted",
        description: "Photo has been removed from the report",
      });
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete photo",
        variant: "destructive",
      });
    }
  };

  const handlePhotoUpload = async (reportId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    try {
      const report = dailyReports.find(r => r.id === reportId);
      if (!report) return;

      const newPhotoUrls = [...report.photo_urls];

      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid file type",
            description: "Please upload only image files",
            variant: "destructive",
          });
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `daily-reports/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('pet-photos')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('pet-photos')
          .getPublicUrl(filePath);

        newPhotoUrls.push(publicUrl);
      }

      const { error } = await supabase
        .from('daily_reports')
        .update({ photo_urls: newPhotoUrls })
        .eq('id', reportId);

      if (error) throw error;

      await fetchBookingDetails();
      toast({
        title: "Photos uploaded",
        description: "New photos have been added to the report",
      });
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload photos",
        variant: "destructive",
      });
    }
  };

  const handleDeclineBooking = async () => {
    if (!booking) return;
    
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'declined' })
        .eq('id', booking.id);

      if (error) throw error;

      // Send decline notification to owner
      if (booking.owner) {
        await supabase.functions.invoke('send-booking-decline-notification', {
          body: {
            owner_email: booking.owner.email,
            owner_name: `${booking.owner.first_name} ${booking.owner.last_name}`,
            sitter_name: `${booking.sitter.first_name} ${booking.sitter.last_name}`,
            service_type: booking.service_type,
            start_date: booking.start_date,
            end_date: booking.end_date,
            booking_reference: booking.booking_reference,
            total_amount: booking.total_amount
          }
        });
      }

      // Send admin status update
      await supabase.functions.invoke('send-admin-status-update', {
        body: {
          booking_reference: booking.booking_reference,
          old_status: 'pending',
          new_status: 'declined',
          owner_name: booking.owner ? `${booking.owner.first_name} ${booking.owner.last_name}` : 'Unknown',
          owner_email: booking.owner?.email,
          sitter_name: `${booking.sitter.first_name} ${booking.sitter.last_name}`,
          sitter_email: booking.sitter.email,
          service_type: booking.service_type,
          start_date: booking.start_date,
          end_date: booking.end_date,
          total_amount: booking.total_amount,
          platform_fee: booking.platform_fee,
          additional_info: `Booking declined by sitter.`
        }
      }).catch(err => console.error('Admin notification failed:', err));

      toast({
        title: 'Booking Declined',
        description: 'The owner has been notified.',
      });

      fetchBookingDetails();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to decline booking',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleOwnerCancelBooking = async () => {
    if (!booking) return;
    
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', booking.id);

      if (error) throw error;

      // Send cancellation email to sitter
      if (booking.sitter) {
        await supabase.functions.invoke('send-booking-cancellation', {
          body: {
            recipient_email: booking.sitter.email,
            recipient_name: `${booking.sitter.first_name} ${booking.sitter.last_name}`,
            cancelled_by_name: `${booking.owner.first_name} ${booking.owner.last_name}`,
            cancelled_by_type: 'owner',
            service_type: booking.service_type,
            start_date: booking.start_date,
            end_date: booking.end_date,
            booking_reference: booking.booking_reference,
            total_amount: booking.total_amount,
            was_paid: false
          },
        });
      }

      toast({
        title: 'Booking Cancelled',
        description: 'The sitter has been notified.',
      });

      navigate('/profile?tab=bookings');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to cancel booking',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading booking details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Booking Not Found</h3>
            <p className="text-muted-foreground mb-4">The requested booking could not be found.</p>
            <Button onClick={() => navigate('/profile?tab=bookings')}>
              Back to Bookings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isSitter = profile?.id === booking.sitter?.id;
  const isOwner = profile?.id === booking.owner?.id;
  const canAccept = isSitter && booking.status === 'pending';
  const needsPayment = isOwner && booking.status === 'awaiting_payment';

  // Determine display status based on payment state
  const getStatusDisplay = () => {
    if (booking.status === 'awaiting_payment') {
      // If there's a Stripe session/intent ID, payment is being processed
      if (booking.stripe_checkout_session_id || booking.stripe_payment_intent_id) {
        return { label: 'PAYMENT PROCESSING', color: statusColors.awaiting_payment };
      }
      // Otherwise, still waiting for payment to be initiated
      return { label: 'AWAITING PAYMENT', color: statusColors.awaiting_payment };
    }
    return { 
      label: booking.status.replace('_', ' ').toUpperCase(), 
      color: statusColors[booking.status] 
    };
  };

  const statusDisplay = getStatusDisplay();

  const handleProceedToPayment = async () => {
    if (!booking) return;
    
    setActionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment-after-acceptance', {
        body: { bookingId: booking.id }
      });

      // Handle edge function errors
      if (error) {
        console.error('Payment function error:', error);
        
        // Try to parse the error as JSON (our 400 errors return JSON)
        let errorData = null;
        try {
          // The error might be a FunctionsHttpError with a context property
          if (error.context && typeof error.context === 'object') {
            errorData = error.context;
          }
          // Or it might have the error data directly
          else if (typeof error === 'object' && error.error) {
            errorData = error;
          }
        } catch (e) {
          console.error('Failed to parse error:', e);
        }
        
        // Check if it's a Stripe setup issue
        if (errorData?.error_code === 'SITTER_STRIPE_NOT_ENABLED' || 
            errorData?.error?.includes('hasn\'t completed') ||
            errorData?.error?.includes('payment setup')) {
          toast({
            title: 'Sitter Payment Setup Incomplete',
            description: errorData.error,
            variant: 'destructive',
            duration: 12000,
          });
          return;
        }
        
        // Use the parsed error message if available
        throw new Error(errorData?.error || error.message || 'Payment failed');
      }

      // Check for errors in the response
      if (data?.error) {
        console.error('Payment error from response:', data);
        
        // Check if it's a Stripe setup issue
        if (data.error.includes('hasn\'t completed payment setup') || 
            data.error.includes('Stripe')) {
          toast({
            title: 'Sitter Payment Setup Incomplete',
            description: data.error,
            variant: 'destructive',
            duration: 10000,
          });
          return;
        }
        
        throw new Error(data.error);
      }

      if (data?.url) {
        window.open(data.url, '_blank');
        toast({
          title: 'Redirecting to Payment',
          description: 'Please complete your payment in the new window.',
        });
      } else {
        throw new Error('No payment URL received from server');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment Error',
        description: error.message || 'Failed to initiate payment. Please contact support if this persists.',
        variant: 'destructive',
        duration: 7000,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleManualVerifyPayment = async () => {
    if (!booking) return;
    
    setActionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manual-verify-payment', {
        body: { booking_id: booking.id }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: 'Payment Verified',
          description: 'Your payment has been verified and the booking is now confirmed.',
        });
        fetchBookingDetails();
      } else {
        toast({
          title: 'Payment Not Found',
          description: data?.message || 'No successful payment found for this booking.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Verification Error',
        description: error.message || 'Failed to verify payment',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6 gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Bookings
      </Button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Booking Details
          </h1>
          <Badge className={`${statusDisplay.color} text-lg px-4 py-2`}>
            {statusDisplay.label}
          </Badge>
        </div>
        <p className="text-lg text-muted-foreground">Reference: {booking.booking_reference}</p>
      </div>

      {/* Sitter Accepted - Payment Required Banner (for owners) */}
      {needsPayment && (
        <Card className="mb-8 border-2 border-green-500 bg-green-50">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-green-900 mb-2">
                  🎉 Great News! Your Sitter Has Accepted
                </h3>
                <p className="text-green-800 mb-4">
                  <span className="font-semibold">
                    {booking.sitter?.first_name} {booking.sitter?.last_name}
                  </span> has accepted your booking request. 
                  Please complete your payment to confirm the booking.
                </p>
                <div className="flex gap-3">
                  <Button 
                    size="lg"
                    onClick={handleProceedToPayment}
                    disabled={actionLoading}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {actionLoading ? 'Processing...' : 'Proceed to Payment'}
                  </Button>
                  <Button 
                    size="lg"
                    variant="outline"
                    onClick={handleManualVerifyPayment}
                    disabled={actionLoading}
                    className="border-green-600 text-green-700 hover:bg-green-50"
                  >
                    Already Paid? Verify Payment
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Waiting for Owner Payment Banner (for sitters) */}
      {isSitter && booking.status === 'awaiting_payment' && (
        <Card className="mb-8 border-2 border-blue-500 bg-blue-50 dark:bg-blue-950">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-2">
                  Awaiting Pet Owner Payment
                </h3>
                <p className="text-blue-800 dark:text-blue-200">
                  You've accepted this booking. The pet owner (<span className="font-semibold">
                    {booking.owner?.first_name} {booking.owner?.last_name}
                  </span>) has been notified and needs to complete payment to confirm the booking. You'll be notified once payment is received.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Service Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Service Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Service Type</p>
                <p className="font-semibold">{serviceLabels[booking.service_type]}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Start Date</p>
                  <p className="font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(booking.start_date), 'PPP')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">End Date</p>
                  <p className="font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(booking.end_date), 'PPP')}
                  </p>
                </div>
              </div>

              {booking.start_time && booking.end_time && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Start Time</p>
                    <p className="font-semibold flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {booking.start_time}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">End Time</p>
                    <p className="font-semibold flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {booking.end_time}
                    </p>
                  </div>
                </div>
              )}

              <Separator />

              {booking.owner && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Service Address</p>
                  <p className="font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {booking.owner.address}, {booking.owner.suburb}, {booking.owner.city}
                  </p>
                </div>
              )}

              {booking.special_instructions && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Special Instructions</p>
                    <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                      <p className="whitespace-pre-wrap">{booking.special_instructions}</p>
                    </ScrollArea>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Pet Information - Enhanced */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <PawPrint className="h-6 w-6" />
                Pet Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {pets.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <PawPrint className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">No Pet Information Available</h3>
                  <p className="text-muted-foreground">
                    No pets were selected for this booking.
                  </p>
                </div>
              ) : (
                <>
                {pets.map((pet, index) => (
                  <div key={pet.id} className={`p-6 ${index !== pets.length - 1 ? 'border-b' : ''}`}>
                    {/* Pet Header with Photos */}
                    <div className="flex flex-col sm:flex-row gap-6 mb-6">
                      {pet.photo_urls && pet.photo_urls.length > 0 && (
                        <div className="flex gap-3 overflow-x-auto pb-2">
                          {pet.photo_urls.slice(0, 3).map((url, idx) => (
                            <img 
                              key={idx}
                              src={url} 
                              alt={`${pet.name} ${idx + 1}`}
                              className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl object-cover flex-shrink-0 border-2 border-primary/10 shadow-md"
                            />
                          ))}
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-4 text-primary">{pet.name}</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Species</p>
                            <p className="font-medium capitalize">{pet.species}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Breed</p>
                            <p className="font-medium">{pet.breed || 'Mixed'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Age</p>
                            <p className="font-medium">{pet.age} {pet.age === 1 ? 'year' : 'years'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Size</p>
                            <p className="font-medium capitalize">{pet.size}</p>
                          </div>
                          {pet.gender && (
                            <div>
                              <p className="text-sm text-muted-foreground">Gender</p>
                              <p className="font-medium capitalize">{pet.gender}</p>
                            </div>
                          )}
                          {pet.weight && (
                            <div>
                              <p className="text-sm text-muted-foreground">Weight</p>
                              <p className="font-medium">{pet.weight} kg</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Personality Traits */}
                    {pet.personality_traits && pet.personality_traits.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Personality Traits</h4>
                        <div className="flex flex-wrap gap-2">
                          {pet.personality_traits.map((trait) => (
                            <Badge key={trait} variant="secondary" className="text-sm px-3 py-1">
                              {trait}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Medical Conditions */}
                    {pet.medical_conditions && pet.medical_conditions.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Medical Conditions</h4>
                        <div className="flex flex-wrap gap-2">
                          {pet.medical_conditions.map((condition) => (
                            <Badge key={condition} variant="outline" className="text-sm px-3 py-1 border-orange-500 text-orange-700">
                              {condition}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Care Instructions */}
                    <div className="grid sm:grid-cols-2 gap-4 mt-6">
                      {pet.feeding_instructions && (
                        <div className="bg-muted/30 p-4 rounded-lg">
                          <h4 className="font-semibold mb-2 text-sm">Feeding Instructions</h4>
                          <p className="text-sm">{pet.feeding_instructions}</p>
                        </div>
                      )}
                      {pet.exercise_needs && (
                        <div className="bg-muted/30 p-4 rounded-lg">
                          <h4 className="font-semibold mb-2 text-sm">Exercise Needs</h4>
                          <p className="text-sm">{pet.exercise_needs}</p>
                        </div>
                      )}
                    </div>

                    {/* Special Care Notes */}
                    {pet.special_care_notes && (
                      <div className="mt-4 bg-primary/5 p-4 rounded-lg border border-primary/20">
                        <h4 className="font-semibold mb-2 text-sm">Special Care Notes</h4>
                        <p className="text-sm">{pet.special_care_notes}</p>
                      </div>
                    )}

                    {/* Health Information */}
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${pet.is_neutered ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className="text-sm">{pet.is_neutered ? 'Spayed/Neutered' : 'Not Neutered'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${pet.vaccination_status ? 'bg-green-500' : 'bg-orange-500'}`} />
                        <span className="text-sm">{pet.vaccination_status ? 'Vaccinations Up-to-Date' : 'Vaccinations Needed'}</span>
                      </div>
                    </div>
                  </div>
                ))}
                </>
              )}
            </CardContent>
          </Card>

          {/* Daily Reports */}
          {booking.requires_daily_reports && isSitter && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Daily Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Reports Completed</p>
                    <p className="text-2xl font-bold">
                      {booking.daily_reports_completed} / {booking.daily_reports_required}
                    </p>
                  </div>
                  {booking.daily_reports_completed === booking.daily_reports_required ? (
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  ) : (
                    <AlertCircle className="h-8 w-8 text-orange-500" />
                  )}
                </div>

                {/* TEST MODE: Allow creating reports for any date */}
                {/* TODO: WHEN GOING LIVE - Restrict to only allow creating ONE report per day for TODAY'S date only */}
                {(booking.status === 'confirmed' || booking.status === 'in_progress') && !showReportForm && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Create a report for any booking day (TEST MODE)
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: booking.daily_reports_required }).map((_, index) => {
                        const reportDate = addDays(startOfDay(new Date(booking.start_date)), index);
                        return (
                          <Button
                            key={index}
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedReportDate(reportDate);
                              setShowReportForm(true);
                            }}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Day {index + 1} ({format(reportDate, 'MMM d')})
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Report Form */}
                {showReportForm && selectedReportDate && (
                  <div className="border-t pt-4">
                    <div className="mb-4">
                      <h4 className="font-semibold">
                        Report for {format(selectedReportDate, 'MMMM d, yyyy')}
                      </h4>
                    </div>
                    <DailyReportForm
                      bookingId={booking.id}
                      sitterId={booking.sitter.id}
                      reportDate={format(selectedReportDate, 'yyyy-MM-dd')}
                      onSubmit={() => {
                        setShowReportForm(false);
                        setSelectedReportDate(null);
                        // Refresh booking data
                        fetchBookingDetails();
                        toast({
                          title: "Report Submitted",
                          description: "Daily report has been created successfully.",
                        });
                      }}
                      onCancel={() => {
                        setShowReportForm(false);
                        setSelectedReportDate(null);
                      }}
                    />
                  </div>
                )}

                {/* Submitted Reports */}
                {dailyReports.length > 0 && (
                  <div className="border-t pt-4 space-y-3">
                    <h4 className="font-semibold">Submitted Reports</h4>
                    {dailyReports.map((report) => (
                      <div key={report.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">
                            {format(new Date(report.report_date), 'MMMM d, yyyy')}
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-muted-foreground">
                              Submitted {format(new Date(report.submitted_at), 'MMM d, h:mm a')}
                            </p>
                            {editingReportId === report.id ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingReportId(null)}
                              >
                                <X className="h-4 w-4" />
                                Done
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingReportId(report.id)}
                              >
                                <Edit2 className="h-4 w-4" />
                                Edit Photos
                              </Button>
                            )}
                          </div>
                        </div>
                        {report.mood && (
                          <p className="text-sm"><span className="font-medium">Mood:</span> {report.mood}</p>
                        )}
                        {report.food_consumption && (
                          <p className="text-sm"><span className="font-medium">Food:</span> {report.food_consumption}</p>
                        )}
                        {report.exercise_duration && (
                          <p className="text-sm"><span className="font-medium">Exercise:</span> {report.exercise_duration} minutes</p>
                        )}
                        <p className="text-sm"><span className="font-medium">Notes:</span> {report.general_notes}</p>
                        
                        {/* Photos with edit capability */}
                        {report.photo_urls && report.photo_urls.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">Photos</p>
                              {editingReportId === report.id && (
                                <div>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => handlePhotoUpload(report.id, e)}
                                    className="hidden"
                                    id={`photo-upload-${report.id}`}
                                  />
                                  <label htmlFor={`photo-upload-${report.id}`}>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      asChild
                                    >
                                      <span className="cursor-pointer">
                                        <Upload className="h-4 w-4 mr-1" />
                                        Add Photos
                                      </span>
                                    </Button>
                                  </label>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              {report.photo_urls.map((url: string, idx: number) => (
                                <div key={idx} className="relative group">
                                  <img 
                                    src={url} 
                                    alt={`Report photo ${idx + 1}`}
                                    className="h-20 w-20 object-cover rounded"
                                  />
                                  {editingReportId === report.id && (
                                    <button
                                      onClick={() => handleDeletePhoto(report.id, url)}
                                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Owner/Sitter Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {isSitter ? 'Pet Owner' : 'Pet Sitter'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(isSitter && booking.owner) || (isOwner && booking.sitter) ? (
                <>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={isSitter ? booking.owner?.avatar_url : booking.sitter?.avatar_url} />
                      <AvatarFallback>
                        {isSitter && booking.owner
                          ? `${booking.owner.first_name[0]}${booking.owner.last_name[0]}`
                          : booking.sitter ? `${booking.sitter.first_name[0]}${booking.sitter.last_name[0]}` : 'NA'
                        }
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">
                        {isSitter && booking.owner
                          ? `${booking.owner.first_name} ${booking.owner.last_name}`
                          : booking.sitter ? `${booking.sitter.first_name} ${booking.sitter.last_name}` : 'N/A'
                        }
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{isSitter ? booking.owner?.email : booking.sitter?.email}</span>
                    </div>
                    {(isSitter ? booking.owner?.phone : booking.sitter?.phone) && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{isSitter ? booking.owner?.phone : booking.sitter?.phone}</span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Contact information not available</p>
              )}
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service Total</span>
                <span className="font-semibold">${booking.total_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform Fee</span>
                <span className="font-semibold">${booking.platform_fee.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg">
                <span className="font-semibold">Total Amount</span>
                <span className="font-bold">${booking.total_amount.toFixed(2)}</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Status</p>
                <Badge variant={booking.payment_status === 'paid' ? 'default' : 'secondary'}>
                  {booking.payment_status.toUpperCase()}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {canAccept && (
            <Card>
              <CardContent className="pt-6 space-y-3">
                <Button 
                  className="w-full" 
                  onClick={handleAcceptBooking}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Processing...' : 'Accept Booking'}
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={handleDeclineBooking}
                  disabled={actionLoading}
                >
                  Decline Booking
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Owner Cancel Button for Pending/Awaiting Payment bookings */}
          {isOwner && (booking.status === 'pending' || booking.status === 'awaiting_payment') && (
            <Card>
              <CardContent className="pt-6 space-y-3">
                <p className="text-sm text-muted-foreground text-center mb-2">
                  {booking.status === 'pending' 
                    ? 'Waiting for sitter to respond' 
                    : 'Complete payment to confirm'}
                </p>
                <Button 
                  className="w-full" 
                  variant="destructive"
                  onClick={handleOwnerCancelBooking}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Cancelling...' : 'Cancel Booking'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
