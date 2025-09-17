import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar as CalendarIcon, Clock, MapPin, Star, MessageSquare, User, Phone, Mail } from 'lucide-react';
import { format } from 'date-fns';
import MessageDialog from '@/components/messaging/MessageDialog';

export default function Bookings() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [messageRecipient, setMessageRecipient] = useState(null);

  useEffect(() => {
    if (profile) {
      fetchBookings();
    }
  }, [profile]);

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
          start_time,
          end_time,
          total_amount, 
          status,
          payment_status,
          owner_notes,
          sitter_notes,
          special_instructions,
          created_at,
          owner_id,
          sitter_id,
          stripe_payment_intent_id,
          booking_reference,
          owner:profiles!owner_id(id, first_name, last_name, email, phone, address, suburb, city),
          sitter:profiles!sitter_id(id, first_name, last_name, email, phone, address, suburb, city, avatar_url)
        `)
        .or(`owner_id.eq.${profile.id},sitter_id.eq.${profile.id}`)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setBookings(data);
        
        // Check for refunded payments periodically
        checkRefundStatus();
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkRefundStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('check-refund-status');
      if (error) {
        console.error('Error checking refund status:', error);
      } else if (data?.updatedBookings > 0) {
        // Refresh bookings if any were updated
        fetchBookings();
      }
    } catch (error) {
      console.error('Error checking refund status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'pending': return 'secondary';
      case 'completed': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsDialog(true);
  };

  const handleMessage = (booking) => {
    // Determine who to message based on the current user's role in this booking
    const isOwner = booking.owner_id === profile.id;
    const recipientProfile = isOwner ? booking.sitter : booking.owner;
    
    setMessageRecipient({
      id: recipientProfile.id,
      name: `${recipientProfile.first_name} ${recipientProfile.last_name}`,
      avatar: recipientProfile.avatar_url
    });
    setShowMessageDialog(true);
  };

  const filteredBookings = bookings.filter(booking => {
    const now = new Date();
    const endDate = new Date(booking.end_date);
    
    switch (activeTab) {
      case 'upcoming':
        return ['pending', 'confirmed'].includes(booking.status) && endDate >= now;
      case 'past':
        return booking.status === 'completed' || endDate < now;
      case 'cancelled':
        return booking.status === 'cancelled';
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
          <p className="text-muted-foreground">Manage your pet care bookings</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'past', label: 'Past Bookings' },
            { id: 'cancelled', label: 'Cancelled' }
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Bookings List */}
        <div className="space-y-6">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center text-2xl">
                        {booking.service_type.includes('dog') ? '🐕' : booking.service_type.includes('cat') ? '🐱' : '🐾'}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold">
                            {booking.service_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </h3>
                          <Badge variant={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <CalendarIcon className="w-4 h-4 mr-2" />
                            {format(new Date(booking.start_date), 'MMM dd, yyyy')}
                          </div>
                          {booking.start_time && (
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-2" />
                              {booking.start_time}
                            </div>
                          )}
                          <div className="flex items-center">
                            <span className="mr-2">💰</span>
                            ${booking.total_amount}
                          </div>
                        </div>
                        
                        {(booking.owner_notes || booking.sitter_notes) && (
                          <div className="mt-3 p-3 bg-muted rounded-lg">
                            <p className="text-sm">
                              <strong>Notes:</strong> {booking.owner_notes || booking.sitter_notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2 lg:items-end">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleMessage(booking)}>
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Message
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(booking)}>
                          View Details
                        </Button>
                      </div>
                      
                      {/* Show sitter address if booking is confirmed and user is owner */}
                      {booking.status === 'confirmed' && booking.owner_id === profile.id && booking.sitter?.address && (
                        <div className="text-sm text-muted-foreground">
                          <MapPin className="w-3 h-3 inline mr-1" />
                          Sitter: {booking.sitter.address}, {booking.sitter.suburb}, {booking.sitter.city}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No bookings found</h3>
                <p className="text-muted-foreground mb-6">
                  {activeTab === 'upcoming' 
                    ? "You don't have any upcoming bookings."
                    : activeTab === 'past'
                    ? "You don't have any past bookings."
                    : "You don't have any cancelled bookings."
                  }
                </p>
                {activeTab === 'upcoming' && (
                  <Button onClick={() => window.location.href = '/find-sitters'}>
                    Find Sitters
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Booking Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Service Information</h4>
                  <p><strong>Service:</strong> {selectedBooking.service_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                  <p><strong>Reference:</strong> {selectedBooking.booking_reference}</p>
                  <p><strong>Date:</strong> {format(new Date(selectedBooking.start_date), 'MMM dd, yyyy')} - {format(new Date(selectedBooking.end_date), 'MMM dd, yyyy')}</p>
                  {selectedBooking.start_time && (
                    <p><strong>Time:</strong> {selectedBooking.start_time} - {selectedBooking.end_time}</p>
                  )}
                  <p><strong>Amount:</strong> ${selectedBooking.total_amount}</p>
                  <p><strong>Status:</strong> <Badge variant={getStatusColor(selectedBooking.status)}>{selectedBooking.status}</Badge></p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Contact Information</h4>
                  {selectedBooking.owner_id === profile.id ? (
                    // Show sitter info to owner
                    <div>
                      <p><strong>Sitter:</strong> {selectedBooking.sitter?.first_name} {selectedBooking.sitter?.last_name}</p>
                      {selectedBooking.status === 'confirmed' && (
                        <>
                          <p><strong>Email:</strong> {selectedBooking.sitter?.email}</p>
                          <p><strong>Phone:</strong> {selectedBooking.sitter?.phone}</p>
                          <p><strong>Address:</strong> {selectedBooking.sitter?.address}, {selectedBooking.sitter?.suburb}, {selectedBooking.sitter?.city}</p>
                        </>
                      )}
                    </div>
                  ) : (
                    // Show owner info to sitter
                    <div>
                      <p><strong>Owner:</strong> {selectedBooking.owner?.first_name} {selectedBooking.owner?.last_name}</p>
                      {selectedBooking.status === 'confirmed' && (
                        <>
                          <p><strong>Email:</strong> {selectedBooking.owner?.email}</p>
                          <p><strong>Phone:</strong> {selectedBooking.owner?.phone}</p>
                          <p><strong>Address:</strong> {selectedBooking.owner?.address}, {selectedBooking.owner?.suburb}, {selectedBooking.owner?.city}</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {selectedBooking.special_instructions && (
                <div>
                  <h4 className="font-medium mb-2">Special Instructions</h4>
                  <p className="text-muted-foreground bg-muted p-3 rounded">{selectedBooking.special_instructions}</p>
                </div>
              )}
              
              {(selectedBooking.owner_notes || selectedBooking.sitter_notes) && (
                <div>
                  <h4 className="font-medium mb-2">Notes</h4>
                  {selectedBooking.owner_notes && (
                    <p className="text-sm mb-2"><strong>Owner notes:</strong> {selectedBooking.owner_notes}</p>
                  )}
                  {selectedBooking.sitter_notes && (
                    <p className="text-sm"><strong>Sitter notes:</strong> {selectedBooking.sitter_notes}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Message Dialog */}
      {messageRecipient && (
        <MessageDialog
          isOpen={showMessageDialog}
          onClose={() => setShowMessageDialog(false)}
          recipientId={messageRecipient.id}
          recipientName={messageRecipient.name}
          recipientAvatar={messageRecipient.avatar}
        />
      )}
    </div>
  );
}