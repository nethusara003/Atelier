import { sendEmail, emailTemplates } from '@/lib/email';
import { formatPrice } from '@/lib/format';
import type { PaymentProvider } from '@/lib/payhere';

type AdminClient = ReturnType<typeof import('@/lib/supabase/admin').createAdminClient>;

export interface FinalizeResult {
  ok: boolean;
  alreadyPaid?: boolean;
  reason?: string;
}

/**
 * Mark an order paid and fulfil inventory. Shared by the Stripe and PayHere
 * webhooks. Idempotent: safe to call again for the same order.
 *
 * - sets status='paid' (only transitions from 'pending')
 * - decrements stock / edition_available; one-of-one pieces become 'sold'
 * - emails the customer and the admin
 */
export async function finalizePaidOrder(
  admin: AdminClient,
  orderId: string,
  provider: PaymentProvider,
  paymentReference: string | null
): Promise<FinalizeResult> {
  const { data: order } = await admin
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('id', orderId)
    .single();

  if (!order) {
    console.error(`[orders] finalize: order not found: ${orderId}`);
    return { ok: false, reason: 'order_not_found' };
  }

  if (order.status === 'paid') {
    return { ok: true, alreadyPaid: true };
  }

  if (order.status !== 'pending') {
    console.error(`[orders] finalize: order ${orderId} has status ${order.status}, refusing`);
    return { ok: false, reason: `unexpected_status_${order.status}` };
  }

  const { error: updateError } = await admin
    .from('orders')
    .update({
      status: 'paid',
      payment_provider: provider,
      payment_reference: paymentReference,
    })
    .eq('id', orderId)
    .eq('status', 'pending'); // optimistic guard against double-fulfilment

  if (updateError) {
    console.error(`[orders] finalize: status update failed for ${orderId}:`, updateError);
    return { ok: false, reason: 'update_failed' };
  }

  // Decrement stock / editions. One-of-one pieces become sold at 0.
  for (const item of (order.items as any[]) ?? []) {
    if (!item.artwork_id) continue;
    const { data: art } = await admin
      .from('artworks')
      .select('id, stock, edition_type, edition_available')
      .eq('id', item.artwork_id)
      .single();
    if (!art) continue;

    const newStock = Math.max(0, art.stock - item.quantity);
    const patch: Record<string, unknown> = { stock: newStock };
    if (art.edition_type === 'limited' && art.edition_available != null) {
      patch.edition_available = Math.max(0, art.edition_available - item.quantity);
    }
    if (newStock === 0) {
      patch.status = 'sold';
    }
    await admin.from('artworks').update(patch).eq('id', art.id);
  }

  // Emails — failures are logged, never fail the fulfilment.
  const total = formatPrice(order.total_cents, order.currency);
  const buyerName = (order.shipping_address as any)?.name ?? order.email;
  try {
    await sendEmail({
      to: order.email,
      subject: 'Your Atelier Voss order is confirmed',
      html: emailTemplates.orderConfirmation(buyerName, order.id, total),
    });
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      await sendEmail({
        to: adminEmail,
        subject: `New paid order ${order.id.slice(0, 8)} — ${total}`,
        html: emailTemplates.orderPaidAdmin(order.id, order.email, total),
      });
    }
  } catch (e) {
    console.error('[orders] finalize: email failed:', e);
  }

  return { ok: true };
}

/** Mark a pending order cancelled (failed / abandoned payments). */
export async function cancelPendingOrder(
  admin: AdminClient,
  orderId: string
): Promise<void> {
  await admin.from('orders').update({ status: 'cancelled' }).eq('id', orderId).eq('status', 'pending');
}
