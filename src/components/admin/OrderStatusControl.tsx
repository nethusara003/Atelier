'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateOrderStatus } from '@/lib/admin-actions';
import { ORDER_STATUSES } from '@/lib/constants';
import { StatusBadge } from '@/components/admin/admin-ui';

export function OrderStatusControl({
  orderId,
  current,
  demo,
}: {
  orderId: string;
  current: string;
  demo: boolean;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const change = async (status: string) => {
    setError('');
    setSaving(true);
    const res = await updateOrderStatus(orderId, status);
    setSaving(false);
    if (res.error) setError(res.error);
    else router.refresh();
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <StatusBadge status={current} />
      <select
        value={current}
        disabled={saving || demo}
        onChange={(e) => change(e.target.value)}
        aria-label="Update order status"
        className="border hairline bg-transparent px-3 py-2 text-sm focus:border-terracotta focus:outline-none disabled:opacity-40"
      >
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
        ))}
      </select>
      {saving && <span className="text-xs text-stone">Saving…</span>}
      {demo && <span className="text-xs text-stone">(demo mode)</span>}
      {error && <p role="alert" className="w-full text-xs text-terracotta">{error}</p>}
    </div>
  );
}
