/**
 * Admin data fetching: live Supabase when configured, demo datasets otherwise.
 */
import { isSupabaseConfigured } from './supabase/client';
import { createAdminClient } from './supabase/admin';
import * as mock from './mock-data';
import type {
  Artwork, Category, Collection, Commission, Inquiry, JournalPost, NewsletterSubscriber, Order,
} from '@/types/database';

const demo = !isSupabaseConfigured;

async function all<T>(table: string, orderBy: string, ascending = false): Promise<T[] | null> {
  if (demo) return null;
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from(table).select('*').order(orderBy, { ascending });
    if (error) {
      console.error(`[admin-data] ${table}:`, error.message);
      return null;
    }
    return (data ?? []) as T[];
  } catch (e) {
    console.error(`[admin-data] ${table}:`, e);
    return null;
  }
}

export async function adminListArtworks(): Promise<Artwork[]> {
  const data = await all<any>('artworks', 'created_at');
  if (!data) return mock.artworks;
  return data.map((a) => ({
    ...a,
    category: mock.categories.find((c) => c.id === a.category_id) ?? null,
    images: [],
  }));
}

export async function adminListOrders(): Promise<Order[]> {
  if (demo) return mock.demoOrders;
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from('orders')
      .select('*, items:order_items(*)')
      .order('created_at', { ascending: false });
    return (data ?? []) as Order[];
  } catch {
    return mock.demoOrders;
  }
}

export async function adminGetOrder(id: string): Promise<Order | null> {
  if (demo) return mock.demoOrders.find((o) => o.id === id) ?? null;
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('id', id)
      .single();
    return (data as Order) ?? null;
  } catch {
    return null;
  }
}

export async function adminListCommissions(): Promise<Commission[]> {
  return (await all<Commission>('commissions', 'created_at')) ?? mock.demoCommissions;
}

export async function adminListInquiries(): Promise<Inquiry[]> {
  return (await all<Inquiry>('inquiries', 'created_at')) ?? mock.demoInquiries;
}

export async function adminListJournal(): Promise<JournalPost[]> {
  if (demo) return mock.journalPosts;
  try {
    const admin = createAdminClient();
    const { data } = await admin.from('journal_posts').select('*').order('created_at', { ascending: false });
    return (data ?? []) as JournalPost[];
  } catch {
    return mock.journalPosts;
  }
}

export async function adminGetJournalPost(id: string): Promise<JournalPost | null> {
  if (demo) return mock.journalPosts.find((p) => p.id === id) ?? null;
  try {
    const admin = createAdminClient();
    const { data } = await admin.from('journal_posts').select('*').eq('id', id).single();
    return (data as JournalPost) ?? null;
  } catch {
    return null;
  }
}

export async function adminListSubscribers(): Promise<NewsletterSubscriber[]> {
  return (await all<NewsletterSubscriber>('newsletter_subscribers', 'subscribed_at')) ?? mock.demoSubscribers;
}

export async function adminGetCategories(): Promise<Category[]> {
  return (await all<Category>('categories', 'name', true)) ?? mock.categories;
}

export async function adminListCollections(): Promise<Collection[]> {
  return (await all<Collection>('collections', 'sort_order', true)) ?? mock.collections;
}

export async function adminGetArtwork(id: string): Promise<Artwork | null> {
  if (demo) return mock.artworks.find((a) => a.id === id) ?? null;
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from('artworks')
      .select('*, images:artwork_images(*)')
      .eq('id', id)
      .single();
    if (!data) return null;
    const images = (data.images ?? []).sort((a: any, b: any) => a.position - b.position);
    return { ...data, images };
  } catch {
    return null;
  }
}
