import { useState } from 'react';
import { X, Mail, Bell, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EmailCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchLocation?: string;
  searchServiceType?: string;
}

export default function EmailCaptureModal({ 
  isOpen, 
  onClose, 
  searchLocation, 
  searchServiceType 
}: EmailCaptureModalProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('email_captures')
        .insert({
          email,
          name: name || null,
          search_location: searchLocation || null,
          search_service_type: searchServiceType || null,
          source: 'search_retarget'
        });

      if (error) {
        // If duplicate email, still show success
        if (error.code === '23505') {
          setSubmitted(true);
          return;
        }
        throw error;
      }

      setSubmitted(true);
      toast.success('You\'re on the list!');
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
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-10"
        >
          <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>

        {!submitted ? (
          <>
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-6 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Get Sitter Recommendations 🐾
              </h3>
              <p className="text-white/90 text-sm">
                We'll send you the best matches for your search
              </p>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="text-center mb-4">
                <p className="text-muted-foreground text-sm">
                  {searchLocation ? (
                    <>Looking for sitters in <span className="font-semibold text-foreground">{searchLocation}</span>?</>
                  ) : (
                    'Get personalized sitter recommendations'
                  )}
                </p>
              </div>
              
              <div className="space-y-3">
                <Input
                  type="text"
                  placeholder="Your name (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 border-2 border-purple-200 focus:border-purple-500"
                />
                
                <Input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 border-2 border-purple-200 focus:border-purple-500"
                />
              </div>
              
              {/* Benefits */}
              <div className="space-y-2 py-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="text-green-500">✓</span> Personalized sitter recommendations
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="text-green-500">✓</span> New sitters in your area
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="text-green-500">✓</span> Unsubscribe anytime
                </div>
              </div>
              
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 hover:from-purple-600 hover:via-indigo-600 hover:to-blue-600"
              >
                {isSubmitting ? (
                  'Subscribing...'
                ) : (
                  <>
                    <Mail className="mr-2 w-4 h-4" />
                    Get Recommendations
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
              
              <p className="text-xs text-center text-muted-foreground">
                We respect your privacy. No spam, ever.
              </p>
            </form>
          </>
        ) : (
          /* Success state */
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🎉</span>
            </div>
            <h3 className="text-2xl font-bold mb-3">You're on the list!</h3>
            <p className="text-muted-foreground mb-6">
              We'll send you personalized sitter recommendations based on your search.
            </p>
            <Button 
              onClick={onClose}
              className="bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500"
            >
              Continue Browsing
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
