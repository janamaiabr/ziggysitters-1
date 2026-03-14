import { useParams, Link } from 'react-router-dom';
import SEOHead from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, User, ArrowRight } from 'lucide-react';
import { useBlogPosts } from '@/hooks/useBlogPosts';

// Legacy content for original posts (keeping JSX format)
const legacyContent: Record<string, JSX.Element> = {
  'profile-tips-stand-out': (
    <>
      <p className="text-lg text-muted-foreground mb-8">
        Your profile is your first impression, and a great one does most of the work for you. We asked some of our most successful pet sitters how to stand out from the crowd. Here are their top three tips for creating a profile that really shines:
      </p>

      <h2 className="text-2xl font-bold mt-12 mb-6">1. Show who you are, not just what you do</h2>
      <p className="mb-6">
        Pet parents want to feel a connection. Share a little of your personality — why you love pet sitting, the kind of animals you click with, or a sweet story from a past sit. Being authentic builds trust faster than anything else.
      </p>

      <h2 className="text-2xl font-bold mt-12 mb-6">2. Use photos that feel warm and real</h2>
      <p className="mb-6">
        Skip the stiff selfies. Choose photos of you genuinely interacting with pets: a cuddle, a walk, a playful moment. These images tell owners instantly, "My pet will be safe with you."
      </p>

      <h2 className="text-2xl font-bold mt-12 mb-6">3. Be specific about your skills</h2>
      <p className="mb-6">
        Instead of saying "experienced," say what you're experienced in: giving medication, handling reactive dogs, caring for senior pets, or managing multi-pet households. Specifics help owners imagine you in their home.
      </p>

      <div className="bg-destructive/10 border-l-4 border-destructive p-6 my-8 rounded-r">
        <h3 className="font-semibold mb-3">Three no-nos:</h3>
        <p className="mb-0">
          Don't lie, don't exaggerate and don't mention names or details of past clients unless you have their consent.
        </p>
      </div>

      <p className="mb-6">
        And finally, just be you. A standout profile isn't about selling - it's about reassuring. Make every word feel like a handshake.
      </p>

      <p className="text-muted-foreground italic mt-8">
        Thank you.<br />
        Jana and Rachel<br />
        Team ZiggySitters
      </p>
    </>
  ),
  'pet-care-sheet-guide': (
    <>
      <p className="text-lg text-muted-foreground mb-8">
        What makes the difference for your pet from a good sit to a great one - good information about their needs. A great sitter can follow instructions — but only you can tell them what really makes your pet your pet.
      </p>
      
      <p className="mb-6">
        A care sheet removes guesswork, builds trust, and helps everyone relax more. (There's a template in our resources section to help you.)
      </p>

      <h2 className="text-2xl font-bold mt-12 mb-6">1. Start with the "essentials only you know"</h2>
      <p className="mb-6">
        Every Auckland pet has quirks — maybe your dog gets spooked by e-scooters on K Road, or your cat bolts under the bed when it rains. Share the things that matter day-to-day: feeding routine, favourite hiding spots, walking triggers, or how they like to be approached. These details help your sitter step into your pet's world with confidence.
      </p>

      <h2 className="text-2xl font-bold mt-12 mb-6">2. Be clear about health needs</h2>
      <p className="mb-6">
        If your pet takes medication, has allergies (hello, grass pollen season), or needs special handling, spell it out. Include doses, timing, and what "normal" looks like for your pet. It keeps them safe and keeps you worry-free.
      </p>

      <h2 className="text-2xl font-bold mt-12 mb-6">3. List your house rules — kindly and clearly</h2>
      <p className="mb-6">
        Are there rooms off-limits? Treats that are okay or off the table? Favourite spots on the couch that are claimed? Let your sitter know so they can honour your home and your pet's routine.
      </p>

      <h2 className="text-2xl font-bold mt-12 mb-6">4. Add a personal touch</h2>
      <p className="mb-6">
        What makes your pet smile? A specific squeaky toy? The word "walkies"? A spot behind the ears? These moments of joy are what a sitter can recreate — if you tell them.
      </p>

      <div className="bg-primary/10 border-l-4 border-primary p-6 my-8 rounded-r">
        <h3 className="font-semibold mb-3">💡 Pro tip:</h3>
        <p className="mb-0">
          Leave one extra set of instructions for emergencies — your vet's details, backup contacts, and anything your sitter should know "just in case."
        </p>
      </div>

      <p className="mb-6">
        A care sheet isn't about being controlling — it's about giving your sitter the tools to give your pet the love they're used to. And that's peace of mind for everyone.
      </p>

      <p className="text-muted-foreground italic mt-8">
        Thank you.<br />
        Jana and Rachel<br />
        Team ZiggySitters
      </p>
    </>
  )
};

// Fallback images
const fallbackImages: Record<string, string> = {
  'pet-care-sheet-guide': '/assets/blog-pet-care-sheet-hero.jpg',
  'profile-tips-stand-out': '/assets/blog-profile-tips-hero.jpg',
};

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { posts: allPosts, loading, getPostBySlug } = useBlogPosts();
  const post = slug ? getPostBySlug(slug) : null;
  
  // Get related posts (same tag, excluding current)
  const relatedPosts = post 
    ? allPosts.filter(p => p.tag === post.tag && p.slug !== post.slug).slice(0, 2)
    : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Post not found</h1>
          <Link to="/blog">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to blog
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.metaDescription || post.excerpt,
    "image": fallbackImages[post.slug] || post.image,
    "datePublished": post.date,
    "author": {
      "@type": "Person",
      "name": post.author
    },
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
        title={post.title}
        description={post.metaDescription || post.excerpt}
        keywords={post.keywords?.join(', ') || ''}
        canonical={post.slug ? `/blog/${post.slug}` : "/blog"}
        structuredData={structuredData}
      />

      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4 py-8">
            <Link to="/blog">
              <Button variant="ghost" className="mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to blog
              </Button>
            </Link>

            <div className="max-w-3xl mx-auto">
              <Badge className={`mb-4 ${getTagColor(post.tag)}`}>
                {post.tag}
              </Badge>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-8">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-2">
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
            </div>
          </div>
        </section>

        {/* Featured Image */}
        <section className="container mx-auto px-4 -mt-4">
          <div className="max-w-4xl mx-auto">
            <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
              <img
                src={fallbackImages[post.slug] || post.image || '/assets/blog-default.jpg'}
                alt={post.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/blog-default.jpg';
                }}
              />
            </div>
          </div>
        </section>

        {/* Content */}
        <article className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto prose prose-lg">
            {/* Render legacy JSX content for old posts, or HTML content for new posts */}
            {legacyContent[post.slug] ? (
              legacyContent[post.slug]
            ) : (
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            )}
          </div>
        </article>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="bg-primary text-primary-foreground rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Find Your Perfect Pet Sitter</h2>
              <p className="mb-6 opacity-90">
                Browse verified pet sitters in Auckland and across New Zealand. All sitters are reviewed by real pet owners.
              </p>
              <Link to="/find-sitters">
                <Button variant="secondary" size="lg">
                  Find Pet Sitters
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="container mx-auto px-4 py-12 border-t">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-8">Related Articles</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Link key={relatedPost.slug} to={`/blog/${relatedPost.slug}`}>
                    <div className="group border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={fallbackImages[relatedPost.slug] || relatedPost.image || '/assets/blog-default.jpg'}
                          alt={relatedPost.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/blog-default.jpg';
                          }}
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
                          {relatedPost.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-2">{relatedPost.readTime}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
