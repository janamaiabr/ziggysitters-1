import { Link } from 'react-router-dom';
import SEOHead from '@/components/seo/SEOHead';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, ArrowRight } from 'lucide-react';
import blogHeroImage from '@/assets/blog-pet-care-sheet-hero.jpg';

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  image: string;
  readTime: string;
}

const blogPosts: BlogPost[] = [
  {
    slug: 'pet-care-sheet-guide',
    title: 'Your Pet Care Sheet — The Small Step That Makes a Big Difference',
    excerpt: 'What makes the difference for your pet from a good sit to a great one - good information about their needs. Learn how to create a care sheet that helps your sitter provide the best care.',
    date: '2025-11-16',
    author: 'Jana and Rachel',
    image: blogHeroImage,
    readTime: '4 min read'
  }
];

export default function Blog() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "ZiggySitters Blog",
    "description": "Pet care tips, advice, and guides from Auckland's trusted pet sitting service",
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

  return (
    <>
      <SEOHead
        title="Pet Care Blog & Tips"
        description="Expert pet care advice, tips, and guides from ZiggySitters. Learn how to provide the best care for your pets in Auckland."
        keywords="pet care blog, pet sitting tips, Auckland pet care, pet care advice, pet owner guides"
        canonical="/blog"
        structuredData={structuredData}
      />
      
      <main className="min-h-screen bg-background">
        <section className="bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Pet Care Blog</h1>
              <p className="text-lg text-muted-foreground">
                Expert advice and tips to help you provide the best care for your beloved pets
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid gap-8">
                {blogPosts.map((post) => (
                  <Link key={post.slug} to={`/blog/${post.slug}`}>
                    <Card className="hover:shadow-lg transition-shadow overflow-hidden group">
                      <div className="md:flex">
                        <div className="md:w-2/5">
                          <div className="aspect-video md:aspect-square relative overflow-hidden">
                            <img
                              src={post.image}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        </div>
                        <div className="md:w-3/5">
                          <CardHeader>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <time dateTime={post.date}>
                                  {new Date(post.date).toLocaleDateString('en-NZ', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </time>
                              </div>
                              <span>•</span>
                              <span>{post.readTime}</span>
                            </div>
                            <CardTitle className="text-2xl mb-2 group-hover:text-primary transition-colors">
                              {post.title}
                            </CardTitle>
                            <CardDescription className="text-base">
                              {post.excerpt}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center text-sm text-primary font-medium group-hover:gap-2 transition-all">
                              Read more
                              <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </CardContent>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
