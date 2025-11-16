import { useParams, Link } from 'react-router-dom';
import SEOHead from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import blogHeroImage from '@/assets/blog-pet-care-sheet-hero.jpg';
import profileTipsHero from '@/assets/blog-profile-tips-hero.jpg';

interface BlogPostData {
  slug: string;
  title: string;
  content: JSX.Element;
  excerpt: string;
  date: string;
  author: string;
  image: string;
  readTime: string;
  tag: 'For Pet Owners' | 'For Sitters';
}

const blogPosts: Record<string, BlogPostData> = {
  'profile-tips-stand-out': {
    slug: 'profile-tips-stand-out',
    title: 'Get Spotted — 3 Tips To Make Your Profile Stand Out',
    excerpt: 'Your profile is your first impression, and a great one does most of the work for you. Learn from our most successful pet sitters how to create a profile that really shines.',
    date: '2025-11-16',
    author: 'Jana and Rachel',
    image: profileTipsHero,
    readTime: '3 min read',
    tag: 'For Sitters',
    content: (
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
    )
  },
  'pet-care-sheet-guide': {
    slug: 'pet-care-sheet-guide',
    title: 'Your Pet Care Sheet — The Small Step That Makes a Big Difference',
    excerpt: 'What makes the difference for your pet from a good sit to a great one - good information about their needs. Learn how to create a care sheet that helps your sitter provide the best care.',
    date: '2025-11-16',
    author: 'Jana and Rachel',
    image: blogHeroImage,
    readTime: '4 min read',
    tag: 'For Pet Owners',
    content: (
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
          Whether it's "no couch time," "treats only after walks," or "keep the front gate double-latched," our sitters appreciate clarity. You're not being picky; you're keeping your pet's routine steady and your home running smoothly.
        </p>

        <h2 className="text-2xl font-bold mt-12 mb-6">4. Add emergency contacts (just in case)</h2>
        <p className="mb-6">
          Include your vet, a trusted local friend, and how you prefer the sitter to contact you. Most sitters never need this info — but having it there creates instant peace of mind for everyone.
        </p>

        <div className="bg-primary/5 border-l-4 border-primary p-6 my-8 rounded-r">
          <p className="font-medium">
            Simple is best. A care sheet is not a manual. It's a friendly guide that helps your sitter love your pet the way you do. Feel free to use our template in the Resources section to get you started.
          </p>
        </div>

        <p className="text-muted-foreground italic mt-8">
          Thank you.<br />
          Jana and Rachel<br />
          Team ZiggySitters
        </p>
      </>
    )
  }
};

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? blogPosts[slug] : null;

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
          <Link to="/blog">
            <Button variant="default">Back to Blog</Button>
          </Link>
        </div>
      </div>
    );
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "image": `https://ziggysitters.com${post.image}`,
    "datePublished": post.date,
    "dateModified": post.date,
    "author": {
      "@type": "Organization",
      "name": post.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "ZiggySitters",
      "logo": {
        "@type": "ImageObject",
        "url": "https://ziggysitters.com/assets/logo.svg"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://ziggysitters.com/blog/${post.slug}`
    },
    "articleBody": post.excerpt,
    "keywords": "pet care sheet, pet sitting tips, pet care guide, Auckland pet care, pet sitter instructions"
  };

  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://ziggysitters.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": "https://ziggysitters.com/blog"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": post.title,
        "item": `https://ziggysitters.com/blog/${post.slug}`
      }
    ]
  };

  return (
    <>
      <SEOHead
        title={post.title}
        description={post.excerpt}
        keywords="pet care sheet, pet sitting guide, pet sitter instructions, Auckland pet care, pet care tips, pet owner guide"
        canonical={`/blog/${post.slug}`}
        ogImage={post.image}
        ogType="article"
        structuredData={[structuredData, breadcrumbStructuredData]}
      />

      <article className="min-h-screen bg-background">
        {/* Breadcrumb Navigation */}
        <nav className="bg-muted/30 py-3 border-b">
          <div className="container mx-auto px-4">
            <ol className="flex items-center gap-2 text-sm" itemScope itemType="https://schema.org/BreadcrumbList">
              <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                <Link to="/" className="text-muted-foreground hover:text-foreground" itemProp="item">
                  <span itemProp="name">Home</span>
                </Link>
                <meta itemProp="position" content="1" />
              </li>
              <span className="text-muted-foreground">/</span>
              <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                <Link to="/blog" className="text-muted-foreground hover:text-foreground" itemProp="item">
                  <span itemProp="name">Blog</span>
                </Link>
                <meta itemProp="position" content="2" />
              </li>
              <span className="text-muted-foreground">/</span>
              <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                <span className="text-foreground" itemProp="name">{post.title}</span>
                <meta itemProp="position" content="3" />
              </li>
            </ol>
          </div>
        </nav>

        {/* Hero Section */}
        <header className="relative">
          <div className="aspect-[21/9] md:aspect-[21/6] w-full overflow-hidden bg-muted">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        </header>

        {/* Article Content */}
        <main className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-3xl mx-auto">
            <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>

            <header className="mb-12">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                {post.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{post.author}</span>
                </div>
                <span>•</span>
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
                <span>•</span>
                <Badge variant="secondary" className="font-normal">
                  {post.tag}
                </Badge>
              </div>
            </header>

            <div className="prose prose-lg max-w-none">
              {post.content}
            </div>

            {/* Call to Action */}
            <section className="mt-16 p-8 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
              <h2 className="text-2xl font-bold mb-4">Ready to find the perfect sitter for your pet?</h2>
              <p className="text-muted-foreground mb-6">
                Browse our verified sitters in Auckland and book with confidence knowing your pet will receive excellent care with daily updates.
              </p>
              <Link to="/find-sitters">
                <Button size="lg">Find Sitters Near You</Button>
              </Link>
            </section>
          </div>
        </main>
      </article>
    </>
  );
}
