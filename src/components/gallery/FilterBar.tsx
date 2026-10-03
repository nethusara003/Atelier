'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { Category, Collection } from '@/types/database';

export interface GalleryFilters {
  category: string; // slug or ''
  collection: string;
  material: string;
  availability: string; // '' | 'available' | 'reserved' | 'sold'
  price: string; // '' | 'under500' | '500to2000' | 'over2000'
  search: string;
}

export const EMPTY_FILTERS: GalleryFilters = {
  category: '',
  collection: '',
  material: '',
  availability: '',
  price: '',
  search: '',
};

const PRICE_BANDS = [
  { value: '', label: 'Any price' },
  { value: 'under500', label: 'Under $500' },
  { value: '500to2000', label: '$500 – $2,000' },
  { value: 'over2000', label: 'Over $2,000' },
];

const AVAILABILITY = [
  { value: '', label: 'All works' },
  { value: 'available', label: 'Available' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'sold', label: 'Sold' },
];

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`whitespace-nowrap border px-4 py-2 text-xs uppercase tracking-widest2 transition-all duration-300 ${
        active
          ? 'border-charcoal bg-charcoal text-ivory'
          : 'hairline text-smoke hover:border-charcoal/50 hover:text-charcoal'
      }`}
    >
      {children}
    </button>
  );
}

export function FilterBar({
  filters,
  onChange,
  categories,
  collections,
  materials,
  resultCount,
  onReset,
}: {
  filters: GalleryFilters;
  onChange: (f: GalleryFilters) => void;
  categories: Category[];
  collections: Collection[];
  materials: string[];
  resultCount: number;
  onReset: () => void;
}) {
  const set = (patch: Partial<GalleryFilters>) => onChange({ ...filters, ...patch });
  const hasActive =
    filters.category || filters.collection || filters.material ||
    filters.availability || filters.price || filters.search;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-sm flex-1">
          <input
            type="search"
            value={filters.search}
            onChange={(e) => set({ search: e.target.value })}
            placeholder="Search works…"
            aria-label="Search artworks"
            className="w-full border-b hairline bg-transparent py-2.5 pr-8 text-[15px] placeholder:text-stone/70 focus:border-terracotta focus:outline-none"
          />
          <svg className="absolute right-1 top-3 text-stone" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M11.5 11.5L15 15" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={resultCount}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className="micro-label"
            aria-live="polite"
          >
            {resultCount} {resultCount === 1 ? 'work' : 'works'}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="space-y-4">
        <div>
          <p className="micro-label mb-2.5">Category</p>
          <div className="flex flex-wrap gap-2">
            <Chip active={!filters.category} onClick={() => set({ category: '' })}>All</Chip>
            {categories.map((c) => (
              <Chip key={c.id} active={filters.category === c.slug} onClick={() => set({ category: c.slug })}>
                {c.name}
              </Chip>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="f-collection" className="micro-label mb-2 block">Collection</label>
            <select
              id="f-collection"
              value={filters.collection}
              onChange={(e) => set({ collection: e.target.value })}
              className="w-full border hairline bg-transparent px-3 py-2.5 text-sm focus:border-terracotta focus:outline-none"
            >
              <option value="">All collections</option>
              {collections.map((c) => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="f-material" className="micro-label mb-2 block">Material</label>
            <select
              id="f-material"
              value={filters.material}
              onChange={(e) => set({ material: e.target.value })}
              className="w-full border hairline bg-transparent px-3 py-2.5 text-sm focus:border-terracotta focus:outline-none"
            >
              <option value="">All materials</option>
              {materials.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="f-availability" className="micro-label mb-2 block">Availability</label>
            <select
              id="f-availability"
              value={filters.availability}
              onChange={(e) => set({ availability: e.target.value })}
              className="w-full border hairline bg-transparent px-3 py-2.5 text-sm focus:border-terracotta focus:outline-none"
            >
              {AVAILABILITY.map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="f-price" className="micro-label mb-2 block">Price</label>
            <select
              id="f-price"
              value={filters.price}
              onChange={(e) => set({ price: e.target.value })}
              className="w-full border hairline bg-transparent px-3 py-2.5 text-sm focus:border-terracotta focus:outline-none"
            >
              {PRICE_BANDS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>

        {hasActive && (
          <button
            onClick={onReset}
            className="link-sweep text-xs uppercase tracking-widest2 text-stone hover:text-terracotta"
          >
            Clear all filters
          </button>
        )}
      </div>
    </div>
  );
}
