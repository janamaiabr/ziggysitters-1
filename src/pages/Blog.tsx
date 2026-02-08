import { Link } from 'react-router-dom';
import SEOHead from '@/components/seo/SEOHead';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, ArrowRight } from 'lucide-react';
import { useBlogPosts } from '@/hooks/useBlogPosts';

// Fallback images for posts without uploaded images
const fallbackImages: Record<string, string> = {
  'pet-care-sheet-guide': '/assets/blog-pet-care-sheet-hero.jpg',
  'profile-tips-stand-out': '/assets/blog-profile-tips-hero.jpg',
};

export default function Blog() {
  const { posts: blogPosts, loading } = useBlogPosts();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading articles...</p>
      </div>
    );
  }
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "ZiggySitters Blog",
    "description": "Pet care tips, advice, and guides from New Zealand's trusted pet sitting service",
    "url": "https://ziggysitters.com/blog",
    "publisher": {
      "@type": "Organization",
      "name": "ZiggySitters",
      "logo": {
        "@type": "ImageObject",
        "url": "https://ziggysitters.com/assets/logo.svg"
      }
    }
  };

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'For Pet Owners': return 'bg-blue-100 text-blue-800';
      case 'For Sitters': return 'bg-green-100 text-green-800';
      case 'Pet Care Tips': return 'bg-purple-100 text-purple-800';
      case 'Auckland Guide': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
                Expert advice and tips to help you provide the best care for your beloved pets in New Zealand
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {blogPosts.map((post) => (
                  <Link key={post.slug} to={`/blog/${post.slug}`}>
                    <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden group">
                      <div className="aspect-video relative overflow-hidden">
                        <img
                          src={fallbackImages[post.slug] || post.image || '/assets/blog-default.jpg'}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/blog-default.jpg';
                          }}
                        />
                        <Badge 
                          className={`absolute top-3 left-3 ${getTagColor(post.tag)}`}
                        >
                          {post.tag}
                        </Badge>
                      </div>
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Calendar className="h-4 w-4" />
                          <time dateTime={post.date}>
                            {new Date(post.date).toLocaleDateString('en-NZ', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
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
                        <div className="flex items-center text-sm text-primary font-medium group-hover:gap-2 transition-all">
                          Read more
                          <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Find a Pet Sitter?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Browse verified pet sitters in Auckland and across New Zealand. All sitters are reviewed by real pet owners.
            </p>
            <Link 
              to="/find-sitters"
              className="inline-flex items-center justify-center px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Find Pet Sitters Near You
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
