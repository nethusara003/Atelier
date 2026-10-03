import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/motion/Reveal';

export const metadata = { title: 'Order confirmed' };

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { demo?: string; session_id?: string; order_id?: string };
}) {
  const orderRef = searchParams.order_id?.slice(0, 8);
  return (
    <div className="mx-auto max-w-2xl px-5 pb-24 pt-32 text-center md:pt-40">
      <Reveal>
        <div className="mx-auto mb-8 h-px w-16 bg-terracotta" aria-hidden />
        <p className="micro-label">Thank you{orderRef ? ` · Order ${orderRef}` : ''}</p>
        <h1 className="mt-4 font-serif text-5xl md:text-6xl">Your order is confirmed</h1>
        <p className="mx-auto mt-6 max-w-md text-[17px] leading-relaxed text-smoke">
          {searchParams.demo
            ? 'This was a demo checkout — no payment was taken and no order was stored. Connect Supabase and a payment provider to accept real orders.'
            : 'A confirmation email is on its way. Elena will pack your piece by hand and write again the moment it ships.'}
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href="/gallery"><Button variant="secondary">Continue browsing</Button></Link>
          <Link href="/account"><Button>View your orders</Button></Link>
        </div>
      </Reveal>
    </div>
  );
}
