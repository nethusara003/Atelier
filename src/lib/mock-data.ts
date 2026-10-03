/**
 * Demo-mode dataset mirroring supabase/seed.sql.
 * Used automatically when Supabase env vars are absent, so the site
 * renders fully without credentials. Swap to live data by configuring env.
 */
import type {
  Artwork,
  ArtworkImage,
  Category,
  Collection,
  JournalPost,
  Testimonial,
} from '@/types/database';

export const categories: Category[] = [
  { id: 'cat-paintings', name: 'Paintings', slug: 'paintings', description: 'Original oil and mixed-media paintings on linen and panel.' },
  { id: 'cat-ceramics', name: 'Ceramics', slug: 'ceramics', description: 'Hand-thrown stoneware vessels, bowls and sculptural forms.' },
  { id: 'cat-sculpture', name: 'Sculpture', slug: 'sculpture', description: 'Carved wood, bronze and assembled sculptural pieces.' },
  { id: 'cat-textile', name: 'Textile Art', slug: 'textile-art', description: 'Hand-woven tapestries and embroidered wall pieces.' },
  { id: 'cat-decor', name: 'Home Décor', slug: 'home-decor', description: 'Functional handmade objects for considered interiors.' },
];

export const collections: Collection[] = [
  { id: 'col-terra', name: 'Terra Memoria', slug: 'terra-memoria', description: 'Earth pigments, raw linen and fired clay — a meditation on soil, memory and the quiet labour of the hand.', cover_image: '/images/artworks/ceramic-1.jpg', featured: true, sort_order: 1 },
  { id: 'col-quiet', name: 'Quiet Hours', slug: 'quiet-hours', description: 'Muted interiors and still vessels painted at dawn. Works about slowness, held breath and morning light.', cover_image: '/images/artworks/painting-1.jpg', featured: true, sort_order: 2 },
  { id: 'col-woven', name: 'Woven Light', slug: 'woven-light', description: 'Hand-loomed textiles in undyed wool and plant-dyed thread — rhythm made visible, thread by thread.', cover_image: '/images/artworks/textile-1.jpg', featured: false, sort_order: 3 },
];

type RawArtwork = Omit<Artwork, 'category' | 'collection' | 'images' | 'category_id' | 'collection_id'> & {
  categorySlug: string;
  collectionSlug: string | null;
  imageFiles: { file: string; alt: string }[];
};

