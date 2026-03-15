import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Check } from 'lucide-react';
import iconPaw from '@/assets/icons/icon-paw.png';

interface EmailCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchLocation?: string;
  searchServiceType?: string;
}

export default function EmailCaptureModal({ isOpen, onClose, searchLocation, searchServiceType }: EmailCaptureModalProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error('Please enter your email'); return; }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('email_captures').insert({
        email, name: name || null, search_location: searchLocation || null,
        search_service_type: searchServiceType || null, source: 'search_retarget'
      });
      if (error && error.code !== '23505') throw error;
      onClose();
      navigate('/email-thank-you');
    } catch (error) {
      console.error('Error saving email:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative bg-card rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in border border-border">
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-accent transition-colors z-10">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Header */}
        <div className="bg-secondary p-6 text-center">
          <div className="flex justify-center mb-4">
            <img src={iconPaw} alt="" className="w-14 h-14" />
          </div>
          <h3 className="text-2xl font-bold text-secondary-foreground mb-2 font-display">
            Get Sitter Recommendations
          </h3>
          <p className="text-secondary-foreground/70 text-sm font-body">
            We'll send you the best matches for your search
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="text-center mb-4">
            <p className="text-muted-foreground text-sm font-body">
              {searchLocation ? (
                <>Looking for sitters in <span className="font-semibold text-foreground">{searchLocation}</span>?</>
              ) : 'Get personalized sitter recommendations'}
            </p>
          </div>
          <div className="space-y-3">
            <Input type="text" placeholder="Your name (optional)" value={name} onChange={(e) => setName(e.target.value)} className="h-12 border-border focus:border-primary font-body" />
            <Input type="email" placeholder="Your email address" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12 border-border focus:border-primary font-body" />
          </div>
          <div className="space-y-2 py-2">
            {['Personalized sitter recommendations', 'New sitters in your area', 'Unsubscribe anytime'].map((t, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground font-body">
                <Check className="w-4 h-4 text-primary" /> {t}
              </div>
            ))}
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 font-body">
            {isSubmitting ? 'Subscribing...' : (<>Get Recommendations <ArrowRight className="ml-2 w-4 h-4" /></>)}
          </Button>
          <p className="text-xs text-center text-muted-foreground font-body">We respect your privacy. No spam, ever.</p>
        </form>
      </div>
    </div>
  );
}
