/**
 * Unified data-access layer.
 * When Supabase env vars are configured, reads live data via the server client.
 * Otherwise falls back to the bundled demo dataset (mirrors seed.sql).
 */
import { createServerSupabaseClient } from './supabase/server';
import { isSupabaseConfigured } from './supabase/client';
import * as mock from './mock-data';
import type {
  Artwork,
  Category,
  Collection,
  JournalPost,
  Testimonial,
} from '@/types/database';

export const isDemo = !isSupabaseConfigured;

export interface ArtworkFilters {
  category?: string; // slug
  collection?: string; // slug
  material?: string;
  availability?: 'available' | 'reserved' | 'sold';
  minPrice?: number; // cents
  maxPrice?: number; // cents
  search?: string;
  featured?: boolean;
  limit?: number;
}

const ARTWORK_SELECT = `
  *,
  category:categories(*),
  collection:collections(*),
  images:artwork_images(*)
`;

function mapArtwork(row: any): Artwork {
  const images = (row.images ?? []).sort(
    (a: any, b: any) => a.position - b.position
  );
  return { ...row, images };
}

async function query<T>(fn: (db: ReturnType<typeof createServerSupabaseClient>) => PromiseLike<{ data: T | null; error: any }>): Promise<T | null> {
  if (isDemo) return null;
  try {
    const db = createServerSupabaseClient();
    const { data, error } = await fn(db);
    if (error) {
      console.error('[data] supabase error:', error.message);
      return null;
    }
    return data;
  } catch (e) {
    console.error('[data] exception:', e);
    return null;
  }
}

export async function getCategories(): Promise<Category[]> {
  const data = await query((db) => db.from('categories').select('*').order('name'));
  return data ?? mock.categories;
}

export async function getCollections(): Promise<Collection[]> {
  const data = await query((db) =>
    db.from('collections').select('*').order('sort_order')
  );
  return data ?? mock.collections;
}

export async function getArtworks(filters: ArtworkFilters = {}): Promise<Artwork[]> {
  if (isDemo) return applyFilters(mock.artworks, filters);

  const data = await query((db) => {
    let q = db
      .from('artworks')
      .select(ARTWORK_SELECT)
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (filters.featured) q = q.eq('featured', true);
    if (filters.availability) q = q.eq('status', filters.availability);
    if (filters.minPrice != null) q = q.gte('price_cents', filters.minPrice);
    if (filters.maxPrice != null) q = q.lte('price_cents', filters.maxPrice);
    if (filters.search) q = q.ilike('title', `%${filters.search}%`);
    if (filters.limit) q = q.limit(filters.limit);
    return q;
  });

  let rows: Artwork[] = (data ?? []).map(mapArtwork);

  // relational filters not expressible in one simple query — filter client-side
  if (filters.category) {
    rows = rows.filter((a) => a.category?.slug === filters.category);
  }
  if (filters.collection) {
    rows = rows.filter((a) => a.collection?.slug === filters.collection);
  }
  if (filters.material) {
    const m = filters.material.toLowerCase();
    rows = rows.filter((a) => a.materials.some((x) => x.toLowerCase().includes(m)));
  }
  return rows;
}

export async function getArtworkBySlug(slug: string): Promise<Artwork | null> {
  if (isDemo) return mock.artworks.find((a) => a.slug === slug) ?? null;
  const data = await query((db) =>
    db.from('artworks').select(ARTWORK_SELECT).eq('slug', slug).eq('published', true).maybeSingle()
  );
  return data ? mapArtwork(data) : null;
}

export async function getJournalPosts(): Promise<JournalPost[]> {
  const data = await query((db) =>
    db
      .from('journal_posts')
      .select('*')
      .eq('published', true)
      .order('published_at', { ascending: false })
  );
  return data ?? mock.journalPosts;
}

export async function getJournalPostBySlug(slug: string): Promise<JournalPost | null> {
  if (isDemo) return mock.journalPosts.find((p) => p.slug === slug) ?? null;
  const data = await query((db) =>
    db.from('journal_posts').select('*').eq('slug', slug).eq('published', true).maybeSingle()
  );
  return data;
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const data = await query((db) =>
    db.from('testimonials').select('*').eq('featured', true).order('sort_order')
  );
  return data ?? mock.testimonials.filter((t) => t.featured);
}

export function allMaterials(arts: Artwork[]): string[] {
  const set = new Set<string>();
  arts.forEach((a) => a.materials.forEach((m) => set.add(m)));
  return Array.from(set).sort();
}

function applyFilters(arts: Artwork[], f: ArtworkFilters): Artwork[] {
  let rows = arts.filter((a) => a.published);
  if (f.featured) rows = rows.filter((a) => a.featured);
  if (f.category) rows = rows.filter((a) => a.category?.slug === f.category);
  if (f.collection) rows = rows.filter((a) => a.collection?.slug === f.collection);
  if (f.availability) rows = rows.filter((a) => a.status === f.availability);
  if (f.minPrice != null) rows = rows.filter((a) => a.price_cents >= f.minPrice!);
  if (f.maxPrice != null) rows = rows.filter((a) => a.price_cents <= f.maxPrice!);
  if (f.material) {
    const m = f.material.toLowerCase();
    rows = rows.filter((a) => a.materials.some((x) => x.toLowerCase().includes(m)));
  }
  if (f.search) {
    const s = f.search.toLowerCase();
    rows = rows.filter(
      (a) => a.title.toLowerCase().includes(s) || a.description.toLowerCase().includes(s)
    );
  }
  if (f.limit) rows = rows.slice(0, f.limit);
  return rows;
}
