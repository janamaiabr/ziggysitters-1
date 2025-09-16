export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 mb-6">
          <strong>Last updated:</strong> {new Date().toLocaleDateString()}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
          <p className="mb-4">
            ZiggySitters ("we", "our", or "us") is committed to protecting your privacy. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your 
            information when you use our pet sitting platform.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
          <h3 className="text-xl font-medium mb-3">Personal Information</h3>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>Name, email address, and phone number</li>
            <li>Profile photos and biographical information</li>
            <li>Address and location information</li>
            <li>Payment and billing information</li>
            <li>Pet information and care requirements</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">Usage Information</h3>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>Device information and IP address</li>
            <li>Browser type and operating system</li>
            <li>Pages visited and time spent on our platform</li>
            <li>Communication preferences</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>To provide and maintain our services</li>
            <li>To process transactions and payments</li>
            <li>To communicate with you about bookings and services</li>
            <li>To verify identity and ensure safety</li>
            <li>To improve our platform and user experience</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Information Sharing</h2>
          <p className="mb-4">
            We do not sell, trade, or rent your personal information. We may share information in these situations:
          </p>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li><strong>With other users:</strong> Profile information to facilitate pet sitting services</li>
            <li><strong>Service providers:</strong> Payment processors and trusted service providers</li>
            <li><strong>Legal requirements:</strong> When required by law or to protect rights and safety</li>
            <li><strong>Business transfers:</strong> In case of merger, acquisition, or sale</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
          <p className="mb-4">
            We implement appropriate security measures to protect your information:
          </p>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>Encryption of sensitive data in transit and at rest</li>
            <li>Regular security audits and updates</li>
            <li>Access controls and employee training</li>
            <li>Secure payment processing through trusted providers</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
          <p className="mb-4">You have the right to:</p>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>Access and review your personal information</li>
            <li>Correct or update your information</li>
            <li>Delete your account and associated data</li>
            <li>Opt-out of marketing communications</li>
            <li>Data portability (receive a copy of your data)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Cookies and Tracking</h2>
          <p className="mb-4">
            We use cookies and similar technologies to enhance your experience, 
            analyze usage, and provide personalized content. You can control 
            cookie settings through your browser preferences.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p className="mb-4">
            If you have questions about this Privacy Policy, please contact us:
          </p>
          <ul className="list-none space-y-2">
            <li><strong>Email:</strong> privacy@ziggysitters.co.nz</li>
            <li><strong>Address:</strong> Auckland, New Zealand</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you 
            of any material changes by posting the new policy on this page and 
            updating the "Last updated" date.
          </p>
        </section>
      </div>
    </div>
  );
}