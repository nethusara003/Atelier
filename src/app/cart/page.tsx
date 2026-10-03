'use client';

import Link from 'next/link';
import { useCart } from '@/components/cart/CartProvider';
import { CartLineItem } from '@/components/cart/CartLineItem';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/primitives';
import { formatPrice } from '@/lib/format';
import { Reveal } from '@/components/motion/Reveal';

export default function CartPage() {
  const { lines, subtotalCents, clear } = useCart();

  return (
    <div className="mx-auto max-w-4xl px-5 pb-24 pt-28 md:pt-36">
      <Reveal>
        <p className="micro-label">Your cart</p>
        <h1 className="mt-4 font-serif text-5xl md:text-6xl">Review your selection</h1>
      </Reveal>

      <div className="mt-10">
        {lines.length === 0 ? (
          <EmptyState
            title="Your cart is empty"
            body="One-of-one pieces don’t wait long. Have another look through the gallery."
            action={
              <Link href="/gallery">
                <Button variant="secondary">Browse the gallery</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid gap-12 md:grid-cols-12">
            <ul className="md:col-span-7">
              {lines.map((l) => (
                <CartLineItem key={l.artworkId} line={l} />
              ))}
              <button
                onClick={clear}
                className="link-sweep mt-6 text-xs uppercase tracking-widest2 text-stone hover:text-terracotta"
              >
                Clear cart
              </button>
            </ul>
            <aside className="md:col-span-5">
              <div className="border hairline bg-parchment p-8">
                <h2 className="font-serif text-2xl">Summary</h2>
                <dl className="mt-6 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-smoke">Subtotal</dt>
                    <dd className="font-medium">{formatPrice(subtotalCents)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-smoke">Shipping</dt>
                    <dd className="text-smoke">Calculated at checkout</dd>
                  </div>
                </dl>
                <Link href="/checkout" className="mt-8 block">
                  <Button className="w-full">Proceed to checkout</Button>
                </Link>
                <p className="mt-4 text-xs leading-relaxed text-stone">
                  Secure payment via Stripe. Each piece ships insured and hand-crated
                  from the Paris studio.
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
