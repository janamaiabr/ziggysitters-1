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
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Terms of Service Agreement</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[400px] p-4">
          <div className="space-y-4 text-sm">
            <p>
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section>
              <h3 className="font-semibold mb-2">Agreement to Terms</h3>
              <p>
                By accessing and using ZiggySitters ("the Service"), you agree to be bound 
                by these Terms of Service ("Terms").
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">Services Offered</h3>
              <p>ZiggySitters connects pet owners with verified pet sitters offering:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Pet sitting in sitter's home</li>
                <li>Pet sitting in owner's home</li>
                <li>Drop-in visits</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">Cancellation Policy</h3>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>48+ hours notice:</strong> Full refund of service cost only</li>
                <li><strong>Less than 48 hours:</strong> No refund</li>
                <li><strong>Platform fee (10%):</strong> Non-refundable under all circumstances</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">User Responsibilities</h3>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Provide accurate information about pets and requirements</li>
                <li>Treat sitters with respect and professionalism</li>
                <li>Pay for services as agreed</li>
                <li>Follow platform safety guidelines</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">Contact Information</h3>
              <p>
                For questions about these Terms: <strong>legal@ziggysitters.co.nz</strong>
              </p>
            </section>
          </div>
        </ScrollArea>

        <div className="space-y-4">
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="accept-terms"
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked === true)}
              className="mt-1"
            />
            <label htmlFor="accept-terms" className="text-sm leading-5 font-medium">
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
              onClick={() => navigate('/terms-of-service')} 
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