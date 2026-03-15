import { useState, useEffect } from 'react';
import { X, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import iconHeart from '@/assets/icons/icon-heart.png';

export default function ExitIntentPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem('exitPopupShown');
    if (alreadyShown) { setHasShown(true); return; }

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShown) {
        setIsVisible(true);
        setHasShown(true);
        sessionStorage.setItem('exitPopupShown', 'true');
      }
    };

    const timeout = setTimeout(() => { document.addEventListener('mouseleave', handleMouseLeave); }, 5000);
    return () => { clearTimeout(timeout); document.removeEventListener('mouseleave', handleMouseLeave); };
  }, [hasShown]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsVisible(false)} />
      <div className="relative bg-card rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in border border-border">
        <button onClick={() => setIsVisible(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-accent transition-colors z-10">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        <div className="bg-secondary p-6 text-center">
          <div className="flex justify-center mb-4">
            <img src={iconHeart} alt="" className="w-16 h-16" />
          </div>
          <h3 className="text-2xl font-bold text-secondary-foreground mb-2 font-display">
            Wait! Don't go yet
          </h3>
          <p className="text-secondary-foreground/70 text-sm font-body">Your pet deserves the best care</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="text-center">
            <p className="text-lg text-foreground mb-2 font-body">Find your perfect pet sitter today</p>
            <p className="text-muted-foreground text-sm font-body">Verified sitters across NZ with daily photo updates</p>
          </div>
          <div className="space-y-2">
            {['Verified & background-checked sitters', 'Daily photo reports when requested', 'Secure online payments'].map((t, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground font-body">
                <Check className="w-4 h-4 text-primary" /> {t}
              </div>
            ))}
          </div>
          <Button onClick={() => { setIsVisible(false); navigate('/find-sitters'); }} className="w-full h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 font-body">
            Find Sitters Now <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
          <button onClick={() => setIsVisible(false)} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors font-body">
            No thanks, I'll keep looking
          </button>
        </div>
      </div>
    </div>
  );
}
