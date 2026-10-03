'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { checkoutSchema } from '@/lib/validations';
import { useCart } from '@/components/cart/CartProvider';
import { Input, Textarea } from '@/components/ui/fields';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/primitives';
import { formatPrice } from '@/lib/format';
import { Reveal } from '@/components/motion/Reveal';

type Errors = Partial<Record<string, string>>;

export default function CheckoutPage() {
  const { lines, subtotalCents, clear } = useCart();
  const router = useRouter();
  const [values, setValues] = useState({
    name: '',
    email: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    postalCode: '',
    country: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [serverError, setServerError] = useState('');

  const set = (k: keyof typeof values) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setValues((v) => ({ ...v, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      email: values.email,
      name: values.name,
      notes: values.notes || undefined,
      lines: lines.map((l) => ({
        artworkId: l.artworkId,
        title: l.title,
        unitPriceCents: l.unitPriceCents,
        quantity: l.quantity,
        image: l.image,
      })),
    };
    // validate cart lines + identity
    const parsed = checkoutSchema.safeParse(payload);
    if (!parsed.success) {
      const errs: Errors = {};
      parsed.error.issues.forEach((i) => {
        const key = String(i.path[0] ?? '');
        if (key && !errs[key]) errs[key] = i.message;
      });
      setErrors(errs);
      return;
    }
    // address + phone are required for shipping/payment (validated separately)
    const addrErrs: Errors = {};
    if (!values.phone.trim()) addrErrs.phone = 'Phone number is required for payment.';
    else if (values.phone.trim().length < 7) addrErrs.phone = 'Please enter a valid phone number.';
    if (!values.address1.trim()) addrErrs.address1 = 'Street address is required.';
    if (!values.city.trim()) addrErrs.city = 'City is required.';
    if (!values.postalCode.trim()) addrErrs.postalCode = 'Postal code is required.';
    if (!values.country.trim()) addrErrs.country = 'Country is required.';
    if (Object.keys(addrErrs).length > 0) {
      setErrors((e) => ({ ...e, ...addrErrs }));
      return;
    }
    setErrors({});
    setStatus('loading');
    try {
      const res = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...parsed.data,
          phone: values.phone.trim(),
          shippingAddress: {
            line1: values.address1,
            line2: values.address2 || undefined,
            city: values.city,
            postal_code: values.postalCode,
            country: values.country,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Could not start checkout.');
      if (data.demo) {
        // Demo mode: no payment provider — simulate a completed order locally.
        clear();
        router.push('/checkout/success?demo=1');
        return;
      }
      if (data.payhere) {
        // PayHere redirect flow: POST the signed fields to PayHere.
        clear();
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.payhere.action;
        for (const [k, v] of Object.entries<string>(data.payhere.fields)) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = k;
          input.value = v;
          form.appendChild(input);
        }
        document.body.appendChild(form);
        form.submit();
        return;
      }
      if (data.url) {
        clear();
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned.');
      }
    } catch (err) {
      setStatus('error');
      setServerError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-5 pb-24 pt-28 md:pt-36">
        <EmptyState
          title="Nothing to check out"
          body="Your cart is empty. Find something you love first."
          action={
            <Link href="/gallery">
              <Button variant="secondary">Browse the gallery</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-28 md:px-8 md:pt-36">
      <Reveal>
        <p className="micro-label">Checkout</p>
        <h1 className="mt-4 font-serif text-5xl md:text-6xl">Almost yours</h1>
      </Reveal>

      <form onSubmit={submit} noValidate className="mt-12 grid gap-12 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-7">
          <section aria-label="Contact details">
            <h2 className="font-serif text-2xl">Contact</h2>
            <div className="mt-5 grid gap-6 sm:grid-cols-2">
              <Input id="co-name" label="Full name" value={values.name} onChange={set('name')} error={errors.name} autoComplete="name" />
              <Input id="co-email" label="Email" type="email" value={values.email} onChange={set('email')} error={errors.email} autoComplete="email" hint="Order updates and tracking go here." />
              <Input id="co-phone" label="Phone" type="tel" value={values.phone} onChange={set('phone')} error={errors.phone} autoComplete="tel" hint="Required by our payment provider." />
            </div>
          </section>

          <section aria-label="Shipping address">
            <h2 className="font-serif text-2xl">Shipping address</h2>
            <div className="mt-5 space-y-6">
              <Input id="co-a1" label="Street address" value={values.address1} onChange={set('address1')} error={errors.address1} autoComplete="street-address" />
              <Input id="co-a2" label="Apartment, suite, etc. (optional)" value={values.address2} onChange={set('address2')} autoComplete="address-line2" />
              <div className="grid gap-6 sm:grid-cols-3">
                <Input id="co-city" label="City" value={values.city} onChange={set('city')} error={errors.city} autoComplete="address-level2" />
                <Input id="co-postal" label="Postal code" value={values.postalCode} onChange={set('postalCode')} error={errors.postalCode} autoComplete="postal-code" />
                <Input id="co-country" label="Country" value={values.country} onChange={set('country')} error={errors.country} autoComplete="country-name" />
              </div>
            </div>
          </section>

          <section aria-label="Notes">
            <h2 className="font-serif text-2xl">Notes <span className="text-base text-stone">(optional)</span></h2>
            <div className="mt-5">
              <Textarea id="co-notes" label="Anything we should know?" value={values.notes} onChange={set('notes')} rows={3} hint="Delivery instructions, gift wrapping, a message for the artist…" />
            </div>
          </section>

          {status === 'error' && <p role="alert" className="text-sm text-terracotta">{serverError}</p>}

          <Button type="submit" loading={status === 'loading'} size="lg" className="w-full sm:w-auto">
            Continue to secure payment
          </Button>
          <p className="text-xs text-stone">You’ll be redirected to PayHere to complete payment securely — cards, bank transfer and mobile wallets. The studio never sees your card details.</p>
        </div>

        <aside className="lg:col-span-5">
          <div className="border hairline bg-parchment p-8 lg:sticky lg:top-28">
            <h2 className="font-serif text-2xl">Order summary</h2>
            <ul className="mt-6 divide-y divide-charcoal/10">
              {lines.map((l) => (
                <li key={l.artworkId} className="flex justify-between gap-4 py-3 text-sm">
                  <span className="text-smoke">{l.title} <span className="text-stone">× {l.quantity}</span></span>
                  <span className="font-medium">{formatPrice(l.unitPriceCents * l.quantity, l.currency)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex items-baseline justify-between border-t hairline pt-5">
              <p className="micro-label">Total due</p>
              <p className="font-serif text-3xl">{formatPrice(subtotalCents)}</p>
            </div>
            <p className="mt-3 text-xs text-stone">Insured, tracked, worldwide shipping — calculated above.</p>
          </div>
        </aside>
      </form>
    </div>
  );
}
