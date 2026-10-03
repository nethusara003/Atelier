export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://atelier-voss.com';

export function artistJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Elena Voss',
    jobTitle: 'Artist — painter & ceramicist',
    url: SITE,
    image: `${SITE}/images/studio/portrait.jpg`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: '14 Rue des Rosiers',
      addressLocality: 'Paris',
      postalCode: '75004',
      addressCountry: 'FR',
    },
  };
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Atelier Voss',
    url: SITE,
    logo: `${SITE}/images/studio/portrait.jpg`,
    sameAs: ['https://instagram.com/atelier.voss', 'https://pinterest.com/ateliervoss'],
    address: {
      '@type': 'PostalAddress',
      streetAddress: '14 Rue des Rosiers',
      addressLocality: 'Paris',
      postalCode: '75004',
      addressCountry: 'FR',
    },
  };
}

export function productJsonLd(a: {
  title: string;
  description: string;
  slug: string;
  price_cents: number;
  currency: string;
  status: string;
  image: string;
  materials: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: a.title,
    description: a.description,
    image: `${SITE}${a.image}`,
    material: a.materials.join(', '),
    brand: { '@type': 'Brand', name: 'Atelier Voss' },
    offers: {
      '@type': 'Offer',
      url: `${SITE}/artwork/${a.slug}`,
      priceCurrency: a.currency,
      price: (a.price_cents / 100).toFixed(2),
      availability:
        a.status === 'available'
          ? 'https://schema.org/InStock'
          : a.status === 'reserved'
            ? 'https://schema.org/Reserved'
            : 'https://schema.org/OutOfStock',
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${SITE}${it.path}`,
    })),
  };
}
