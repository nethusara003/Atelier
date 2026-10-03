'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Artwork } from '@/types/database';
import { formatPrice } from '@/lib/format';
import { useCart } from '../cart/CartProvider';
import { useSavedArtworks } from '../cart/saved-artworks';
import { Button } from '../ui/Button';
import { Badge } from '../ui/primitives';

function editionLabel(a: Artwork): string {
  if (a.edition_type === 'one_of_one') return 'One of one — the only one in existence';
  if (a.edition_type === 'limited' && a.edition_total)
    return `Limited edition of ${a.edition_total} · ${a.edition_available ?? a.stock} remaining`;
  return 'Open edition — made to order in small batches';
}

export function PurchasePanel({ artwork }: { artwork: Artwork }) {
  const { addLine } = useCart();
  const { toggle, isSaved } = useSavedArtworks();
  const [added, setAdded] = useState(false);

  const primary = artwork.images?.[0];
  const available = artwork.status === 'available' && artwork.stock > 0;
  const maxQty = Math.max(1, Math.min(artwork.stock, artwork.edition_available ?? artwork.stock));
  const saved = isSaved(artwork.slug);

  const handleAdd = () => {
    addLine(
      {
        artworkId: artwork.id,
        title: artwork.title,
        unitPriceCents: artwork.price_cents,
        currency: artwork.currency,
        image: primary?.url ?? '/images/artworks/painting-1.jpg',
        maxQuantity: maxQty,
      },
      1
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="border-t hairline pt-8">
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-serif text-4xl">{formatPrice(artwork.price_cents, artwork.currency)}</p>
        {artwork.status === 'reserved' && <Badge tone="clay">Reserved</Badge>}
        {artwork.status === 'sold' && <Badge tone="dark">Sold</Badge>}
      </div>
      <p className="micro-label mt-3">{editionLabel(artwork)}</p>

      {available ? (
        <div className="mt-7 space-y-3">
          <Button onClick={handleAdd} className="w-full" aria-live="polite">
            {added ? 'Added to your cart ✓' : 'Add to cart'}
          </Button>
          <p className="text-xs leading-relaxed text-stone">
            Insured worldwide shipping · 14-day returns · Certificate of authenticity included.
          </p>
        </div>
      ) : artwork.status === 'reserved' ? (
        <div className="mt-7 space-y-3">
          <Button variant="secondary" className="w-full" disabled={false}>
            <Link href={`/contact?subject=${encodeURIComponent(`Enquiry: ${artwork.title}`)}`}>
              Enquire about this piece
            </Link>
          </Button>
          <p className="text-xs leading-relaxed text-stone">
            This piece is currently reserved. Leave an enquiry — reservations occasionally lapse.
          </p>
        </div>
      ) : (
        <div className="mt-7">
          <p className="border hairline px-5 py-4 text-sm text-smoke">
            This piece has found its home.{' '}
            <Link href="/commissions" className="link-sweep text-terracotta">
              Commission something similar
            </Link>
            .
          </p>
        </div>
      )}

      <button
        onClick={() =>
          toggle({
            slug: artwork.slug,
            title: artwork.title,
            image: primary?.url ?? '',
            price: formatPrice(artwork.price_cents, artwork.currency),
          })
        }
        aria-pressed={saved}
        className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-widest2 text-stone transition-colors hover:text-terracotta"
      >
        <svg width="15" height="15" viewBox="0 0 15 15" fill={saved ? 'currentColor' : 'none'} aria-hidden>
          <path d="M3 1.5h9V14l-4.5-3.5L3 14V1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
        {saved ? 'Saved to your collection' : 'Save this artwork'}
      </button>

      <dl className="mt-8 space-y-3 border-t hairline pt-6 text-sm">
        <div className="flex justify-between gap-6">
          <dt className="micro-label">Delivery</dt>
          <dd className="text-right text-smoke">Ships in 5–7 days, tracked & insured worldwide</dd>
        </div>
        <div className="flex justify-between gap-6">
          <dt className="micro-label">Packaging</dt>
          <dd className="text-right text-smoke">Hand-built crate, plastic-free materials</dd>
        </div>
        <div className="flex justify-between gap-6">
          <dt className="micro-label">Returns</dt>
          <dd className="text-right text-smoke">14 days, no questions asked</dd>
        </div>
      </dl>
    </div>
  );
}
