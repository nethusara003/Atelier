'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const STATUSES = ['', 'available', 'reserved', 'sold', 'archived'];

export function ProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/admin/products?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <input
        type="search"
        placeholder="Search title or slug…"
        defaultValue={searchParams.get('q') ?? ''}
        onChange={(e) => update('q', e.target.value)}
        aria-label="Search products"
        className="w-full max-w-xs border hairline bg-transparent px-4 py-2.5 text-sm placeholder:text-stone/70 focus:border-terracotta focus:outline-none"
      />
      <select
        value={searchParams.get('status') ?? ''}
        onChange={(e) => update('status', e.target.value)}
        aria-label="Filter by status"
        className="border hairline bg-transparent px-4 py-2.5 text-sm focus:border-terracotta focus:outline-none"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s ? s[0].toUpperCase() + s.slice(1) : 'All statuses'}</option>
        ))}
      </select>
    </div>
  );
}
