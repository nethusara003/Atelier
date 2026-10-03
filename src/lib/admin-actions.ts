'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminAction } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { artworkInputSchema, journalInputSchema, orderStatusSchema, enquiryStatusSchema, inquiryStatusSchema } from '@/lib/validations';

/* ---------------- orders ---------------- */

export async function updateOrderStatus(orderId: string, status: string) {
  await requireAdminAction();
  const parsed = orderStatusSchema.safeParse(status);
  if (!parsed.success) return { error: 'Invalid status.' };
  const admin = createAdminClient();
  const { error } = await admin.from('orders').update({ status: parsed.data }).eq('id', orderId);
  if (error) return { error: error.message };
  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true };
}

/* ---------------- commissions / inquiries ---------------- */

export async function updateCommissionStatus(id: string, status: string) {
  await requireAdminAction();
  const parsed = enquiryStatusSchema.safeParse(status);
  if (!parsed.success) return { error: 'Invalid status.' };
  const admin = createAdminClient();
  const { error } = await admin.from('commissions').update({ status: parsed.data }).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/commissions');
  return { ok: true };
}

export async function updateInquiryStatus(id: string, status: string) {
  await requireAdminAction();
  const parsed = inquiryStatusSchema.safeParse(status);
  if (!parsed.success) return { error: 'Invalid status.' };
  const admin = createAdminClient();
  const { error } = await admin.from('inquiries').update({ status: parsed.data }).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/enquiries');
  return { ok: true };
}

/* ---------------- artworks ---------------- */

export async function upsertArtwork(input: unknown, id?: string) {
  await requireAdminAction();
  const parsed = artworkInputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid artwork data.' };
  }
  const d = parsed.data;
  const admin = createAdminClient();

  const row = {
    title: d.title,
    slug: d.slug,
    description: d.description,
    story: d.story || null,
    category_id: d.categoryId,
    collection_id: d.collectionId || null,
    price_cents: d.priceCents,
    currency: d.currency,
    edition_type: d.editionType,
    edition_total: d.editionTotal ?? null,
    edition_available:
      d.editionType === 'limited'
        ? (d.editionTotal ?? d.stock)
        : null,
    stock: d.stock,
    status: d.stock === 0 ? 'sold' : d.status,
    materials: d.materials,
    dimensions:
      d.width || d.height || d.depth
        ? { width: d.width ?? undefined, height: d.height ?? undefined, depth: d.depth ?? undefined, unit: d.dimensionUnit }
        : null,
    year: d.year,
    featured: d.featured,
    published: d.published,
  };

  let artworkId = id;
  if (id) {
    const { error } = await admin.from('artworks').update(row).eq('id', id);
    if (error) return { error: error.message };
  } else {
    const { data, error } = await admin.from('artworks').insert(row).select('id').single();
    if (error || !data) return { error: error?.message ?? 'Insert failed.' };
    artworkId = data.id;
  }

  // Replace images with the submitted list.
  await admin.from('artwork_images').delete().eq('artwork_id', artworkId);
  if (d.imageUrls.length > 0) {
    const { error: imgError } = await admin.from('artwork_images').insert(
      d.imageUrls.map((url, i) => ({
        artwork_id: artworkId,
        url,
        alt: `${d.title} — image ${i + 1}`,
        position: i + 1,
        is_primary: i === 0,
      }))
    );
    if (imgError) return { error: imgError.message };
  }

  revalidatePath('/admin/products');
  revalidatePath('/gallery');
  return { ok: true, id: artworkId };
}

export async function deleteArtwork(id: string) {
  await requireAdminAction();
  const admin = createAdminClient();
  const { error } = await admin.from('artworks').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/products');
  return { ok: true };
}

/* ---------------- collections ---------------- */

export async function upsertCollection(input: {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  cover_image?: string;
  featured?: boolean;
  sort_order?: number;
}) {
  await requireAdminAction();
  if (!input.name?.trim() || !/^[a-z0-9-]+$/.test(input.slug)) {
    return { error: 'Name and a valid slug are required.' };
  }
  const admin = createAdminClient();
  const row = {
    name: input.name.trim(),
    slug: input.slug.trim(),
    description: input.description?.trim() || null,
    cover_image: input.cover_image?.trim() || null,
    featured: !!input.featured,
    sort_order: input.sort_order ?? 0,
  };
  const { error } = input.id
    ? await admin.from('collections').update(row).eq('id', input.id).then((r) => r)
    : await admin.from('collections').insert(row).then((r) => r);
  if (error) return { error: error.message };
  revalidatePath('/admin/collections');
  return { ok: true };
}

export async function deleteCollection(id: string) {
  await requireAdminAction();
  const admin = createAdminClient();
  const { error } = await admin.from('collections').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/collections');
  return { ok: true };
}

/* ---------------- journal ---------------- */

export async function upsertJournalPost(input: unknown, id?: string) {
  await requireAdminAction();
  const parsed = journalInputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid post data.' };
  }
  const d = parsed.data;
  const admin = createAdminClient();
  const row = {
    title: d.title,
    slug: d.slug,
    excerpt: d.excerpt,
    content: d.content,
    cover_image: d.coverImage || null,
    tags: d.tags,
    published: d.published,
    published_at: d.published ? new Date().toISOString() : null,
  };
  const { error } = id
    ? await admin.from('journal_posts').update(row).eq('id', id).then((r) => r)
    : await admin.from('journal_posts').insert(row).then((r) => r);
  if (error) return { error: error.message };
  revalidatePath('/admin/journal');
  revalidatePath('/journal');
  return { ok: true };
}

export async function deleteJournalPost(id: string) {
  await requireAdminAction();
  const admin = createAdminClient();
  const { error } = await admin.from('journal_posts').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/journal');
  return { ok: true };
}
