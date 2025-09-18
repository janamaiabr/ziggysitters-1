import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, Eye, UserCheck, Database, Star, CreditCard } from 'lucide-react';

export default function Security() {
  const securityFeatures = [
    {
      icon: UserCheck,
      title: 'Identity Verification',
      description: 'All sitters complete thorough identity verification including ID checks (i.e. passport or drivers licence) and address confirmation.',
      status: 'Active'
    },
    {
      icon: Star,
      title: 'Profile Validation',
      description: 'Comprehensive profile review and validation to ensure genuine pet sitters join our platform.',
      status: 'Active'
    },
    {
      icon: Lock,
      title: 'Secure Payments',
      description: 'PCI DSS compliant payment processing with encrypted transactions and secure payment storage.',
      status: 'Active'
    },
    {
      icon: Eye,
      title: 'Profile Monitoring',
      description: 'Continuous monitoring of user profiles and activities to detect and prevent suspicious behavior.',
      status: 'Active'
    },
    {
      icon: CreditCard,
      title: 'Payment Protection',
      description: 'Secure payment processing with buyer protection and fraud prevention measures.',
      status: 'Active'
    },
    {
      icon: Database,
      title: 'Data Encryption',
      description: 'End-to-end encryption for all personal data, communications, and sensitive information.',
      status: 'Active'
    }
  ];

  const privacyMeasures = [
    {
      title: 'Contact Information Protection',
      description: 'Personal contact details are protected and only accessible through our secure platform.',
      icon: '📧'
    },
    {
      title: 'Address Privacy',
      description: 'Exact addresses are only shared with confirmed bookings and never displayed publicly.',
      icon: '🏠'
    },
    {
      title: 'Communication Security',
      description: 'All communications between users are monitored for safety and kept secure.',
      icon: '💬'
    },
    {
      title: 'Data Minimization',
      description: 'We only collect and store information necessary for providing our services.',
      icon: '🗂️'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Security & Safety</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your safety and privacy are our top priorities. Learn about the comprehensive 
            security measures we have in place to protect you, your pets, and your data.
          </p>
        </div>

        {/* Security Overview */}
        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-8 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">100%</div>
              <div className="text-gray-600">Verified Sitters</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <div className="text-gray-600">Platform Monitoring</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">256-bit</div>
              <div className="text-gray-600">SSL Encryption</div>
            </div>
          </div>
        </div>

        {/* Security Features */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Security Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {securityFeatures.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {feature.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Privacy Protection */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Privacy Protection</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {privacyMeasures.map((measure, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="text-2xl">{measure.icon}</div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{measure.title}</h3>
                      <p className="text-gray-600">{measure.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Verification Process */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Sitter Verification Process</h2>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              <div className="flex items-start space-x-4 p-6 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground rounded-full font-bold">1</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Application Review</h3>
                  <p className="text-gray-600">
                    Initial application review including personal information, experience, 
                    and motivation for pet sitting.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-6 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground rounded-full font-bold">2</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Identity Verification</h3>
                  <p className="text-gray-600">
                    Government-issued ID verification and address confirmation to ensure 
                    sitter identity authenticity.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-6 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground rounded-full font-bold">3</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Profile Validation</h3>
                  <p className="text-gray-600">
                    Comprehensive profile review including experience validation, 
                    reference checks, and previous pet care experience verification.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-6 bg-primary text-primary-foreground rounded-lg">
                <div className="flex items-center justify-center w-10 h-10 bg-white text-primary rounded-full font-bold">4</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Approval & Monitoring</h3>
                  <p className="opacity-90">
                    Final approval and ongoing monitoring of sitter performance, 
                    reviews, and platform activity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Data Security */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Data Security</h2>
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Lock className="h-5 w-5 text-primary" />
                      Encryption & Security
                    </h3>
                    <ul className="space-y-2 text-gray-600">
                      <li>• 256-bit SSL encryption for all data transmission</li>
                      <li>• Encrypted database storage for sensitive information</li>
                      <li>• Regular security audits and vulnerability testing</li>
                      <li>• Secure payment processing (PCI DSS compliant)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Database className="h-5 w-5 text-primary" />
                      Access Control
                    </h3>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Role-based access control (RBAC)</li>
                      <li>• Multi-factor authentication for admin accounts</li>
                      <li>• Regular access reviews and privilege management</li>
                      <li>• Audit logging of all system access</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Reporting */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-8">Report Security Concerns</h2>
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-4">Found a Security Issue?</h3>
              <p className="text-gray-600 mb-6">
                We take security seriously. If you discover a security vulnerability 
                or have concerns about platform safety, please report it immediately.
              </p>
              <div className="space-y-3">
                <p><strong>Security Email:</strong> security@ziggysitters.co.nz</p>
                <p className="text-sm text-gray-500">
                  For all security-related questions and concerns.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}