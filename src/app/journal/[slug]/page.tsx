import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { getJournalPostBySlug, getJournalPosts } from '@/lib/data';
import { formatDate } from '@/lib/format';
import { Badge } from '@/components/ui/primitives';
import { Reveal } from '@/components/motion/Reveal';
import { JsonLd, breadcrumbJsonLd } from '@/components/seo/JsonLd';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getJournalPostBySlug(params.slug);
  if (!post) return { title: 'Entry not found' };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: `${post.title} · Atelier Voss Journal`,
      description: post.excerpt,
      type: 'article',
      ...(post.cover_image ? { images: [{ url: post.cover_image, alt: post.title }] } : {}),
    },
  };
}

export default async function JournalPostPage({ params }: { params: { slug: string } }) {
  const post = await getJournalPostBySlug(params.slug);
  if (!post) notFound();

  const all = await getJournalPosts();
  const idx = all.findIndex((p) => p.id === post.id);
  const next = all[idx - 1] ?? null;
  const prev = all[idx + 1] ?? null;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Journal', path: '/journal' },
          { name: post.title, path: `/journal/${post.slug}` },
        ])}
      />
      <article className="mx-auto max-w-3xl px-5 pb-24 pt-28 md:pt-36">
        <Reveal>
          <nav aria-label="Breadcrumb" className="micro-label">
            <Link href="/journal" className="hover:text-terracotta">← All entries</Link>
          </nav>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <p className="micro-label">{formatDate(post.published_at)}</p>
            {post.tags.map((t) => (
              <Badge key={t} tone="neutral">{t}</Badge>
            ))}
          </div>
          <h1 className="mt-5 font-serif text-5xl leading-[1.02] md:text-6xl">{post.title}</h1>
          <p className="mt-5 font-serif text-xl italic leading-relaxed text-smoke">{post.excerpt}</p>
        </Reveal>

        {post.cover_image && (
          <Reveal delay={0.1} className="mt-10">
            <div className="relative aspect-[3/2] overflow-hidden">
              <Image
                src={post.cover_image}
                alt=""
                fill
                priority
                sizes="(max-width: 768px) 100vw, 60vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        )}

        <Reveal delay={0.15} className="mt-10">
          <div className="space-y-6 text-[18px] leading-[1.85] text-smoke">
            {post.content.split('\n\n').map((para, i) => (
              <p key={i} className={i === 0 ? 'font-serif text-[22px] text-charcoal first-letter:text-5xl first-letter:float-left first-letter:mr-3 first-letter:leading-[0.9] first-letter:text-terracotta' : ''}>
                {para}
              </p>
            ))}
          </div>
          <p className="mt-10 border-t hairline pt-6 font-serif text-xl italic text-clay">— Elena</p>
        </Reveal>

        <nav className="mt-16 grid gap-6 border-t hairline pt-10 sm:grid-cols-2" aria-label="More entries">
          {prev ? (
            <Link href={`/journal/${prev.slug}`} className="group">
              <p className="micro-label">Older</p>
              <p className="mt-2 font-serif text-2xl leading-snug transition-colors group-hover:text-terracotta">{prev.title}</p>
            </Link>
          ) : <div />}
          {next && (
            <Link href={`/journal/${next.slug}`} className="group text-right">
              <p className="micro-label">Newer</p>
              <p className="mt-2 font-serif text-2xl leading-snug transition-colors group-hover:text-terracotta">{next.title}</p>
            </Link>
          )}
        </nav>
      </article>
    </>
  );
}
