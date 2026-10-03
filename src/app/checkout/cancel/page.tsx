import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/motion/Reveal';

export const metadata = { title: 'Checkout cancelled' };

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 pb-24 pt-32 text-center md:pt-40">
      <Reveal>
        <div className="mx-auto mb-8 h-px w-16 bg-stone" aria-hidden />
        <p className="micro-label">No charge made</p>
        <h1 className="mt-4 font-serif text-5xl md:text-6xl">Checkout cancelled</h1>
        <p className="mx-auto mt-6 max-w-md text-[17px] leading-relaxed text-smoke">
          Your cart is exactly as you left it. Take your time — good pieces wait,
          though one-of-one pieces don’t wait forever.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href="/cart"><Button>Return to your cart</Button></Link>
          <Link href="/gallery"><Button variant="secondary">Browse the gallery</Button></Link>
        </div>
      </Reveal>
    </div>
  );
}
