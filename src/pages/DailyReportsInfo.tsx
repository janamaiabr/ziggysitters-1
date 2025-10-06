import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Camera, 
  DollarSign, 
  Clock, 
  Shield, 
  Heart,
  CheckCircle,
  Star,
  ArrowRight
} from 'lucide-react';

export default function DailyReportsInfo() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Daily Reports: Your Choice, Our Guarantee
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Want daily updates with photos? Simply check the box when booking. When you request them,
            ZiggySitters ensures your sitter delivers - or they face a 15% payment reduction.
          </p>
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Link to="/find-sitters">
              Find a Sitter
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How Optional Daily Reports Work
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose to receive comprehensive reports when booking - when you do, our system
              ensures sitters deliver quality updates about your pet's well-being.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center">
              <CardHeader>
                <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Choose Your Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Simply check the box when booking if you want daily reports. Not every booking
                  needs them - you decide what level of communication works best for you.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Camera className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Guaranteed Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  When you request reports, sitters must deliver them with photos. Our 15%
                  payment deduction ensures accountability - reports are guaranteed when requested.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Comprehensive Care</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Reports cover feeding, exercise, medication, sleep quality, and any 
                  special care requirements your pet may have.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sample Report Preview */}
          <div className="bg-white border rounded-lg p-6 shadow-sm max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Daily Report - March 15, 2024</h3>
              <Badge variant="secondary">
                <CheckCircle className="h-4 w-4 mr-1" />
                Completed
              </Badge>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-medium mb-2">Exercise & Activities</h4>
                <p className="text-sm text-gray-600">
                  45-minute morning walk in the park, played fetch for 20 minutes. 
                  Max was very energetic and social with other dogs.
                </p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-medium mb-2">Feeding & Appetite</h4>
                <p className="text-sm text-gray-600">
                  Ate breakfast completely at 7:30 AM. Good appetite and finished 
                  dinner by 6:00 PM. Plenty of fresh water available.
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <img 
                src="/placeholder.svg" 
                alt="Pet photo" 
                className="w-20 h-20 object-cover rounded-lg"
              />
              <img 
                src="/placeholder.svg" 
                alt="Pet photo" 
                className="w-20 h-20 object-cover rounded-lg"
              />
              <img 
                src="/placeholder.svg" 
                alt="Pet photo" 
                className="w-20 h-20 object-cover rounded-lg"
              />
            </div>
            
            <p className="text-sm text-gray-600 italic">
              "Max had a wonderful day! He's such a happy and well-behaved dog. 
              Looking forward to our adventure tomorrow!"
            </p>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Daily Reports?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Many pet owners prefer the reassurance of daily updates - here's what makes them valuable
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <Heart className="h-10 w-10 text-red-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Peace of Mind</h3>
              <p className="text-sm text-gray-600">
                Know your pet is happy and well-cared for while you're away.
              </p>
            </div>

            <div className="text-center">
              <Camera className="h-10 w-10 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Visual Updates</h3>
              <p className="text-sm text-gray-600">
                See your pet's activities and mood through daily photos.
              </p>
            </div>

            <div className="text-center">
              <Clock className="h-10 w-10 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Real-time Communication</h3>
              <p className="text-sm text-gray-600">
                Stay connected with daily updates delivered to your inbox.
              </p>
            </div>

            <div className="text-center">
              <Star className="h-10 w-10 text-yellow-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Quality Assurance</h3>
              <p className="text-sm text-gray-600">
                Detailed reports ensure high standards of pet care.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment & Quality Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-blue-600 text-white rounded-lg p-8 text-center">
            <DollarSign className="h-16 w-16 mx-auto mb-6 text-blue-200" />
            <h2 className="text-3xl font-bold mb-4">
              Optional, But Guaranteed When Requested
            </h2>
            <p className="text-xl mb-6 text-blue-100 max-w-3xl mx-auto">
              When you request daily reports, sitters must complete them for 100% payment. Missing requested
              reports results in a 15% deduction - ensuring accountability when you choose transparency.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 mt-8">
              <div className="bg-blue-700 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3">For Pet Parents</h3>
                <ul className="text-left space-y-2 text-blue-100">
                  <li>• Choose if you want daily updates when booking</li>
                  <li>• Guaranteed delivery when you request them</li>
                  <li>• Detailed care documentation with photos</li>
                  <li>• Accountability through payment structure</li>
                </ul>
              </div>
              
              <div className="bg-blue-700 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3">For Sitters</h3>
                <ul className="text-left space-y-2 text-blue-100">
                  <li>• Reports only required when owners request them</li>
                  <li>• 100% payment for completing requested reports</li>
                  <li>• Build trust with detailed documentation</li>
                  <li>• Flexibility for bookings that don't need reports</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Your Choice, Our Guarantee
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of pet parents who choose ZiggySitters for flexible, accountable
            pet care - with optional daily reports that are guaranteed when you request them.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link to="/find-sitters">Find a Sitter</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-gray-900">
              <Link to="/become-sitter">Become a Sitter</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}