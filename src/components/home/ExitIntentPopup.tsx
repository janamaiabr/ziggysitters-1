import { useState, useEffect } from 'react';
import { X, Gift, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function ExitIntentPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if popup was already shown in this session
    const alreadyShown = sessionStorage.getItem('exitPopupShown');
    if (alreadyShown) {
      setHasShown(true);
      return;
    }

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse leaves from top of viewport (likely closing tab/navigating away)
      if (e.clientY <= 0 && !hasShown) {
        setIsVisible(true);
        setHasShown(true);
        sessionStorage.setItem('exitPopupShown', 'true');
      }
    };

    // Add delay before enabling exit intent to avoid triggering too early
    const timeout = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 5000);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [hasShown]);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleCTA = () => {
    setIsVisible(false);
    navigate('/find-sitters');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
      />
      
      {/* Popup */}
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
        {/* Close button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-10"
        >
          <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
        
        {/* Header gradient */}
        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-6 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            Wait! Don't go yet 🐾
          </h3>
          <p className="text-white/90 text-sm">
            Your pet deserves the best care
          </p>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="text-center">
            <p className="text-lg text-foreground mb-2">
              Find your perfect pet sitter today!
            </p>
            <p className="text-muted-foreground text-sm">
              Verified sitters across NZ • Daily photo updates • 100% satisfaction guarantee
            </p>
          </div>
          
          {/* Benefits */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="text-green-500">✓</span> Verified & background-checked sitters
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="text-green-500">✓</span> Daily photo reports guaranteed
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="text-green-500">✓</span> Secure online payments
            </div>
          </div>
          
          {/* CTA */}
          <Button 
            onClick={handleCTA}
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 hover:from-purple-600 hover:via-indigo-600 hover:to-blue-600"
          >
            Find Sitters Now
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
          
          <button 
            onClick={handleClose}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            No thanks, I'll keep looking
          </button>
        </div>
      </div>
    </div>
  );
}
