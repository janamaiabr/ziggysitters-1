#!/usr/bin/env node
/**
 * Regenerate static blog SEO HTML files from public/blog-posts.json
 * Run: node regenerate-blog-seo.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE = { domain: 'https://ziggysitters.com', name: 'ZiggySitters', gaId: 'G-H9K8JN5BB9', locale: 'en_NZ' };

function stripHtml(html) { return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 300); }

function gen(post) {
  const url = `${SITE.domain}/blog/${post.slug}`;
  const desc = (post.metaDescription || post.excerpt || '').replace(/"/g, '&quot;');
  const img = post.image || '';
  const schema = JSON.stringify({"@context":"https://schema.org","@type":"BlogPosting","headline":post.title,"description":desc,"image":img,"author":{"@type":"Person","name":post.author||SITE.name},"publisher":{"@type":"Organization","name":SITE.name,"url":SITE.domain},"datePublished":post.date||'',"url":url,"mainEntityOfPage":url});
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script async src="https://www.googletagmanager.com/gtag/js?id=${SITE.gaId}"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${SITE.gaId}');</script>
  <title>${post.title} | ${SITE.name}</title>
  <meta name="description" content="${desc}" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${url}" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${url}" />
  <meta property="og:title" content="${post.title}" />
  <meta property="og:description" content="${desc}" />
  <meta property="og:image" content="${img}" />
  <meta property="og:site_name" content="${SITE.name}" />
  <meta property="og:locale" content="${SITE.locale}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${post.title}" />
  <meta name="twitter:description" content="${desc}" />
  <meta name="twitter:image" content="${img}" />
  <script type="application/ld+json">${schema}</script>
  <style>body{font-family:system-ui,sans-serif;max-width:800px;margin:0 auto;padding:2rem;line-height:1.6}h1{font-size:2rem;margin-bottom:1rem}p{margin-bottom:1rem;color:#444}</style>
</head>
<body>
  <script>window.location.replace('/blog/' + '${post.slug}');</script>
  <noscript>
    <article>
      <h1>${post.title}</h1>
      <p><em>${post.date || ''} · ${post.readTime || ''} · ${post.author || SITE.name}</em></p>
      <p>${stripHtml(post.content || '')}...</p>
      <p><a href="${url}">Read full article at ${SITE.name}</a></p>
    </article>
  </noscript>
</body>
</html>`;
}

const jsonPath = path.join(__dirname, 'public', 'blog-posts.json');
const posts = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const blogDir = path.join(__dirname, 'public', 'blog');
if (fs.existsSync(blogDir)) fs.rmSync(blogDir, { recursive: true });
let n = 0;
for (const p of posts) {
  const d = path.join(blogDir, p.slug);
  fs.mkdirSync(d, { recursive: true });
  fs.writeFileSync(path.join(d, 'index.html'), gen(p));
  n++;
}
console.log(`✅ ${SITE.name}: Generated ${n} blog SEO pages`);
