import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';

interface TermsAcceptanceProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export default function TermsAcceptance({ isOpen, onAccept, onDecline }: TermsAcceptanceProps) {
  const [accepted, setAccepted] = useState(false);
  const navigate = useNavigate();

  const handleAccept = () => {
    if (accepted) {
      onAccept();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onDecline(); }}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col border-2 border-purple-200 dark:border-purple-800 shadow-2xl overflow-hidden relative bg-background" onInteractOutside={(e) => e.preventDefault()}>
        {/* Decorative Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-950/20 dark:via-blue-950/20 dark:to-indigo-950/20 opacity-60 -z-10"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-300 dark:bg-purple-700 rounded-full blur-3xl opacity-25 -z-10"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-300 dark:bg-blue-700 rounded-full blur-3xl opacity-25 -z-10"></div>
        
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <span className="text-3xl">📋</span>
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Terms of Service Agreement
            </span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 min-h-0 overflow-y-auto p-4 bg-white/50 dark:bg-gray-900/50 rounded-lg backdrop-blur">
          <div className="space-y-4 text-sm">
            <p>
              <strong>Last updated:</strong> 15 October 2025
            </p>

            <p>
              Ziggysitters (operated by Ziggysitters Limited) is a marketplace that connects pet owners with independent pet sitters. 
              By using our website or booking a sitter through Ziggysitters, you agree to these Terms & Conditions.
            </p>

            <section>
              <h3 className="font-semibold mb-2">1. Our Role</h3>
              <p className="mb-2">
                Ziggysitters provides an online platform where pet owners ("Clients") and independent pet sitters ("Sitters") 
                can connect, communicate, and arrange services. Ziggysitters is not a party to the agreement between Clients and Sitters. 
                The actual pet care service is provided by the Sitter, not by Ziggysitters.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">2. Bookings & Payment</h3>
              <p className="mb-2">All bookings must be made through the Ziggysitters platform. Ziggysitters may facilitate payments on behalf of Sitters.</p>
              <p className="mb-2"><strong>Cancellation Policy:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Cancellations at least 24 hours before start: 100% refund of sitting fee (less Ziggysitters fee)</li>
                <li>Cancellations less than 24 hours before start: 50% refund of sitting fee (less Ziggysitters listing fee)</li>
                <li>After job has started: No cancellation possible, all fees remain due</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">3. Client Responsibilities</h3>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Provide accurate information about your pet, including health, behaviour, and special needs</li>
                <li>Ensure safe access for the Sitter and disclose who else will enter during the booking</li>
                <li>Provide proof of vaccinations, flea and worm treatment when required</li>
                <li>You are responsible for your pet's behaviour and any damage it causes</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">4. Sitter Responsibilities</h3>
              <p className="mb-2">
                Sitters agree to provide services with reasonable care and skill, consistent with the Consumer Guarantees Act 1993. 
                Sitters are responsible for the welfare and safety of pets during their bookings.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">5. Liability</h3>
              <p className="mb-2">
                Ziggysitters is not responsible for loss, injury, or illness to pets, people, or property during a booking, 
                or disputes between Clients and Sitters.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">Contact Information</h3>
              <p>
                For questions about these Terms: <strong>legal@ziggysitters.com</strong>
              </p>
            </section>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-purple-200 dark:border-purple-800 flex-shrink-0">
          <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/40 dark:to-blue-900/40 rounded-xl border-2 border-purple-300 dark:border-purple-700">
            <Checkbox 
              id="accept-terms"
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked === true)}
              className="mt-0.5 flex-shrink-0 border-purple-500 data-[state=checked]:bg-purple-500"
            />
            <label 
              htmlFor="accept-terms" 
              className="text-sm leading-relaxed font-bold cursor-pointer flex-1"
            >
              ✅ I have read the Terms of Service and agree to them
            </label>
          </div>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onDecline}
              className="flex-1 h-12 border-2 border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/20"
            >
              Decline
            </Button>
            <Button 
              onClick={handleAccept}
              disabled={!accepted}
              className="flex-1 h-12 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Accept & Continue ✨
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                window.open('/terms-of-service', '_blank');
              }} 
              className="underline hover:no-underline font-semibold text-purple-600 dark:text-purple-400"
            >
              📄 View full Terms of Service
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
