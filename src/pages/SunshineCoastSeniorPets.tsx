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
    icon: <Pill className="h-6 w-6" />,
    title: 'Medication management',
    description:
      "Oral meds, eye drops, insulin, subcutaneous fluids — your pet won't miss a dose. We document every administration in your daily report.",
  },
  {
    icon: <Activity className="h-6 w-6" />,
    title: "Matched to your pet's needs",
    description:
      "We pair senior pets with sitters who've handled their specific condition before — arthritis, diabetes, kidney disease, anxiety. No guesswork.",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'Vet-referred sitters',
    description:
      'Local Sunshine Coast vets send their clients to us. When your vet trusts someone with their own patients, that means something.',
  },
  {
    icon: <Phone className="h-6 w-6" />,
    title: 'Emergency plan included',
    description:
      "Every booking includes your vet's details, nearest emergency hospital, and a clear escalation process. No scrambling if something changes.",
  },
  {
    icon: <Camera className="h-6 w-6" />,
    title: 'Daily photo & video updates',
    description:
      'See exactly how your pet is doing — not a generic all-good text, but photos, notes on appetite, mood, medication times, and activity.',
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: 'Locals who know the coast',
    description:
      'Our sitters live here. They know the quiet walking tracks for stiff joints, the emergency vets open on weekends, and the best shady spots on hot days.',
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Jasper is 14 with bad hips. His sitter gives him his arthritis meds perfectly and sends us a photo every afternoon. First time we've actually relaxed on holiday.",
    name: 'Sarah T.',
    suburb: 'Buderim',
  },
  {
    quote:
      'Our vet recommended ZiggySitters for our diabetic cat. Twice-daily insulin injections, no dramas. Worth every cent for the peace of mind.',
    name: 'Michael K.',
    suburb: 'Maroochydore',
  },
  {
    quote:
      "Luna is 16 with hyperthyroidism. I was terrified to leave her. Our sitter even sent voice messages explaining how she was eating. Genuinely caring people.",
    name: 'Emma R.',
    suburb: 'Noosa',
  },
];

const CONDITIONS = [
  'Arthritis & joint pain',
  'Diabetes (insulin)',
  'Heart conditions',
  'Kidney disease (subcut fluids)',
  'Hyperthyroidism',
  'Post-surgical recovery',
  'Cognitive dysfunction',
  'Vision or hearing loss',
  'Mobility issues',
  'Anxiety & behavioural needs',
];

export default function SunshineCoastSeniorPets() {
  const navigate = useNavigate();

  return (
    <>
      <title>{SUNSHINE_COAST_META.title}</title>
      <meta name="description" content={SUNSHINE_COAST_META.description} />
      <meta name="keywords" content={SUNSHINE_COAST_META.keywords} />
      <meta property="og:title" content={SUNSHINE_COAST_META.title} />
      <meta property="og:description" content={SUNSHINE_COAST_META.description} />
      <meta property="og:type" content="website" />
      <link rel="canonical" href="https://ziggysitters.com/sunshine-coast" />

      <div className="min-h-screen bg-white">

        {/* ── Hero ── */}
        <section className="relative bg-[#f8faf8] border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                  <MapPin className="h-3.5 w-3.5" />
                  Sunshine Coast, Queensland
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold leading-[1.1] text-gray-900 mb-6 tracking-tight">
                  Your senior pet deserves<br className="hidden sm:block" />
                  <span className="text-emerald-600">someone who gets it.</span>
                </h1>
                <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                  Specialist sitters for older and medically complex pets. Medication admin, vet-referred carers, daily photo updates — trusted by families from Caloundra to Noosa.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <Button
                    size="lg"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm"
                    onClick={() => navigate('/find-sitters')}
                  >
                    Find a senior pet specialist
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    onClick={() => navigate('/how-it-works')}
                  >
                    How it works
                  </Button>
                </div>
              </div>

              {/* Trust signals grid */}
              <div className="grid grid-cols-2 gap-3 max-w-xs w-full">
                {[
                  { icon: <Pill className="h-5 w-5 text-emerald-600" />, label: 'Medication trained' },
                  { icon: <Shield className="h-5 w-5 text-emerald-600" />, label: 'Vet-referred' },
                  { icon: <Camera className="h-5 w-5 text-emerald-600" />, label: 'Daily updates' },
                  { icon: <Heart className="h-5 w-5 text-emerald-600" />, label: 'Senior specialists' },
                ].map(item => (
                  <div
                    key={item.label}
                    className="bg-white rounded-xl p-4 text-center border border-gray-200 shadow-sm"
                  >
                    <div className="flex justify-center mb-2">{item.icon}</div>
                    <div className="text-sm font-medium text-gray-700">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Suburb strip ── */}
        <section className="bg-white py-6 border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex flex-wrap items-center gap-2 justify-center">
              <span className="text-sm font-medium text-gray-500 mr-1">Serving</span>
              {SUNSHINE_COAST_SUBURBS.map(suburb => (
                <Badge
                  key={suburb}
                  variant="outline"
                  className="bg-gray-50 border-gray-200 text-gray-600 text-xs font-normal"
                >
                  {suburb}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why us ── */}
        <section className="py-20 md:py-24 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                Built for pets who need more than a walk and a pat.
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto text-lg">
                Every sitter is vetted for medical competency, emergency preparedness, and genuine care for older animals.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {FEATURES.map(feature => (
                <div key={feature.title} className="group">
                  <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-lg">{feature.title}</h3>
                  <p className="text-[15px] text-gray-500 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Conditions ── */}
        <section className="bg-[#fafbfa] py-20 border-y border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid md:grid-cols-2 gap-16 items-start">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                  Conditions we handle every week.
                </h2>
                <p className="text-gray-500 mb-8 text-lg leading-relaxed">
                  Tell us what your pet needs. We'll match you with a sitter who's done it before — not someone learning on the job.
                </p>
                <div className="grid grid-cols-1 gap-3">
                  {CONDITIONS.map(condition => (
                    <div key={condition} className="flex items-center gap-3 text-[15px] text-gray-700">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      {condition}
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center">
                        <Heart className="h-5 w-5 text-rose-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">End-of-life care</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                          We work with families through their pet's final chapter. Our sitters bring the gentleness and patience this time requires.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Your pet's schedule, not ours</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                          Meds at 7am and 6pm? Dinner at 4:30? Short walk but no stairs? We work around your pet's routine exactly as you set it.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Direct vet communication</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                          With your permission, our sitters contact your vet directly if anything changes. No delays, no confusion.
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
        <section className="py-20 md:py-24 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                From Sunshine Coast pet owners.
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {TESTIMONIALS.map(t => (
                <Card key={t.name} className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-gray-600 text-[15px] mb-6 leading-relaxed">"{t.quote}"</p>
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                      <div className="h-9 w-9 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 font-semibold text-sm">
                        {t.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{t.name}</p>
                        <p className="text-xs text-gray-400">{t.suburb}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="bg-gray-900 py-20 text-center">
          <div className="max-w-2xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              They can't tell you they'll be okay.<br />
              <span className="text-emerald-400">But we can show you they are.</span>
            </h2>
            <p className="text-gray-400 mb-8 text-lg">
              Daily photo updates. Medication logs. A sitter who's done this before.
            </p>
            <Button
              size="lg"
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg"
              onClick={() => navigate('/find-sitters')}
            >
              Find your pet's sitter
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
