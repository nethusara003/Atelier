import Link from 'next/link';
import { getAdminSession } from '@/lib/admin-auth';
import { adminListArtworks, adminListOrders, adminListCommissions, adminListInquiries, adminListJournal, adminListSubscribers } from '@/lib/admin-data';
import { formatPrice, formatDateTime } from '@/lib/format';
import { DemoBanner, StatusBadge } from '@/components/admin/admin-ui';

export const metadata = { title: 'Dashboard' };

export default async function AdminDashboard() {
  const session = await getAdminSession();
  const [artworks, orders, commissions, inquiries, posts, subscribers] = await Promise.all([
    adminListArtworks(),
    adminListOrders(),
    adminListCommissions(),
    adminListInquiries(),
    adminListJournal(),
    adminListSubscribers(),
  ]);

  const revenue = orders
    .filter((o) => ['paid', 'preparing', 'shipped', 'delivered'].includes(o.status))
    .reduce((n, o) => n + o.total_cents, 0);

  const stats = [
    { label: 'Artworks', value: String(artworks.length), href: '/admin/products' },
    { label: 'Revenue (fulfilled)', value: formatPrice(revenue), href: '/admin/orders' },
    { label: 'Open orders', value: String(orders.filter((o) => ['pending', 'paid', 'preparing'].includes(o.status)).length), href: '/admin/orders' },
    { label: 'New commissions', value: String(commissions.filter((c) => c.status === 'new').length), href: '/admin/commissions' },
    { label: 'Open enquiries', value: String(inquiries.filter((i) => i.status === 'new').length), href: '/admin/enquiries' },
    { label: 'Subscribers', value: String(subscribers.length), href: '/admin/settings' },
  ];

  const recentOrders = orders.slice(0, 5);
  const needsAttention = [
    ...commissions.filter((c) => c.status === 'new').map((c) => ({ type: 'Commission', label: `${c.name} — ${c.commission_type}`, href: '/admin/commissions', when: c.created_at })),
    ...inquiries.filter((i) => i.status === 'new').map((i) => ({ type: 'Enquiry', label: `${i.name} — ${i.subject}`, href: '/admin/enquiries', when: i.created_at })),
  ].slice(0, 6);

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <p className="micro-label">Atelier · Admin</p>
          <h1 className="mt-2 font-serif text-4xl md:text-5xl">Dashboard</h1>
        </div>
        <p className="text-sm text-stone">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {session.demo && <div className="mt-6"><DemoBanner /></div>}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="group border hairline bg-white/40 p-6 transition-all hover:border-terracotta/50 hover:shadow-sm">
            <p className="micro-label">{s.label}</p>
            <p className="mt-2 font-serif text-4xl transition-colors group-hover:text-terracotta">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section aria-label="Recent orders">
          <div className="flex items-baseline justify-between">
            <h2 className="font-serif text-2xl">Recent orders</h2>
            <Link href="/admin/orders" className="link-sweep text-xs uppercase tracking-widest2 text-terracotta">All orders →</Link>
          </div>
          <ul className="mt-4 divide-y divide-charcoal/10 border-y hairline">
            {recentOrders.length === 0 && <li className="py-8 text-center text-sm text-stone">No orders yet.</li>}
            {recentOrders.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <Link href={`/admin/orders/${o.id}`} className="font-medium hover:text-terracotta">
                    #{o.id.slice(0, 8)}
                  </Link>
                  <p className="micro-label mt-0.5">{formatDateTime(o.created_at)} · {o.email}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">{formatPrice(o.total_cents, o.currency)}</span>
                  <StatusBadge status={o.status} />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section aria-label="Needs attention">
          <div className="flex items-baseline justify-between">
            <h2 className="font-serif text-2xl">Needs attention</h2>
          </div>
          <ul className="mt-4 divide-y divide-charcoal/10 border-y hairline">
            {needsAttention.length === 0 && <li className="py-8 text-center text-sm text-stone">All caught up. The studio is quiet.</li>}
            {needsAttention.map((n, i) => (
              <li key={i} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="micro-label !text-terracotta">{n.type}</p>
                  <Link href={n.href} className="mt-1 block font-medium hover:text-terracotta">{n.label}</Link>
                </div>
                <p className="shrink-0 text-xs text-stone">{formatDateTime(n.when)}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-10" aria-label="Low stock">
        <h2 className="font-serif text-2xl">Low stock</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {artworks.filter((a) => a.status === 'available' && a.stock <= 2).slice(0, 4).map((a) => (
            <Link key={a.id} href={`/admin/products/${a.id}`} className="border hairline p-5 transition-colors hover:border-terracotta/50">
              <p className="font-serif text-lg leading-tight">{a.title}</p>
              <p className="micro-label mt-2 !text-terracotta">
                {a.stock === 0 ? 'Out of stock' : `${a.stock} remaining`}
              </p>
            </Link>
          ))}
          {artworks.filter((a) => a.status === 'available' && a.stock <= 2).length === 0 && (
            <p className="text-sm text-stone">Stock levels are healthy.</p>
          )}
        </div>
      </section>

      {posts.filter((p) => !p.published).length > 0 && (
        <section className="mt-10" aria-label="Draft posts">
          <h2 className="font-serif text-2xl">Draft journal posts</h2>
          <ul className="mt-4 space-y-2">
            {posts.filter((p) => !p.published).map((p) => (
              <li key={p.id}>
                <Link href={`/admin/journal/${p.id}`} className="link-sweep text-smoke hover:text-terracotta">{p.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
