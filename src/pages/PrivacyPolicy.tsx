import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Shield, Mail, Users, FileText, Eye, Lock, Globe, AlertCircle, Clock, UserCheck } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Privacy Statement
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We care about your information and protecting your privacy
          </p>
          <Badge variant="outline" className="mt-4">
            <Clock className="w-4 h-4 mr-2" />
            Last Updated: {new Date().toLocaleDateString()}
          </Badge>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Introduction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              This Privacy Statement will help you understand how we process and protect your personal information when you use our Platform, or when you otherwise interact with us. We tell you about your privacy rights and how the law protects you.
            </p>
            <p className="text-muted-foreground">
              If you join Ziggysitters and create a user account, you are a "User". If you are using the Services as a paying customer, you are a "Customer".
            </p>
          </CardContent>
        </Card>

        {/* Purpose */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>1. Purpose of This Privacy Statement</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This Privacy Statement aims to give you information about what information we hold and how we protect your personal information, as a result of your visiting or using our Platform and/or Services.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  Please read the following carefully to understand our practices regarding your personal information and how we will treat it. If you do not agree with this Privacy Statement, please do not use our site.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Who We Are */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              2. Who We Are & Contact Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Ziggysitters is an online platform facilitating the connection between home and pet owners and sitters. When we talk about Ziggysitters "we", "our" or "us" in this Statement, we are referring to Ziggysitters Ltd., the company which provides the Platform and/or Services.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-blue-600 mr-2" />
                <div>
                  <p className="font-medium text-blue-900">Contact Us</p>
                  <p className="text-blue-700">
                    If you have any general enquiries related to this Privacy Statement please email us at{' '}
                    <a href="mailto:hello@ziggysitters.com" className="underline">hello@ziggysitters.com</a>
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    This email address is monitored on a regular basis and we aim to respond to your query as soon as possible.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Information We Collect */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              3. The Information We Collect About You
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Personal information means any information about you from which you can be identified. It does not include information where the identity has been removed and cannot be re-established to identify you personally e.g. information about number of users on the Platform.
            </p>
            
            <div className="grid gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Financial Information</h4>
                <p className="text-sm text-muted-foreground">
                  Bank account and payment card details you provide, including expiry date. Details about your payment history and/or services or products you have purchased from us.
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Identity Information</h4>
                <p className="text-sm text-muted-foreground">
                  Full name, title, marital status, date of birth and/or gender. Billing address, home address, postal code, telephone numbers, email address, username, password.
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Image Information</h4>
                <p className="text-sm text-muted-foreground">
                  Photographs and videos of you and/or your house and/or your pet that you provide.
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Marketing Information</h4>
                <p className="text-sm text-muted-foreground">
                  Information you provide about yourself such as information you provide about your home such as your location, amenities and surrounding area and your pets.
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Listing Information</h4>
                <p className="text-sm text-muted-foreground">
                  Information you provide about yourself such as your job, hobbies and reasons for travel, and information you provide about your house such as your location, amenities, car and surrounding area.
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Verification Information</h4>
                <p className="text-sm text-muted-foreground">
                  A copy of your passport, proof of address and results of criminal record checks.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Information Collection Methods */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>4. Information Collection Methods</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              We use different methods to collect information from and about you, including through:
            </p>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Direct Provision of Information</h4>
                <p className="text-muted-foreground mb-3">
                  We collect information from you when you provide information directly to us e.g. via email or via our Platform. For Customers this refers to personal information you provide when, for example; you create an account, complete a profile/post a listing, or contact us by email or live chat. For Users, this refers to personal information you provide when you create an account on our Platform. For both Customers and Users, this will include Marketing and Communications Information.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Automated Technologies or Interactions</h4>
                <p className="text-muted-foreground mb-3">
                  As you interact with our Platform, we may automatically collect information about your device, browsing actions and patterns. For example, we collect information which may include your IP address, the browser type, your location, and access times. We collect this personal information by using cookies, pixel tags and other similar tracking technologies. The sole purpose of passively collecting your information is to improve your experience when using our Platform and/or Services.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Cookies</h4>
                <p className="text-muted-foreground mb-3">
                  We use cookies and similar tracking technologies to track the activity on our Platform and may also receive Technical Information about you if you visit other websites employing our cookies. Cookies are files with a small amount of information which may include an anonymous unique identifier. You can instruct your browser to refuse all cookies. However, if you do not accept cookies, you may not be able to use some of our Service.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Indirect Information</h4>
                <p className="text-muted-foreground mb-3">
                  We may receive personal information about you from third parties and public sources, for example, a provider that conducts background checks. In this instance we will comply with all necessary information protection obligations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Specific Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCheck className="w-5 h-5 mr-2" />
              As a Customer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">a</span>
                You are able to provide personal information to obtain external references that can be added to your profile as part of your verification process which may include personal information of referees. In this case, you are responsible for obtaining the consent of the referee to do this.
              </li>
              <li className="flex items-start">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">b</span>
                You can provide personal information to a third party who will carry out checks for any criminal convictions and offences. The third party will then provide us with that information.
              </li>
              <li className="flex items-start">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">c</span>
                You can both leave a review or give feedback on another Customer and/or you can receive a review or feedback from another Customer. We encourage you not to include any personal information when writing a review or giving feedback.
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Information Sharing */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Who We Share Your Personal Information With
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4 text-muted-foreground">
              <li className="flex items-start">
                <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">a</span>
                <div>
                  <strong>Service providers:</strong> We may share your personal information with third party service providers that provide services for us or on our behalf, which may include providing mailing, payment processing, sitter verifications, banking, advertising, web hosting, payment gateway or analytics services.
                </div>
              </li>
              <li className="flex items-start">
                <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">b</span>
                <div>
                  <strong>Other users:</strong> Certain information of your personal information may be shared with other users of the Platform as part of the normal operation of the Services (for example your uploaded profile picture, sitter profile/listing will be accessible to all users).
                </div>
              </li>
              <li className="flex items-start">
                <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">c</span>
                <div>
                  <strong>Professional advisors:</strong> We may share your personal information with our lawyers, accountants, insurers and other professional advisors to the extent we need to.
                </div>
              </li>
              <li className="flex items-start">
                <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">d</span>
                <div>
                  <strong>Business partners:</strong> We may share your personal information (such as contact details) with our business partners where this is necessary in the normal course of our business.
                </div>
              </li>
              <li className="flex items-start">
                <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">e</span>
                <div>
                  <strong>Purchasers and third parties in connection with a business transaction:</strong> Your personal information may be disclosed to third parties in connection with a transaction, such as a merger, sale of assets or shares, reorganisation, financing, change of control or acquisition of all or a portion of our business.
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Rights Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Rights in Relation to Your Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              You have rights under information protection laws in relation to your personal information, in particular under the Privacy Act 2020 you have the following rights:
            </p>
            <ol className="space-y-3 text-muted-foreground">
              <li className="flex items-start">
                <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">1</span>
                <strong>To request access to your personal information.</strong> This enables you to receive a copy of the personal information we hold about you.
              </li>
              <li className="flex items-start">
                <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">2</span>
                <strong>To request the correction of your personal information</strong> that you consider to be inaccurate. This enables you to have any incomplete or inaccurate information we hold about you corrected. However, we may need to verify your identity and the accuracy of the new information you provide to us.
              </li>
            </ol>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-blue-800">
                If you wish to exercise any of the rights set out above, in the first instance, please email us at{' '}
                <a href="mailto:hello@ziggysitters.com" className="underline">hello@ziggysitters.com</a>. We will respond to you within 30 days of receipt of your request.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="w-5 h-5 mr-2" />
              Information Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              We have put in place appropriate security measures to prevent your personal information from being accidentally lost, altered or disclosed, used or accessed in an unauthorised way. In addition, we limit access to your personal information to those employees, agents, contractors and other third parties who have a business need to know it.
            </p>
            <p className="text-muted-foreground">
              We have put in place procedures to deal with any suspected personal information breach and will notify you and any applicable regulator of a breach where we are legally required to do so.
            </p>
          </CardContent>
        </Card>

        {/* Children */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Children</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
                <div>
                  <p className="text-red-900 font-medium">Age Restriction</p>
                  <p className="text-red-800 text-sm">
                    Our Platform and/or Services are not intended for children under 18 and we do not knowingly collect information relating to anyone under the age of 18. If you learn that a child under the age of 18 or a Customer under the age of 18 has provided us with personal information without valid consent, please email us at{' '}
                    <a href="mailto:hello@ziggysitters.com" className="underline">hello@ziggysitters.com</a>.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              Contact & Changes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We may modify this Privacy Statement at any time, however, if we make any material changes to it we will revise the date at the top of the Statement and may provide you with notice either via a message on our Platform or via sending you an email.
            </p>
            <p className="text-muted-foreground">
              It is important that the personal information we hold about you is accurate and current. Please keep us informed should your personal information change during your relationship with us.
            </p>
            <div className="bg-gray-50 border rounded-lg p-4">
              <p className="text-sm text-gray-700">
                Please contact us at{' '}
                <a href="mailto:hello@ziggysitters.com" className="underline font-medium">hello@ziggysitters.com</a>{' '}
                if you object to any changes or need to inform us of any personal information changes during your use of our services.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Definitions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Definitions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <strong>Platform</strong> means the online platform accessed via the website or mobile application.
            </div>
            <div>
              <strong>Services</strong> means the products and services offered by Ziggysitters.com.
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-8 border-t">
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()} | 
            For questions, contact us at{' '}
            <a href="mailto:hello@ziggysitters.com" className="text-primary hover:underline">
              hello@ziggysitters.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}