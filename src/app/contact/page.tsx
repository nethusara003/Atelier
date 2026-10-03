import { ARTIST } from '@/lib/constants';
import { SectionHeading } from '@/components/ui/primitives';
import { Reveal } from '@/components/motion/Reveal';
import { ContactForm } from '@/components/contact/ContactForm';

export const metadata = {
  title: 'Contact',
  description:
    'Write to Atelier Voss — purchase enquiries, press, studio visits by appointment in Paris.',
};

export default function ContactPage() {
  const mapQuery = encodeURIComponent(ARTIST.address);
  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-28 md:px-8 md:pt-36">
      <div className="grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Reveal>
            <p className="micro-label">Contact</p>
            <h1 className="mt-4 font-serif text-5xl leading-[1.02] md:text-6xl">
              Write to the studio
            </h1>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-smoke">
              Questions about a piece, a commission, a visit — every message is read
              and answered personally, usually within three working days.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="mt-10">
            <ContactForm />
          </Reveal>
        </div>

        <div className="lg:col-span-5">
          <Reveal delay={0.15}>
            <SectionHeading eyebrow="Visit" title="The studio" />
            <address className="mt-6 space-y-2 text-[16px] not-italic text-smoke">
              <p className="font-medium text-charcoal">{ARTIST.studioName}</p>
              <p>{ARTIST.address}</p>
              <p>
                <a href={`mailto:${ARTIST.email}`} className="link-sweep text-terracotta">{ARTIST.email}</a>
              </p>
              <p>{ARTIST.phone}</p>
            </address>
            <div className="mt-6 border hairline bg-parchment px-6 py-5">
              <p className="micro-label">Studio visits</p>
              <p className="mt-2 text-[15px] leading-relaxed text-smoke">
                Thursday – Saturday, 10:00 – 17:00, by appointment. Choose
                “Studio visit” in the form and suggest a date — we’ll confirm by email
                within two working days.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.2} className="mt-8">
            <p className="micro-label mb-3">Find us</p>
            <div className="relative aspect-[4/3] overflow-hidden border hairline">
              <iframe
                title="Map — Atelier Voss, Paris"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=2.3522%2C48.8566%2C2.3722%2C48.8666&layer=mapnik&marker=48.8616%2C2.3622`}
                className="absolute inset-0 h-full w-full grayscale-[35%] contrast-[1.05]"
                loading="lazy"
              />
            </div>
            <a
              href={`https://www.openstreetmap.org/search?query=${mapQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              className="link-sweep mt-3 inline-block text-xs uppercase tracking-widest2 text-stone hover:text-terracotta"
            >
              Open in maps →
            </a>
          </Reveal>

          <Reveal delay={0.25} className="mt-8">
            <p className="micro-label mb-4">Elsewhere</p>
            <div className="flex gap-6 text-sm">
              <a href={ARTIST.instagram} target="_blank" rel="noopener noreferrer" className="link-sweep text-charcoal hover:text-terracotta">Instagram</a>
              <a href={ARTIST.pinterest} target="_blank" rel="noopener noreferrer" className="link-sweep text-charcoal hover:text-terracotta">Pinterest</a>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
