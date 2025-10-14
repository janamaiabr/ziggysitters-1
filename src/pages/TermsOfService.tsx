import SEOHead from '@/components/seo/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Terms of Service - ZiggySitters"
        description="Read our complete Terms and Conditions for the ZiggySitters marketplace platform"
        canonical="/terms-of-service"
      />

      <div className="container max-w-4xl mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              Ziggysitters – Marketplace Terms & Conditions (NZ)
            </CardTitle>
            <p className="text-center text-muted-foreground mt-2">
              Last updated: 15 October 2025
            </p>
          </CardHeader>

          <CardContent className="prose prose-sm max-w-none dark:prose-invert space-y-6">
            <p className="lead text-base">
              Ziggysitters (operated by Ziggysitters Limited) is a marketplace that connects pet owners with independent pet sitters. 
              By using our website or booking a sitter through Ziggysitters, you agree to these Terms & Conditions.
            </p>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">1. Our Role</h2>
              <p className="mb-2"><strong>1.1</strong> Ziggysitters provides an online platform where pet owners ("Clients") and independent pet sitters ("Sitters") can connect, communicate, and arrange services.</p>
              <p className="mb-2"><strong>1.2</strong> Ziggysitters is not a party to the agreement between Clients and Sitters. The actual pet care service is provided by the Sitter, not by Ziggysitters.</p>
              <p className="mb-2"><strong>1.3</strong> Sitters are independent, self-employed providers. They are not employees, agents, or representatives of Ziggysitters.</p>
              <p className="mb-2"><strong>1.4</strong> Ziggysitters does not guarantee the availability, suitability, or performance of any sitter.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">2. Bookings & Payment</h2>
              <p className="mb-2"><strong>2.1</strong> All bookings must be made through the Ziggysitters platform.</p>
              <p className="mb-2"><strong>2.2</strong> By confirming a booking, you are entering into a direct agreement with the Sitter, not Ziggysitters.</p>
              <p className="mb-2"><strong>2.3</strong> Ziggysitters may facilitate payments on behalf of Sitters. Once paid, fees are held and then passed on to the Sitter after the booking.</p>
              <p className="mb-2"><strong>2.4</strong> Ziggysitters provides a cancellation fee principle as follows:</p>
              <ul className="list-disc ml-6 mb-2">
                <li>cancellations at least 24 hours before start of a job result in 100 percent of Sitting fee (less Ziggysitters fee) be returned;</li>
                <li>cancellation less than 24 hours before the start of a job results in 50 percent of Sitting fees (less Ziggysitters listing fee) be returned;</li>
                <li>attempted cancellation after a job has started is not possible and all fees will remain due, however Sitters and Clients may agree alternative arrangements as part of the specific agreement between them.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">3. Client Responsibilities</h2>
              <p className="mb-2"><strong>3.1</strong> You must provide accurate and all relevant information about your pet, including health, behaviour, and special needs.</p>
              <p className="mb-2"><strong>3.2</strong> For care in your home, you must ensure safe access for the Sitter, provide keys, and disclose who else will enter during the booking.</p>
              <p className="mb-2"><strong>3.3</strong> For care in a Sitter's home, you must provide proof of vaccinations, flea and worm treatment, and ensure your pet is suitable for the environment.</p>
              <p className="mb-2"><strong>3.4</strong> You are responsible for your pet's behaviour and any damage it causes to property, people, or other animals. We recommend you consider insurance in case any damage or incident.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">4. Sitter Responsibilities</h2>
              <p className="mb-2"><strong>4.1</strong> Sitters agree to provide services with reasonable care and skill, consistent with the Consumer Guarantees Act 1993.</p>
              <p className="mb-2"><strong>4.2</strong> Sitters are responsible for the welfare and safety of pets during their bookings.</p>
              <p className="mb-2"><strong>4.3</strong> Sitters set their own rates, availability, and cancellation policies.</p>
              <p className="mb-2"><strong>4.4</strong> Sitters are encouraged to maintain public liability insurance but are individually responsible for their own tax, ACC, and other legal obligations.</p>
              <p className="mb-2"><strong>4.5</strong> Sitters must provide copies of a passport or driving licence, written references and preferably a clear police vet check before offering sitting services on the Ziggysitters platform.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">5. Veterinary Care & Emergencies</h2>
              <p className="mb-2"><strong>5.1</strong> If not provided for in the individual agreement between a Sitter and a Client, the following provisions apply: in an emergency, the Sitter will attempt to contact the Client. If the Client cannot be reached, the Sitter may act in the pet's best interests and seek veterinary care.</p>
              <p className="mb-2"><strong>5.2</strong> The Client is responsible for all vet costs, plus any reasonable transport/time charges from the Sitter.</p>
              <p className="mb-2"><strong>5.3</strong> Ziggysitters is not liable for illness, injury, or death arising during a booking.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">6. Marketplace Limitations</h2>
              <p className="mb-2"><strong>6.1</strong> Ziggysitters does not supervise Sitters, inspect homes, or monitor bookings.</p>
              <p className="mb-2"><strong>6.2</strong> While we may perform basic checks on Sitters, we do not guarantee their qualifications, insurance, or suitability.</p>
              <p className="mb-2"><strong>6.3</strong> All agreements, risks, and liabilities relating to pet care rest with the Sitter and Client.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">7. Liability</h2>
              <p className="mb-2"><strong>7.1</strong> Ziggysitters is not responsible for:</p>
              <ul className="list-disc ml-6 mb-2">
                <li>Loss, injury, or illness to pets, people, or property during a booking.</li>
                <li>Disputes between Clients and Sitters.</li>
                <li>Costs or losses arising from cancellations, no-shows, or emergencies.</li>
              </ul>
              <p className="mb-2"><strong>7.2</strong> Nothing in these Terms limits your rights under the Fair Trading Act or Consumer Guarantees Act in relation to Ziggysitters' role as a marketplace provider.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">8. Photos, Updates & Privacy</h2>
              <p className="mb-2"><strong>8.1</strong> Sitters may provide photo updates during bookings.</p>
              <p className="mb-2"><strong>8.2</strong> With your consent, pet photos may be used for Ziggysitters' marketing.</p>
              <p className="mb-2"><strong>8.3</strong> Ziggysitters collects and processes personal information in line with NZ privacy law. For more information on what information is collected and your rights, please refer to Ziggysitters Privacy Statement.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">9. Complaints & Disputes</h2>
              <p className="mb-2"><strong>9.1</strong> If you have a complaint about a booking, you should first raise it directly with the Sitter.</p>
              <p className="mb-2"><strong>9.2</strong> If not resolved, you may contact Ziggysitters for support, but we are not legally responsible for resolving disputes.</p>
              <p className="mb-2"><strong>9.3</strong> Ziggysitters may suspend or remove Sitters or Clients who breach these Terms or create safety risks.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">10. Force Majeure</h2>
              <p className="mb-2">Ziggysitters and Sitters are not liable for failure to perform services due to natural disasters, extreme weather, or events beyond reasonable control.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">11. Changes to Terms</h2>
              <p className="mb-2">We may update these Terms & Conditions at any time. The latest version will always be published on our website.</p>
            </section>

            <div className="mt-8 p-6 bg-muted rounded-lg">
              <p className="text-sm text-center mb-0">
                By using Ziggysitters, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
