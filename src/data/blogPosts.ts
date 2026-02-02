// Blog posts data - centralized for easier management
// Add new posts here and they'll appear on the blog

export interface BlogPostData {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  image: string;
  readTime: string;
  tag: 'For Pet Owners' | 'For Sitters' | 'Pet Care Tips' | 'Auckland Guide';
  metaDescription: string;
  keywords: string[];
  content: string; // HTML content
}

export const blogPosts: BlogPostData[] = [
  // New SEO blog posts - February 2026
  {
    slug: 'how-to-become-top-rated-pet-sitter',
    title: 'How to Become a Top-Rated Pet Sitter in New Zealand: Your Complete Guide',
    excerpt: 'Want to turn your love for animals into a rewarding career? Learn how to become a top-rated pet sitter in NZ, from building your profile to earning five-star reviews.',
    date: '2026-02-02',
    author: 'ZiggySitters Team',
    image: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=1200&h=630&fit=crop',
    readTime: '9 min read',
    tag: 'For Sitters',
    metaDescription: 'Comprehensive guide to becoming a top-rated pet sitter in New Zealand. Learn skills, build your profile, earn trust, and start your pet sitting career today.',
    keywords: ['become pet sitter', 'pet sitting career nz', 'how to start pet sitting', 'top pet sitter tips', 'pet sitter training nz'],
    content: `
      <p class="text-lg text-muted-foreground mb-8">
        Pet sitting isn't just a job — it's a calling for animal lovers who want to make a difference in pets' lives while earning a flexible income. If you're passionate about animals and want to build a successful pet sitting career in New Zealand, this comprehensive guide will walk you through every step.
      </p>

      <div class="bg-primary/10 border-l-4 border-primary p-6 my-8 rounded-r">
        <h3 class="font-semibold mb-3">Ready to start your pet sitting journey?</h3>
        <p class="mb-4">
          Join ZiggySitters and connect with pet owners across New Zealand. Start building your profile and turning your passion into a rewarding career.
        </p>
        <p class="mb-0 font-medium">
          <a href="/become-sitter" class="text-primary underline">Become a Sitter →</a>
        </p>
      </div>
    `
  },
  {
    slug: 'how-to-choose-pet-sitter-nz-buyer-guide',
    title: 'The Ultimate Guide to Choosing the Right Pet Sitter in New Zealand',
    excerpt: 'Not all pet sitters are created equal. Learn the insider tips for finding a trustworthy, loving pet sitter who will care for your furry family member like their own.',
    date: '2026-02-02',
    author: 'ZiggySitters Team',
    image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=1200&h=630&fit=crop',
    readTime: '8 min read',
    tag: 'For Pet Owners',
    metaDescription: 'Comprehensive guide to choosing the perfect pet sitter in New Zealand. Discover what to look for, questions to ask, and how to find a trusted sitter.',
    keywords: ['choose pet sitter', 'pet sitter guide', 'how to find pet sitter', 'trusted pet sitter nz', 'pet sitting tips'],
    content: `
      <p class="text-lg text-muted-foreground mb-8">
        Choosing a pet sitter is one of the most important decisions you'll make as a pet owner. Your furry friend isn't just an animal — they're family. And finding someone who understands that can make all the difference between a stressful experience and a peaceful time away.
      </p>

      <div class="bg-primary/10 border-l-4 border-primary p-6 my-8 rounded-r">
        <h3 class="font-semibold mb-3">Find your perfect pet sitter today</h3>
        <p class="mb-4">
          Browse verified sitters on ZiggySitters. Every profile is checked, every sitter is reviewed by real pet owners.
        </p>
        <p class="mb-0 font-medium">
          <a href="/find-sitters" class="text-primary underline">Find a Sitter Near You →</a>
        </p>
      </div>
    `
  },
  {
    slug: 'ultimate-guide-pet-sitting-auckland',
    title: 'The Ultimate Guide to Pet Sitting in Auckland (2026)',
    excerpt: 'Everything you need to know about finding reliable pet sitting services in Auckland - from choosing the right sitter to understanding costs and what to expect.',
    date: '2026-01-15',
    author: 'ZiggySitters Team',
    image: '/assets/auckland-pet-sitting-guide.jpg',
    readTime: '10 min read',
    tag: 'Auckland Guide',
    metaDescription: 'Complete guide to pet sitting in Auckland. Find trusted pet sitters, understand pricing, and learn what to expect from professional pet sitting services in NZ.',
    keywords: ['pet sitting auckland', 'auckland pet sitter', 'pet care auckland', 'dog sitting auckland', 'cat sitting nz'],
    content: `
      <p class="text-lg text-muted-foreground mb-8">
        Auckland pet owners have more options than ever for quality pet care. Whether you need overnight stays, daily visits, or extended care while you're away, this guide covers everything you need to know.
      </p>
      
      <h2 class="text-2xl font-bold mt-12 mb-6">Why Choose Professional Pet Sitting?</h2>
      <p class="mb-6">
        Professional pet sitters offer personalized care in your home or theirs, reducing stress for your pets compared to traditional kennels.
      </p>

      <div class="bg-primary/10 border-l-4 border-primary p-6 my-8 rounded-r">
        <h3 class="font-semibold mb-3">Find Auckland Pet Sitters</h3>
        <p class="mb-4">Browse verified pet sitters across all Auckland suburbs.</p>
        <p class="mb-0 font-medium">
          <a href="/find-sitters" class="text-primary underline">Search Now →</a>
        </p>
      </div>
    `
  },
  {
    slug: 'profile-tips-stand-out',
    title: '3 Tips to Make Your Pet Sitter Profile Stand Out',
    excerpt: 'Your profile is your first impression. Learn how top-rated pet sitters create profiles that build trust and attract more bookings.',
    date: '2026-01-10',
    author: 'ZiggySitters Team',
    image: '/assets/blog-profile-tips-hero.jpg',
    readTime: '5 min read',
    tag: 'For Sitters',
    metaDescription: 'Learn how to create a standout pet sitter profile that attracts more bookings. Tips from top-rated NZ pet sitters.',
    keywords: ['pet sitter profile', 'pet sitting tips', 'pet sitter marketing', 'get more bookings'],
    content: '' // Uses legacy JSX content
  },
  {
    slug: 'pet-care-sheet-guide',
    title: 'How to Create the Perfect Pet Care Sheet',
    excerpt: 'A comprehensive care sheet makes all the difference. Learn what to include so your sitter can give your pet the care they deserve.',
    date: '2026-01-05',
    author: 'ZiggySitters Team',
    image: '/assets/blog-pet-care-sheet-hero.jpg',
    readTime: '6 min read',
    tag: 'For Pet Owners',
    metaDescription: 'Create the perfect pet care sheet for your sitter. Include feeding schedules, medical needs, and all the details your pet sitter needs.',
    keywords: ['pet care sheet', 'pet instructions', 'pet sitter instructions', 'pet care guide'],
    content: '' // Uses legacy JSX content
  }
];

// Helper functions
export function getAllPosts(): BlogPostData[] {
  return blogPosts;
}

export function getPostBySlug(slug: string): BlogPostData | undefined {
  return blogPosts.find(post => post.slug === slug);
}
