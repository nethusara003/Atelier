import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { finalizePaidOrder, cancelPendingOrder } from '@/lib/orders';

/**
 * POST /api/webhooks/stripe
 * Only active when PAYMENT_PROVIDER=stripe. Verifies the Stripe signature, then:
 *  - checkout.session.completed → mark order paid (shared fulfilment logic)
 *  - payment_intent.payment_failed → mark the matching order cancelled
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Webhook not configured.' }, { status: 500 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature.' }, { status: 400 });
  }

  const rawBody = await req.text();
  const stripe = getStripe();

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    console.error('[webhook:stripe] signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
  }

  const admin = createAdminClient();

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const orderId = session.metadata?.order_id;
      if (!orderId) {
        console.error('[webhook:stripe] session completed without order_id metadata');
        return NextResponse.json({ received: true });
      }
      await finalizePaidOrder(admin, orderId, 'stripe', session.payment_intent ?? null);
    } else if (event.type === 'payment_intent.payment_failed') {
      const intent = event.data.object as any;
      try {
        const sessions = await stripe.checkout.sessions.list({
          payment_intent: intent.id,
          limit: 1,
        });
        const orderId = sessions.data[0]?.metadata?.order_id;
        if (orderId) await cancelPendingOrder(admin, orderId);
      } catch (e) {
        console.error('[webhook:stripe] failed-order lookup error:', e);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[webhook:stripe] handler error:', err);
    return NextResponse.json({ error: 'Webhook handler failed.' }, { status: 500 });
  }
}
