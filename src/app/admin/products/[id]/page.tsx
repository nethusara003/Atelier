import { notFound } from 'next/navigation';
import { adminGetArtwork, adminGetCategories, adminListCollections } from '@/lib/admin-data';
import { getAdminSession } from '@/lib/admin-auth';
import { ArtworkForm } from '@/components/admin/ArtworkForm';
import { DemoBanner } from '@/components/admin/admin-ui';

export const metadata = { title: 'Edit artwork' };

export default async function EditArtworkPage({ params }: { params: { id: string } }) {
  const session = await getAdminSession();
  const [artwork, categories, collections] = await Promise.all([
    adminGetArtwork(params.id),
    adminGetCategories(),
    adminListCollections(),
  ]);
  if (!artwork) notFound();

  return (
    <div>
      <p className="micro-label">Products</p>
      <h1 className="mt-2 font-serif text-4xl">Edit — {artwork.title}</h1>
      {session.demo && <div className="mt-6"><DemoBanner /></div>}
      <div className="mt-8">
        <ArtworkForm artwork={artwork} categories={categories} collections={collections} demo={session.demo} />
      </div>
    </div>
  );
}
