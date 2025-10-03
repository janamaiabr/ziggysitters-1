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
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </CardHeader>

          <CardContent className="prose prose-sm max-w-none dark:prose-invert space-y-6">
            <p className="lead text-base">
              Ziggysitters is a marketplace that connects pet owners with independent pet sitters. 
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
              <p className="mb-2"><strong>2.4</strong> Cancellation policies are set by individual Sitters. These must be displayed in their profile and agreed before booking.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">3. Client Responsibilities</h2>
              <p className="mb-2"><strong>3.1</strong> You must provide accurate and all relevant information about your pet, including health, behaviour, and special needs.</p>
              <p className="mb-2"><strong>3.2</strong> For care in your home, you must ensure safe access for the sitter, provide keys, and disclose who else will enter during the booking.</p>
              <p className="mb-2"><strong>3.3</strong> For care in a sitter's home, you must provide proof of vaccinations, flea and worm treatment, and ensure your pet is suitable for the environment.</p>
              <p className="mb-2"><strong>3.4</strong> You are responsible for your pet's behaviour and any damage it causes to property, people, or other animals.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">4. Sitter Responsibilities</h2>
              <p className="mb-2"><strong>4.1</strong> Sitters agree to provide services with reasonable care and skill, consistent with the Consumer Guarantees Act 1993.</p>
              <p className="mb-2"><strong>4.2</strong> Sitters are responsible for the welfare and safety of pets during their bookings.</p>
              <p className="mb-2"><strong>4.3</strong> Sitters set their own rates, availability, and cancellation policies.</p>
              <p className="mb-2"><strong>4.4</strong> Sitters are encouraged to maintain public liability insurance but are individually responsible for their own tax, ACC, and other legal obligations.</p>
              <p className="mb-2"><strong>4.5</strong> Sitters must provide copies of a passport or driving licence, written references and a clear police vet check before offering sitting services.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">5. Veterinary Care & Emergencies</h2>
              <p className="mb-2"><strong>5.1</strong> In an emergency, the Sitter will attempt to contact the Client. If the Client cannot be reached, the Sitter may act in the pet's best interests and seek veterinary care.</p>
              <p className="mb-2"><strong>5.2</strong> The Client is responsible for all vet costs, plus any reasonable transport/time charges from the Sitter.</p>
              <p className="mb-2"><strong>5.3</strong> Ziggysitters is not liable for illness, injury, or death arising during a booking.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">6. Marketplace Limitations</h2>
              <p className="mb-2"><strong>6.1</strong> Ziggysitters does not directly supervise sitters, inspect homes, or monitor bookings.</p>
              <p className="mb-2"><strong>6.2</strong> While we may perform basic checks on sitters, we do not guarantee their qualifications, insurance, or suitability.</p>
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
              <p className="mb-2"><strong>9.2</strong> If unresolved, you may contact Ziggysitters at <a href="mailto:support@ziggysitters.co.nz" className="text-primary hover:underline">support@ziggysitters.co.nz</a></p>
              <p className="mb-2"><strong>9.3</strong> Disputes may be referred to third-party dispute resolution in line with New Zealand consumer law.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">10. Governing Law</h2>
              <p className="mb-2"><strong>10.1</strong> These Terms are governed by the laws of New Zealand.</p>
              <p className="mb-2"><strong>10.2</strong> Any disputes arising from these Terms will be subject to the exclusive jurisdiction of New Zealand courts.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">11. Changes to Terms</h2>
              <p className="mb-2"><strong>11.1</strong> Ziggysitters may update these Terms at any time.</p>
              <p className="mb-2"><strong>11.2</strong> Continued use of the platform after changes indicates acceptance of the new Terms.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">12. Contact</h2>
              <p className="mb-2">For questions about these Terms, please contact us at:</p>
              <p className="ml-4 mb-2">
                <strong>Email:</strong> <a href="mailto:legal@ziggysitters.co.nz" className="text-primary hover:underline">legal@ziggysitters.co.nz</a><br />
                <strong>Website:</strong> <a href="https://ziggysitters.co.nz" className="text-primary hover:underline">www.ziggysitters.co.nz</a>
              </p>
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
