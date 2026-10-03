import { createHash, timingSafeEqual } from 'node:crypto';

/**
 * PayHere Checkout API (redirect / form-POST flow).
 *
 * Docs: https://support.payhere.lk/api-&-mobile-sdk/checkout-api
 *
 * Checkout: our server builds a signed parameter set; the browser POSTs it
 * as a form to the PayHere action URL. PayHere then calls our `notify_url`
 * server-to-server with the payment result (`md5sig`-signed, form-encoded).
 *
 * Amounts are formatted with exactly two decimals and no thousands
 * separators before hashing — this is required for the hash to verify.
 */

export type PaymentProvider = 'payhere' | 'stripe';

export function getPaymentProvider(): PaymentProvider {
  const v = (process.env.PAYMENT_PROVIDER ?? 'payhere').toLowerCase();
  return v === 'stripe' ? 'stripe' : 'payhere';
}

export function isPayHereConfigured(): boolean {
  return Boolean(process.env.PAYHERE_MERCHANT_ID && process.env.PAYHERE_MERCHANT_SECRET);
}

export function payhereCheckoutUrl(): string {
  const sandbox = (process.env.PAYHERE_SANDBOX ?? 'true').toLowerCase() !== 'false';
  return sandbox ? 'https://sandbox.payhere.lk/pay/checkout' : 'https://www.payhere.lk/pay/checkout';
}

/** "1000" (cents) -> "10.00" — the exact string PayHere hashes. */
export function formatPayHereAmount(totalCents: number): string {
  return (Math.round(totalCents) / 100).toFixed(2);
}

function md5Upper(input: string): string {
  return createHash('md5').update(input, 'utf8').digest('hex').toUpperCase();
}

/**
 * Checkout hash:
 *   UPPER( MD5( merchant_id + order_id + amount + currency + UPPER(MD5(merchant_secret)) ) )
 */
export function buildCheckoutHash(args: {
  merchantId: string;
  orderId: string;
  amount: string; // already formatted to 2 decimals
  currency: string;
  merchantSecret: string;
}): string {
  const { merchantId, orderId, amount, currency, merchantSecret } = args;
  return md5Upper(`${merchantId}${orderId}${amount}${currency}${md5Upper(merchantSecret)}`);
}

export interface PayHereCustomer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

export interface PayHereCheckoutParams {
  action: string;
  fields: Record<string, string>;
}

/** Build the full signed form payload for a PayHere redirect checkout. */
export function buildCheckoutParams(args: {
  orderId: string;
  items: string;
  totalCents: number;
  currency: string; // LKR or USD
  customer: PayHereCustomer;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
}): PayHereCheckoutParams {
  const merchantId = process.env.PAYHERE_MERCHANT_ID ?? '';
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET ?? '';
  const amount = formatPayHereAmount(args.totalCents);
  const hash = buildCheckoutHash({
    merchantId,
    orderId: args.orderId,
    amount,
    currency: args.currency,
    merchantSecret,
  });

  return {
    action: payhereCheckoutUrl(),
    fields: {
      merchant_id: merchantId,
      return_url: args.returnUrl,
      cancel_url: args.cancelUrl,
      notify_url: args.notifyUrl,
      order_id: args.orderId,
      items: args.items,
      currency: args.currency,
      amount,
      first_name: args.customer.firstName,
      last_name: args.customer.lastName,
      email: args.customer.email,
      phone: args.customer.phone,
      address: args.customer.address,
      city: args.customer.city,
      country: args.customer.country,
      hash,
    },
  };
}

export interface PayHereNotify {
  merchant_id: string;
  order_id: string;
  payhere_amount: string;
  payhere_currency: string;
  status_code: string;
  md5sig: string;
  payment_id: string;
  raw: Record<string, string>;
}

export function parseNotifyParams(form: FormData | URLSearchParams): PayHereNotify {
  const get = (k: string) => {
    const v = form instanceof FormData ? form.get(k) : form.get(k);
    return typeof v === 'string' ? v : '';
  };
  const raw: Record<string, string> = {};
  const collect = (k: string, v: string) => {
    raw[k] = v;
  };
  if (form instanceof FormData) {
    form.forEach((v, k) => collect(k, typeof v === 'string' ? v : ''));
  } else {
    form.forEach((v, k) => collect(k, v));
  }
  return {
    merchant_id: get('merchant_id'),
    order_id: get('order_id'),
    payhere_amount: get('payhere_amount'),
    payhere_currency: get('payhere_currency'),
    status_code: get('status_code'),
    md5sig: get('md5sig'),
    payment_id: get('payment_id'),
    raw,
  };
}

/**
 * Notify signature:
 *   UPPER( MD5( merchant_id + order_id + payhere_amount + payhere_currency
 *              + status_code + UPPER(MD5(merchant_secret)) ) )
 * Also confirms the merchant_id is ours.
 */
export function verifyNotifySignature(notify: PayHereNotify): boolean {
  const merchantId = process.env.PAYHERE_MERCHANT_ID ?? '';
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET ?? '';
  if (!merchantId || !merchantSecret) return false;
  if (notify.merchant_id !== merchantId) return false;

  const expected = md5Upper(
    `${notify.merchant_id}${notify.order_id}${notify.payhere_amount}` +
      `${notify.payhere_currency}${notify.status_code}${md5Upper(merchantSecret)}`
  );
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(notify.md5sig.toUpperCase(), 'utf8');
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Split "Ada Lovelace" -> ["Ada", "Lovelace"]; PayHere wants both fields non-empty. */
export function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: 'Customer', lastName: '—' };
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}
