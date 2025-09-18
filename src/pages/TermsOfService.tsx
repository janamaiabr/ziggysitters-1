export default function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 mb-6">
          <strong>Last updated:</strong> {new Date().toLocaleDateString()}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Agreement to Terms</h2>
          <p className="mb-4">
            By accessing and using ZiggySitters ("the Service"), you agree to be bound 
            by these Terms of Service ("Terms"). If you disagree with any part of these 
            terms, you may not access the Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Description of Service</h2>
          <p className="mb-4">
            ZiggySitters is a platform that connects pet owners with verified pet sitters who 
            provide mandatory daily updates. We provide a marketplace for transparent pet care 
            services including:
          </p>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>Pet sitting and boarding with daily photo updates</li>
            <li>Dog walking services with activity reports</li>
            <li>Drop-in visits with detailed visit summaries</li>
            <li>Overnight care with comprehensive daily reports</li>
            <li>Pet grooming and training with progress updates</li>
          </ul>
          <p className="mb-4">
            <strong>Key Feature:</strong> All pet sitters are required to submit detailed daily 
            reports with photos and comprehensive updates about your pet's well-being, activities, 
            and care throughout the service period.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">User Accounts</h2>
          <h3 className="text-xl font-medium mb-3">Registration</h3>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>You must provide accurate and complete information</li>
            <li>You are responsible for maintaining account security</li>
            <li>You must be at least 18 years old to use our Service</li>
            <li>One person may not maintain more than one account</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">Account Responsibilities</h3>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>Keep your login credentials confidential</li>
            <li>Notify us immediately of unauthorized access</li>
            <li>Update your information when it changes</li>
            <li>You are liable for all activities under your account</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Pet Sitter Requirements</h2>
          <p className="mb-4">Pet sitters must:</p>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>Complete profile verification and identity confirmation</li>
            <li>Provide accurate information about experience and availability</li>
            <li>Follow all local laws and regulations</li>
            <li>Provide safe and appropriate care for pets</li>
            <li><strong>Submit daily reports with photos and comprehensive updates</strong></li>
            <li>Complete daily report forms covering exercise, food, sleep, medication, and general well-being</li>
            <li>Upload at least one photo per day showing the pet in their care</li>
            <li>Provide detailed notes about the pet's mood, behavior, and activities</li>
          </ul>
          
          <h3 className="text-xl font-medium mb-3 text-red-600">Critical Requirement: Daily Reports</h3>
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <p className="mb-2">
              <strong>Mandatory Daily Reporting:</strong> Pet sitters MUST submit a comprehensive 
              daily report for each day of service. Failure to submit daily reports will result 
              in reduced payment and may affect sitter standing on the platform.
            </p>
            <p className="mb-2">
              Daily reports must include:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>At least one clear photo of the pet</li>
              <li>Exercise duration and activities</li>
              <li>Food consumption and eating habits</li>
              <li>Sleep quality and rest periods</li>
              <li>Medication administration (if applicable)</li>
              <li>Time spent alone</li>
              <li>Pet's mood and behavior observations</li>
              <li>Detailed general notes about the day</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Booking and Payments</h2>
          <h3 className="text-xl font-medium mb-3">Booking Process</h3>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>All bookings are subject to sitter availability and acceptance</li>
            <li>Pet owners must provide accurate pet and care information</li>
            <li>Emergency contact information must be provided</li>
            <li>Special requirements must be disclosed before booking</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">Payment Terms</h3>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>Payment is processed securely through our platform</li>
            <li>Service fees and taxes will be clearly displayed</li>
            <li>Final payment to sitters depends on daily report compliance</li>
            <li>Refunds are subject to our cancellation policy</li>
          </ul>
          
          <h3 className="text-xl font-medium mb-3 text-red-600">Daily Report Payment Policy</h3>
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <p className="mb-2">
              <strong>Performance-Based Payment Structure:</strong>
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>100% Payment:</strong> Sitters who submit daily reports for ALL required days 
                receive full payment as agreed</li>
              <li><strong>50% Payment:</strong> Sitters who fail to submit daily reports for any required 
                day(s) will receive only 50% of the agreed payment</li>
              <li>Daily reports must be submitted by 9 PM on the day of service</li>
              <li>Late submissions (after 9 PM) are considered missed reports</li>
              <li>No exceptions will be made except for verified emergencies with prior notification</li>
            </ul>
            <p className="mt-2">
              <strong>Important:</strong> This policy ensures pet owners receive the transparency and 
              updates they expect when trusting their pets to our sitters.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Cancellation Policy</h2>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li><strong>48+ hours notice:</strong> Full refund of service cost only (platform fee non-refundable)</li>
            <li><strong>Less than 48 hours:</strong> No refund (platform fee is always non-refundable)</li>
            <li><strong>Emergency situations:</strong> Case-by-case review at our discretion</li>
          </ul>
          <p className="mb-4">
            <strong>Important:</strong> Our 10% platform fee is non-refundable under all circumstances 
            to cover payment processing and administrative costs.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Prohibited Conduct</h2>
          <p className="mb-4">Users may not:</p>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>Provide false or misleading information</li>
            <li>Use the platform for illegal activities</li>
            <li>Harass, abuse, or threaten other users</li>
            <li>Attempt to circumvent platform safety measures</li>
            <li>Share personal contact information outside the platform initially</li>
            <li>Use automated systems to access the Service</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Liability</h2>
          <p className="mb-4">
            ZiggySitters provides a platform for connecting users but is not directly 
            responsible for the care provided. Pet sitters are independent contractors, 
            and pet owners use services at their own risk.
          </p>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>Pet owners should verify sitter credentials and references</li>
            <li>Report any incidents or concerns immediately</li>
            <li>Our liability is limited to the extent permitted by law</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Termination</h2>
          <p className="mb-4">
            We reserve the right to terminate or suspend accounts for violation 
            of these Terms or for any reason at our discretion. Upon termination:
          </p>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>Your access to the Service will cease immediately</li>
            <li>Pending bookings may be cancelled</li>
            <li>Outstanding payments will be processed according to our policies</li>
            <li>Some provisions of these Terms will survive termination</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. We will notify 
            users of material changes via email or platform notification. Continued 
            use of the Service after changes constitutes acceptance of the new Terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
          <p className="mb-4">
            For questions about these Terms of Service, please contact us:
          </p>
          <ul className="list-none space-y-2">
            <li><strong>Email:</strong> legal@ziggysitters.co.nz</li>
            <li><strong>Address:</strong> Auckland, New Zealand</li>
          </ul>
        </section>
      </div>
    </div>
  );
}