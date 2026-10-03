import { SectionHeading } from '@/components/ui/primitives';
import { Reveal, Stagger, StaggerItem } from '@/components/motion/Reveal';
import { CommissionForm } from '@/components/commissions/CommissionForm';

export const metadata = {
  title: 'Commissions',
  description:
    'Commission a custom painting, ceramic piece, sculpture or textile from Elena Voss. Process, timelines and pricing guidance.',
};

const STEPS = [
  { n: '01', t: 'Conversation', d: 'Tell the studio what you’re dreaming of — sizes, colours, the room, the occasion. Elena replies personally within two working days, usually with sketches and honest questions.' },
  { n: '02', t: 'Proposal', d: 'You receive a written proposal: concept sketches, materials, dimensions, timeline and a fixed price. A 30% deposit reserves your place in the making schedule.' },
  { n: '03', t: 'Making', d: 'Work begins. You’ll receive progress notes and photographs at natural pauses — the leather-hard stage, the first glaze, the stretcher going up. One round of direction is always welcome.' },
  { n: '04', t: 'Delivery', d: 'The finished piece is photographed for your approval, then crated by hand and shipped insured. The balance is due before dispatch. 14-day returns apply to commissions too.' },
];

const PRICING = [
  { type: 'Small ceramics & vessels', range: 'from $180', note: 'Cups, bowls, small sculptural forms' },
  { type: 'Textile pieces', range: 'from $650', note: 'Runners, embroidered panels; tapestries quoted individually' },
  { type: 'Paintings', range: 'from $1,400', note: 'Priced by size and complexity; large works $4,000+' },
  { type: 'Sculpture', range: 'from $2,800', note: 'Wood and bronze; editioned bronzes from $1,450' },
];

export default function CommissionsPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-28 md:px-8 md:pt-36">
      <div className="max-w-3xl">
        <Reveal>
          <p className="micro-label">Commissions</p>
          <h1 className="mt-4 font-serif text-5xl leading-[1.02] md:text-7xl">
            Made for you, <em className="text-terracotta not-italic font-medium">from scratch</em>
          </h1>
          <p className="mt-6 text-[19px] leading-relaxed text-smoke">
            A painting sized to the wall above your table. A set of bowls in the exact
            glaze of your grandmother’s kitchen. A tapestry the colour of your October
            light. Elena accepts a small number of commissions each year — usually
            eight to ten — so every one gets the full attention of the studio.
          </p>
        </Reveal>
      </div>

      {/* process */}
      <section className="mt-20 md:mt-28" aria-label="Commission process">
        <Reveal>
          <SectionHeading eyebrow="How it works" title="From first note to your wall" />
        </Reveal>
        <Stagger className="mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <StaggerItem key={s.n}>
              <div className="border-t-2 border-terracotta/50 pt-6">
                <p className="font-serif text-4xl text-clay">{s.n}</p>
                <h3 className="mt-3 font-serif text-2xl">{s.t}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-smoke">{s.d}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* pricing + timelines */}
      <section className="mt-20 md:mt-28" aria-label="Pricing guidance">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <Reveal>
              <SectionHeading eyebrow="Guidance" title="What things cost" body="Every commission is quoted individually, but these starting points are honest — most commissions land within 15% of the guide." />
            </Reveal>
            <ul className="mt-10 divide-y divide-charcoal/10">
              {PRICING.map((p) => (
                <Reveal as="li" key={p.type} className="flex items-baseline justify-between gap-6 py-5">
                  <div>
                    <p className="font-serif text-xl">{p.type}</p>
                    <p className="micro-label mt-1">{p.note}</p>
                  </div>
                  <p className="shrink-0 text-lg font-medium text-terracotta">{p.range}</p>
                </Reveal>
              ))}
            </ul>
          </div>
          <div>
            <Reveal>
              <SectionHeading eyebrow="Patience" title="How long things take" />
            </Reveal>
            <ul className="mt-10 space-y-6">
              {[
                ['Ceramics', '6–10 weeks — throwing, drying, two firings, glazing. Wood-fired pieces wait for the next kiln date.'],
                ['Paintings', '8–16 weeks — sketches, underpainting, thin glazes with drying time between each. Large works take a season.'],
                ['Textiles', '10–20 weeks — dyeing, warping the loom, then the slow arithmetic of the weave. Worth every evening.'],
                ['Sculpture', '12–24 weeks — carving or modelling, then casting for bronze with foundry scheduling.'],
              ].map(([t, d]) => (
                <Reveal as="li" key={t} className="border-l-2 border-clay/50 pl-6">
                  <p className="font-serif text-xl">{t}</p>
                  <p className="mt-2 text-[15px] leading-relaxed text-smoke">{d}</p>
                </Reveal>
              ))}
            </ul>
            <Reveal delay={0.1}>
              <p className="mt-8 border hairline bg-parchment px-6 py-5 text-sm leading-relaxed text-smoke">
                <span className="font-medium text-charcoal">Currently booking:</span> the studio
                is accepting commissions for completion from late spring onward. Earlier
                slots occasionally open — ask.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* form */}
      <section className="mx-auto mt-20 max-w-3xl md:mt-28" aria-label="Commission enquiry form">
        <Reveal>
          <SectionHeading
            align="center"
            eyebrow="Begin"
            title="Tell us what you’re dreaming of"
            body="The more detail you share — sizes, colours, the room, the feeling — the more thoughtful the reply."
          />
        </Reveal>
        <Reveal delay={0.1} className="mt-10">
          <CommissionForm />
        </Reveal>
      </section>
    </div>
  );
}
