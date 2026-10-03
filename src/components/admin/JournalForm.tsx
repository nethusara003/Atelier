'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { JournalPost } from '@/types/database';
import { upsertJournalPost, deleteJournalPost } from '@/lib/admin-actions';
import { Input, Textarea } from '@/components/ui/fields';
import { Button } from '@/components/ui/Button';

export function JournalForm({ post, demo }: { post?: JournalPost | null; demo: boolean }) {
  const router = useRouter();
  const [values, setValues] = useState({
    title: post?.title ?? '',
    slug: post?.slug ?? '',
    excerpt: post?.excerpt ?? '',
    content: post?.content ?? '',
    coverImage: post?.cover_image ?? '',
    tags: (post?.tags ?? []).join(', '),
    published: post?.published ?? false,
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof values) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const v = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setValues((prev) => {
      const next = { ...prev, [k]: v };
      if (k === 'title' && !post) {
        next.slug = String(v).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      }
      return next;
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await upsertJournalPost(
        {
          title: values.title,
          slug: values.slug,
          excerpt: values.excerpt,
          content: values.content,
          coverImage: values.coverImage,
          tags: values.tags.split(',').map((t) => t.trim()).filter(Boolean),
          published: values.published,
        },
        post?.id
      );
      if (res.error) throw new Error(res.error);
      router.push('/admin/journal');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!post || !confirm(`Delete “${post.title}” permanently?`)) return;
    const res = await deleteJournalPost(post.id);
    if (res.error) setError(res.error);
    else router.push('/admin/journal');
  };

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-6">
      {demo && (
        <p className="border border-clay/40 bg-clay/10 px-5 py-3 text-sm text-smoke">
          Demo mode — saving is disabled.
        </p>
      )}
      <div className="grid gap-6 sm:grid-cols-2">
        <Input id="j-title" label="Title" value={values.title} onChange={set('title')} required />
        <Input id="j-slug" label="Slug" value={values.slug} onChange={set('slug')} required />
      </div>
      <Input id="j-excerpt" label="Excerpt" value={values.excerpt} onChange={set('excerpt')} required hint="One or two sentences shown on the journal index." />
      <Textarea
        id="j-content" label="Content" value={values.content} onChange={set('content')} required rows={12}
        hint="Plain text — blank lines separate paragraphs."
      />
      <div className="grid gap-6 sm:grid-cols-2">
        <Input id="j-cover" label="Cover image URL" value={values.coverImage} onChange={set('coverImage')} hint="Supabase Storage URL or /images/… path" />
        <Input id="j-tags" label="Tags (comma-separated)" value={values.tags} onChange={set('tags')} placeholder="process, ceramics" />
      </div>
      <label className="flex items-center gap-2.5 text-sm">
        <input type="checkbox" checked={values.published} onChange={set('published')} className="h-4 w-4 accent-[#9C4A2F]" />
        Published
      </label>
      {error && <p role="alert" className="text-sm text-terracotta">{error}</p>}
      <div className="flex flex-wrap items-center gap-4 border-t hairline pt-6">
        <Button type="submit" loading={saving} disabled={demo}>
          {post ? 'Save changes' : 'Create post'}
        </Button>
        {post && (
          <button type="button" onClick={remove} disabled={demo} className="link-sweep text-xs uppercase tracking-widest2 text-terracotta disabled:opacity-40">
            Delete post
          </button>
        )}
      </div>
    </form>
  );
}
