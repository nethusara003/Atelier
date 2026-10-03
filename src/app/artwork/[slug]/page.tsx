import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getArtworkBySlug, getArtworks } from '@/lib/data';
import { formatPrice } from '@/lib/format';
import { ArtworkGallery } from '@/components/artwork/ArtworkGallery';
import { PurchasePanel } from '@/components/artwork/PurchasePanel';
import { ArtworkCard } from '@/components/gallery/ArtworkCard';
import { Reveal, Stagger, StaggerItem } from '@/components/motion/Reveal';
import { Badge } from '@/components/ui/primitives';
import { JsonLd, productJsonLd, breadcrumbJsonLd } from '@/components/seo/JsonLd';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const artwork = await getArtworkBySlug(params.slug);
  if (!artwork) return { title: 'Work not found' };
  const image = artwork.images?.[0]?.url;
  return {
    title: artwork.title,
    description: artwork.description,
    openGraph: {
      title: `${artwork.title} · Atelier Voss`,
      description: artwork.description,
      type: 'website',
      ...(image ? { images: [{ url: image, alt: artwork.title }] } : {}),
    },
  };
}

function formatDimensions(a: { dimensions: { width?: number; height?: number; depth?: number; unit: string } | null }): string {
  const d = a.dimensions;
  if (!d) return '—';
  const parts = [d.width, d.height, d.depth].filter((n) => n != null) as number[];
  return `${parts.join(' × ')} ${d.unit}`;
}

export default async function ArtworkPage({ params }: { params: { slug: string } }) {
  const artwork = await getArtworkBySlug(params.slug);
  if (!artwork) notFound();

  const related = (await getArtworks({ category: artwork.category?.slug, limit: 4 }))
    .filter((a) => a.id !== artwork.id)
    .slice(0, 3);

  const primary = artwork.images?.[0];

  return (
    <>
      <JsonLd
        data={[
          productJsonLd({
            title: artwork.title,
            description: artwork.description,
            slug: artwork.slug,
            price_cents: artwork.price_cents,
            currency: artwork.currency,
            status: artwork.status,
            image: primary?.url ?? '/images/artworks/painting-1.jpg',
            materials: artwork.materials,
          }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Gallery', path: '/gallery' },
            { name: artwork.title, path: `/artwork/${artwork.slug}` },
          ]),
        ]}
      />

      <div className="mx-auto max-w-7xl px-5 pb-24 pt-28 md:px-8 md:pt-36">
        <nav aria-label="Breadcrumb" className="micro-label">
          <Link href="/" className="hover:text-terracotta">Home</Link>
          <span aria-hidden className="mx-2">/</span>
          <Link href="/gallery" className="hover:text-terracotta">Gallery</Link>
          <span aria-hidden className="mx-2">/</span>
          <span aria-current="page" className="text-charcoal">{artwork.title}</span>
        </nav>

        <div className="mt-8 grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <Reveal>
              <ArtworkGallery images={artwork.images ?? []} title={artwork.title} />
            </Reveal>
          </div>

          <div className="lg:col-span-5">
            <Reveal>
              <div className="flex flex-wrap items-center gap-3">
                {artwork.category && <Badge tone="neutral">{artwork.category.name}</Badge>}
                {artwork.collection && (
                  <Link href={`/gallery?collection=${artwork.collection.slug}`}>
                    <Badge tone="clay">{artwork.collection.name}</Badge>
                  </Link>
                )}
                <span className="micro-label">{artwork.year}</span>
              </div>
              <h1 className="mt-5 font-serif text-5xl leading-[1.02] md:text-6xl">{artwork.title}</h1>
              <p className="mt-5 text-[17px] leading-relaxed text-smoke">{artwork.description}</p>
            </Reveal>

            <Reveal delay={0.1}>
              <PurchasePanel artwork={artwork} />
            </Reveal>

            <Reveal delay={0.15}>
              <dl className="mt-8 space-y-3 border-t hairline pt-6 text-sm">
                <div className="flex justify-between gap-6">
                  <dt className="micro-label">Dimensions</dt>
                  <dd className="text-smoke">{formatDimensions(artwork)}</dd>
                </div>
                <div className="flex justify-between gap-6">
                  <dt className="micro-label">Materials</dt>
                  <dd className="text-right text-smoke">{artwork.materials.join(', ')}</dd>
                </div>
                {artwork.weight_grams && (
                  <div className="flex justify-between gap-6">
                    <dt className="micro-label">Weight</dt>
                    <dd className="text-smoke">{(artwork.weight_grams / 1000).toFixed(1)} kg</dd>
                  </div>
                )}
                <div className="flex justify-between gap-6">
                  <dt className="micro-label">Signed</dt>
                  <dd className="text-smoke">Signed & dated by the artist</dd>
                </div>
              </dl>
            </Reveal>
          </div>
        </div>

        {/* story */}
        {artwork.story && (
          <section className="mx-auto mt-24 max-w-3xl md:mt-32" aria-label="The story behind the work">
            <Reveal>
              <p className="micro-label text-center">The story</p>
              <h2 className="mt-4 text-center font-serif text-4xl md:text-5xl">Behind this piece</h2>
              <div className="mt-8 space-y-5 text-[18px] leading-[1.85] text-smoke">
                {artwork.story.split('\n\n').map((para, i) => (
                  <p key={i} className={i === 0 ? 'font-serif text-[22px] italic text-charcoal' : ''}>
                    {para}
                  </p>
                ))}
              </div>
              <p className="mt-8 text-center font-serif text-xl italic text-clay">— Elena</p>
            </Reveal>
          </section>
        )}

        {/* related */}
        {related.length > 0 && (
          <section className="mt-24 md:mt-32" aria-label="Related works">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <Reveal>
                <p className="micro-label">Continue looking</p>
                <h2 className="mt-4 font-serif text-4xl md:text-5xl">You may also love</h2>
              </Reveal>
              <Reveal delay={0.1}>
                <Link href="/gallery" className="link-sweep text-sm uppercase tracking-widest2 text-terracotta">
                  View all works →
                </Link>
              </Reveal>
            </div>
            <Stagger className="mt-12 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((a, i) => (
                <StaggerItem key={a.id}>
                  <ArtworkCard artwork={a} index={i} />
                </StaggerItem>
              ))}
            </Stagger>
          </section>
        )}
      </div>
    </>
  );
}
