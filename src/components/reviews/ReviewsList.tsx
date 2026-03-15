import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

import iconStar from '@/assets/icons/icon-star.png';
import iconCheck from '@/assets/icons/icon-check.png';
import iconCamera from '@/assets/icons/icon-camera.png';
import iconHeart from '@/assets/icons/icon-heart.png';
import iconShield from '@/assets/icons/icon-shield.png';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
}

interface ReviewsListProps {
  sitterId: string;
  sitterName: string;
}

export default function ReviewsList({ sitterId, sitterName }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [sitterId]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          reviewer_id
        `)
        .eq('reviewee_id', sitterId)
        .eq('is_for_sitter', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const reviewerIds = [...new Set(data.map(r => r.reviewer_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, avatar_url')
          .in('id', reviewerIds);

        const reviewsWithProfiles = data.map(review => ({
          ...review,
          reviewer: profiles?.find(p => p.id === review.reviewer_id) || {
            first_name: 'Pet',
            last_name: 'Owner',
            avatar_url: null
          }
        }));

        setReviews(reviewsWithProfiles);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  if (loading) {
    return (
      <Card className="border border-border overflow-hidden">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const firstName = sitterName.split(' ')[0];

  // Empty state — on-brand, no emoji, no Lucide
  if (reviews.length === 0) {
    return (
      <Card className="border border-border overflow-hidden">
        <CardHeader className="bg-muted/50 border-b border-border">
          <CardTitle className="flex items-center gap-2 font-display text-foreground">
            <img src={iconStar} alt="" className="w-6 h-6" />
            Reviews
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-6 space-y-4">
            <p className="text-foreground font-display text-lg font-semibold">
              No reviews yet
            </p>
            <p className="text-muted-foreground font-body text-sm max-w-md mx-auto">
              {firstName} is ready and excited to care for your pet. Book a free meet & greet to see if it's the right fit — no commitment required.
            </p>

            {/* Trust signals — on-brand */}
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-xs font-medium text-foreground font-body">
                <img src={iconShield} alt="" className="w-4 h-4" /> ID Verified
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-xs font-medium text-foreground font-body">
                <img src={iconCamera} alt="" className="w-4 h-4" /> Daily Updates
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-xs font-medium text-foreground font-body">
                <img src={iconHeart} alt="" className="w-4 h-4" /> Free Meet & Greet
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border overflow-hidden">
      <CardHeader className="bg-muted/50 border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 font-display text-foreground">
            <img src={iconStar} alt="" className="w-6 h-6" />
            Reviews
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <img
                  key={star}
                  src={iconStar}
                  alt=""
                  className={`h-4 w-4 ${star > Math.round(averageRating) ? 'opacity-20' : ''}`}
                />
              ))}
            </div>
            <span className="font-semibold font-body text-foreground">{averageRating.toFixed(1)}</span>
            <span className="text-muted-foreground text-sm font-body">
              ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="space-y-3">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={review.reviewer.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-body text-sm">
                  {review.reviewer.first_name[0]}{review.reviewer.last_name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium font-body text-foreground">
                    {review.reviewer.first_name} {review.reviewer.last_name[0]}.
                  </span>
                  <span className="text-sm text-muted-foreground font-body">
                    {format(new Date(review.created_at), 'MMM d, yyyy')}
                  </span>
                </div>
                <div className="flex mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <img
                      key={star}
                      src={iconStar}
                      alt=""
                      className={`h-3.5 w-3.5 ${star > review.rating ? 'opacity-20' : ''}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            {review.comment && (
              <p className="text-muted-foreground text-sm pl-13 font-body">
                "{review.comment}"
              </p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
