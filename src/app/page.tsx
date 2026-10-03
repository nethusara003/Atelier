import Link from 'next/link';
import Image from 'next/image';
import { getArtworks, getCollections, getTestimonials, getJournalPosts } from '@/lib/data';
import { ARTIST } from '@/lib/constants';
import { formatPrice, formatDate, truncate } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { SectionHeading, Badge } from '@/components/ui/primitives';
import { Reveal, TextReveal, Stagger, StaggerItem } from '@/components/motion/Reveal';
import { ParallaxImage } from '@/components/motion/ParallaxImage';
import { ArtworkCard } from '@/components/gallery/ArtworkCard';
import { NewsletterSignup } from '@/components/layout/NewsletterSignup';
import { HeroCta } from '@/components/home/HeroCta';

export const metadata = {
  title: 'Atelier Voss — Original Handmade Art & Craft',
  description:
    'Original paintings, ceramics, sculpture and textiles by Elena Voss. Handmade in small numbers in a Paris studio.',
};

export default async function HomePage() {
  const [featured, collections, testimonials, posts] = await Promise.all([
    getArtworks({ featured: true, limit: 6 }),
    getCollections(),
    getTestimonials(),
    getJournalPosts(),
  ]);
  const featuredCollection = collections.find((c) => c.featured) ?? collections[0];
  const collectionWorks = featuredCollection
    ? (await getArtworks({ collection: featuredCollection.slug, limit: 3 }))
    : [];

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="relative flex min-h-[100svh] items-end overflow-hidden" aria-label="Introduction">
        <div className="absolute inset-0" aria-hidden>
          <ParallaxImage
            src="/images/artworks/painting-1.jpg"
            alt=""
            priority
            parallax={0.1}
            className="h-full w-full"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/20 to-charcoal/30" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-24 pt-40 md:px-8 md:pb-32">
          <Reveal>
            <p className="micro-label !text-ivory/70">Painter & ceramicist · Paris</p>
          </Reveal>
          <h1 className="mt-6 max-w-4xl font-serif text-[13vw] leading-[0.95] text-ivory sm:text-7xl md:text-8xl">
            <TextReveal lines={['Made by hand,', 'meant to be kept.']} />
          </h1>
          <Reveal delay={0.55}>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-ivory/85">
              Original paintings, ceramics, sculpture and textiles — formed slowly,
              in small numbers, from earth pigment, clay and thread.
            </p>
          </Reveal>
          <HeroCta />
        </div>

        <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2" aria-hidden>
          <div className="flex h-12 w-7 items-start justify-center rounded-full border border-ivory/40 p-1.5">
            <div className="h-2.5 w-1 animate-bounce rounded-full bg-ivory/80" />
          </div>
        </div>
      </section>

      {/* ============ ARTIST INTRO ============ */}
      <section className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-36" aria-label="About the artist">
        <div className="grid items-center gap-12 md:grid-cols-12 md:gap-8">
          <Reveal className="md:col-span-5 md:col-start-1" y={40}>
            <div className="relative">
              <div className="absolute -left-4 -top-4 h-full w-full border hairline" aria-hidden />
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                  src="/images/studio/portrait.jpg"
                  alt="Portrait of Elena Voss in her studio"
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>
            </div>
          </Reveal>
          <div className="md:col-span-6 md:col-start-7">
            <Reveal>
              <SectionHeading
                eyebrow="The artist"
                title="Elena Voss works the way weather works — slowly, and all at once."
              />
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-6 space-y-5 text-[17px] leading-relaxed text-smoke">
                <p>
                  For twenty years Elena has divided her days between the potter’s wheel,
                  the easel and the loom in a converted Marais atelier. Her work begins
                  with raw material — dug clay, ground pigment, undyed wool — and ends
                  with objects that carry the unmistakable pressure of a human hand.
                </p>
                <p>
                  Nothing leaves the studio in a hurry. Vessels are wood-fired for three
                  days; paintings are built in thin glazes over months; tapestries are
                  woven two hours each evening. The slowness is the point.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.25}>
              <Link href="/about" className="mt-8 inline-block">
                <Button variant="secondary">Read her story</Button>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ FEATURED COLLECTION ============ */}
      {featuredCollection && (
        <section className="bg-parchment py-24 md:py-36" aria-label="Featured collection">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="grid gap-12 md:grid-cols-12">
              <div className="md:col-span-4">
                <Reveal>
                  <SectionHeading
                    eyebrow="Featured collection"
                    title={featuredCollection.name}
                    body={featuredCollection.description ?? ''}
                  />
                </Reveal>
                <Reveal delay={0.15}>
                  <Link href={`/gallery?collection=${featuredCollection.slug}`} className="mt-8 inline-block">
                    <Button>View the collection</Button>
                  </Link>
                </Reveal>
              </div>
              <div className="md:col-span-8">
                <Stagger className="grid gap-6 sm:grid-cols-3">
                  {collectionWorks.map((w) => (
                    <StaggerItem key={w.id}>
                      <ArtworkCard artwork={w} />
                    </StaggerItem>
                  ))}
                </Stagger>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============ SELECTED WORKS ============ */}
      <section className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-36" aria-label="Selected works">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <SectionHeading
              eyebrow="The gallery"
              title="Selected works"
              body="One-of-one pieces and small editions, currently in the studio and ready to travel."
            />
          </Reveal>
          <Reveal delay={0.1}>
            <Link href="/gallery" className="link-sweep text-sm uppercase tracking-widest2 text-terracotta">
              View all works →
            </Link>
          </Reveal>
        </div>
        <Stagger className="mt-14 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((a, i) => (
            <StaggerItem key={a.id}>
              <ArtworkCard artwork={a} index={i} />
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ============ PROCESS / STORY ============ */}
      <section className="relative overflow-hidden bg-charcoal py-24 text-ivory md:py-36" aria-label="Process">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Reveal>
            <SectionHeading
              dark
              align="center"
              eyebrow="From the studio"
              title="Three days of fire, eleven mornings of looking"
              body="Every piece passes through the same unhurried ritual — raw material, patient labour, and a kiln or canvas that has the final word."
            />
          </Reveal>
          <Stagger className="mt-16 grid gap-10 md:grid-cols-3">
            {[
              { n: '01', t: 'Gather', d: 'Clay is dug and wedged, pigments ground from earth and walnut husk, wool dyed in small autumn pots. The palette is decided by the season, not the market.' },
              { n: '02', t: 'Shape', d: 'Vessels are thrown at dawn, paintings glazed in thin layers over months, tapestries woven two hours each evening. The hand stays visible in every surface.' },
              { n: '03', t: 'Fire & finish', d: 'Three days in the wood kiln, or months of drying and varnishing. Each piece is signed, dated, and packed by hand in a crate built for its exact dimensions.' },
            ].map((s) => (
              <StaggerItem key={s.n}>
                <div className="border-t border-ivory/20 pt-8">
                  <p className="font-serif text-5xl text-claylight">{s.n}</p>
                  <h3 className="mt-4 font-serif text-2xl">{s.t}</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-ivory/70">{s.d}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal className="mt-14 text-center">
            <Link href="/journal">
              <Button variant="secondary" className="!border-ivory/30 !text-ivory hover:!bg-ivory hover:!text-charcoal">
                Read the studio journal
              </Button>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ============ PRESS / TESTIMONIALS ============ */}
      <section className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-36" aria-label="Collectors and press">
        <Reveal>
          <SectionHeading align="center" eyebrow="In their words" title="Collectors & press" />
        </Reveal>
        <Stagger className="mt-14 grid gap-10 md:grid-cols-3">
          {testimonials.map((t) => (
            <StaggerItem key={t.id}>
              <Reveal as="blockquote" className="flex h-full flex-col border-t-2 border-terracotta/60 pt-8">
                <p className="font-serif text-xl italic leading-relaxed text-charcoal">“{t.quote}”</p>
                <footer className="mt-6">
                  <p className="text-sm font-medium">{t.name}</p>
                  {t.role && <p className="micro-label mt-1">{t.role}</p>}
                </footer>
              </Reveal>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ============ JOURNAL TEASER ============ */}
      {posts.length > 0 && (
        <section className="bg-beige/60 py-24 md:py-32" aria-label="From the journal">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <Reveal>
                <SectionHeading eyebrow="Journal" title="Notes from the studio" />
              </Reveal>
              <Reveal delay={0.1}>
                <Link href="/journal" className="link-sweep text-sm uppercase tracking-widest2 text-terracotta">
                  All entries →
                </Link>
              </Reveal>
            </div>
            <Stagger className="mt-12 grid gap-8 md:grid-cols-3">
              {posts.slice(0, 3).map((p) => (
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
                    <p className="mt-2 text-[15px] text-smoke">{truncate(p.excerpt, 120)}</p>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      )}

      {/* ============ NEWSLETTER ============ */}
      <section className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-36" aria-label="Newsletter">
        <Reveal>
          <NewsletterSignup />
        </Reveal>
      </section>
    </>
  );
}
