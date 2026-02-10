/**
 * Post-build script: generates static HTML files for each blog post
 * so that search engines can see meta tags + content without JavaScript.
 * 
 * Run after `vite build`: npx tsx generate-blog-html.ts
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Import blog data
import { blogPosts } from './src/data/blogPosts';

const DIST = path.resolve(__dirname, 'dist');
const INDEX_HTML = fs.readFileSync(path.join(DIST, 'index.html'), 'utf-8');

function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function generateBlogPageHtml(post: typeof blogPosts[0]): string {
  const title = `${post.title} | ZiggySitters Blog`;
  const description = post.metaDescription || post.excerpt;
  const canonical = `https://ziggysitters.com/blog/${post.slug}`;
  const plainContent = stripHtmlTags(post.content).substring(0, 5000);

  // Replace the default title and meta tags
  let html = INDEX_HTML;
  
  // Replace title
  html = html.replace(
    /<title>.*?<\/title>/,
    `<title>${title}</title>`
  );
  
  // Replace meta description
  html = html.replace(
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${description.replace(/"/g, '&quot;')}" />`
  );

  // Replace OG tags
  html = html.replace(
    /<meta property="og:title" content="[^"]*" \/>/,
    `<meta property="og:title" content="${title.replace(/"/g, '&quot;')}" />`
  );
  html = html.replace(
    /<meta property="og:description" content="[^"]*" \/>/,
    `<meta property="og:description" content="${description.replace(/"/g, '&quot;')}" />`
  );
  html = html.replace(
    /<meta property="og:type" content="[^"]*" \/>/,
    `<meta property="og:type" content="article" />`
  );

  // Add canonical link
  html = html.replace(
    '</head>',
    `  <link rel="canonical" href="${canonical}" />\n  </head>`
  );

  // Add structured data for article
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": description,
    "datePublished": post.date,
    "author": {
      "@type": "Organization",
      "name": "ZiggySitters"
    },
    "publisher": {
      "@type": "Organization",
      "name": "ZiggySitters",
      "url": "https://ziggysitters.com"
    },
    "image": post.image,
    "url": canonical
  };

  html = html.replace(
    '</head>',
    `  <script type="application/ld+json">${JSON.stringify(structuredData)}</script>\n  </head>`
  );

  // Add noscript content with blog text for crawlers
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root"></div>
    <noscript>
      <article>
        <h1>${post.title}</h1>
        <p><em>${post.date} · ${post.readTime} · ${post.author}</em></p>
        <p>${description}</p>
        ${post.content}
      </article>
    </noscript>`
  );

  return html;
}

function generateBlogIndexHtml(): string {
  const title = 'Pet Care Blog - Tips, Guides & Advice | ZiggySitters';
  const description = 'Expert pet care tips, guides and advice for New Zealand pet owners. Learn about pet sitting, dog walking, cat care and more from ZiggySitters.';
  
  let html = INDEX_HTML;
  
  html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
  html = html.replace(
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${description}" />`
  );
  html = html.replace('</head>', `  <link rel="canonical" href="https://ziggysitters.com/blog" />\n  </head>`);

  // Add noscript blog listing for crawlers
  const blogList = blogPosts.map(p => 
    `<li><a href="/blog/${p.slug}">${p.title}</a> - ${p.excerpt}</li>`
  ).join('\n');

  html = html.replace(
    '<div id="root"></div>',
    `<div id="root"></div>
    <noscript>
      <h1>ZiggySitters Blog</h1>
      <ul>${blogList}</ul>
    </noscript>`
  );

  return html;
}

// Main
console.log('Generating static blog HTML files...');

// Create blog directory
const blogDir = path.join(DIST, 'blog');
fs.mkdirSync(blogDir, { recursive: true });

// Generate blog index
fs.writeFileSync(path.join(blogDir, 'index.html'), generateBlogIndexHtml());
console.log('  ✅ /blog/index.html');

// Generate each blog post
let count = 0;
for (const post of blogPosts) {
  const postDir = path.join(blogDir, post.slug);
  fs.mkdirSync(postDir, { recursive: true });
  fs.writeFileSync(path.join(postDir, 'index.html'), generateBlogPageHtml(post));
  count++;
}
console.log(`  ✅ ${count} blog post pages generated`);
console.log('Done! Blog posts now have static HTML for SEO crawlers.');