const raw: RawArtwork[] = [
  {
    id: 'art-001', slug: 'morning-vessel-i', title: 'Morning Vessel I',
    description: 'Hand-thrown stoneware vessel in warm ivory with an iron-oxide wash, wood-fired for three days.',
    story: 'This vessel was thrown at dawn in early spring, when the studio was still cold and the clay fought back. I kept the throwing rings visible — I like the honesty of them. It survived the wood kiln with a single iron kiss down one shoulder, and I decided that mark was the whole point.',
    categorySlug: 'ceramics', collectionSlug: 'terra-memoria',
    price_cents: 48000, currency: 'USD', edition_type: 'one_of_one', edition_total: null, edition_available: null,
    stock: 1, status: 'available', materials: ['Stoneware', 'Iron oxide wash', 'Wood-fired'],
    dimensions: { width: 18, height: 27, unit: 'cm' }, weight_grams: 1450, year: 2025, featured: true, published: true,
    created_at: '2025-03-02T10:00:00Z', updated_at: '2025-03-02T10:00:00Z',
    imageFiles: [
      { file: 'ceramic-1.jpg', alt: 'Hand-thrown stoneware vessel in ivory with iron wash' },
      { file: 'ceramic-2.jpg', alt: 'Detail of the iron-oxide shoulder mark' },
    ],
  },
  {
    id: 'art-002', slug: 'field-study-no-4', title: 'Field Study No. 4',
    description: 'Oil and earth pigment on linen — a low horizon of ochre and umber beneath a pale, weathered sky.',
    story: 'Painted from sketches made walking the same field for eleven mornings. Each day the light was different and the field was the same. I stopped trying to paint what I saw and started painting the repetition instead.',
    categorySlug: 'paintings', collectionSlug: 'quiet-hours',
    price_cents: 240000, currency: 'USD', edition_type: 'one_of_one', edition_total: null, edition_available: null,
    stock: 1, status: 'available', materials: ['Oil on linen', 'Earth pigments', 'Beeswax finish'],
    dimensions: { width: 90, height: 70, unit: 'cm' }, weight_grams: 2800, year: 2024, featured: true, published: true,
    created_at: '2024-11-10T10:00:00Z', updated_at: '2024-11-10T10:00:00Z',
    imageFiles: [
      { file: 'painting-1.jpg', alt: 'Oil painting of a low ochre horizon under a pale sky' },
      { file: 'painting-2.jpg', alt: 'Detail of impasto sky in Field Study No. 4' },
    ],
  },
  {
    id: 'art-003', slug: 'harvest-bowls-set', title: 'Harvest Bowls, Set of Three',
    description: 'A trio of nested stoneware bowls in graduated sizes, glazed inside with a soft oat-milk matte.',
    story: 'I make these in batches of twelve and keep the three that sit best together. They are meant to be used — for morning porridge, for olives at dusk, for keys by the door. The glaze will craze gently with years of washing; that is by design.',
    categorySlug: 'ceramics', collectionSlug: 'terra-memoria',
    price_cents: 18500, currency: 'USD', edition_type: 'open', edition_total: null, edition_available: null,
    stock: 8, status: 'available', materials: ['Stoneware', 'Matte food-safe glaze'],
    dimensions: { width: 16, height: 8, unit: 'cm' }, weight_grams: 900, year: 2025, featured: true, published: true,
    created_at: '2025-02-14T10:00:00Z', updated_at: '2025-02-14T10:00:00Z',
    imageFiles: [{ file: 'ceramic-3.jpg', alt: 'Three nested stoneware bowls in graduated sizes' }],
  },
  {
    id: 'art-004', slug: 'still-life-with-figs', title: 'Still Life with Figs',
    description: 'Oil on panel — figs, a linen cloth and late-afternoon light, painted in a single sustained session.',
    story: 'Figs only hold their pose for a day. I painted this in one long sitting, racing the fruit, and you can feel the hurry in the background and the calm in the cloth. It is my favourite kind of contradiction.',
    categorySlug: 'paintings', collectionSlug: 'quiet-hours',
    price_cents: 165000, currency: 'USD', edition_type: 'one_of_one', edition_total: null, edition_available: null,
    stock: 1, status: 'available', materials: ['Oil on wood panel', 'Cold-wax medium'],
    dimensions: { width: 60, height: 50, unit: 'cm' }, weight_grams: 1900, year: 2023, featured: false, published: true,
    created_at: '2023-09-05T10:00:00Z', updated_at: '2023-09-05T10:00:00Z',
    imageFiles: [{ file: 'painting-3.jpg', alt: 'Oil still life of figs on a linen cloth' }],
  },
  {
    id: 'art-005', slug: 'loom-study-dusk', title: 'Loom Study: Dusk',
    description: 'Hand-woven wall tapestry in undyed wool, walnut-dyed thread and raw linen warp.',
    story: 'Woven over six weeks, two hours each evening after the studio closed. The palette follows the light outside my window as autumn came on — I dyed the weft to match the sky on the days I worked. It is, quietly, a calendar.',
    categorySlug: 'textile-art', collectionSlug: 'woven-light',
    price_cents: 89000, currency: 'USD', edition_type: 'one_of_one', edition_total: null, edition_available: null,
    stock: 1, status: 'available', materials: ['Undyed wool', 'Walnut-dyed thread', 'Linen warp', 'Oak dowel'],
    dimensions: { width: 75, height: 110, unit: 'cm' }, weight_grams: 1200, year: 2024, featured: true, published: true,
    created_at: '2024-12-01T10:00:00Z', updated_at: '2024-12-01T10:00:00Z',
    imageFiles: [
      { file: 'textile-1.jpg', alt: 'Hand-woven tapestry in undyed wool and walnut tones' },
      { file: 'textile-2.jpg', alt: 'Detail of the hand-woven weft in Loom Study: Dusk' },
    ],
  },
  {
    id: 'art-006', slug: 'ember-cups-pair', title: 'Ember Cups, Pair',
    description: 'Two hand-built ceramic cups with a smoked terracotta exterior and glazed interior.',
    story: 'Pinched rather than thrown, so each keeps the memory of fingers. I smoke-fire them in a small pit behind the studio — the colour is never the same twice, which is why they are sold as pairs from the same firing.',
    categorySlug: 'ceramics', collectionSlug: 'terra-memoria',
    price_cents: 9500, currency: 'USD', edition_type: 'limited', edition_total: 40, edition_available: 23,
    stock: 23, status: 'available', materials: ['Stoneware', 'Pit-fired', 'Food-safe liner glaze'],
    dimensions: { width: 9, height: 10, unit: 'cm' }, weight_grams: 420, year: 2025, featured: false, published: true,
    created_at: '2025-01-20T10:00:00Z', updated_at: '2025-01-20T10:00:00Z',
    imageFiles: [{ file: 'ceramic-2.jpg', alt: 'Pair of smoked terracotta cups' }],
  },
  {
    id: 'art-007', slug: 'standing-figure-ash', title: 'Standing Figure (Ash)',
    description: 'Carved ash-wood figure, oil-finished, standing 64 cm tall on a charred oak base.',
    story: 'Carved over winter from a single ash log felled in the studio garden. I worked with the grain and the knots rather than against them — the figure leans the way the tree leaned. The base is the same wood, charred in the Japanese shou-sugi-ban manner.',
    categorySlug: 'sculpture', collectionSlug: null,
    price_cents: 320000, currency: 'USD', edition_type: 'one_of_one', edition_total: null, edition_available: null,
    stock: 1, status: 'available', materials: ['Carved ash wood', 'Charred oak base', 'Hardwax oil'],
    dimensions: { width: 22, height: 64, depth: 20, unit: 'cm' }, weight_grams: 8400, year: 2023, featured: true, published: true,
    created_at: '2023-04-11T10:00:00Z', updated_at: '2023-04-11T10:00:00Z',
    imageFiles: [{ file: 'sculpture-1.jpg', alt: 'Carved ash-wood standing figure on charred oak base' }],
  },
  {
    id: 'art-008', slug: 'linen-light-i', title: 'Linen Light I',
    description: 'Embroidered linen panel — hand-stitched lines mapping a week of morning light across the studio wall.',
    story: 'For one week I marked, each morning, where the light fell on the studio wall, then stitched the marks in flax thread. A drawing made of attention more than image.',
    categorySlug: 'textile-art', collectionSlug: 'woven-light',
    price_cents: 54000, currency: 'USD', edition_type: 'one_of_one', edition_total: null, edition_available: null,
    stock: 1, status: 'reserved', materials: ['Belgian linen', 'Hand-dyed flax thread', 'Oak frame'],
    dimensions: { width: 55, height: 70, unit: 'cm' }, weight_grams: 800, year: 2024, featured: false, published: true,
    created_at: '2024-06-15T10:00:00Z', updated_at: '2024-06-15T10:00:00Z',
    imageFiles: [{ file: 'textile-2.jpg', alt: 'Embroidered linen panel mapping morning light' }],
  },
  {
    id: 'art-009', slug: 'tide-pools-triptych', title: 'Tide Pools (Triptych)',
    description: 'Three small oil studies on panel — rock pools at low tide, painted en plein air on the Brittany coast.',
    story: 'Painted with the panels balanced on my knees and the tide coming in. Salt got into the paint; I consider it a collaboration.',
    categorySlug: 'paintings', collectionSlug: 'quiet-hours',
    price_cents: 72000, currency: 'USD', edition_type: 'one_of_one', edition_total: null, edition_available: null,
    stock: 1, status: 'available', materials: ['Oil on wood panel (3)'],
    dimensions: { width: 120, height: 30, unit: 'cm' }, weight_grams: 2400, year: 2022, featured: false, published: true,
    created_at: '2022-08-22T10:00:00Z', updated_at: '2022-08-22T10:00:00Z',
    imageFiles: [{ file: 'painting-4.jpg', alt: 'Triptych of tidal rock pools in oil on panel' }],
  },
  {
    id: 'art-010', slug: 'garden-lantern', title: 'Garden Lantern',
    description: 'Pierced stoneware lantern — candlelight escapes through hand-cut apertures in a rough clay body.',
    story: 'Designed for long evenings. The apertures are cut freehand so no two cast the same pattern. Unglazed outside; it weathers beautifully and grows more itself with rain.',
    categorySlug: 'home-decor', collectionSlug: 'terra-memoria',
    price_cents: 13200, currency: 'USD', edition_type: 'open', edition_total: null, edition_available: null,
    stock: 12, status: 'available', materials: ['Stoneware', 'Unglazed exterior'],
    dimensions: { width: 14, height: 22, unit: 'cm' }, weight_grams: 1100, year: 2025, featured: false, published: true,
    created_at: '2025-05-06T10:00:00Z', updated_at: '2025-05-06T10:00:00Z',
    imageFiles: [{ file: 'decor-1.jpg', alt: 'Pierced stoneware lantern glowing with candlelight' }],
  },
  {
    id: 'art-011', slug: 'bronze-seed-ii', title: 'Bronze Seed II',
    description: 'Cast bronze seed form on a limestone plinth — the second in an edition of twelve.',
    story: 'Modelled in wax from a horse-chestnut seed, then cast in bronze and given a warm brown patina. Small enough to hold; heavy enough to mean it.',
    categorySlug: 'sculpture', collectionSlug: null,
    price_cents: 145000, currency: 'USD', edition_type: 'limited', edition_total: 12, edition_available: 5,
    stock: 5, status: 'available', materials: ['Cast bronze', 'Limestone plinth'],
    dimensions: { width: 10, height: 16, depth: 10, unit: 'cm' }, weight_grams: 2300, year: 2024, featured: false, published: true,
    created_at: '2024-03-30T10:00:00Z', updated_at: '2024-03-30T10:00:00Z',
    imageFiles: [{ file: 'sculpture-2.jpg', alt: 'Cast bronze seed form on limestone plinth' }],
  },
  {
    id: 'art-012', slug: 'winter-table-runner', title: 'Winter Table Runner',
    description: 'Hand-loomed runner in undyed wool with a single terracotta stripe — woven on a countermarch loom.',
    story: 'My one concession to the purely functional. Woven slowly, hemmed by hand, and soft enough that people always touch it first and ask second.',
    categorySlug: 'home-decor', collectionSlug: 'woven-light',
    price_cents: 7800, currency: 'USD', edition_type: 'open', edition_total: null, edition_available: null,
    stock: 20, status: 'available', materials: ['Undyed wool', 'Madder-dyed stripe'],
    dimensions: { width: 40, height: 220, unit: 'cm' }, weight_grams: 600, year: 2025, featured: false, published: true,
    created_at: '2025-06-12T10:00:00Z', updated_at: '2025-06-12T10:00:00Z',
    imageFiles: [{ file: 'textile-1.jpg', alt: 'Hand-loomed wool table runner with terracotta stripe' }],
  },
];

