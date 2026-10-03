'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Artwork, Category, Collection } from '@/types/database';
import { upsertArtwork, deleteArtwork } from '@/lib/admin-actions';
import { Input, Textarea, Select } from '@/components/ui/fields';
import { Button } from '@/components/ui/Button';

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function ArtworkForm({
  artwork,
  categories,
  collections,
  demo,
}: {
  artwork?: Artwork | null;
  categories: Category[];
  collections: Collection[];
  demo: boolean;
}) {
  const router = useRouter();
  const d = artwork?.dimensions;

  const [values, setValues] = useState({
    title: artwork?.title ?? '',
    slug: artwork?.slug ?? '',
    description: artwork?.description ?? '',
    story: artwork?.story ?? '',
    categoryId: artwork?.category_id ?? categories[0]?.id ?? '',
    collectionId: artwork?.collection_id ?? '',
    price: artwork ? String(artwork.price_cents / 100) : '',
    editionType: artwork?.edition_type ?? 'one_of_one',
    editionTotal: artwork?.edition_total ? String(artwork.edition_total) : '',
    stock: String(artwork?.stock ?? 1),
    status: artwork?.status ?? 'available',
    materials: (artwork?.materials ?? []).join(', '),
    width: d?.width ? String(d.width) : '',
    height: d?.height ? String(d.height) : '',
    depth: d?.depth ? String(d.depth) : '',
    year: String(artwork?.year ?? new Date().getFullYear()),
    featured: artwork?.featured ?? false,
    published: artwork?.published ?? true,
    imageUrls: (artwork?.images ?? []).map((i) => i.url).join('\n'),
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof values) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const v = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setValues((prev) => {
      const next = { ...prev, [k]: v };
      if (k === 'title' && !artwork) next.slug = slugify(String(v));
      return next;
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const priceCents = Math.round(parseFloat(values.price || '0') * 100);
      const res = await upsertArtwork(
        {
          title: values.title,
          slug: slugify(values.slug),
          description: values.description,
          story: values.story,
          categoryId: values.categoryId,
          collectionId: values.collectionId || null,
          priceCents,
          currency: 'USD',
          editionType: values.editionType,
          editionTotal: values.editionTotal ? parseInt(values.editionTotal, 10) : null,
          stock: parseInt(values.stock || '0', 10),
          status: values.status,
          materials: values.materials.split(',').map((m) => m.trim()).filter(Boolean),
          width: values.width ? parseFloat(values.width) : null,
          height: values.height ? parseFloat(values.height) : null,
          depth: values.depth ? parseFloat(values.depth) : null,
          dimensionUnit: 'cm',
          year: parseInt(values.year, 10),
          featured: values.featured,
          published: values.published,
          imageUrls: values.imageUrls.split('\n').map((s) => s.trim()).filter(Boolean),
        },
        artwork?.id
      );
      if (res.error) throw new Error(res.error);
      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!artwork || !confirm(`Delete “${artwork.title}” permanently?`)) return;
    const res = await deleteArtwork(artwork.id);
    if (res.error) setError(res.error);
    else router.push('/admin/products');
  };

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-6">
      {demo && (
        <p className="border border-clay/40 bg-clay/10 px-5 py-3 text-sm text-smoke">
          Demo mode — saving is disabled.
        </p>
      )}
      <div className="grid gap-6 sm:grid-cols-2">
        <Input id="a-title" label="Title" value={values.title} onChange={set('title')} required />
        <Input id="a-slug" label="Slug" value={values.slug} onChange={set('slug')} required hint="URL-friendly, e.g. morning-vessel-i" />
      </div>
      <Textarea id="a-desc" label="Description" value={values.description} onChange={set('description')} required rows={3} />
      <Textarea id="a-story" label="Story behind the work" value={values.story} onChange={set('story')} rows={4} hint="Shown on the artwork page under “Behind this piece”." />
      <div className="grid gap-6 sm:grid-cols-3">
        <Select
          id="a-cat" label="Category"
          options={categories.map((c) => ({ value: c.id, label: c.name }))}
          value={values.categoryId} onChange={set('categoryId')}
        />
        <Select
          id="a-col" label="Collection (optional)"
          options={[{ value: '', label: 'None' }, ...collections.map((c) => ({ value: c.id, label: c.name }))]}
          value={values.collectionId} onChange={set('collectionId')}
        />
        <Input id="a-price" label="Price (USD)" type="number" min="0" step="0.01" value={values.price} onChange={set('price')} required />
      </div>
      <div className="grid gap-6 sm:grid-cols-4">
        <Select
          id="a-ed" label="Edition type"
          options={[
            { value: 'one_of_one', label: 'One of one' },
            { value: 'limited', label: 'Limited edition' },
            { value: 'open', label: 'Open edition' },
          ]}
          value={values.editionType} onChange={set('editionType')}
        />
        <Input id="a-edtotal" label="Edition total" type="number" min="1" value={values.editionTotal} onChange={set('editionTotal')} hint="Limited only" />
        <Input id="a-stock" label="Stock" type="number" min="0" value={values.stock} onChange={set('stock')} required />
        <Select
          id="a-status" label="Status"
          options={['available', 'reserved', 'sold', 'archived'].map((s) => ({ value: s, label: s }))}
          value={values.status} onChange={set('status')}
        />
      </div>
      <Input id="a-materials" label="Materials (comma-separated)" value={values.materials} onChange={set('materials')} placeholder="Stoneware, Iron oxide wash" />
      <div className="grid gap-6 sm:grid-cols-4">
        <Input id="a-w" label="Width (cm)" type="number" min="0" step="0.1" value={values.width} onChange={set('width')} />
        <Input id="a-h" label="Height (cm)" type="number" min="0" step="0.1" value={values.height} onChange={set('height')} />
        <Input id="a-d" label="Depth (cm)" type="number" min="0" step="0.1" value={values.depth} onChange={set('depth')} />
        <Input id="a-year" label="Year" type="number" value={values.year} onChange={set('year')} required />
      </div>
      <Textarea
        id="a-images" label="Image URLs (one per line)" value={values.imageUrls} onChange={set('imageUrls')} rows={3}
        hint="Use Supabase Storage public URLs, or /images/… paths for local files."
      />
      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2.5 text-sm">
          <input type="checkbox" checked={values.featured} onChange={set('featured')} className="h-4 w-4 accent-[#9C4A2F]" />
          Featured on home page
        </label>
        <label className="flex items-center gap-2.5 text-sm">
          <input type="checkbox" checked={values.published} onChange={set('published')} className="h-4 w-4 accent-[#9C4A2F]" />
          Published (visible in gallery)
        </label>
      </div>

      {error && <p role="alert" className="text-sm text-terracotta">{error}</p>}

      <div className="flex flex-wrap items-center gap-4 border-t hairline pt-6">
        <Button type="submit" loading={saving} disabled={demo}>
          {artwork ? 'Save changes' : 'Create artwork'}
        </Button>
        {artwork && (
          <button
            type="button"
            onClick={remove}
            disabled={demo}
            className="link-sweep text-xs uppercase tracking-widest2 text-terracotta disabled:opacity-40"
          >
            Delete artwork
          </button>
        )}
      </div>
    </form>
  );
}
