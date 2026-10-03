import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-5 pb-24 pt-32 text-center md:pt-40">
      <div className="mx-auto mb-8 h-px w-16 bg-terracotta" aria-hidden />
      <p className="micro-label">404</p>
      <h1 className="mt-4 font-serif text-5xl md:text-6xl">This page has left the studio</h1>
      <p className="mx-auto mt-6 max-w-md text-[17px] text-smoke">
        The page you’re looking for doesn’t exist — or the piece found its home
        and moved on.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link href="/"><Button>Back home</Button></Link>
        <Link href="/gallery"><Button variant="secondary">Browse the gallery</Button></Link>
      </div>
    </div>
  );
}
