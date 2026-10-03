import Link from 'next/link';
import Image from 'next/image';
import { getJournalPosts } from '@/lib/data';
import { formatDate, truncate } from '@/lib/format';
import { SectionHeading, Badge } from '@/components/ui/primitives';
import { Reveal, Stagger, StaggerItem } from '@/components/motion/Reveal';

export const metadata = {
  title: 'Journal',
  description:
    'Studio notes from Elena Voss — process, kiln firings, exhibitions and the inspirations behind the work.',
};

export default async function JournalPage() {
  const posts = await getJournalPosts();
  const [featured, ...rest] = posts;

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-28 md:px-8 md:pt-36">
      <Reveal>
        <p className="micro-label">Journal</p>
        <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[1.02] md:text-7xl">
          Notes from the studio
        </h1>
        <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-smoke">
          Kiln logs, dye pots, packing crates and the occasional strong opinion —
          written between making sessions.
        </p>
      </Reveal>

      {featured && (
        <Reveal className="mt-14">
          <Link href={`/journal/${featured.slug}`} className="group grid gap-8 md:grid-cols-2">
            <div className="relative aspect-[3/2] overflow-hidden">
              {featured.cover_image && (
                <Image
                  src={featured.cover_image}
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              )}
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-4">
                <p className="micro-label">{formatDate(featured.published_at)}</p>
                <Badge tone="terracotta">Latest</Badge>
              </div>
              <h2 className="mt-4 font-serif text-4xl leading-tight transition-colors group-hover:text-terracotta md:text-5xl">
                {featured.title}
              </h2>
              <p className="mt-4 text-[17px] leading-relaxed text-smoke">{featured.excerpt}</p>
              <span className="link-sweep mt-6 w-fit text-sm uppercase tracking-widest2 text-terracotta">
                Read the entry →
              </span>
            </div>
          </Link>
        </Reveal>
      )}

      <Stagger className="mt-16 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((p) => (
          <StaggerItem key={p.id}>
            <Link href={`/journal/${p.slug}`} className="group block">
              {p.cover_image && (
                <div className="relative aspect-[3/2] overflow-hidden">
                  <Image
                    src={p.cover_image}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
              )}
              <p className="micro-label mt-5">{formatDate(p.published_at)}</p>
              <h3 className="mt-2 font-serif text-2xl leading-snug transition-colors group-hover:text-terracotta">
                {p.title}
              </h3>
              <p className="mt-2 text-[15px] text-smoke">{truncate(p.excerpt, 130)}</p>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
