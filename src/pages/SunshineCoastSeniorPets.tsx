import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Heart,
  Shield,
  Star,
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  Pill,
  Activity,
  Users,
  Camera,
  ArrowRight,
} from 'lucide-react';

// SEO constants (also used in tests)
export const SUNSHINE_COAST_META = {
  title: 'Senior & High-Needs Pet Sitting | Sunshine Coast | ZiggySitters',
  description:
    'Specialist pet sitters for senior and high-needs pets on the Sunshine Coast. Medication administration, vet-referred, local team in Caloundra, Maroochydore, Noosa, Mooloolaba, Buderim, Nambour & Coolum.',
  keywords:
    'pet sitting sunshine coast, senior pet sitter sunshine coast, dog sitting sunshine coast, cat sitting sunshine coast, high needs pet care sunshine coast, medication administration pet sitter, vet referred pet sitter sunshine coast',
};

export const SUNSHINE_COAST_SUBURBS = [
  'Caloundra',
  'Maroochydore',
  'Noosa',
  'Mooloolaba',
  'Buderim',
  'Nambour',
  'Coolum',
  'Peregian',
  'Sippy Downs',
  'Palmview',
];

export const SUNSHINE_COAST_USP = [
  'senior pet specialists',
  'medication administration',
  'vet-referred',
  'daily updates',
  'emergency protocols',
];

const FEATURES = [
  {
    icon: <Pill className="h-6 w-6 text-purple-600" />,
    title: 'Medication Administration',
    description:
      'Our sitters are trained to administer oral medications, eye drops, insulin injections, and subcutaneous fluids — so your senior pet never misses a dose.',
  },
  {
    icon: <Activity className="h-6 w-6 text-purple-600" />,
    title: 'Senior Pet Specialists',
    description:
      'We match senior and high-needs pets with sitters who have specific experience in arthritis management, mobility assistance, and age-related conditions.',
  },
  {
    icon: <Shield className="h-6 w-6 text-purple-600" />,
    title: 'Vet-Referred & Trusted',
    description:
      'Many of our clients are referred by local Sunshine Coast vets who trust us with their most vulnerable patients. That\'s the highest endorsement we could ask for.',
  },
  {
    icon: <Phone className="h-6 w-6 text-purple-600" />,
    title: 'Emergency Protocols',
    description:
      'Every senior pet booking includes an emergency plan: your vet\'s number, nearest emergency animal hospital, and a clear escalation process if something changes.',
  },
  {
    icon: <Camera className="h-6 w-6 text-purple-600" />,
    title: 'Daily Photo Updates',
    description:
      'You\'ll receive daily photo and video updates so you can see exactly how your pet is doing. Peace of mind, delivered to your phone every day.',
  },
  {
    icon: <Users className="h-6 w-6 text-purple-600" />,
    title: 'Local Sunshine Coast Team',
    description:
      'Our sitters live and work right here on the Sunshine Coast. They know the local vets, the best quiet walks for arthritic dogs, and the area\'s emergency animal services.',
  },
];

const TESTIMONIALS = [
  {
    quote:
      'ZiggySitters has been a lifesaver for our 14-year-old Lab, Jasper. His sitter gives him his arthritis medication perfectly and sends us photos every day. We finally feel comfortable going on holidays.',
    name: 'Sarah T.',
    suburb: 'Buderim',
    rating: 5,
  },
  {
    quote:
      'Our vet actually recommended ZiggySitters for our diabetic cat. The sitter gives her insulin injections twice a day without any issues. Absolutely worth every cent.',
    name: 'Michael K.',
    suburb: 'Maroochydore',
    rating: 5,
  },
  {
    quote:
      'My 16-year-old cat has hyperthyroidism and needs daily medication. I was terrified to leave her, but our ZiggySitters carer was exceptional. She even sent voice messages explaining how Luna was doing.',
    name: 'Emma R.',
    suburb: 'Noosa',
    rating: 5,
  },
];

const CONDITIONS_WE_SUPPORT = [
  'Arthritis & joint pain',
  'Diabetes (insulin management)',
  'Heart conditions',
  'Kidney disease (subcutaneous fluids)',
  'Hyperthyroidism (oral meds)',
  'Cancer & post-surgical recovery',
  'Cognitive dysfunction (doggy dementia)',
  'Vision or hearing impairment',
  'Mobility issues',
  'Anxiety & behavioural needs',
];

