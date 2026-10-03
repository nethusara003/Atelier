'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Commission } from '@/types/database';
import { updateCommissionStatus } from '@/lib/admin-actions';
import { COMMISSION_STATUSES } from '@/lib/constants';
import { DataTable, StatusBadge, DemoBanner } from '@/components/admin/admin-ui';
import { formatDateTime } from '@/lib/format';

export function CommissionsManager({ commissions, demo }: { commissions: Commission[]; demo: boolean }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [error, setError] = useState('');

  const change = async (id: string, status: string) => {
    setError('');
    const res = await updateCommissionStatus(id, status);
    if (res.error) setError(res.error);
    else router.refresh();
  };

  return (
    <div>
      {demo && <DemoBanner />}
      {error && <p role="alert" className="mb-4 text-sm text-terracotta">{error}</p>}
      <div className="mt-6">
        <DataTable
          rows={commissions}
          rowKey={(c) => c.id}
          emptyTitle="No commission enquiries"
          emptyBody="Enquiries from the commissions page appear here."
          columns={[
            {
              header: 'Enquiry',
              render: (c) => (
                <div>
                  <button onClick={() => setExpanded(expanded === c.id ? null : c.id)} className="text-left font-medium hover:text-terracotta" aria-expanded={expanded === c.id}>
                    {c.name} <span className="text-stone">· {c.commission_type}</span>
                  </button>
                  <p className="micro-label mt-0.5">{c.email}{c.phone ? ` · ${c.phone}` : ''} · {formatDateTime(c.created_at)}</p>
                  {expanded === c.id && (
                    <div className="mt-3 max-w-xl space-y-2 border-l-2 border-clay/40 pl-4 text-sm text-smoke">
                      <p><span className="micro-label">Budget:</span> {c.budget_range.replace(/_/g, ' ')}</p>
                      <p><span className="micro-label">Timeline:</span> {c.timeline.replace(/_/g, ' ')}</p>
                      <p className="whitespace-pre-wrap">{c.description}</p>
                    </div>
                  )}
                </div>
              ),
            },
            { header: 'Status', render: (c) => <StatusBadge status={c.status} /> },
            {
              header: 'Update',
              render: (c) => (
                <select
                  value={c.status}
                  disabled={demo}
                  onChange={(e) => change(c.id, e.target.value)}
                  aria-label={`Update status for ${c.name}`}
                  className="border hairline bg-transparent px-2.5 py-1.5 text-xs focus:border-terracotta focus:outline-none disabled:opacity-40"
                >
                  {COMMISSION_STATUSES.map((s) => (
                    <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
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
