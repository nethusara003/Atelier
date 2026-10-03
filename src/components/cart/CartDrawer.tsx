'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { useEffect } from 'react';
import { useCart } from './CartProvider';
import { CartLineItem } from './CartLineItem';
import { Button } from '../ui/Button';
import { formatPrice } from '@/lib/format';

export function CartDrawer() {
  const { lines, subtotalCents, isOpen, closeCart } = useCart();
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeCart();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, closeCart]);

  const transition = reduce
    ? { duration: 0 }
    : { type: 'spring', damping: 32, stiffness: 260 };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Shopping cart">
          <motion.div
            className="absolute inset-0 bg-charcoal/60 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.3 }}
            onClick={closeCart}
            aria-hidden
          />
          <motion.aside
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-ivory shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={transition}
          >
            <div className="flex items-center justify-between border-b hairline px-6 py-5">
              <h2 className="font-serif text-2xl">
                Your Cart{' '}
                <span className="text-base text-stone">
                  ({lines.reduce((n, l) => n + l.quantity, 0)})
                </span>
              </h2>
              <button
                onClick={closeCart}
                aria-label="Close cart"
                className="p-2 text-stone transition-colors hover:text-charcoal"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                  <path d="M1 1l16 16M17 1L1 17" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6">
              {lines.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="mb-6 h-px w-16 bg-terracotta" aria-hidden />
                  <p className="font-serif text-2xl">Your cart is empty</p>
                  <p className="mt-3 max-w-[26ch] text-sm text-stone">
                    Every piece is one of a kind or from a small edition — when it’s gone, it’s gone.
                  </p>
                  <Button variant="secondary" size="sm" className="mt-8" onClick={closeCart}>
                    <Link href="/gallery">Browse the gallery</Link>
                  </Button>
                </div>
              ) : (
                <ul>
                  {lines.map((l) => (
                    <CartLineItem key={l.artworkId} line={l} />
                  ))}
                </ul>
              )}
            </div>

            {lines.length > 0 && (
              <div className="border-t hairline px-6 py-6">
                <div className="flex items-baseline justify-between">
                  <p className="micro-label">Subtotal</p>
                  <p className="font-serif text-2xl">{formatPrice(subtotalCents)}</p>
                </div>
                <p className="mt-2 text-xs text-stone">
                  Shipping and taxes calculated at checkout. Each piece ships insured, worldwide.
                </p>
                <Link href="/checkout" onClick={closeCart} className="mt-5 block">
                  <Button className="w-full">Proceed to checkout</Button>
                </Link>
                <button
                  onClick={closeCart}
                  className="link-sweep mx-auto mt-4 block text-xs uppercase tracking-widest2 text-stone hover:text-charcoal"
                >
                  Continue browsing
                </button>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
