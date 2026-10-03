import { notFound } from 'next/navigation';
import { adminGetJournalPost } from '@/lib/admin-data';
import { getAdminSession } from '@/lib/admin-auth';
import { JournalForm } from '@/components/admin/JournalForm';
import { DemoBanner } from '@/components/admin/admin-ui';

export const metadata = { title: 'Edit journal post' };

export default async function EditJournalPage({ params }: { params: { id: string } }) {
  const session = await getAdminSession();
  const post = await adminGetJournalPost(params.id);
  if (!post) notFound();

  return (
    <div>
      <p className="micro-label">Journal</p>
      <h1 className="mt-2 font-serif text-4xl">Edit — {post.title}</h1>
      {session.demo && <div className="mt-6"><DemoBanner /></div>}
      <div className="mt-8">
        <JournalForm post={post} demo={session.demo} />
      </div>
    </div>
  );
}
