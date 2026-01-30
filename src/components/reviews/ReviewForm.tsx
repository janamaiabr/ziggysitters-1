import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Sparkles, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ReviewFormProps {
  bookingId: string;
  reviewerId: string;
  revieweeId: string;
  revieweeName: string;
  isForSitter: boolean;
  onSubmit: () => void;
  onCancel?: () => void;
}

export default function ReviewForm({
  bookingId,
  reviewerId,
  revieweeId,
  revieweeName,
  isForSitter,
  onSubmit,
  onCancel
}: ReviewFormProps) {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: 'Rating required',
        description: 'Please select a star rating before submitting.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('reviews').insert({
        booking_id: bookingId,
        reviewer_id: reviewerId,
        reviewee_id: revieweeId,
        rating,
        comment: comment.trim() || null,
        is_for_sitter: isForSitter
      });

      if (error) throw error;

      // Update sitter's rating and total_reviews in profiles
      if (isForSitter) {
        // Get current stats
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('rating, total_reviews')
          .eq('id', revieweeId)
          .single();

        if (currentProfile) {
          const currentRating = currentProfile.rating || 0;
          const currentCount = currentProfile.total_reviews || 0;
          const newCount = currentCount + 1;
          const newRating = ((currentRating * currentCount) + rating) / newCount;

          await supabase
            .from('profiles')
            .update({
              rating: Math.round(newRating * 10) / 10,
              total_reviews: newCount
            })
            .eq('id', revieweeId);
        }
      }

      toast({
        title: '🎉 Thank you for your review!',
        description: `Your feedback helps ${revieweeName} and other pet owners.`
      });

      onSubmit();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit review',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Heart className="h-5 w-5 text-primary" />
          How was your experience with {revieweeName}?
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Your review helps other pet parents find great sitters and helps us maintain quality.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Star Rating */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Rating</label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-1 transition-transform hover:scale-110 focus:outline-none"
              >
                <Star
                  className={`h-8 w-8 transition-colors ${
                    star <= (hoveredRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground/30'
                  }`}
                />
              </button>
            ))}
            {(hoveredRating || rating) > 0 && (
              <span className="ml-2 text-sm font-medium text-muted-foreground">
                {ratingLabels[hoveredRating || rating]}
              </span>
            )}
          </div>
        </div>

        {/* Comment */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Share your experience <span className="text-muted-foreground">(optional)</span>
          </label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={`What did you love about ${revieweeName}? How did they care for your pet?`}
            rows={4}
            className="resize-none"
          />
        </div>

        {/* First Review Encouragement */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
          <Sparkles className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>You could be the first to review!</strong> Your feedback helps build trust in our community 
            and means the world to {revieweeName}.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
            className="flex-1"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
          {onCancel && (
            <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Maybe Later
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
