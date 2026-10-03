import { adminListCommissions } from '@/lib/admin-data';
import { getAdminSession } from '@/lib/admin-auth';
import { CommissionsManager } from '@/components/admin/CommissionsManager';

export const metadata = { title: 'Commissions' };

export default async function AdminCommissionsPage() {
  const session = await getAdminSession();
  const commissions = await adminListCommissions();

  return (
    <div>
      <p className="micro-label">Client work</p>
      <h1 className="mt-2 font-serif text-4xl">Commissions</h1>
      <div className="mt-2">
        <CommissionsManager commissions={commissions} demo={session.demo} />
      </div>
    </div>
  );
}