export default function SunshineCoastSeniorPets() {
  const navigate = useNavigate();

  return (
    <>
      {/* SEO Head — inlined for now, replace with SEOHead component if available */}
      <title>{SUNSHINE_COAST_META.title}</title>
      <meta name="description" content={SUNSHINE_COAST_META.description} />
      <meta name="keywords" content={SUNSHINE_COAST_META.keywords} />
      <meta property="og:title" content={SUNSHINE_COAST_META.title} />
      <meta property="og:description" content={SUNSHINE_COAST_META.description} />
      <meta property="og:type" content="website" />
      <link rel="canonical" href="https://ziggysitters.com/sunshine-coast" />

      <div className="min-h-screen bg-white">
        {/* ── Hero ── */}
        <section className="bg-gradient-to-br from-purple-700 via-purple-600 to-purple-800 text-white py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col lg:flex-row items-center gap-10">
              <div className="flex-1 text-center lg:text-left">
                <Badge className="bg-white/20 text-white border-white/30 mb-4 text-sm">
                  🌞 Sunshine Coast, Queensland
                </Badge>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6">
                  Senior & High-Needs<br />
                  <span className="text-yellow-300">Pet Sitting</span> on the<br />
                  Sunshine Coast
                </h1>
                <p className="text-lg text-purple-100 mb-8 max-w-xl mx-auto lg:mx-0">
                  Specialist care for older and medically complex pets. Medication administration,
                  vet-referred sitters, daily updates — trusted by Sunshine Coast families and local vets.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <Button
                    size="lg"
                    className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold"
                    onClick={() => navigate('/find-sitters')}
                  >
                    Find a Senior Pet Specialist <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-purple-700"
                    onClick={() => navigate('/how-it-works')}
                  >
                    How It Works
                  </Button>
                </div>
              </div>

              {/* Trust signals */}
              <div className="grid grid-cols-2 gap-4 max-w-sm w-full">
                {[
                  { icon: '💊', label: 'Medication trained' },
                  { icon: '🏥', label: 'Vet-referred' },
                  { icon: '📱', label: 'Daily updates' },
                  { icon: '🐾', label: 'Senior specialists' },
                ].map(item => (
                  <div
                    key={item.label}
                    className="bg-white/10 rounded-xl p-4 text-center border border-white/20"
                  >
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <div className="text-sm font-medium">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Suburb coverage ── */}
        <section className="bg-purple-50 py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex flex-wrap items-center gap-2 justify-center">
              <MapPin className="h-4 w-4 text-purple-600 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-700">Serving:</span>
              {SUNSHINE_COAST_SUBURBS.map(suburb => (
                <Badge
                  key={suburb}
                  variant="outline"
                  className="bg-white border-purple-200 text-purple-700 text-xs"
                >
                  {suburb}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why choose us ── */}
        <section className="py-16 md:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Why Sunshine Coast Pet Owners Trust Us With Their Senior Pets
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Senior and high-needs pets deserve specialist care. We vet every sitter for medical
                competency, emergency preparedness, and genuine compassion for older animals.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map(feature => (
                <Card key={feature.title} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="mb-3">{feature.icon}</div>
                    <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── Conditions we support ── */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Conditions & Needs We Support
                </h2>
                <p className="text-gray-600 mb-6">
                  Our sitters have experience with a wide range of age-related and medical conditions.
                  When you book, tell us exactly what your pet needs — we'll match you with the right carer.
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {CONDITIONS_WE_SUPPORT.map(condition => (
                    <div key={condition} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {condition}
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <Heart className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-purple-900 mb-1">For End-of-Life Care</h3>
                        <p className="text-sm text-purple-700">
                          We work with families navigating their pet's final chapter. Our sitters approach
                          palliative care with the gentleness and patience your pet deserves.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-blue-900 mb-1">Flexible Scheduling</h3>
                        <p className="text-sm text-blue-700">
                          Medication schedules, feeding times, and exercise routines — we work around
                          your pet's medical needs, not the other way around.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-green-900 mb-1">Vet Communication</h3>
                        <p className="text-sm text-green-700">
                          With your permission, our sitters can communicate directly with your vet
                          to report any changes in your pet's condition.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section className="py-16 md:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                What Sunshine Coast Families Say
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map(t => (
                <Card key={t.name} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex mb-3">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 text-sm mb-4 italic">"{t.quote}"</p>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-semibold text-sm">
                        {t.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{t.name}</p>
                        <p className="text-xs text-gray-500">{t.suburb}, Sunshine Coast</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="bg-gradient-to-r from-purple-700 to-purple-800 py-16 text-white text-center">
          <div className="max-w-2xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Your senior pet deserves the best care on the Sunshine Coast
            </h2>
            <p className="text-purple-100 mb-8">
              Find a vetted, medication-trained sitter near you. Book in minutes.
              Daily updates guaranteed.
            </p>
            <Button
              size="lg"
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold"
              onClick={() => navigate('/find-sitters')}
            >
              Find Your Senior Pet Specialist
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
