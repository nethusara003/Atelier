'use client';

import Image from 'next/image';
import { formatPrice } from '@/lib/format';
import { useCart, type CartLine } from './CartProvider';

export function CartLineItem({ line }: { line: CartLine }) {
  const { updateQuantity, removeLine } = useCart();
  return (
    <li className="flex gap-4 border-b hairline py-5">
      <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-beige">
        <Image src={line.image} alt={line.title} fill sizes="80px" className="object-cover" />
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-serif text-lg leading-tight">{line.title}</p>
            <p className="micro-label mt-1">{formatPrice(line.unitPriceCents, line.currency)}</p>
          </div>
          <button
            onClick={() => removeLine(line.artworkId)}
            aria-label={`Remove ${line.title} from cart`}
            className="p-1 text-stone transition-colors hover:text-terracotta"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </button>
        </div>
        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="flex items-center border hairline" role="group" aria-label="Quantity">
            <button
              onClick={() => updateQuantity(line.artworkId, line.quantity - 1)}
              disabled={line.quantity <= 1}
              aria-label="Decrease quantity"
              className="px-3 py-1.5 text-sm transition-colors hover:bg-beige disabled:opacity-30"
            >
              −
            </button>
            <span className="w-8 text-center text-sm" aria-live="polite">{line.quantity}</span>
            <button
              onClick={() => updateQuantity(line.artworkId, line.quantity + 1)}
              disabled={line.quantity >= line.maxQuantity}
              aria-label="Increase quantity"
              className="px-3 py-1.5 text-sm transition-colors hover:bg-beige disabled:opacity-30"
            >
              +
            </button>
          </div>
          <p className="text-sm font-medium">
            {formatPrice(line.unitPriceCents * line.quantity, line.currency)}
          </p>
        </div>
      </div>
    </li>
  );
}
