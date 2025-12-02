import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/contexts/ProfileContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Calendar, MapPin, Phone, Mail, Edit3, Save, X, Camera, DollarSign, Users, Briefcase, Shield, CameraIcon, Upload, Plus, FileText, CheckCircle, AlertCircle, Settings, UserX } from 'lucide-react';
import { format } from 'date-fns';
import AvailabilityCalendar from '@/components/calendar/AvailabilityCalendar';
import PetsManagement from '@/components/PetsManagement';
import SitterDailyReports from '@/components/SitterDailyReports';
import ClientDailyReports from '@/components/ClientDailyReports';
import { SitterStatusBadge } from '@/components/onboarding/SitterStatusBadge';
import SitterPayouts from '@/components/SitterPayouts';
import StripeLiveModeWarning from '@/components/sitter/StripeLiveModeWarning';

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading, refetch } = useProfile();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [recentBookings, setRecentBookings] = useState([]);
  const [sitterServices, setSitterServices] = useState([]);
  const [userPets, setUserPets] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [portfolioPhotos, setPortfolioPhotos] = useState([]);
  const [editingService, setEditingService] = useState<string | null>(null);
  const [serviceEditData, setServiceEditData] = useState<any>({});
  const [stripeStatus, setStripeStatus] = useState<{
    connected: boolean;
    enabled: boolean;
    onboarding_completed: boolean;
    payout_ready?: boolean;
    requirements_due?: string[];
  } | null>(null);
  const [checkingStripe, setCheckingStripe] = useState(false);
  const [connectingStripe, setConnectingStripe] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [submittingCancel, setSubmittingCancel] = useState(false);

  // Handle URL tab parameter on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, []);

  useEffect(() => {
    if (profile) {
      fetchBookings();
      if (profile.role === 'pet_sitter') {
        fetchSitterServices();
        fetchPortfolioPhotos();
        checkStripeStatus();
        
        // Handle Stripe Connect return URLs
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('stripe_success') === 'true') {
          setActiveTab('payments');
          toast({
            title: "Stripe Setup Complete!",
            description: "Your bank account connection has been saved. Verifying status...",
          });
          // Refresh status and profile data, then check if onboarding can be completed
          setTimeout(async () => {
            await checkStripeStatus();
            await refetch();
            
            // If all requirements met, mark onboarding as complete
            const hasBasicInfo = profile.first_name && profile.last_name && profile.phone && profile.address && profile.suburb;
            const hasDocuments = profile.id_document_url && profile.blue_card_document_url;
            
            // Check if sitter has services configured
            const { data: services } = await supabase
              .from('sitter_services')
              .select('id')
              .eq('sitter_id', profile.id)
              .limit(1);
            
            const hasServices = services && services.length > 0;
            
            if (hasBasicInfo && hasDocuments && hasServices && !profile.onboarding_completed) {
              console.log('All requirements met after Stripe - completing onboarding');
              const { error } = await supabase
                .from('profiles')
                .update({ onboarding_completed: true })
                .eq('user_id', user?.id);
                
              if (!error) {
                await refetch();
                toast({
                  title: "Onboarding Complete!",
                  description: "Your sitter profile is now active.",
                });
              }
            }
          }, 3000);
          // Clean up URL
          window.history.replaceState({}, '', '/profile?tab=payments');
        } else if (urlParams.get('stripe_refresh') === 'true') {
          setActiveTab('payments');
          toast({
            title: "Setup Incomplete",
            description: "Please complete your Stripe setup to receive payments.",
            variant: "destructive",
          });
          window.history.replaceState({}, '', '/profile?tab=payments');
        }
      }
      if (profile.role === 'pet_owner') {
        fetchUserPets();
      }
      setEditData({
        first_name: profile.first_name,
        last_name: profile.last_name,
        bio: profile.bio || '',
        phone: profile.phone || '',
        suburb: profile.suburb || '',
        city: profile.city || '',
        address: profile.address || '',
        email: profile.email || ''
      });
    }
  }, [profile]);

  // Check Stripe status when payments tab is opened
  useEffect(() => {
    if (activeTab === 'payments' && profile?.role === 'pet_sitter') {
      checkStripeStatus();
    }
  }, [activeTab, profile?.role]);

  const fetchBookings = async () => {
    if (!profile) return;
    
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id, 
          service_type, 
          start_date, 
          end_date, 
          total_amount, 
          status,
          pet_ids,
          booking_reference,
          owner_id,
          sitter_id,
          owner:profiles!owner_id(id, first_name, last_name, email),
          sitter:profiles!sitter_id(id, first_name, last_name, email)
        `)
        .or(`owner_id.eq.${profile.id},sitter_id.eq.${profile.id}`)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!error && data) {
        setRecentBookings(data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchSitterServices = async () => {
    if (!profile) return;
    
    try {
      const { data, error } = await supabase
        .from('sitter_services')
        .select('*')
        .eq('sitter_id', profile.id);

      if (!error && data) {
        setSitterServices(data);
      }
    } catch (error) {
      console.error('Error fetching sitter services:', error);
    }
  };

  const fetchUserPets = async () => {
    if (!profile) return;
    
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('owner_id', profile.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setUserPets(data);
      }
    } catch (error) {
      console.error('Error fetching pets:', error);
    }
  };

  const fetchPortfolioPhotos = async () => {
    if (!profile) return;
    
    try {
      const { data, error } = await supabase.storage
        .from('profile-photos')
        .list(`${profile.user_id}/portfolio`, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (!error && data) {
        const photos = await Promise.all(
          data.map(async (file) => {
            const { data: { publicUrl } } = supabase.storage
              .from('profile-photos')
              .getPublicUrl(`${profile.user_id}/portfolio/${file.name}`);
            return publicUrl;
          })
        );
        setPortfolioPhotos(photos);
      }
    } catch (error) {
      console.error('Error fetching portfolio photos:', error);
    }
  };

  const uploadVerificationDocument = async (file: File, type: 'id' | 'blue_card') => {
    if (!user || !profile) return;

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: `File size must be under 5MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`,
        variant: "destructive",
      });
      return;
    }

    // Validate file format
    const allowedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf'];
    
    if (!allowedFormats.includes(file.type) && !allowedExtensions.includes(fileExt || '')) {
      toast({
        title: "Invalid file format",
        description: "Please upload a PDF, JPG, JPEG, or PNG file.",
        variant: "destructive",
      });
      return;
    }

    try {
      const fileName = `${user.id}-${type}.${fileExt}`;
      const filePath = fileName;

      // Delete old file if it exists
      const oldUrl = type === 'id' ? profile.id_document_url : profile.blue_card_document_url;
      if (oldUrl) {
        const oldFileName = oldUrl.split('/').pop();
        if (oldFileName) {
          await supabase.storage
            .from('verification-docs')
            .remove([oldFileName]);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from('verification-docs')
        .upload(filePath, file, {
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('verification-docs')
        .getPublicUrl(filePath);

      // Update profile with document URL
      const updateField = type === 'id' ? 'id_document_url' : 'blue_card_document_url';
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          [updateField]: publicUrl,
          verification_documents_uploaded_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Send admin notification about document upload
      try {
        const documentType = type === 'id' ? 'id_verification' : 'vet_check';
        await supabase.functions.invoke('send-sitter-document-notification', {
          body: {
            sitter_id: profile.id,
            document_type: documentType,
            sitter_name: `${profile.first_name} ${profile.last_name}`,
            sitter_email: profile.email
          }
        });
      } catch (emailError) {
        console.error('Error sending document notification:', emailError);
        // Don't block upload if notification fails
      }

      toast({
        title: "Document uploaded successfully",
        description: `${type === 'id' ? 'ID' : 'Police Vet'} document uploaded for verification.`,
      });

      // Refresh profile data
      window.location.reload();
    } catch (error: any) {
      console.error('Error uploading document:', error);
      
      let errorMessage = "Failed to upload document. Please try again.";
      
      if (error.message?.includes('duplicate')) {
        errorMessage = "A document with this name already exists. Please try again.";
      } else if (error.message?.includes('size')) {
        errorMessage = "File size exceeds the allowed limit.";
      } else if (error.message?.includes('storage')) {
        errorMessage = "Storage error. Please check your connection and try again.";
      }
      
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Phone validation function for New Zealand numbers
  const validateNZPhone = (phone: string): boolean => {
    // Remove spaces, hyphens, and parentheses
    const cleaned = phone.replace(/[\s\-()]/g, '');
    
    // NZ mobile: 02x xxx xxxx or +6421/22/27/28/29 followed by 6-8 digits
    const nzMobileRegex = /^(?:\+?64|0)2[1-9]\d{6,8}$/;
    
    // NZ landline: 0x xxx xxxx (3-9 area codes)
    const nzLandlineRegex = /^(?:\+?64|0)[3-9]\d{7,9}$/;
    
    return nzMobileRegex.test(cleaned) || nzLandlineRegex.test(cleaned);
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    // Validate mandatory fields
    const requiredFields = {
      first_name: 'First Name',
      last_name: 'Last Name',
      email: 'Email',
      phone: 'Phone Number',
      address: 'Address'
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!editData[field] || !editData[field].trim()) {
        toast({
          title: "Missing required field",
          description: `${label} is required and cannot be empty.`,
          variant: "destructive",
        });
        return;
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editData.email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    // Validate phone number for sitters
    if (profile.role === 'pet_sitter' && editData.phone && !validateNZPhone(editData.phone)) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid New Zealand phone number (e.g., 021 123 4567 or +64 21 123 4567).",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(editData)
        .eq('user_id', user?.id)
        .select()
        .maybeSingle();

      if (!error && data) {
        setIsEditing(false);
        toast({
          title: "Profile updated",
          description: "Your profile has been successfully updated.",
        });
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditService = (service: any) => {
    setEditingService(service.id || service.key);
    setServiceEditData({
      daily_rate: service.daily_rate || null,
      overnight_rate: service.overnight_rate || null,
      description: service.description || '',
      max_pets: service.max_pets || 1,
      is_offered: service.is_offered !== false,
      service_type: service.service_type || service.key
    });
  };

  const handleSaveService = async () => {
    if (!editingService || !profile) {
      console.error('Missing requirements:', { editingService, profile });
      return;
    }

    // Validate that at least one rate is provided and greater than 0
    const { daily_rate, overnight_rate } = serviceEditData;
    if ((!daily_rate || daily_rate <= 0) && (!overnight_rate || overnight_rate <= 0)) {
      toast({
        title: "Invalid rate",
        description: "Please enter a valid rate (greater than $0) for at least one pricing option.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('=== SAVE SERVICE DEBUG ===');
      console.log('editingService:', editingService);
      console.log('serviceEditData:', serviceEditData);
      console.log('profile.id:', profile.id);
      console.log('sitterServices:', sitterServices);
      
      // Check if this is a new service (using key) or existing (using id)
      const existingService = sitterServices.find(s => s.id === editingService);
      console.log('existingService found:', existingService);
      
      if (existingService) {
        // Update existing service
        console.log('=== UPDATING EXISTING SERVICE ===');
        console.log('Updating service ID:', existingService.id);
        
        const updatePayload = {
          daily_rate: serviceEditData.daily_rate || null,
          overnight_rate: serviceEditData.overnight_rate || null,
          description: serviceEditData.description || '',
          max_pets: serviceEditData.max_pets || 1,
          is_offered: serviceEditData.is_offered !== false
        };
        console.log('Update payload:', updatePayload);
        
        const { data, error } = await supabase
          .from('sitter_services')
          .update(updatePayload)
          .eq('id', existingService.id)
          .select();

        console.log('Update response:', { data, error });

        if (error) {
          console.error('❌ Update error:', error);
          toast({
            title: "Error updating service",
            description: error.message || "Failed to update service. Please try again.",
            variant: "destructive",
          });
          return;
        }

        if (!data || data.length === 0) {
          console.error('❌ Update returned no data - RLS might be blocking');
          toast({
            title: "Permission error",
            description: "Unable to update service. Please check your permissions.",
            variant: "destructive",
          });
          return;
        }

        console.log('✅ Update successful:', data);
        setSitterServices(prev => 
          prev.map(service => 
            service.id === existingService.id 
              ? { ...service, ...updatePayload }
              : service
          )
        );
        setEditingService(null);
        setServiceEditData({});
        toast({
          title: "Service updated",
          description: "Your service has been successfully updated.",
        });
      } else {
        // Insert new service
        console.log('=== INSERTING NEW SERVICE ===');
        console.log('Service type:', serviceEditData.service_type);
        
        const insertPayload = {
          sitter_id: profile.id,
          service_type: serviceEditData.service_type,
          daily_rate: serviceEditData.daily_rate || null,
          overnight_rate: serviceEditData.overnight_rate || null,
          description: serviceEditData.description || '',
          max_pets: serviceEditData.max_pets || 1,
          is_offered: serviceEditData.is_offered !== false
        };
        console.log('Insert payload:', insertPayload);
        
        const { data, error } = await supabase
          .from('sitter_services')
          .insert(insertPayload)
          .select();

        console.log('Insert response:', { data, error });

        if (error) {
          console.error('❌ Insert error:', error);
          toast({
            title: "Error adding service",
            description: error.message || "Failed to add service. Please try again.",
            variant: "destructive",
          });
          return;
        }

        if (!data || data.length === 0) {
          console.error('❌ Insert returned no data - RLS might be blocking');
          toast({
            title: "Permission error",
            description: "Unable to add service. Please check your permissions.",
            variant: "destructive",
          });
          return;
        }

        console.log('✅ Insert successful:', data);
        setEditingService(null);
        setServiceEditData({});
        // Refresh services list
        await fetchSitterServices();
        toast({
          title: "Service added",
          description: "Your new service has been added successfully.",
        });
      }
    } catch (error: any) {
      console.error('❌ Exception in save service:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to save service. Please try again.",
        variant: "destructive",
      });
    }
  };

  const allServiceTypes = [
    { 
      key: 'pet_sitting_owners_home', 
      label: 'Pet Sitting (Owner\'s Home)', 
      description: 'Stay at the pet owner\'s home to care for their pets in their familiar environment.',
      rateLabel: 'Per Day / Per Night',
      icon: '🏡'
    },
    { 
      key: 'pet_sitting_sitters_home', 
      label: 'Pet Sitting (Your Home)', 
      description: 'Pets stay at your home where you provide care, attention, and a safe environment.',
      rateLabel: 'Per Day / Per Night',
      icon: '🏘️'
    },
    { 
      key: 'drop_in_visits', 
      label: 'Drop-in Visits', 
      description: 'Short visits to check on pets, provide food, water, and quick playtime or bathroom breaks.',
      rateLabel: 'Per Visit',
      icon: '⏰'
    }
  ];

  const getRateLabel = (serviceType: string) => {
    const service = allServiceTypes.find(s => s.key === serviceType);
    return service?.rateLabel || 'Rate';
  };

  const getServiceInfo = (serviceType: string) => {
    return allServiceTypes.find(s => s.key === serviceType) || {
      key: serviceType,
      label: serviceType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: '',
      rateLabel: 'Rate',
      icon: '💼'
    };
  };

  // Merge all service types with configured services
  const allServicesDisplay = allServiceTypes.map(serviceType => {
    const configuredService = sitterServices.find(s => s.service_type === serviceType.key);
    return {
      ...serviceType,
      ...configuredService,
      isConfigured: !!configuredService,
      service_type: serviceType.key
    };
  });

  const getRateDisplay = (service: any) => {
    const rates = [];
    if (service.hourly_rate) {
      rates.push(`NZ$${Number(service.hourly_rate).toFixed(2)}/hour`);
    }
    if (service.daily_rate) {
      rates.push(`NZ$${Number(service.daily_rate).toFixed(2)}/day`);
    }
    if (service.overnight_rate) {
      rates.push(`NZ$${Number(service.overnight_rate).toFixed(2)}/night`);
    }
    return rates.join(' • ') || 'Rate not set - Click edit to add pricing!';
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${profile.user_id}/portfolio/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      toast({
        title: "Photo uploaded",
        description: "Your portfolio photo has been uploaded successfully.",
      });

      fetchPortfolioPhotos();
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    }
  };

  const checkStripeStatus = async () => {
    setCheckingStripe(true);
    try {
      const { data, error } = await supabase.functions.invoke('stripe-connect-account-status');
      if (!error && data) {
        setStripeStatus(data);
      }
    } catch (error) {
      console.error('Error checking Stripe status:', error);
    } finally {
      setCheckingStripe(false);
    }
  };

  const handleStripeConnect = async () => {
    setConnectingStripe(true);
    try {
      console.log('Initiating Stripe Connect onboarding...');
      const { data, error } = await supabase.functions.invoke('stripe-connect-onboarding');
      
      console.log('Stripe Connect response:', { data, error });
      
      if (error) {
        console.error('Stripe Connect error details:', error);
        throw error;
      }
      
      // Check if the response contains an error
      if (data?.error) {
        console.error('Stripe Connect returned error:', data.error);
        throw new Error(data.error);
      }
      
      if (data?.url) {
        console.log('Opening Stripe Connect URL:', data.url);
        window.open(data.url, '_blank');
        toast({
          title: "Redirecting to Stripe",
          description: "A new tab has opened. Please complete your setup there.",
        });
      } else {
        throw new Error('No URL returned from Stripe Connect');
      }
    } catch (error: any) {
      console.error('Error initiating Stripe Connect:', error);
      
      // Check if this is the platform profile setup error
      const errorMessage = error?.message || '';
      const isPlatformSetupError = errorMessage.includes('platform-profile') || 
                                    errorMessage.includes('managing losses for connected accounts');
      
      if (isPlatformSetupError) {
        toast({
          title: "Platform Setup In Progress",
          description: "We're still setting up the payment system. This should be ready soon! Please check back in a few hours or contact support if this persists.",
          duration: 8000,
        });
      } else {
        toast({
          title: "Connection failed",
          description: error?.message || error?.error || "Failed to connect to Stripe. Please try again or contact support.",
          variant: "destructive",
        });
      }
    } finally {
      setConnectingStripe(false);
    }
  };

  const handleAcceptBooking = async (bookingId: string) => {
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
          description: 'You must complete your Stripe Connect setup before accepting bookings. Complete setup in the Payments tab below.',
          variant: 'destructive',
          duration: 7000,
        });
        setActiveTab('payments');
        return;
      }
    }

    try {
      const { data: result, error } = await supabase.rpc('accept_booking', { 
        booking_id: bookingId 
      });

      if (error) throw error;
      
      const response = result as { success: boolean; error?: string; error_code?: string };
      
      if (!response.success) {
        if (response.error_code === 'STRIPE_NOT_CONNECTED' || response.error_code === 'STRIPE_NOT_ENABLED') {
          toast({
            title: 'Stripe Setup Required',
            description: response.error,
            variant: 'destructive',
            duration: 7000,
          });
          setActiveTab('payments');
          return;
        }
        throw new Error(response.error || 'Failed to accept booking');
      }

      // Send acceptance notification to owner
      const acceptedBooking = recentBookings.find(b => b.id === bookingId);
      if (acceptedBooking && acceptedBooking.owner) {
        await supabase.functions.invoke('send-booking-acceptance-email', {
          body: {
            owner_email: acceptedBooking.owner.email,
            owner_name: `${acceptedBooking.owner.first_name} ${acceptedBooking.owner.last_name}`,
            sitter_name: `${profile.first_name} ${profile.last_name}`,
            service_type: acceptedBooking.service_type,
            start_date: acceptedBooking.start_date,
            end_date: acceptedBooking.end_date,
            booking_reference: acceptedBooking.booking_reference,
            total_amount: acceptedBooking.total_amount
          }
        });
      }

      toast({
        title: "Booking Accepted",
        description: "The owner will be notified to complete payment.",
      });

      fetchBookings();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeclineBooking = async (booking: any) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', booking.id);

      if (error) throw error;

      // Send cancellation email
      const recipient = booking.owner;
      
      await supabase.functions.invoke('send-booking-cancellation', {
        body: {
          recipient_email: recipient.email,
          recipient_name: `${recipient.first_name} ${recipient.last_name}`,
          cancelled_by_name: `${profile.first_name} ${profile.last_name}`,
          cancelled_by_type: 'sitter',
          service_type: booking.service_type,
          start_date: booking.start_date,
          end_date: booking.end_date,
          booking_reference: booking.booking_reference,
          total_amount: booking.total_amount
        }
      });

      toast({
        title: "Booking Declined",
        description: "The booking has been cancelled.",
      });

      fetchBookings();
    } catch (error) {
      console.error('Error declining booking:', error);
      toast({
        title: "Error",
        description: "Failed to decline booking.",
        variant: "destructive",
      });
    }
  };

  const handleCancelAccount = async () => {
    if (!cancelReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for cancelling your account.",
        variant: "destructive",
      });
      return;
    }

    setSubmittingCancel(true);
    try {
      const { error } = await supabase.functions.invoke('request-account-cancellation', {
        body: {
          userId: user?.id,
          userEmail: profile?.email,
          userName: `${profile?.first_name} ${profile?.last_name}`,
          reason: cancelReason
        }
      });

      if (error) throw error;

      toast({
        title: "Cancellation Request Submitted",
        description: "Your account cancellation request has been submitted. Our team will contact you within 24-48 hours.",
      });

      setShowCancelDialog(false);
      setCancelReason('');
    } catch (error: any) {
      console.error('Error submitting cancellation request:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit cancellation request.",
        variant: "destructive",
      });
    } finally {
      setSubmittingCancel(false);
    }
  };

  const handleProfilePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar.${fileExt}`;
      const filePath = `${profile.user_id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user?.id);

      if (updateError) throw updateError;

      toast({
        title: "Profile photo updated",
        description: "Your profile photo has been updated successfully.",
      });

      window.location.reload();
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload profile photo. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Profile not found</h1>
          <p className="text-muted-foreground">Please complete your onboarding process.</p>
        </div>
      </div>
    );
  }

  const userProfile = {
    name: `${profile.first_name} ${profile.last_name}`,
    email: profile.email,
    phone: profile.phone || 'Not provided',
    bio: profile.bio || 'No bio provided yet.',
    location: `${profile.suburb || ''}, ${profile.city || 'Auckland'}`.replace(/^,\s*/, ''),
    avatar: profile.avatar_url,
    verified: profile.is_verified,
    rating: profile.rating || 0,
    bookings_completed: profile.total_reviews || 0,
    
    memberSince: format(new Date(profile.created_at), 'MMM yyyy'),
    completedBookings: recentBookings.length,
    hourlyRate: 0, // Removed hourly rates
    services: sitterServices.filter(s => s.is_offered).map(s => 
      s.service_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    )
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Stripe Live Mode Warning for Sitters */}
        <StripeLiveModeWarning />
        
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage 
                    src={userProfile.avatar} 
                    alt={userProfile.name} 
                    className="object-cover"
                  />
                  <AvatarFallback className="text-2xl">
                    {userProfile.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePhotoUpload}
                    className="hidden"
                    id="profile-photo-upload"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('profile-photo-upload')?.click()}
                    className="h-8 w-8 rounded-full p-0"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold">{userProfile.name}</h1>
                  {userProfile.verified && (
                    <Shield className="w-6 h-6 text-green-500" />
                  )}
                  {profile.role === 'pet_sitter' && (
                    <Badge 
                      variant={
                        profile.verification_status === 'verified' ? 'default' : 
                        profile.verification_status === 'rejected' ? 'destructive' : 
                        'secondary'
                      }
                      className="ml-2"
                    >
                      {profile.verification_status === 'verified' ? 'Verified Sitter' : 
                       profile.verification_status === 'rejected' ? 'Verification Rejected' : 
                       'Under Review'}
                    </Badge>
                  )}
                </div>
                
                {/* Verification Status Message for Sitters */}
                {profile.role === 'pet_sitter' && profile.verification_status !== 'verified' && (
                  <div className={`p-3 rounded-lg mb-3 ${
                    profile.verification_status === 'rejected' ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'
                  }`}>
                    <p className={`text-sm ${
                      profile.verification_status === 'rejected' ? 'text-red-700' : 'text-blue-700'
                    }`}>
                      {profile.verification_status === 'rejected' 
                        ? '⚠️ Your profile verification was not approved. Please update your profile and resubmit for review.'
                        : profile.verification_documents_uploaded_at
                        ? '⏳ Your profile is under review. You will receive an email notification once the review is complete.'
                        : '📋 Complete your profile verification by uploading required documents below.'
                      }
                    </p>
                  </div>
                )}
                
                <div className="flex items-center text-muted-foreground mb-3">
                  <MapPin className="w-4 h-4 mr-1" />
                  {userProfile.location}
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="text-muted-foreground">
                    {userProfile.completedBookings} bookings completed
                  </div>
                  <div className="text-muted-foreground">
                    Member since {userProfile.memberSince}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col space-y-2">
                {isEditing ? (
                  <div className="flex space-x-2">
                    <Button onClick={handleSaveProfile}>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full ${profile.role === 'pet_owner' ? 'grid-cols-5' : profile.is_verified ? 'grid-cols-7' : 'grid-cols-8'}`}>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {profile.role === 'pet_owner' && (
              <>
                <TabsTrigger value="pets">My Pets</TabsTrigger>
                <TabsTrigger value="client-reports">Daily Reports</TabsTrigger>
              </>
            )}
            {profile.role === 'pet_sitter' && (
              <>
                <TabsTrigger value="services">Services & Pricing</TabsTrigger>
                <TabsTrigger value="calendar">My Calendar</TabsTrigger>
                <TabsTrigger value="sitter-reports">Daily Reports</TabsTrigger>
              </>
            )}
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            {profile.role === 'pet_sitter' && (
              <>
                <TabsTrigger value="payments">Payments</TabsTrigger>
                {!profile.is_verified && (
                  <TabsTrigger value="verification">Verification</TabsTrigger>
                )}
              </>
            )}
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Sitter Status Badge - shows current onboarding/verification status */}
            {profile.role === 'pet_sitter' && !profile.is_verified && (
              <SitterStatusBadge 
                profile={profile} 
                stripeStatus={stripeStatus}
                onNavigate={setActiveTab}
              />
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* About */}
                <Card>
                  <CardHeader>
                    <CardTitle>About Me</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <Textarea
                        value={editData.bio}
                        onChange={(e) => setEditData({...editData, bio: e.target.value})}
                        placeholder="Tell potential clients about yourself..."
                        rows={4}
                      />
                    ) : (
                      <p className="text-muted-foreground">{userProfile.bio}</p>
                    )}
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditing && (
                      <div className="mb-4 p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          <span className="text-destructive">*</span> indicates required fields
                        </p>
                      </div>
                    )}
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>First Name <span className="text-destructive">*</span></Label>
                            <Input
                              value={editData.first_name}
                              onChange={(e) => setEditData({...editData, first_name: e.target.value})}
                              required
                              placeholder="Required"
                            />
                          </div>
                          <div>
                            <Label>Last Name <span className="text-destructive">*</span></Label>
                            <Input
                              value={editData.last_name}
                              onChange={(e) => setEditData({...editData, last_name: e.target.value})}
                              required
                              placeholder="Required"
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Email <span className="text-destructive">*</span></Label>
                          <Input
                            type="email"
                            value={editData.email}
                            onChange={(e) => setEditData({...editData, email: e.target.value})}
                            required
                            placeholder="Required"
                          />
                        </div>
                        <div>
                          <Label>Phone <span className="text-destructive">*</span></Label>
                          <Input
                            type="tel"
                            value={editData.phone}
                            onChange={(e) => setEditData({...editData, phone: e.target.value})}
                            required
                            placeholder="e.g., 021 123 4567 or +64 21 123 4567"
                            className={profile?.role === 'pet_sitter' && editData.phone && !validateNZPhone(editData.phone) ? 'border-destructive' : ''}
                          />
                          {profile?.role === 'pet_sitter' && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {editData.phone && !validateNZPhone(editData.phone) 
                                ? '⚠️ Please enter a valid NZ phone number' 
                                : 'Valid NZ mobile or landline number required'}
                            </p>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Suburb</Label>
                            <Input
                              value={editData.suburb}
                              onChange={(e) => setEditData({...editData, suburb: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label>City</Label>
                            <Input
                              value={editData.city}
                              onChange={(e) => setEditData({...editData, city: e.target.value})}
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Address <span className="text-destructive">*</span></Label>
                          <Input
                            value={editData.address}
                            onChange={(e) => setEditData({...editData, address: e.target.value})}
                            required
                            placeholder="Required"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                          <span>{userProfile.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                          <span>{userProfile.phone}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                          <span>{userProfile.location}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recentBookings.length > 0 ? (
                      <div className="space-y-3">
                        {recentBookings.map((booking: any) => (
                          <div key={booking.id} className="flex justify-between items-center p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{booking.service_type.replace(/_/g, ' ')}</p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(booking.start_date), 'MMM d')} - {format(new Date(booking.end_date), 'MMM d, yyyy')}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge variant={
                                booking.status === 'completed' ? 'default' :
                                booking.status === 'confirmed' ? 'secondary' :
                                'outline'
                              }>
                                {booking.status}
                              </Badge>
                              <p className="text-sm text-muted-foreground mt-1">${booking.total_amount}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No recent bookings</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Statistics */}
              <div className="space-y-6">
                {/* Stats Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="mr-2 h-5 w-5" />
                      Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {userProfile.bookings_completed > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rating:</span>
                        <span className="font-medium">{userProfile.rating}/5 ⭐</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* My Pets Tab - Only for pet owners */}
          {profile.role === 'pet_owner' && (
            <TabsContent value="pets" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>My Pets</CardTitle>
                    <PetsManagement 
                      profileId={profile.id}
                      userId={profile.user_id}
                      onPetAdded={fetchUserPets}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  {userPets.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">No pets added yet.</p>
                      <p className="text-sm text-muted-foreground">
                        Add your pets to make booking easier for sitters.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userPets.map((pet: any) => (
                        <Card key={pet.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-4">
                              {pet.photo_urls && pet.photo_urls[0] && (
                                <img
                                  src={pet.photo_urls[0]}
                                  alt={pet.name}
                                  className="w-16 h-16 rounded-lg object-cover"
                                />
                              )}
                              <div className="flex-1">
                                <h3 className="font-semibold">{pet.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {pet.species} • {pet.breed || 'Mixed'} • {pet.age} years
                                </p>
                                {pet.personality_traits && pet.personality_traits.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {pet.personality_traits.slice(0, 3).map((trait: string) => (
                                      <Badge key={trait} variant="outline" className="text-xs">
                                        {trait}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Services & Pricing Tab - Only for sitters */}
          {profile.role === 'pet_sitter' && (
            <TabsContent value="services" className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {allServicesDisplay.map((service: any) => (
                    <Card key={service.key}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <CardTitle className="flex items-center gap-2">
                              <span>{service.icon}</span>
                              {service.label}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">{service.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {service.isConfigured ? (
                              <>
                                <Badge variant={service.is_offered ? 'default' : 'secondary'}>
                                  {service.is_offered ? 'Active' : 'Inactive'}
                                </Badge>
                                {editingService === service.id ? (
                              <div className="flex gap-1">
                                <Button size="sm" onClick={handleSaveService}>
                                  <Save className="w-3 h-3" />
                                </Button>
                                  <Button size="sm" variant="outline" onClick={() => setEditingService(null)}>
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              ) : (
                                <Button size="sm" variant="outline" onClick={() => handleEditService(service)}>
                                  <Edit3 className="w-3 h-3" />
                                </Button>
                              )}
                            </>
                            ) : (
                              <Button size="sm" onClick={() => handleEditService(service)}>
                                <Plus className="w-3 h-3 mr-1" />
                                Add Service
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {editingService === service.id || editingService === service.key ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label>Daily Rate ($)</Label>
                                <Input
                                  type="number"
                                  min="0.01"
                                  step="0.01"
                                  value={serviceEditData.daily_rate || ''}
                                  onChange={(e) => setServiceEditData((prev: any) => ({
                                    ...prev,
                                    daily_rate: parseFloat(e.target.value) || null
                                  }))}
                                  placeholder="0.00"
                                />
                              </div>
                              <div>
                                <Label>Overnight Rate ($)</Label>
                                <Input
                                  type="number"
                                  min="0.01"
                                  step="0.01"
                                  value={serviceEditData.overnight_rate || ''}
                                  onChange={(e) => setServiceEditData((prev: any) => ({
                                    ...prev,
                                    overnight_rate: parseFloat(e.target.value) || null
                                  }))}
                                  placeholder="0.00"
                                />
                              </div>
                            </div>
                            <div>
                              <Label>Description</Label>
                              <Textarea
                                value={serviceEditData.description || ''}
                                onChange={(e) => setServiceEditData((prev: any) => ({
                                  ...prev,
                                  description: e.target.value
                                }))}
                                placeholder="Describe your service..."
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`offered-${service.id || service.key}`}
                                checked={serviceEditData.is_offered}
                                onCheckedChange={(checked) => setServiceEditData((prev: any) => ({
                                  ...prev,
                                  is_offered: checked
                                }))}
                              />
                              <Label htmlFor={`offered-${service.id || service.key}`}>Service offered</Label>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="text-2xl font-bold">
                              {(() => {
                                const rates = [];
                                if (service.daily_rate) rates.push(`$${service.daily_rate}/day`);
                                if (service.overnight_rate) rates.push(`$${service.overnight_rate}/night`);
                                if (rates.length > 0) {
                                  return <span className="text-primary">{rates.join(' • ')}</span>;
                                }
                                return (
                                  <span className="text-blue-500 animate-pulse">
                                    🎯 Rate not set - Click edit to add pricing!
                                  </span>
                                );
                              })()}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {getRateLabel(service.service_type)}
                            </p>
                            {service.description ? (
                              <p className="text-sm">{service.description}</p>
                            ) : (
                              <p className="text-sm text-muted-foreground italic">
                                💡 Add a description to make your service stand out!
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>🐾 Max pets: {service.max_pets || 1}</span>
                              <span>📅 {service.experience_years || 0} years experience</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          )}

          {/* Calendar Tab - Only for sitters */}
          {profile.role === 'pet_sitter' && (
            <TabsContent value="calendar" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>My Availability</CardTitle>
                </CardHeader>
                <CardContent>
                  <AvailabilityCalendar sitterId={profile.id} />
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {recentBookings.length > 0 ? (
                  <div className="space-y-4">
                    {recentBookings.map((booking: any) => {
                      const isSitter = booking.sitter_id === profile.id;
                      const isPending = booking.status === 'pending';
                      
                      return (
                        <div key={booking.id} className="p-4 border rounded-lg space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{booking.service_type.replace(/_/g, ' ')}</p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(booking.start_date), 'MMM d')} - {format(new Date(booking.end_date), 'MMM d, yyyy')}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Ref: {booking.booking_reference}
                              </p>
                            </div>
                           <div className="flex items-center gap-2">
                              <Badge variant={
                                booking.status === 'completed' ? 'default' :
                                booking.status === 'confirmed' ? 'secondary' :
                                booking.status === 'awaiting_payment' ? 'secondary' :
                                booking.status === 'cancelled' ? 'destructive' :
                                'outline'
                              }>
                                {booking.status}
                              </Badge>
                              <p className="text-sm text-muted-foreground">${booking.total_amount}</p>
                            </div>
                          </div>
                          
                          {/* Action buttons */}
                          <div className="flex gap-2 pt-2 border-t">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/booking/${booking.id}`)}
                              className="flex-1"
                            >
                              View Details
                            </Button>
                            {isSitter && isPending && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleAcceptBooking(booking.id)}
                                  className="flex-1"
                                >
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeclineBooking(booking)}
                                  className="flex-1"
                                >
                                  Decline
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No bookings yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Verification Tab - Only for unverified sitters */}
          {profile.role === 'pet_sitter' && !profile.is_verified && (
            <TabsContent value="verification" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Identity Verification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* ID Document Upload */}
                <div>
                  <h3 className="font-medium mb-2">Government Issued Photo ID</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload a clear photo of your driver's license, passport, or government ID card.
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    📄 Accepted formats: PDF, JPG, JPEG, PNG | 📦 Max size: 5MB
                  </p>
                  {profile.id_document_url ? (
                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium text-green-700">ID Document Uploaded</p>
                        <p className="text-sm text-green-600">
                          ID document uploaded - pending assessment
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadVerificationDocument(file, 'id');
                        }}
                        className="hidden"
                        id="id-upload"
                      />
                      <Button
                        variant="outline"
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          console.log('ID Upload button clicked');
                          const input = document.getElementById('id-upload') as HTMLInputElement;
                          console.log('Input element found:', !!input);
                          if (input) {
                            input.click();
                          } else {
                            console.error('ID upload input not found');
                          }
                        }}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Photo ID
                      </Button>
                    </div>
                  )}
                </div>

                {/* Police Vet Upload */}
                <div>
                  <h3 className="font-medium mb-2">NZ Police Vetting Service Check</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload your NZ Police Vetting Service check. <a href="https://www.police.govt.nz/advice-services/businesses-and-organisations/nz-police-vetting-service/forms-and-guides" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Get your police vet here</a>
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    📄 Accepted formats: PDF, JPG, JPEG, PNG | 📦 Max size: 5MB
                  </p>
                  {profile.blue_card_document_url ? (
                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium text-green-700">Police Vet Uploaded</p>
                        <p className="text-sm text-green-600">
                          Police Vet uploaded - pending assessment
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadVerificationDocument(file, 'blue_card');
                        }}
                        className="hidden"
                        id="blue-card-upload"
                      />
                      <Button
                        variant="outline"
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          console.log('Police Vet Upload button clicked');
                          const input = document.getElementById('blue-card-upload') as HTMLInputElement;
                          console.log('Input element found:', !!input);
                          if (input) {
                            input.click();
                          } else {
                            console.error('Blue card upload input not found');
                          }
                        }}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Police Vet
                      </Button>
                    </div>
                  )}
                </div>

                {/* Verification Status */}
                <div className="border-t pt-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                    <div>
                      <h4 className="font-medium text-yellow-700">Verification Pending</h4>
                      <p className="text-sm text-muted-foreground">
                        {profile.verification_documents_uploaded_at 
                          ? 'Your documents are under assessment'
                          : 'Upload your documents to start the verification process'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          )}

          {/* Payments Tab - Only for sitters */}
          {profile.role === 'pet_sitter' && (
            <TabsContent value="payments" className="space-y-6">
              {/* Stripe Connect Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Setup</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Connect Your Bank Account</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect your bank account to receive automatic payments after completing bookings. 
                    We use Stripe to ensure secure payments. A 10% listing fee is charged to pet owners.
                  </p>
                  
                  {checkingStripe ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                      <span className="text-sm text-muted-foreground">Checking connection status...</span>
                    </div>
                  ) : stripeStatus?.enabled ? (
                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div className="flex-1">
                        <p className="font-medium text-green-700">Bank Account Connected</p>
                        <p className="text-sm text-green-600">
                          You're all set to receive payments
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={checkStripeStatus}
                      >
                        Refresh Status
                      </Button>
                    </div>
                  ) : stripeStatus?.connected && !stripeStatus?.enabled ? (
                    stripeStatus.onboarding_completed ? (
                      // Documents submitted, waiting for Stripe review
                      <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-blue-500" />
                        <div className="flex-1">
                          <p className="font-medium text-blue-700">Documents Submitted - Under Review</p>
                          <p className="text-sm text-blue-600">
                            Stripe is reviewing your documents. This typically takes 1-2 business days. 
                            You cannot accept bookings until verification is complete.
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleStripeConnect}
                            disabled={connectingStripe}
                          >
                            {connectingStripe ? (
                              <>
                                <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                Opening...
                              </>
                            ) : (
                              'View Stripe Dashboard'
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={checkStripeStatus}
                            disabled={checkingStripe}
                          >
                            {checkingStripe ? (
                              <>
                                <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                Checking...
                              </>
                            ) : (
                              'Check Status'
                            )}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // Onboarding not completed - needs to submit documents
                      <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-yellow-500" />
                        <div className="flex-1">
                          <p className="font-medium text-yellow-700">Additional Verification Required</p>
                          <p className="text-sm text-yellow-600">
                            Stripe requires additional verification documents to enable payments. 
                            Click below to complete the verification process.
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleStripeConnect}
                            disabled={connectingStripe}
                          >
                            {connectingStripe ? (
                              <>
                                <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                Opening...
                              </>
                            ) : (
                              'Complete Verification'
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleStripeConnect}
                            disabled={connectingStripe}
                          >
                            {connectingStripe ? (
                              <>
                                <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                Connecting...
                              </>
                            ) : (
                              'Submit Documents'
                            )}
                          </Button>
                        </div>
                      </div>
                    )
                  ) : (
                    <div>
                      <Button
                        onClick={handleStripeConnect}
                        className="w-full md:w-auto"
                        disabled={connectingStripe}
                      >
                        {connectingStripe ? (
                          <>
                            <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Connecting to Stripe...
                          </>
                        ) : (
                          <>
                            <DollarSign className="w-4 h-4 mr-2" />
                            Connect Bank Account
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">
                        You must connect a bank account before you can accept bookings
                      </p>
                    </div>
                  )}
                </div>

                {/* Payment Fee Information */}
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Payment Structure</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Your earnings:</span>
                      <span className="font-medium text-foreground">100% of your set rate</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Listing fee (charged to pet owner):</span>
                      <span className="font-medium text-foreground">10% of service cost</span>
                    </div>
                    <p className="text-xs pt-2 border-t">
                      Example: For a $100 service, you receive $100 and pet owner pays $110 total ($100 service + $10 listing fee).
                    </p>
                  </div>
                </div>
              </CardContent>
              </Card>

              {/* Payouts Section */}
              <Card>
                <CardHeader>
                  <CardTitle>My Payouts</CardTitle>
                </CardHeader>
                <CardContent>
                  <SitterPayouts sitterId={profile.id} />
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Client Daily Reports Tab */}
          {profile.role === 'pet_owner' && (
            <TabsContent value="client-reports">
              <ClientDailyReports />
            </TabsContent>
          )}

          {/* Sitter Daily Reports Tab */}
          {profile.role === 'pet_sitter' && (
            <TabsContent value="sitter-reports">
              <SitterDailyReports />
            </TabsContent>
          )}

          {/* Account Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 h-5 w-5" />
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Account Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Account Information</h3>
                  <div className="grid gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Email:</span>
                      <span className="ml-2 font-medium">{profile.email}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Account Type:</span>
                      <span className="ml-2 font-medium capitalize">{profile.role.replace('_', ' ')}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Member Since:</span>
                      <span className="ml-2 font-medium">{format(new Date(profile.created_at), 'MMMM d, yyyy')}</span>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-destructive mb-4">Danger Zone</h3>
                  <Card className="border-destructive">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold mb-2">Cancel Account</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            Request to permanently delete your account and all associated data. 
                            This action cannot be undone. Our team will review your request and contact you within 24-48 hours.
                          </p>
                        </div>
                      </div>
                      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive">
                            <UserX className="w-4 h-4 mr-2" />
                            Request Account Cancellation
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Request Account Cancellation</AlertDialogTitle>
                            <AlertDialogDescription>
                              We're sorry to see you go. Please tell us why you're cancelling your account so we can improve our service.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="py-4">
                            <Label htmlFor="cancel-reason" className="mb-2 block">
                              Reason for cancellation <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                              id="cancel-reason"
                              placeholder="Please tell us why you're cancelling..."
                              value={cancelReason}
                              onChange={(e) => setCancelReason(e.target.value)}
                              rows={4}
                              className="resize-none"
                            />
                            <p className="text-xs text-muted-foreground mt-2">
                              A detailed explanation helps us understand and improve our platform.
                            </p>
                          </div>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setCancelReason('')}>
                              Keep My Account
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleCancelAccount}
                              disabled={submittingCancel || !cancelReason.trim()}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              {submittingCancel ? (
                                <>
                                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  Submitting...
                                </>
                              ) : (
                                'Submit Cancellation Request'
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}