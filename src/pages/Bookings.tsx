import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CreditCard, Calendar as CalendarIcon, Clock, MapPin, Star, Check, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const mockBookings = [
  {
    id: 1,
    petName: 'Max',
    petType: 'Golden Retriever',
    service: 'Dog Walking',
    date: '2024-01-20',
    time: '10:00 AM',
    duration: '1 hour',
    status: 'confirmed',
    amount: 25,
    sitter: 'Sarah Johnson',
    sitterAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b9c5?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 2,
    petName: 'Luna',
    petType: 'Persian Cat',
    service: 'Pet Sitting',
    date: '2024-01-25',
    time: '9:00 AM',
    duration: '4 hours',
    status: 'pending',
    amount: 120,
    sitter: 'Mike Chen',
    sitterAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  }
];

export default function Bookings() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');

  const handlePayment = () => {
    // Payment processing logic would go here
    alert('Payment processed successfully!');
    setShowPaymentDialog(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
          <p className="text-muted-foreground">Manage your pet care bookings and payments</p>
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
          {mockBookings.map((booking) => (
            <Card key={booking.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center text-2xl">
                      {booking.petType.includes('Dog') ? '🐕' : '🐱'}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold">{booking.petName} - {booking.service}</h3>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          {booking.date}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          {booking.time} ({booking.duration})
                        </div>
                        <div className="flex items-center">
                          <CreditCard className="w-4 h-4 mr-2" />
                          ${booking.amount}
                        </div>
                      </div>
                      
                      <div className="flex items-center mt-3">
                        <img 
                          src={booking.sitterAvatar} 
                          alt={booking.sitter}
                          className="w-8 h-8 rounded-full mr-2"
                        />
                        <span className="text-sm font-medium">{booking.sitter}</span>
                        <div className="flex items-center ml-3">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                          <span className="text-sm">4.9</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 lg:items-end">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Message Sitter
                      </Button>
                      {booking.status === 'pending' && (
                        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                          <DialogTrigger asChild>
                            <Button size="sm" onClick={() => setSelectedBooking(booking)}>
                              Pay Now
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Complete Payment</DialogTitle>
                            </DialogHeader>
                            
                            <div className="space-y-6">
                              {/* Booking Summary */}
                              <div className="bg-accent/50 p-4 rounded-lg">
                                <h4 className="font-medium mb-2">Booking Summary</h4>
                                <div className="space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span>Service:</span>
                                    <span>{selectedBooking?.service}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Date:</span>
                                    <span>{selectedBooking?.date}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Duration:</span>
                                    <span>{selectedBooking?.duration}</span>
                                  </div>
                                  <div className="flex justify-between font-medium text-base pt-2 border-t">
                                    <span>Total:</span>
                                    <span>${selectedBooking?.amount}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Payment Method */}
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium">Payment Method</label>
                                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                    <SelectTrigger className="mt-1">
                                      <SelectValue placeholder="Select payment method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                                      <SelectItem value="paypal">PayPal</SelectItem>
                                      <SelectItem value="bank">Bank Transfer</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                {paymentMethod === 'card' && (
                                  <div className="space-y-4">
                                    <div>
                                      <label className="text-sm font-medium">Card Number</label>
                                      <Input 
                                        placeholder="1234 5678 9012 3456"
                                        value={cardNumber}
                                        onChange={(e) => setCardNumber(e.target.value)}
                                        className="mt-1"
                                      />
                                    </div>
                                    
                                    <div>
                                      <label className="text-sm font-medium">Cardholder Name</label>
                                      <Input 
                                        placeholder="John Doe"
                                        value={cardName}
                                        onChange={(e) => setCardName(e.target.value)}
                                        className="mt-1"
                                      />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-sm font-medium">Expiry Date</label>
                                        <Input 
                                          placeholder="MM/YY"
                                          value={expiryDate}
                                          onChange={(e) => setExpiryDate(e.target.value)}
                                          className="mt-1"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">CVV</label>
                                        <Input 
                                          placeholder="123"
                                          value={cvv}
                                          onChange={(e) => setCvv(e.target.value)}
                                          className="mt-1"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}

                                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                  <Shield className="w-4 h-4" />
                                  <span>Your payment is secured with 256-bit SSL encryption</span>
                                </div>

                                <Button 
                                  className="w-full" 
                                  onClick={handlePayment}
                                  disabled={!paymentMethod || (paymentMethod === 'card' && (!cardNumber || !cardName || !expiryDate || !cvv))}
                                >
                                  Pay ${selectedBooking?.amount}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                      {booking.status === 'confirmed' && (
                        <Button variant="outline" size="sm">
                          Modify
                        </Button>
                      )}
                    </div>
                    
                    {booking.status === 'confirmed' && (
                      <div className="flex items-center text-green-600 text-sm">
                        <Check className="w-4 h-4 mr-1" />
                        Payment confirmed
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {mockBookings.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No bookings yet</h3>
              <p className="text-muted-foreground mb-6">
                Start by finding the perfect pet sitter for your furry friend
              </p>
              <Button onClick={() => window.location.href = '/find-sitters'}>
                Find Sitters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Book New Service</h3>
              <p className="text-sm text-muted-foreground">Find and book a new pet sitter</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <Star className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Leave Review</h3>
              <p className="text-sm text-muted-foreground">Share your experience</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <CreditCard className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Payment History</h3>
              <p className="text-sm text-muted-foreground">View all transactions</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}