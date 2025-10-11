import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import SEOHead from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <SEOHead
        title="Page Not Found - 404"
        description="The page you're looking for doesn't exist. Return to ZiggySitters homepage to find pet sitters in Auckland."
        canonical="/404"
      />
      
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Search className="w-8 h-8 text-primary" />
          </div>
          
          <h1 className="text-4xl font-bold text-foreground mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Page Not Found</h2>
          
          <p className="text-muted-foreground mb-6">
            We couldn't find the page you're looking for. It may have been moved or doesn't exist.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
            <Button
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Button>
          </div>

          <div className="mt-8 pt-6 border-t">
            <p className="text-sm text-muted-foreground mb-3">Popular pages:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant="link"
                size="sm"
                onClick={() => navigate('/find-sitters')}
              >
                Find Sitters
              </Button>
              <Button
                variant="link"
                size="sm"
                onClick={() => navigate('/become-sitter')}
              >
                Become a Sitter
              </Button>
              <Button
                variant="link"
                size="sm"
                onClick={() => navigate('/faq')}
              >
                FAQ
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
