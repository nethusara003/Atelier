import { notFound } from 'next/navigation';
import Link from 'next/link';
import { adminGetOrder } from '@/lib/admin-data';
import { getAdminSession } from '@/lib/admin-auth';
import { formatPrice, formatDateTime } from '@/lib/format';
import { DemoBanner } from '@/components/admin/admin-ui';
import { OrderStatusControl } from '@/components/admin/OrderStatusControl';

export const metadata = { title: 'Order detail' };

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const session = await getAdminSession();
  const order = await adminGetOrder(params.id);
  if (!order) notFound();

  const addr = (order.shipping_address ?? {}) as Record<string, string>;

  return (
    <div>
      <Link href="/admin/orders" className="link-sweep text-xs uppercase tracking-widest2 text-stone hover:text-terracotta">
        ← All orders
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="micro-label">Order #{order.id.slice(0, 8)}</p>
          <h1 className="mt-2 font-serif text-4xl">{formatPrice(order.total_cents, order.currency)}</h1>
          <p className="micro-label mt-2">{formatDateTime(order.created_at)} · {order.email}</p>
        </div>
        <OrderStatusControl orderId={order.id} current={order.status} demo={session.demo} />
      </div>

      {session.demo && <div className="mt-6"><DemoBanner /></div>}

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section className="border hairline p-8" aria-label="Items">
          <h2 className="font-serif text-2xl">Items</h2>
          <ul className="mt-5 divide-y divide-charcoal/10">
            {(order.items ?? []).map((i) => (
              <li key={i.id} className="flex justify-between gap-4 py-3 text-sm">
                <span>{i.title} <span className="text-stone">× {i.quantity}</span></span>
                <span className="font-medium">{formatPrice(i.unit_price_cents * i.quantity, order.currency)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-2 border-t hairline pt-5 text-sm">
            <div className="flex justify-between"><dt className="text-smoke">Subtotal</dt><dd>{formatPrice(order.subtotal_cents, order.currency)}</dd></div>
            <div className="flex justify-between"><dt className="text-smoke">Shipping</dt><dd>{order.shipping_cents === 0 ? 'Complimentary' : formatPrice(order.shipping_cents, order.currency)}</dd></div>
            <div className="flex justify-between font-medium"><dt>Total</dt><dd>{formatPrice(order.total_cents, order.currency)}</dd></div>
          </dl>
        </section>

        <div className="space-y-8">
          <section className="border hairline p-8" aria-label="Shipping">
            <h2 className="font-serif text-2xl">Shipping</h2>
            <address className="mt-5 space-y-1 text-sm not-italic text-smoke">
              {addr.name && <p className="font-medium text-charcoal">{addr.name}</p>}
              {addr.line1 && <p>{addr.line1}</p>}
              {addr.line2 && <p>{addr.line2}</p>}
              {(addr.city || addr.postal_code) && <p>{[addr.city, addr.postal_code].filter(Boolean).join(' ')}</p>}
              {addr.country && <p>{addr.country}</p>}
              {!addr.line1 && <p className="text-stone">Address collected at payment (Stripe).</p>}
            </address>
          </section>

          <section className="border hairline p-8" aria-label="Payment">
            <h2 className="font-serif text-2xl">Payment</h2>
            <dl className="mt-5 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-smoke">Stripe session</dt><dd className="max-w-[220px] truncate font-mono text-xs">{order.stripe_session_id ?? '—'}</dd></div>
              <div className="flex justify-between"><dt className="text-smoke">Payment intent</dt><dd className="max-w-[220px] truncate font-mono text-xs">{order.stripe_payment_intent ?? '—'}</dd></div>
              {order.notes && (
                <div className="pt-2"><dt className="micro-label">Customer notes</dt><dd className="mt-1 text-smoke">{order.notes}</dd></div>
              )}
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
