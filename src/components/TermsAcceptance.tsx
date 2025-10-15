import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
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
    <Dialog open={isOpen} onOpenChange={() => onDecline()}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Terms of Service Agreement</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 min-h-0 max-h-[50vh] p-4">
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
                For questions about these Terms: <strong>legal@ziggysitters.co.nz</strong>
              </p>
            </section>
          </div>
        </ScrollArea>

        <div className="space-y-4 pt-4 border-t flex-shrink-0">
          <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
            <Checkbox 
              id="accept-terms"
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked === true)}
              className="mt-0.5 flex-shrink-0"
            />
            <label 
              htmlFor="accept-terms" 
              className="text-sm leading-relaxed font-medium cursor-pointer flex-1"
            >
              I have read the Terms of Service and agree to them
            </label>
          </div>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onDecline}
              className="flex-1"
            >
              Decline
            </Button>
            <Button 
              onClick={handleAccept}
              disabled={!accepted}
              className="flex-1"
            >
              Accept & Continue
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                window.open('/terms-of-service', '_blank');
              }} 
              className="underline hover:no-underline"
            >
              View full Terms of Service
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}