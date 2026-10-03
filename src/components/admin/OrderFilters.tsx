'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ORDER_STATUSES } from '@/lib/constants';

export function OrderFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get('status') ?? '';

  const set = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set('status', value);
    else params.delete('status');
    router.push(`/admin/orders?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter orders by status">
      <FilterChip active={!current} onClick={() => set('')}>All</FilterChip>
      {ORDER_STATUSES.map((s) => (
        <FilterChip key={s} active={current === s} onClick={() => set(s)}>
          {s[0].toUpperCase() + s.slice(1)}
        </FilterChip>
      ))}
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`border px-4 py-2 text-xs uppercase tracking-widest2 transition-all ${
        active ? 'border-charcoal bg-charcoal text-ivory' : 'hairline text-smoke hover:border-charcoal/50 hover:text-charcoal'
      }`}
    >
      {children}
    </button>
  );
}
