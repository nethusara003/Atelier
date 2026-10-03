import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/primitives';
import { Reveal, Stagger, StaggerItem } from '@/components/motion/Reveal';
import { ParallaxImage } from '@/components/motion/ParallaxImage';

export const metadata = {
  title: 'About Elena Voss',
  description:
    'Biography, artistic philosophy, exhibitions and press for Elena Voss — painter and ceramicist working in Paris.',
};

const EXHIBITIONS = [
  { year: '2025', title: 'Terra Memoria', venue: 'Galerie Sept, Paris', note: 'Solo' },
  { year: '2024', title: 'Quiet Hours', venue: 'The Clay Rooms, London', note: 'Solo' },
  { year: '2023', title: 'Hands & Earth', venue: 'Maison des Métiers d’Art, Lyon', note: 'Group' },
  { year: '2022', title: 'Salon des Artistes Décorateurs', venue: 'Grand Palais Éphémère, Paris', note: 'Group' },
  { year: '2021', title: 'Woven Light', venue: 'Atelier Voss (studio show), Paris', note: 'Solo' },
  { year: '2019', title: 'New Ceramics Biennale', venue: 'Stoke-on-Trent, UK', note: 'Group' },
];

const AWARDS = [
  { year: '2023', title: 'Prix des Métiers d’Art, Île-de-France', detail: 'For the Terra Memoria vessel series' },
  { year: '2020', title: 'Crafts Council Maker Grant', detail: 'Wood-kiln research residency' },
  { year: '2017', title: 'Residency, European Ceramic Work Centre', detail: '’s-Hertogenbosch, Netherlands' },
];

const PRESS = [
  { outlet: 'The Slow Home Review', quote: 'Voss makes objects that slow a room down.' },
  { outlet: 'Ceramics Monthly', quote: 'A wood-firer of rare patience and quiet drama.' },
  { outlet: 'Maison Intérieure', quote: 'Her textiles hold light the way linen holds memory.' },
  { outlet: 'Kunst & Handwerk', quote: 'One of the most honest hands working in Europe today.' },
];