function catBySlug(slug: string): Category {
  return categories.find((c) => c.slug === slug)!;
}
function colBySlug(slug: string | null): Collection | null {
  return slug ? collections.find((c) => c.slug === slug) ?? null : null;
}

export const artworks: Artwork[] = raw.map((r) => {
  const { categorySlug, collectionSlug, imageFiles, ...rest } = r;
  const images: ArtworkImage[] = imageFiles.map((f, i) => ({
    id: `${r.id}-img-${i}`,
    artwork_id: r.id,
    url: `/images/artworks/${f.file}`,
    alt: f.alt,
    position: i + 1,
    is_primary: i === 0,
  }));
  return {
    ...rest,
    category_id: catBySlug(categorySlug).id,
    collection_id: colBySlug(collectionSlug)?.id ?? null,
    category: catBySlug(categorySlug),
    collection: colBySlug(collectionSlug),
    images,
  };
});

export const journalPosts: JournalPost[] = [
  {
    id: 'post-1', slug: 'firing-the-wood-kiln', title: 'Three Days at the Wood Kiln',
    excerpt: 'Stoking a wood kiln is a conversation in fire. Notes from the spring firing that produced the Terra Memoria vessels.',
    content: `The kiln takes three days and roughly a cord of oak. You feed it every twenty minutes, day and night, and in return it decides — largely on its own — what your pots will look like.\n\nThis spring's firing was kind. The ivory vessels came out with exactly the iron kiss I'd hoped for on the shoulders, and only two pieces were lost to the fire's opinion.\n\nPeople ask why I don't use an electric kiln. The answer is simple: the wood kiln is a collaborator. I make the form; the fire makes the surface. Half the beauty in the Terra Memoria collection belongs to three days of smoke and patience.`,
    cover_image: '/images/journal/journal-1.jpg', published: true, published_at: '2025-04-18T09:00:00Z',
    tags: ['process', 'ceramics', 'kiln'], created_at: '2025-04-18T09:00:00Z',
  },
  {
    id: 'post-2', slug: 'eleven-mornings-one-field', title: 'Eleven Mornings, One Field',
    excerpt: 'On repetition as a painting method — the sketches behind Field Study No. 4.',
    content: `For eleven mornings I walked to the same field with the same sketchbook and stood in the same place.\n\nNothing about the field changed. Everything about the light did. By the fourth morning I stopped drawing the field at all and started drawing the difference between one morning and the next.\n\nField Study No. 4 is the painting that came out of those sketches. It isn't a landscape so much as a record of looking — eleven mornings compressed into one low horizon.`,
    cover_image: '/images/journal/journal-2.jpg', published: true, published_at: '2024-11-02T09:00:00Z',
    tags: ['painting', 'process', 'sketchbook'], created_at: '2024-11-02T09:00:00Z',
  },
  {
    id: 'post-3', slug: 'dyeing-with-walnuts', title: 'Dyeing with Walnuts',
    excerpt: 'The autumn dye pots behind Loom Study: Dusk, and why I match thread to sky.',
    content: `Black walnut husks, gathered in October, simmered for an afternoon, strained through linen. The dye bath smells like rain and gives wool the exact colour of wet bark.\n\nFor Loom Study: Dusk I dyed the weft to match the sky outside the studio on the evenings I wove. Some rows are the pale grey of early dusk; some are the deep umber of late. The tapestry is, without quite meaning to be, a calendar of one autumn.`,
    cover_image: '/images/journal/journal-3.jpg', published: true, published_at: '2024-10-14T09:00:00Z',
    tags: ['textile', 'natural dye', 'process'], created_at: '2024-10-14T09:00:00Z',
  },
  {
    id: 'post-4', slug: 'packing-a-painting', title: 'How I Pack a Painting',
    excerpt: 'What happens between "sold" and the doorbell — the unglamorous craft of getting art across the world intact.',
    content: `Every painting leaves the studio in a double-walled crate I build myself, floated on foam and wrapped in glassine. Corners get extra armour; the crate gets a tilt indicator and a note that says, honestly, "please carry, don't roll."\n\nIt takes about two hours per painting. Collectors sometimes ask why shipping costs what it does — this is why. The work survives the journey because the packing is as considered as the painting.`,
    cover_image: '/images/journal/journal-4.jpg', published: true, published_at: '2025-01-20T09:00:00Z',
    tags: ['studio notes', 'shipping'], created_at: '2025-01-20T09:00:00Z',
  },
];

