import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Sparkles, Rocket, Heart, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

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

      // Fetch reviewer profiles
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
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state - engaging "new platform" messaging
  if (reviews.length === 0) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent pb-4">
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Reviews
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center py-8 space-y-6">
            {/* Hero illustration */}
            <div className="flex justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center animate-bounce">
                <Rocket className="h-6 w-6 text-white" />
              </div>
            </div>

            {/* Main message */}
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-foreground">
                Be a Trailblazer! 🐾
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {sitterName.split(' ')[0]} doesn't have any reviews yet, but every great sitter starts somewhere. 
                ZiggySitters is a new platform, and our sitters are excited to prove themselves!
              </p>
            </div>

            {/* Trust signals */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 max-w-lg mx-auto">
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/50">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-xs text-center font-medium">ID Verified</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/50">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-xs text-center font-medium">Daily Updates</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/50">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-xs text-center font-medium">Free Meet & Greet</span>
              </div>
            </div>

            {/* Encouraging CTA */}
            <div className="pt-4">
              <p className="text-sm text-muted-foreground italic">
                "Early adopters always get the best sitters. Give {sitterName.split(' ')[0]} a chance – 
                you might just find your pet's new best friend!"
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Reviews
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= Math.round(averageRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
            <span className="font-semibold">{averageRating.toFixed(1)}</span>
            <span className="text-muted-foreground text-sm">
              ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="space-y-3">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={review.reviewer.avatar_url || undefined} />
                <AvatarFallback>
                  {review.reviewer.first_name[0]}{review.reviewer.last_name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {review.reviewer.first_name} {review.reviewer.last_name[0]}.
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(review.created_at), 'MMM d, yyyy')}
                  </span>
                </div>
                <div className="flex mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= review.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            {review.comment && (
              <p className="text-muted-foreground text-sm pl-13">
                "{review.comment}"
              </p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
