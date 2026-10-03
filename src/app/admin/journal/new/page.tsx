import { getAdminSession } from '@/lib/admin-auth';
import { JournalForm } from '@/components/admin/JournalForm';
import { DemoBanner } from '@/components/admin/admin-ui';

export const metadata = { title: 'New journal post' };

export default async function NewJournalPage() {
  const session = await getAdminSession();

  return (
    <div>
      <p className="micro-label">Journal</p>
      <h1 className="mt-2 font-serif text-4xl">New post</h1>
      {session.demo && <div className="mt-6"><DemoBanner /></div>}
      <div className="mt-8">
        <JournalForm demo={session.demo} />
      </div>
    </div>
  );
}
