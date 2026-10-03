import { adminListCollections } from '@/lib/admin-data';
import { getAdminSession } from '@/lib/admin-auth';
import { CollectionsManager } from '@/components/admin/CollectionsManager';

export const metadata = { title: 'Collections' };

export default async function AdminCollectionsPage() {
  const session = await getAdminSession();
  const collections = await adminListCollections();

  return (
    <div>
      <p className="micro-label">Catalogue</p>
      <h1 className="mt-2 font-serif text-4xl">Collections</h1>
      <div className="mt-2">
        <CollectionsManager collections={collections} demo={session.demo} />
      </div>
    </div>
  );
}
