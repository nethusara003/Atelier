import Link from 'next/link';
import { adminListJournal } from '@/lib/admin-data';
import { getAdminSession } from '@/lib/admin-auth';
import { formatDate } from '@/lib/format';
import { DataTable, DemoBanner } from '@/components/admin/admin-ui';
import { Button } from '@/components/ui/Button';

export const metadata = { title: 'Journal' };

export default async function AdminJournalPage() {
  const session = await getAdminSession();
  const posts = await adminListJournal();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="micro-label">Stories</p>
          <h1 className="mt-2 font-serif text-4xl">Journal</h1>
        </div>
        <Link href="/admin/journal/new">
          <Button size="sm">+ New post</Button>
        </Link>
      </div>
      {session.demo && <div className="mt-6"><DemoBanner /></div>}
      <div className="mt-6">
        <DataTable
          rows={posts}
          rowKey={(p) => p.id}
          emptyTitle="No journal posts"
          emptyBody="Write the first studio note."
          columns={[
            {
              header: 'Title',
              render: (p) => (
                <div>
                  <Link href={`/admin/journal/${p.id}`} className="font-medium hover:text-terracotta">
                    {p.title}
                  </Link>
                  <p className="micro-label mt-0.5">/{p.slug} · {formatDate(p.published_at)}</p>
                </div>
              ),
            },
            { header: 'Tags', render: (p) => <span className="text-smoke">{p.tags.join(', ') || '—'}</span> },
            {
              header: 'Status',
              render: (p) => (
                <span className={`inline-flex items-center px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider ${p.published ? 'bg-green-900/10 text-green-900' : 'bg-beige text-stone'}`}>
                  {p.published ? 'Published' : 'Draft'}
                </span>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
