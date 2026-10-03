'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import type { Artwork, Category, Collection } from '@/types/database';
import { FilterBar, EMPTY_FILTERS, type GalleryFilters } from './FilterBar';
import { ArtworkCard } from './ArtworkCard';
import { EmptyState } from '../ui/primitives';
import Link from 'next/link';
import { Button } from '../ui/Button';

function priceBandToCents(band: string): { min?: number; max?: number } {
  if (band === 'under500') return { max: 49999 };
  if (band === '500to2000') return { min: 50000, max: 200000 };
  if (band === 'over2000') return { min: 200001 };
  return {};
}

export function GalleryClient({
  artworks,
  categories,
  collections,
  materials,
}: {
  artworks: Artwork[];
  categories: Category[];
  collections: Collection[];
  materials: string[];
}) {
  const searchParams = useSearchParams();
  const reduce = useReducedMotion();

  const [filters, setFilters] = useState<GalleryFilters>(() => ({
    ...EMPTY_FILTERS,
    collection: searchParams.get('collection') ?? '',
  }));

  const filtered = useMemo(() => {
    const { min, max } = priceBandToCents(filters.price);
    const s = filters.search.trim().toLowerCase();
    return artworks.filter((a) => {
      if (filters.category && a.category?.slug !== filters.category) return false;
      if (filters.collection && a.collection?.slug !== filters.collection) return false;
      if (filters.availability && a.status !== filters.availability) return false;
      if (min != null && a.price_cents < min) return false;
      if (max != null && a.price_cents > max) return false;
      if (filters.material && !a.materials.some((m) => m.toLowerCase().includes(filters.material.toLowerCase())))
        return false;
      if (s && !(a.title.toLowerCase().includes(s) || a.description.toLowerCase().includes(s))) return false;
      return true;
    });
  }, [artworks, filters]);

  return (
    <div>
      <FilterBar
        filters={filters}
        onChange={setFilters}
        categories={categories}
        collections={collections}
        materials={materials}
        resultCount={filtered.length}
        onReset={() => setFilters(EMPTY_FILTERS)}
      />

      <div className="mt-12" aria-live="polite">
        {filtered.length === 0 ? (
          <EmptyState
            title="No works match those filters"
            body="Try widening the price range or clearing a filter — new pieces arrive in the studio regularly."
            action={
              <Button variant="secondary" size="sm" onClick={() => setFilters(EMPTY_FILTERS)}>
                Clear all filters
              </Button>
            }
          />
        ) : (
          <motion.div layout className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((a, i) => (
                <motion.div
                  key={a.id}
                  layout={!reduce}
                  initial={reduce ? false : { opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduce ? undefined : { opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <ArtworkCard artwork={a} index={i} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <div className="mt-20 border-t hairline pt-10 text-center">
        <p className="font-serif text-2xl">Looking for something specific?</p>
        <p className="mx-auto mt-3 max-w-md text-smoke">
          Most of the studio’s output is one of a kind. If the piece you imagine isn’t here,
          it can be commissioned.
        </p>
        <Link href="/commissions" className="mt-6 inline-block">
          <Button variant="secondary">About commissions</Button>
        </Link>
      </div>
    </div>
  );
}
