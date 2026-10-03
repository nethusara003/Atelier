'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Inquiry } from '@/types/database';
import { updateInquiryStatus } from '@/lib/admin-actions';
import { DataTable, StatusBadge, DemoBanner } from '@/components/admin/admin-ui';
import { formatDateTime } from '@/lib/format';

const STATUSES = ['new', 'replied', 'archived'];

export function EnquiriesManager({ inquiries, demo }: { inquiries: Inquiry[]; demo: boolean }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [error, setError] = useState('');

  const change = async (id: string, status: string) => {
    setError('');
    const res = await updateInquiryStatus(id, status);
    if (res.error) setError(res.error);
    else router.refresh();
  };

  return (
    <div>
      {demo && <DemoBanner />}
      {error && <p role="alert" className="mb-4 text-sm text-terracotta">{error}</p>}
      <div className="mt-6">
        <DataTable
          rows={inquiries}
          rowKey={(i) => i.id}
          emptyTitle="No enquiries"
          emptyBody="Messages from the contact page appear here."
          columns={[
            {
              header: 'Message',
              render: (i) => (
                <div>
                  <button onClick={() => setExpanded(expanded === i.id ? null : i.id)} className="text-left font-medium hover:text-terracotta" aria-expanded={expanded === i.id}>
                    {i.name} <span className="text-stone">· {i.subject}</span>
                  </button>
                  <p className="micro-label mt-0.5">{i.email} · {i.inquiry_type} · {formatDateTime(i.created_at)}</p>
                  {expanded === i.id && (
                    <p className="mt-3 max-w-xl whitespace-pre-wrap border-l-2 border-clay/40 pl-4 text-sm text-smoke">
                      {i.message}
                    </p>
                  )}
                </div>
              ),
            },
            { header: 'Status', render: (i) => <StatusBadge status={i.status} /> },
            {
              header: 'Update',
              render: (i) => (
                <select
                  value={i.status}
                  disabled={demo}
                  onChange={(e) => change(i.id, e.target.value)}
                  aria-label={`Update status for message from ${i.name}`}
                  className="border hairline bg-transparent px-2.5 py-1.5 text-xs focus:border-terracotta focus:outline-none disabled:opacity-40"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
