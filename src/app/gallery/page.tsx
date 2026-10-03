import { Suspense } from 'react';
import { getArtworks, getCategories, getCollections, allMaterials } from '@/lib/data';
import { GalleryClient } from '@/components/gallery/GalleryClient';

export const metadata = {
  title: 'Gallery',
  description:
    'Browse original paintings, ceramics, sculpture and textiles by Elena Voss. Filter by category, collection, material, availability and price.',
};

export default async function GalleryPage() {
  const [artworks, categories, collections] = await Promise.all([
    getArtworks(),
    getCategories(),
    getCollections(),
  ]);
  const materials = allMaterials(artworks);

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-32 md:px-8 md:pt-40">
      <p className="micro-label">The gallery</p>
      <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[1.05] md:text-7xl">
        Every piece, made by one pair of hands
      </h1>
      <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-smoke">
        Original works in clay, pigment, wood, bronze and thread. One-of-one pieces
        are exactly that — when a piece finds its home, it leaves the gallery for good.
      </p>

      <div className="mt-12 border-t hairline pt-10">
        <Suspense fallback={<p className="micro-label">Loading the gallery…</p>}>
          <GalleryClient
            artworks={artworks}
            categories={categories}
            collections={collections}
            materials={materials}
          />
        </Suspense>
      </div>
    </div>
  );
}