export const testimonials: Testimonial[] = [
  { id: 't-1', name: 'Margaux Delacroix', role: 'Collector, Lyon', quote: 'The vessel arrived packed like a relic and sits in our hallway like it has always lived there. You can feel the hand in it — that is increasingly rare and worth every centime.', featured: true, sort_order: 1 },
  { id: 't-2', name: 'The Slow Home Review', role: 'Design editorial', quote: 'Voss makes objects that slow a room down. Her ceramics carry the quiet confidence of things made without hurry.', featured: true, sort_order: 2 },
  { id: 't-3', name: 'James Okafor', role: 'Collector, London', quote: 'I commissioned a painting for our dining room and the process felt like a correspondence with a friend. The piece itself is the calmest thing we own.', featured: true, sort_order: 3 },
  { id: 't-4', name: 'Claire Fontaine', role: 'Interior architect, Paris', quote: 'Her textiles do something no machine-made piece can: they hold light differently through the day. I specify her work whenever a project needs soul.', featured: false, sort_order: 4 },
];

/* ---------------- demo admin datasets (shown when Supabase is unconfigured) ---------------- */
import type { Order, Commission, Inquiry, NewsletterSubscriber } from '@/types/database';

export const demoOrders: Order[] = [
  {
    id: 'ord-demo-1', user_id: null, email: 'margaux@example.com', status: 'shipped',
    subtotal_cents: 48000, shipping_cents: 0, total_cents: 48000, currency: 'USD',
    stripe_session_id: 'cs_demo_1', stripe_payment_intent: 'pi_demo_1',
    payment_provider: 'stripe', payment_reference: 'pi_demo_1',
    shipping_address: { name: 'Margaux Delacroix', city: 'Lyon', country: 'FR' },
    notes: 'Please leave with the concierge.',
    created_at: '2025-09-20T14:00:00Z', updated_at: '2025-09-24T09:00:00Z',
    items: [{ id: 'oi-1', order_id: 'ord-demo-1', artwork_id: 'art-001', title: 'Morning Vessel I', unit_price_cents: 48000, quantity: 1 }],
  },
  {
    id: 'ord-demo-2', user_id: null, email: 'james@example.com', status: 'preparing',
    subtotal_cents: 18500, shipping_cents: 4500, total_cents: 23000, currency: 'USD',
    stripe_session_id: 'cs_demo_2', stripe_payment_intent: 'pi_demo_2',
    payment_provider: 'stripe', payment_reference: 'pi_demo_2',
    shipping_address: { name: 'James Okafor', city: 'London', country: 'GB' },
    notes: null,
    created_at: '2025-09-28T10:30:00Z', updated_at: '2025-09-29T11:00:00Z',
    items: [{ id: 'oi-2', order_id: 'ord-demo-2', artwork_id: 'art-003', title: 'Harvest Bowls, Set of Three', unit_price_cents: 18500, quantity: 1 }],
  },
  {
    id: 'ord-demo-3', user_id: null, email: 'claire@example.com', status: 'paid',
    subtotal_cents: 89000, shipping_cents: 0, total_cents: 89000, currency: 'USD',
    stripe_session_id: 'cs_demo_3', stripe_payment_intent: 'pi_demo_3',
    payment_provider: 'stripe', payment_reference: 'pi_demo_3',
    shipping_address: { name: 'Claire Fontaine', city: 'Paris', country: 'FR' },
    notes: null,
    created_at: '2025-10-01T16:45:00Z', updated_at: '2025-10-01T16:47:00Z',
    items: [{ id: 'oi-3', order_id: 'ord-demo-3', artwork_id: 'art-005', title: 'Loom Study: Dusk', unit_price_cents: 89000, quantity: 1 }],
  },
];

