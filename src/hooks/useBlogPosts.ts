import { useState, useEffect } from 'react';
import type { BlogPostData } from '@/data/blogPosts';

let cachedPosts: BlogPostData[] | null = null;

export function useBlogPosts() {
  const [posts, setPosts] = useState<BlogPostData[]>(cachedPosts || []);
  const [loading, setLoading] = useState(!cachedPosts);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cachedPosts) return;

    fetch('/blog-posts.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load blog posts');
        return res.json();
      })
      .then((data: BlogPostData[]) => {
        const sorted = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        cachedPosts = sorted;
        setPosts(sorted);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const getPostBySlug = (slug: string) => posts.find(p => p.slug === slug);

  return { posts, loading, error, getPostBySlug };
}
