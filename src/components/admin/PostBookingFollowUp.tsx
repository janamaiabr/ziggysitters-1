import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Clock, CheckCircle2, SkipForward, Star } from 'lucide-react';

// --- Pure logic (also exported for tests) ---
export type FollowUpStatus = 'pending' | 'sent' | 'skipped';

export function getFollowUpStatus(
  booking: { end_date: string; follow_up_sent: boolean; follow_up_sent_at: string | null },
  now: Date = new Date()
): FollowUpStatus {
  if (booking.follow_up_sent) return 'sent';
  const endDate = new Date(booking.end_date);
  const hoursSinceEnd = (now.getTime() - endDate.getTime()) / (1000 * 60 * 60);
  if (hoursSinceEnd > 48) return 'skipped';
  return 'pending';
}

export function isReadyForFollowUp(
  booking: { end_date: string; follow_up_sent: boolean },
  now: Date = new Date()
): boolean {
  if (booking.follow_up_sent) return false;
  const endDate = new Date(booking.end_date);
  const hoursSinceEnd = (now.getTime() - endDate.getTime()) / (1000 * 60 * 60);
  return hoursSinceEnd >= 24 && hoursSinceEnd <= 48;
}

export function getBookingsEndedInLast48h<T extends { end_date: string }>(
  bookings: T[],
  now: Date = new Date()
): T[] {
  const cutoff = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  return bookings.filter(b => {
    const end = new Date(b.end_date);
    return end >= cutoff && end <= now;
  });
}

// --- Types ---
export interface BookingForFollowUp {
  id: string;
  end_date: string;
  follow_up_sent: boolean;
  follow_up_sent_at: string | null;
  follow_up_response: string | null;
  client_name?: string;
  sitter_name?: string;
  pet_name?: string;
}

// --- Sub-components ---
function StatusBadge({ status }: { status: FollowUpStatus }) {
  if (status === 'sent') {
    return (
      <Badge className="bg-green-100 text-green-700 border-green-200 gap-1">
        <CheckCircle2 className="h-3 w-3" /> Sent
      </Badge>
    );
  }
  if (status === 'pending') {
    return (
      <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 gap-1">
        <Clock className="h-3 w-3" /> Pending
      </Badge>
    );
  }
  return (
    <Badge className="bg-gray-100 text-gray-600 border-gray-200 gap-1">
      <SkipForward className="h-3 w-3" /> Skipped
    </Badge>
  );
}

function FollowUpMessageTemplate({ sitterName, petName }: { sitterName: string; petName: string }) {
  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-sm">
      <p className="font-medium text-purple-800 mb-2">📧 Email Template Preview</p>
      <div className="text-purple-700 space-y-2">
        <p><strong>Subject:</strong> How was your stay with ZiggySitters?</p>
        <p><strong>Body:</strong></p>
        <p className="italic bg-white rounded p-3 border border-purple-100">
          Hi there! 👋<br /><br />
          We hope {petName || 'your pet'} had a wonderful time with {sitterName || 'your sitter'}!<br /><br />
          How was {sitterName || 'the sitter'} with {petName || 'your pet'}? We'd love to hear your feedback.
          Your review helps other pet owners find great sitters like {sitterName || 'yours'}!<br /><br />
          ⭐ Leave a quick rating: [Rate Now]<br /><br />
          Thanks for choosing ZiggySitters! 🐾
        </p>
      </div>
    </div>
  );
}

// --- Main Component ---
interface PostBookingFollowUpProps {
  bookings?: BookingForFollowUp[];
  onSendFollowUp?: (bookingId: string) => Promise<void>;
  onSkipFollowUp?: (bookingId: string) => Promise<void>;
  isLoading?: boolean;
}

export function PostBookingFollowUp({
  bookings = [],
  onSendFollowUp,
  onSkipFollowUp,
  isLoading = false,
}: PostBookingFollowUpProps) {
  const { toast } = useToast();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const now = new Date();
  const recentBookings = getBookingsEndedInLast48h(bookings, now);

  const handleSend = async (bookingId: string) => {
    if (!onSendFollowUp) return;
    setLoadingId(bookingId);
    try {
      await onSendFollowUp(bookingId);
      toast({ title: 'Follow-up sent!', description: 'The client will receive a feedback request.' });
    } catch {
      toast({ title: 'Failed to send', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setLoadingId(null);
    }
  };

  const handleSkip = async (bookingId: string) => {
    if (!onSkipFollowUp) return;
    setLoadingId(bookingId);
    try {
      await onSkipFollowUp(bookingId);
      toast({ title: 'Skipped', description: 'This follow-up has been marked as skipped.' });
    } catch {
      toast({ title: 'Error', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setLoadingId(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-purple-600" />
            Post-Booking Follow-Ups
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-gray-400">
            Loading bookings...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-purple-600" />
          Post-Booking Follow-Ups
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Bookings that ended in the last 48 hours. Follow-ups are sent automatically 24h after booking ends.
        </p>
      </CardHeader>
      <CardContent>
        {recentBookings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>No bookings ended in the last 48 hours.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentBookings.map(booking => {
              const status = getFollowUpStatus(booking, now);
              const ready = isReadyForFollowUp(booking, now);
              const isExpanded = expandedId === booking.id;
              const isThisLoading = loadingId === booking.id;

              return (
                <div
                  key={booking.id}
                  className="border rounded-lg overflow-hidden"
                >
                  {/* Row */}
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">
                          {booking.sitter_name || 'Unknown Sitter'}
                        </span>
                        <span className="text-gray-400 text-sm">→</span>
                        <span className="text-sm text-gray-600">
                          {booking.pet_name || 'Pet'}
                        </span>
                        {booking.client_name && (
                          <span className="text-xs text-gray-400">
                            (owner: {booking.client_name})
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Ended: {new Date(booking.end_date).toLocaleDateString('en-AU', {
                          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <StatusBadge status={status} />
                      {ready && status === 'pending' && (
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                          Ready to send
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Expanded panel */}
                  {isExpanded && (
                    <div className="border-t p-4 bg-gray-50 space-y-4">
                      <FollowUpMessageTemplate
                        sitterName={booking.sitter_name || 'your sitter'}
                        petName={booking.pet_name || 'your pet'}
                      />

                      {booking.follow_up_response && (
                        <div className="space-y-1">
                          <Label className="text-sm font-medium text-green-700">
                            <Star className="h-3 w-3 inline mr-1" />
                            Client Response
                          </Label>
                          <div className="bg-green-50 border border-green-200 rounded p-3 text-sm text-green-800">
                            {booking.follow_up_response}
                          </div>
                        </div>
                      )}

                      {status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSend(booking.id)}
                            disabled={isThisLoading || !onSendFollowUp}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            {isThisLoading ? 'Sending...' : 'Send Follow-Up Now'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSkip(booking.id)}
                            disabled={isThisLoading || !onSkipFollowUp}
                          >
                            Skip
                          </Button>
                        </div>
                      )}

                      {status === 'sent' && booking.follow_up_sent_at && (
                        <p className="text-xs text-green-600">
                          ✓ Sent on {new Date(booking.follow_up_sent_at).toLocaleDateString('en-AU', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PostBookingFollowUp;
