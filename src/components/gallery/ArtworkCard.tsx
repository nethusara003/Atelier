'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import type { Artwork } from '@/types/database';
import { formatPrice } from '@/lib/format';
import { Badge } from '../ui/primitives';

function statusBadge(status: Artwork['status']) {
  if (status === 'sold') return <Badge tone="dark">Sold</Badge>;
  if (status === 'reserved') return <Badge tone="clay">Reserved</Badge>;
  return null;
}

/**
 * Editorial artwork card. The image is never obscured: on hover a slim
 * ivory caption bar rises from the bottom with title / medium / price.
 */
export function ArtworkCard({ artwork, index = 0 }: { artwork: Artwork; index?: number }) {
  const reduce = useReducedMotion();
  const primary = artwork.images?.[0];
  const src = primary?.url ?? '/images/artworks/painting-1.jpg';

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.75, delay: (index % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      <Link href={`/artwork/${artwork.slug}`} className="block" aria-label={`${artwork.title} — view details`}>
        <div className="relative aspect-[4/5] overflow-hidden bg-beige">
          <Image
            src={src}
            alt={primary?.alt ?? artwork.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045]"
          />
          {artwork.status !== 'available' && (
            <div className="absolute left-4 top-4">{statusBadge(artwork.status)}</div>
          )}
          {/* hover caption: rises without covering the artwork's heart */}
          <div
            className="absolute inset-x-0 bottom-0 translate-y-2 bg-ivory/95 px-5 py-4 opacity-0 backdrop-blur-sm transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
            aria-hidden
          >
            <div className="flex items-baseline justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate font-serif text-lg leading-tight">{artwork.title}</p>
                <p className="micro-label mt-1 truncate">
                  {artwork.materials[0] ?? artwork.category?.name}
                  {artwork.edition_type === 'limited' && artwork.edition_total
                    ? ` · Ed. of ${artwork.edition_total}`
                    : artwork.edition_type === 'one_of_one'
                      ? ' · One of one'
                      : ''}
                </p>
              </div>
              <p className="shrink-0 text-[15px] font-medium text-terracotta">
                {artwork.status === 'sold' ? 'Sold' : formatPrice(artwork.price_cents, artwork.currency)}
              </p>
            </div>
          </div>
        </div>
        {/* always-visible caption for touch / reduced-motion users */}
        <div className="flex items-baseline justify-between gap-4 px-0.5 pt-4 md:hidden">
          <div className="min-w-0">
            <h3 className="truncate font-serif text-lg leading-tight">{artwork.title}</h3>
            <p className="micro-label mt-1 truncate">{artwork.materials[0] ?? artwork.category?.name}</p>
          </div>
          <p className="shrink-0 text-[15px] font-medium text-terracotta">
            {artwork.status === 'sold' ? 'Sold' : formatPrice(artwork.price_cents, artwork.currency)}
          </p>
        </div>
      </Link>
    </motion.article>
  );
}
