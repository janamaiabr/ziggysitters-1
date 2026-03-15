import { Link } from 'react-router-dom';
import SEOHead from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { petCareTips } from '@/data/petCareTips';

const localImagePool = [
  '/assets/auckland-pet-sitting-guide.jpg',
  '/assets/cat-sitting-tips.jpg',
  '/assets/choose-pet-sitter.jpg',
  '/assets/dog-sitting-vs-kennels.jpg',
  '/assets/blog-default.jpg',
];

export default function PetCareTips() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'ZiggySitters Pet Care Tips',
    description: 'NZ-focused pet care advice and tips from trusted local pet sitters',
    url: 'https://ziggysitters.com/pet-care-tips',
    publisher: {
      '@type': 'Organization',
      name: 'ZiggySitters',
    },
  };

  const imageUsage = new Map<string, number>();
  const tipsWithResolvedImages = petCareTips.map((tip, index) => {
    const preferredImage = tip.image || localImagePool[index % localImagePool.length];
    const seenCount = imageUsage.get(preferredImage) || 0;
    imageUsage.set(preferredImage, seenCount + 1);

    const fallbackImage = localImagePool[index % localImagePool.length];
    const cardImage = seenCount === 0 ? preferredImage : fallbackImage;

    return { tip, cardImage, fallbackImage };
  });

  return (
    <>
      <SEOHead
        title="Pet Care Tips NZ | Expert Advice from Local Sitters | ZiggySitters"
        description="NZ-focused pet care advice from trusted local sitters. Tips on keeping your pets happy, healthy, and safe in New Zealand."
        keywords="pet care tips nz, dog care new zealand, cat care tips, pet health nz, pet safety tips, pet owner advice nz"
        canonical="/pet-care-tips"
        structuredData={structuredData}
      />

      <main className="min-h-screen bg-background">
        <section className="bg-gradient-to-b from-accent/30 to-background py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <Badge className="mb-4 bg-secondary text-secondary-foreground border border-border px-4 py-2">
                NZ Pet Care
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Pet Care Tips</h1>
              <p className="text-lg text-muted-foreground">
                Expert advice from local NZ sitters to keep your pets happy, healthy, and safe.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {tipsWithResolvedImages.map(({ tip, cardImage, fallbackImage }) => (
                  <Link key={tip.slug} to={`/blog/${tip.slug}`}>
                    <Card className="h-full overflow-hidden group border-border bg-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                      <div className="aspect-video relative overflow-hidden">
                        <img
                          src={cardImage}
                          alt={tip.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = fallbackImage;
                          }}
                        />
                        <Badge className="absolute top-3 left-3 bg-muted text-foreground border border-border">
                          Pet Care Tips
                        </Badge>
                      </div>
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <time dateTime={tip.date}>
                            {new Date(tip.date).toLocaleDateString('en-NZ', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </time>
                          <span>•</span>
                          <span>{tip.readTime}</span>
                        </div>
                        <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">
                          {tip.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-base line-clamp-3 mb-4">
                          {tip.excerpt}
                        </CardDescription>
                        <div className="text-sm text-primary font-medium">Read article</div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Need a Trusted Pet Sitter?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Find a verified local sitter who matches your pet's needs.
            </p>
            <Link to="/find-sitters">
              <Button size="lg">Find Pet Sitters Near You</Button>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
