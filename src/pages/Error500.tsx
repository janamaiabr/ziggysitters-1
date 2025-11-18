import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Error500() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-destructive/10 rounded-full mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          
          <h1 className="text-4xl font-bold text-foreground mb-2">500</h1>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Server Error</h2>
          
          <p className="text-muted-foreground mb-6">
            Oops! Something went wrong on our end. Our team has been notified and we're working to fix it.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
            <Button
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            If the problem persists, please contact us at{' '}
            <a href="mailto:support@ziggysitters.com" className="text-primary hover:underline">
              support@ziggysitters.com
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
