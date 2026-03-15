import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, Search, ArrowRight } from 'lucide-react';

export default function EmailThankYou() {
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'conversion', {
        event_category: 'email_capture',
        event_label: 'newsletter_signup'
      });
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-card rounded-3xl border border-border shadow-xl p-8 space-y-6">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">You're on the list</h1>
            <p className="text-muted-foreground">
              We'll send you personalized sitter recommendations and alerts when new sitters join your area.
            </p>
          </div>

          <div className="bg-muted/50 rounded-xl p-4 space-y-2 text-left">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-primary">•</span>
              <span>Personalized sitter matches</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-primary">•</span>
              <span>New sitter alerts for your area</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-primary">•</span>
              <span>Exclusive offers and tips</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button onClick={() => navigate('/find-sitters')} className="w-full">
              <Search className="mr-2 w-4 h-4" />
              Continue Searching
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>

            <Button variant="ghost" onClick={() => navigate('/')} className="w-full">
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
