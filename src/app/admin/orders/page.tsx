import Link from 'next/link';
import { adminListOrders } from '@/lib/admin-data';
import { getAdminSession } from '@/lib/admin-auth';
import { formatPrice, formatDateTime } from '@/lib/format';
import { DataTable, StatusBadge, DemoBanner } from '@/components/admin/admin-ui';
import { OrderFilters } from '@/components/admin/OrderFilters';

export const metadata = { title: 'Orders' };

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const session = await getAdminSession();
  const orders = await adminListOrders();
  const status = searchParams.status ?? '';
  const filtered = status ? orders.filter((o) => o.status === status) : orders;

  return (
    <div>
      <p className="micro-label">Fulfilment</p>
      <h1 className="mt-2 font-serif text-4xl">Orders</h1>
      {session.demo && <div className="mt-6"><DemoBanner /></div>}
      <div className="mt-6"><OrderFilters /></div>
      <div className="mt-6">
        <DataTable
          rows={filtered}
          rowKey={(o) => o.id}
          emptyTitle="No orders found"
          emptyBody="Orders appear here once checkout is complete."
          columns={[
            {
              header: 'Order',
              render: (o) => (
                <div>
                  <Link href={`/admin/orders/${o.id}`} className="font-medium hover:text-terracotta">
                    #{o.id.slice(0, 8)}
                  </Link>
                  <p className="micro-label mt-0.5">{formatDateTime(o.created_at)}</p>
                </div>
              ),
            },
            {
              header: 'Customer',
              render: (o) => <span className="text-smoke">{o.email}</span>,
            },
            {
              header: 'Items',
              render: (o) => (
                <span className="text-smoke">
                  {(o.items ?? []).map((i) => `${i.title} ×${i.quantity}`).join(', ') || '—'}
                </span>
              ),
            },
            {
              header: 'Total',
              render: (o) => <span className="font-medium">{formatPrice(o.total_cents, o.currency)}</span>,
              className: 'whitespace-nowrap',
            },
            { header: 'Status', render: (o) => <StatusBadge status={o.status} /> },
          ]}
        />
      </div>
    </div>
  );
}
