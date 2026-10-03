'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Collection } from '@/types/database';
import { upsertCollection, deleteCollection } from '@/lib/admin-actions';
import { DataTable, DemoBanner } from '@/components/admin/admin-ui';
import { Input, Textarea } from '@/components/ui/fields';
import { Button } from '@/components/ui/Button';

const EMPTY = { name: '', slug: '', description: '', cover_image: '', featured: false };

export function CollectionsManager({
  collections,
  demo,
}: {
  collections: Collection[];
  demo: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<Collection | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const openEdit = (c: Collection) => {
    setEditing(c);
    setShowNew(false);
    setForm({
      name: c.name,
      slug: c.slug,
      description: c.description ?? '',
      cover_image: c.cover_image ?? '',
      featured: c.featured,
    });
    setError('');
  };

  const openNew = () => {
    setEditing(null);
    setShowNew(true);
    setForm(EMPTY);
    setError('');
  };

  const close = () => {
    setEditing(null);
    setShowNew(false);
    setError('');
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await upsertCollection({
        id: editing?.id,
        name: form.name,
        slug: form.slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'),
        description: form.description,
        cover_image: form.cover_image,
        featured: form.featured,
        sort_order: editing?.sort_order ?? collections.length,
      });
      if (res.error) throw new Error(res.error);
      close();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c: Collection) => {
    if (!confirm(`Delete collection “${c.name}”? Artworks keep their data; the collection link is removed.`)) return;
    const res = await deleteCollection(c.id);
    if (res.error) setError(res.error);
    else router.refresh();
  };

  const formOpen = showNew || editing !== null;

  return (
    <div>
      {demo && <DemoBanner />}
      <div className="mt-6 flex justify-end">
        <Button size="sm" onClick={openNew} disabled={demo}>
          + New collection
        </Button>
      </div>

      <div className="mt-6">
        <DataTable
          rows={collections}
          rowKey={(c) => c.id}
          emptyTitle="No collections yet"
          emptyBody="Group works into stories — Terra Memoria, Quiet Hours…"
          columns={[
            {
              header: 'Name',
              render: (c) => (
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="micro-label mt-0.5">/{c.slug}</p>
                </div>
              ),
            },
            { header: 'Featured', render: (c) => (c.featured ? 'Yes' : '—') },
            { header: 'Order', render: (c) => String(c.sort_order) },
            {
              header: 'Actions',
              render: (c) => (
                <div className="flex gap-4">
                  <button onClick={() => openEdit(c)} disabled={demo} className="link-sweep text-xs uppercase tracking-widest2 text-stone hover:text-terracotta disabled:opacity-40">
                    Edit
                  </button>
                  <button onClick={() => remove(c)} disabled={demo} className="link-sweep text-xs uppercase tracking-widest2 text-terracotta disabled:opacity-40">
                    Delete
                  </button>
                </div>
              ),
            },
          ]}
        />
      </div>

      {formOpen && (
        <form onSubmit={save} className="mt-10 max-w-2xl space-y-6 border hairline bg-parchment/50 p-8">
          <h2 className="font-serif text-2xl">{editing ? `Edit — ${editing.name}` : 'New collection'}</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <Input id="col-name" label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input id="col-slug" label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
          </div>
          <Textarea id="col-desc" label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
          <Input id="col-cover" label="Cover image URL" value={form.cover_image} onChange={(e) => setForm({ ...form, cover_image: e.target.value })} hint="Supabase Storage URL or /images/… path" />
          <label className="flex items-center gap-2.5 text-sm">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="h-4 w-4 accent-[#9C4A2F]" />
            Featured on home page
          </label>
          {error && <p role="alert" className="text-sm text-terracotta">{error}</p>}
          <div className="flex gap-4">
            <Button type="submit" loading={saving}>{editing ? 'Save changes' : 'Create collection'}</Button>
            <Button type="button" variant="ghost" onClick={close}>Cancel</Button>
          </div>
        </form>
      )}
    </div>
  );
}
