import { Link } from 'react-router-dom';
import SEOHead from '@/components/seo/SEOHead';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBlogPosts } from '@/hooks/useBlogPosts';

const fallbackImages: Record<string, string> = {
  'pet-care-sheet-guide': '/assets/blog-pet-care-sheet-hero.jpg',
  'profile-tips-stand-out': '/assets/blog-profile-tips-hero.jpg',
};

const localImagePool = [
  '/assets/auckland-pet-sitting-guide.jpg',
  '/assets/cat-sitting-tips.jpg',
  '/assets/choose-pet-sitter.jpg',
  '/assets/dog-sitting-vs-kennels.jpg',
  '/assets/blog-default.jpg',
];

const getTagClass = (tag: string) => {
  switch (tag) {
    case 'For Pet Owners':
      return 'bg-secondary text-secondary-foreground border border-border';
    case 'For Sitters':
      return 'bg-accent text-accent-foreground border border-border';
    case 'Pet Care Tips':
      return 'bg-muted text-foreground border border-border';
    case 'Auckland Guide':
      return 'bg-primary/10 text-primary border border-primary/20';
    default:
      return 'bg-muted text-muted-foreground border border-border';
  }
};

export default function Blog() {
  const { posts: blogPosts, loading } = useBlogPosts();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading articles...</p>
      </div>
    );
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'ZiggySitters Blog',
    description: "Pet care tips, advice, and guides from New Zealand's trusted pet sitting service",
    url: 'https://ziggysitters.com/blog',
    publisher: {
      '@type': 'Organization',
      name: 'ZiggySitters',
      logo: {
        '@type': 'ImageObject',
        url: 'https://ziggysitters.com/assets/logo.svg',
      },
    },
  };

  const imageUsage = new Map<string, number>();
  const postsWithResolvedImages = blogPosts.map((post, index) => {
    const preferredImage = fallbackImages[post.slug] || post.image || localImagePool[index % localImagePool.length];
    const seenCount = imageUsage.get(preferredImage) || 0;
    imageUsage.set(preferredImage, seenCount + 1);

    const fallbackImage = localImagePool[index % localImagePool.length];
    const cardImage = seenCount === 0 ? preferredImage : fallbackImage;

    return { post, cardImage, fallbackImage };
  });

  return (
    <>
      <SEOHead
        title="Pet Care Blog & Tips | ZiggySitters NZ"
        description="Expert pet care advice, tips, and guides from ZiggySitters. Learn about pet sitting in Auckland, choosing sitters, and keeping your pets happy."
        keywords="pet care blog, pet sitting tips, Auckland pet care, pet care advice, pet owner guides, dog sitting nz, cat sitting auckland"
        canonical="/blog"
        structuredData={structuredData}
      />

      <main className="min-h-screen bg-background">
        <section className="bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Pet Care Blog</h1>
              <p className="text-lg text-muted-foreground">
                Expert advice and local tips to help you care for your pets across New Zealand.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {postsWithResolvedImages.map(({ post, cardImage, fallbackImage }) => (
                  <Link key={post.slug} to={`/blog/${post.slug}`}>
                    <Card className="h-full overflow-hidden group border-border bg-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                      <div className="aspect-video relative overflow-hidden">
                        <img
                          src={cardImage}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = fallbackImage;
                          }}
                        />
                        <Badge className={`absolute top-3 left-3 ${getTagClass(post.tag)}`}>
                          {post.tag}
                        </Badge>
                      </div>
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <time dateTime={post.date}>
                            {new Date(post.date).toLocaleDateString('en-NZ', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </time>
                          <span>•</span>
                          <span>{post.readTime}</span>
                        </div>
                        <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-base line-clamp-3 mb-4">
                          {post.excerpt}
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
            <h2 className="text-3xl font-bold mb-4">Ready to Find a Pet Sitter?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Browse verified local sitters and book with confidence.
            </p>
            <Link
              to="/find-sitters"
              className="inline-flex items-center justify-center px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Find Pet Sitters Near You
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
