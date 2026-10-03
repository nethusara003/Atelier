import { adminGetCategories, adminListCollections } from '@/lib/admin-data';
import { getAdminSession } from '@/lib/admin-auth';
import { ArtworkForm } from '@/components/admin/ArtworkForm';
import { DemoBanner } from '@/components/admin/admin-ui';

export const metadata = { title: 'New artwork' };

export default async function NewArtworkPage() {
  const session = await getAdminSession();
  const [categories, collections] = await Promise.all([
    adminGetCategories(),
    adminListCollections(),
  ]);

  return (
    <div>
      <p className="micro-label">Products</p>
      <h1 className="mt-2 font-serif text-4xl">New artwork</h1>
      {session.demo && <div className="mt-6"><DemoBanner /></div>}
      <div className="mt-8">
        <ArtworkForm categories={categories} collections={collections} demo={session.demo} />
      </div>
    </div>
  );
}