export const demoCommissions: Commission[] = [
  {
    id: 'com-demo-1', name: 'Sofia Marchetti', email: 'sofia@example.com', phone: '+39 340 123 4567',
    commission_type: 'painting', budget_range: '1500_5000', timeline: '3_6_months',
    description: 'A large painting for our dining room in warm ochres — roughly 120×90cm, something calm for long dinners. We loved Field Study No. 4.',
    reference_images: [], status: 'in_discussion', created_at: '2025-09-25T09:15:00Z',
  },
  {
    id: 'com-demo-2', name: 'Daniel Reyes', email: 'daniel@example.com', phone: null,
    commission_type: 'ceramics', budget_range: '500_1500', timeline: 'flexible',
    description: 'A set of six dinner plates and serving bowls in the oat-milk glaze, for everyday use.',
    reference_images: [], status: 'new', created_at: '2025-10-02T11:20:00Z',
  },
];

export const demoInquiries: Inquiry[] = [
  {
    id: 'inq-demo-1', name: 'Hannah Lindqvist', email: 'hannah@example.com',
    subject: 'Shipping to Sweden', message: 'Do you ship ceramics to Stockholm, and roughly what does it cost for a medium vessel?',
    inquiry_type: 'purchase', status: 'new', created_at: '2025-10-01T08:00:00Z',
  },
  {
    id: 'inq-demo-2', name: 'Tomas Weber', email: 'tomas@example.com',
    subject: 'Studio visit in November', message: 'We’ll be in Paris mid-November — would love to visit the studio on a Saturday if possible.',
    inquiry_type: 'visit', status: 'replied', created_at: '2025-09-27T15:40:00Z',
  },
];

export const demoSubscribers: NewsletterSubscriber[] = [
  { id: 'sub-1', email: 'reader1@example.com', subscribed_at: '2025-08-10T10:00:00Z' },
  { id: 'sub-2', email: 'reader2@example.com', subscribed_at: '2025-08-22T10:00:00Z' },
  { id: 'sub-3', email: 'reader3@example.com', subscribed_at: '2025-09-05T10:00:00Z' },
];
