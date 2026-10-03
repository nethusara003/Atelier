import Link from 'next/link';
import { adminListArtworks } from '@/lib/admin-data';
import { getAdminSession } from '@/lib/admin-auth';
import { formatPrice } from '@/lib/format';
import { DataTable, StatusBadge, DemoBanner } from '@/components/admin/admin-ui';
import { Button } from '@/components/ui/Button';
import { ProductFilters } from '@/components/admin/ProductFilters';

export const metadata = { title: 'Products' };

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string };
}) {
  const session = await getAdminSession();
  const artworks = await adminListArtworks();

  const q = (searchParams.q ?? '').toLowerCase();
  const status = searchParams.status ?? '';
  const filtered = artworks.filter((a) => {
    if (status && a.status !== status) return false;
    if (q && !(a.title.toLowerCase().includes(q) || a.slug.includes(q))) return false;
    return true;
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="micro-label">Catalogue</p>
          <h1 className="mt-2 font-serif text-4xl">Products</h1>
        </div>
        <Link href="/admin/products/new">
          <Button size="sm">+ New artwork</Button>
        </Link>
      </div>

      {session.demo && <div className="mt-6"><DemoBanner /></div>}

      <div className="mt-6">
        <ProductFilters />
      </div>

      <div className="mt-6">
        <DataTable
          rows={filtered}
          rowKey={(a) => a.id}
          emptyTitle="No artworks found"
          emptyBody="Try a different search, or add your first piece."
          columns={[
            {
              header: 'Title',
              render: (a) => (
                <div>
                  <Link href={`/admin/products/${a.id}`} className="font-medium hover:text-terracotta">
                    {a.title}
                  </Link>
                  <p className="micro-label mt-0.5">/{a.slug}</p>
                </div>
              ),
            },
            { header: 'Category', render: (a) => <span className="text-smoke">{a.category?.name ?? '—'}</span> },
            {
              header: 'Price',
              render: (a) => formatPrice(a.price_cents, a.currency),
              className: 'whitespace-nowrap',
            },
            {
              header: 'Stock',
              render: (a) => (
                <span className={a.stock <= 2 && a.status === 'available' ? 'font-medium text-terracotta' : 'text-smoke'}>
                  {a.stock}
                </span>
              ),
            },
            { header: 'Status', render: (a) => <StatusBadge status={a.status} /> },
            {
              header: 'Published',
              render: (a) => (
                <span className={a.published ? 'text-green-900' : 'text-stone'}>
                  {a.published ? 'Yes' : 'No'}
                </span>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
