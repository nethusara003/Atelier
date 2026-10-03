import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { finalizePaidOrder, cancelPendingOrder } from '@/lib/orders';
import {
  parseNotifyParams,
  verifyNotifySignature,
  formatPayHereAmount,
} from '@/lib/payhere';

/**
 * POST /api/webhooks/payhere
 * PayHere `notify_url` callback. PayHere POSTs form-urlencoded payment
 * details; we verify `md5sig` + merchant_id before trusting anything.
 *
 * Status codes: 2 = success → fulfil order; 0 = pending → wait;
 * -1 = cancelled, -2 = failed, -3 = charged back → cancel pending order.
 *
 * Always returns 200 — PayHere retries any other response.
 * Never trusts payhere_amount: the fulfilment amount comes from our own DB.
 */
export async function POST(req: Request) {
  const contentType = req.headers.get('content-type') ?? '';

  let notify;
  try {
    if (contentType.includes('application/json')) {
      const json = await req.json();
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(json)) params.set(k, String(v));
      notify = parseNotifyParams(params);
    } else {
      // PayHere sends application/x-www-form-urlencoded.
      const text = await req.text();
      notify = parseNotifyParams(new URLSearchParams(text));
    }
  } catch {
    return NextResponse.json({ received: true });
  }

  if (!notify.order_id || !verifyNotifySignature(notify)) {
    console.error('[webhook:payhere] signature verification failed for order:', notify.order_id);
    return NextResponse.json({ received: true });
  }

  const admin = createAdminClient();

  try {
    const { data: order } = await admin
      .from('orders')
      .select('id, status, total_cents, currency')
      .eq('id', notify.order_id)
      .single();

    if (!order) {
      console.error('[webhook:payhere] order not found:', notify.order_id);
      return NextResponse.json({ received: true });
    }

    // Cross-check the amount PayHere reports against our own record.
    // A mismatch means something is wrong — never fulfil on it.
    const expectedAmount = formatPayHereAmount(order.total_cents);
    if (
      notify.payhere_amount !== expectedAmount ||
      notify.payhere_currency !== order.currency
    ) {
      console.error(
        `[webhook:payhere] amount mismatch for ${order.id}: ` +
          `payhere=${notify.payhere_amount} ${notify.payhere_currency}, ` +
          `expected=${expectedAmount} ${order.currency}`
      );
      return NextResponse.json({ received: true });
    }

    switch (notify.status_code) {
      case '2': // success
        await finalizePaidOrder(admin, order.id, 'payhere', notify.payment_id || null);
        break;
      case '-1': // cancelled by customer
      case '-2': // failed
      case '-3': // charged back
        await cancelPendingOrder(admin, order.id);
        break;
      case '0': // pending — leave the order pending; PayHere will notify again
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[webhook:payhere] handler error:', err);
    // Still 200: a 500 would trigger PayHere retries for a poisoned payload.
    return NextResponse.json({ received: true });
  }
}