export default function AboutPage() {
  return (
    <div className="pt-28 md:pt-36">
      {/* hero */}
      <section className="mx-auto max-w-7xl px-5 md:px-8" aria-label="Biography">
        <div className="grid gap-12 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-7">
            <Reveal>
              <p className="micro-label">About the artist</p>
              <h1 className="mt-4 font-serif text-5xl leading-[1.02] md:text-7xl">
                Elena Voss
              </h1>
              <p className="mt-6 max-w-2xl text-[19px] leading-relaxed text-smoke">
                Elena Voss (b. 1979, Hamburg) is a painter and ceramicist living in Paris.
                Trained first as a weaver in Copenhagen and later in ceramics in Mashiko,
                Japan, she has spent twenty years building a practice around a single
                conviction: that objects made slowly carry something machines cannot give them.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-8 space-y-5 max-w-2xl text-[17px] leading-relaxed text-smoke">
                <p>
                  Her studio in the Marais houses a potter’s wheel, two looms, an easel
                  that has survived three moves, and a wood kiln in a garden courtyard —
                  the fire she calls her most honest collaborator. She works across
                  painting, ceramics, sculpture and textiles, often letting one discipline
                  interrupt another: a glaze recipe becomes a painting palette; a weaving
                  rhythm becomes the throwing rhythm of a bowl.
                </p>
                <p>
                  Elena’s work is held in private collections across Europe, the UK and
                  North America, and in the permanent collection of the Musée des Arts
                  Décoratifs. She accepts a small number of commissions each year and
                  opens the studio to visitors by appointment.
                </p>
              </div>
            </Reveal>
          </div>
          <Reveal className="md:col-span-5" y={40}>
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image
                src="/images/studio/portrait.jpg"
                alt="Elena Voss in her Paris studio"
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
                priority
              />
            </div>
            <p className="micro-label mt-3">Elena in the Marais studio, 2025</p>
          </Reveal>
        </div>
      </section>

      {/* philosophy */}
      <section className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32" aria-label="Artistic philosophy">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Reveal>
              <SectionHeading eyebrow="Philosophy" title="What the work believes" />
            </Reveal>
          </div>
          <Stagger className="md:col-span-7 space-y-10">
            {[
              { t: 'The hand stays visible', d: 'Throwing rings, brush marks, the uneven edge of a hand-cut aperture — these are not flaws to polish away. They are the signature of the only instrument that matters.' },
              { t: 'Material first, idea second', d: 'Every piece begins with the substance: dug clay, ground pigment, undyed wool. The material proposes; the artist disposes. Fighting the material is how you learn what it wants to be.' },
              { t: 'Slowness is a technique', d: 'A wood firing takes three days. A painting takes months of glazes. A tapestry takes a season of evenings. Hurry is the one tool the studio refuses to own.' },
              { t: 'Use is a form of respect', d: 'Bowls are for porridge, cups for morning coffee, runners for tables that get used. The most beautiful object is the one that earns its place in a daily ritual.' },
            ].map((p) => (
              <StaggerItem key={p.t}>
                <div className="border-l-2 border-terracotta/60 pl-8">
                  <h3 className="font-serif text-2xl">{p.t}</h3>
                  <p className="mt-3 text-[16px] leading-relaxed text-smoke">{p.d}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* studio images */}
      <section className="bg-parchment py-24 md:py-32" aria-label="The studio">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="The studio"
              title="A converted Marais atelier"
              body="Two looms, one wheel, an easel with twenty years of paint on its edges — and a wood kiln in the courtyard garden."
            />
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <Reveal>
              <ParallaxImage
                src="/images/studio/studio-1.jpg"
                alt="The worktable with vessels in progress"
                className="aspect-[4/3]"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <p className="micro-label mt-3">The worktable, spring</p>
            </Reveal>
            <Reveal delay={0.12}>
              <ParallaxImage
                src="/images/studio/studio-2.jpg"
                alt="Shelves of bowls drying in window light"
                className="aspect-[4/3] md:mt-16"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <p className="micro-label mt-3 md:ml-16">Drying shelves, morning light</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* exhibitions / awards / press */}
      <section className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32" aria-label="Exhibitions, awards and press">
        <div className="grid gap-16 md:grid-cols-2">
          <div>
            <Reveal>
              <SectionHeading eyebrow="Selected exhibitions" title="Exhibitions" />
            </Reveal>
            <ul className="mt-10 divide-y divide-charcoal/10">
              {EXHIBITIONS.map((e) => (
                <Reveal as="li" key={`${e.year}-${e.title}`} className="flex gap-6 py-5">
                  <span className="w-12 shrink-0 font-serif text-xl text-clay">{e.year}</span>
                  <div>
                    <p className="font-serif text-xl">{e.title} <span className="text-smoke text-base">· {e.note}</span></p>
                    <p className="micro-label mt-1">{e.venue}</p>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
          <div className="space-y-16">
            <div>
              <Reveal>
                <SectionHeading eyebrow="Recognition" title="Awards" />
              </Reveal>
              <ul className="mt-10 space-y-6">
                {AWARDS.map((a) => (
                  <Reveal as="li" key={a.title} className="border-l-2 border-clay/50 pl-6">
                    <p className="font-medium">{a.title}</p>
                    <p className="micro-label mt-1">{a.year} · {a.detail}</p>
                  </Reveal>
                ))}
              </ul>
            </div>
            <div>
              <Reveal>
                <SectionHeading eyebrow="In print" title="Press" />
              </Reveal>
              <ul className="mt-10 space-y-6">
                {PRESS.map((p) => (
                  <Reveal as="li" key={p.outlet}>
                    <p className="font-serif text-xl italic">“{p.quote}”</p>
                    <p className="micro-label mt-2">— {p.outlet}</p>
                  </Reveal>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <Reveal className="mt-20 text-center">
          <p className="font-serif text-3xl">Visit the studio, or bring a piece home.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/gallery"><Button>Browse the gallery</Button></Link>
            <Link href="/commissions"><Button variant="secondary">Commission a piece</Button></Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
