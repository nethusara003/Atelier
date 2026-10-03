import type { MetadataRoute } from 'next';
import { getArtworks, getJournalPosts, getCollections } from '@/lib/data';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://atelier-voss.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [artworks, posts, collections] = await Promise.all([
    getArtworks(),
    getJournalPosts(),
    getCollections(),
  ]);

  const staticPages = [
    '',
    '/gallery',
    '/about',
    '/commissions',
    '/journal',
    '/contact',
    '/cart',
    '/checkout',
  ].map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: p === '' ? 1 : 0.8,
  }));

  const artworkPages = artworks.map((a) => ({
    url: `${SITE_URL}/artwork/${a.slug}`,
    lastModified: new Date(a.updated_at),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const journalPages = posts.map((p) => ({
    url: `${SITE_URL}/journal/${p.slug}`,
    lastModified: new Date(p.published_at ?? p.created_at),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const collectionPages = collections.map((c) => ({
    url: `${SITE_URL}/gallery?collection=${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...artworkPages, ...journalPages, ...collectionPages];
}
