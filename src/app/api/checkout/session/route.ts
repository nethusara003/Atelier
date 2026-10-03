import { NextResponse } from 'next/server';
import { z } from 'zod';
import { checkoutSchema } from '@/lib/validations';
import { createAdminClient } from '@/lib/supabase/admin';
import { getStripe, isStripeConfigured } from '@/lib/stripe';
import {
  getPaymentProvider,
  isPayHereConfigured,
  buildCheckoutParams,
  splitName,
} from '@/lib/payhere';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/client';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

const bodySchema = checkoutSchema.extend({
  // PayHere requires a customer phone number for checkout.
  phone: z.string().trim().min(7).max(20),
  shippingAddress: z.object({
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    postal_code: z.string().min(1),
    country: z.string().min(1),
  }),
});

function isPaymentConfigured(): boolean {
  return getPaymentProvider() === 'stripe' ? isStripeConfigured() : isPayHereConfigured();
}

/**
 * POST /api/checkout/session
 * Validates the cart, re-prices every line against the database (never trusts
 * client prices), creates a pending order, then starts payment:
 *  - provider=payhere (default): returns a signed PayHere form payload the
 *    browser POSTs to PayHere; order_id is our order UUID.
 *  - provider=stripe: returns a Stripe Checkout URL (Sri Lanka businesses
 *    cannot receive via Stripe — kept for non-LK use).
 * In demo mode (no Supabase/payment keys) returns { demo: true }.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid checkout data.' },
      { status: 400 }
    );
  }

  const { email, name, phone, lines, notes, shippingAddress } = parsed.data;

  // Demo mode: nothing to persist or charge.
  if (!isSupabaseConfigured || !isPaymentConfigured()) {
    return NextResponse.json({ demo: true });
  }

  const admin = createAdminClient();

  // Re-price from the database — the client-supplied price is never trusted.
  const ids = lines.map((l) => l.artworkId);
  const { data: artworks, error: artError } = await admin
    .from('artworks')
    .select('id, title, price_cents, currency, stock, status, edition_available')
    .in('id', ids);

  if (artError || !artworks) {
    return NextResponse.json({ error: 'Could not verify artwork availability.' }, { status: 500 });
  }

  const byId = new Map(artworks.map((a) => [a.id, a]));
  const verifiedLines: { artworkId: string; title: string; unitPriceCents: number; quantity: number }[] = [];

  for (const line of lines) {
    const art = byId.get(line.artworkId);
    if (!art) {
      return NextResponse.json({ error: `“${line.title}” is no longer available.` }, { status: 409 });
    }
    if (art.status !== 'available' || art.stock < line.quantity) {
      return NextResponse.json(
        { error: `“${art.title}” only has ${art.stock} remaining.` },
        { status: 409 }
      );
    }
    verifiedLines.push({
      artworkId: art.id,
      title: art.title,
      unitPriceCents: art.price_cents,
      quantity: Math.min(line.quantity, 10),
    });
  }

  const subtotal = verifiedLines.reduce((n, l) => n + l.unitPriceCents * l.quantity, 0);
  const shipping = subtotal >= 50000 ? 0 : 4500;
  const total = subtotal + shipping;
  const currency = 'USD'; // PayHere supports LKR and USD

  // Attach the order to the signed-in user when there is one.
  let userId: string | null = null;
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  } catch {
    /* optional */
  }

  const { data: order, error: orderError } = await admin
    .from('orders')
    .insert({
      user_id: userId,
      email,
      status: 'pending',
      subtotal_cents: subtotal,
      shipping_cents: shipping,
      total_cents: total,
      currency,
      shipping_address: { ...shippingAddress, name, phone },
      notes: notes ?? null,
    })
    .select('id')
    .single();

  if (orderError || !order) {
    console.error('[checkout] order insert failed:', orderError);
    return NextResponse.json({ error: 'Could not create your order. Please try again.' }, { status: 500 });
  }

  const { error: itemsError } = await admin.from('order_items').insert(
    verifiedLines.map((l) => ({
      order_id: order.id,
      artwork_id: l.artworkId,
      title: l.title,
      unit_price_cents: l.unitPriceCents,
      quantity: l.quantity,
    }))
  );

  if (itemsError) {
    console.error('[checkout] items insert failed:', itemsError);
    await admin.from('orders').delete().eq('id', order.id);
    return NextResponse.json({ error: 'Could not create your order. Please try again.' }, { status: 500 });
  }

  const provider = getPaymentProvider();

  if (provider === 'payhere') {
    try {
      const { firstName, lastName } = splitName(name);
      const itemsLabel = verifiedLines
        .map((l) => `${l.title} x${l.quantity}`)
        .join(', ')
        .slice(0, 200);

      const checkout = buildCheckoutParams({
        orderId: order.id,
        items: itemsLabel,
        totalCents: total,
        currency,
        customer: {
          firstName,
          lastName,
          email,
          phone,
          address: [shippingAddress.line1, shippingAddress.line2].filter(Boolean).join(', '),
          city: shippingAddress.city,
          country: shippingAddress.country,
        },
        returnUrl: `${SITE_URL}/checkout/success?order_id=${order.id}`,
        cancelUrl: `${SITE_URL}/checkout/cancel`,
        notifyUrl: `${SITE_URL}/api/webhooks/payhere`,
      });

      await admin
        .from('orders')
        .update({ payment_provider: 'payhere' })
        .eq('id', order.id);

      return NextResponse.json({ provider: 'payhere', payhere: checkout });
    } catch (err) {
      console.error('[checkout] payhere error:', err);
      await admin.from('orders').update({ status: 'cancelled' }).eq('id', order.id);
      return NextResponse.json({ error: 'Payment could not be started. Please try again.' }, { status: 502 });
    }
  }

  // provider === 'stripe'
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      metadata: { order_id: order.id },
      line_items: verifiedLines.map((l) => ({
        price_data: {
          currency: 'usd',
          unit_amount: l.unitPriceCents,
          product_data: { name: l.title, metadata: { artwork_id: l.artworkId } },
        },
        quantity: l.quantity,
      })),
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: shipping, currency: 'usd' },
            display_name: shipping === 0 ? 'Complimentary insured shipping' : 'Insured worldwide shipping',
          },
        },
      ],
      shipping_address_collection: { allowed_countries: ['US', 'GB', 'FR', 'DE', 'NL', 'BE', 'CH', 'CA', 'AU', 'JP'] },
      success_url: `${SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/checkout/cancel`,
    });

    await admin
      .from('orders')
      .update({ stripe_session_id: session.id, payment_provider: 'stripe' })
      .eq('id', order.id);

    return NextResponse.json({ provider: 'stripe', url: session.url });
  } catch (err) {
    console.error('[checkout] stripe error:', err);
    await admin.from('orders').update({ status: 'cancelled' }).eq('id', order.id);
    return NextResponse.json({ error: 'Payment could not be started. Please try again.' }, { status: 502 });
  }
}
