'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export function HeroCta() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
      className="mt-10 flex flex-wrap gap-4"
    >
      <Link
        href="/gallery"
        className="inline-flex items-center justify-center bg-ivory px-9 py-4 text-sm font-medium uppercase tracking-widest2 text-charcoal transition-all duration-300 hover:bg-terracotta hover:text-ivory active:scale-[0.98]"
      >
        Enter the gallery
      </Link>
      <Link
        href="/commissions"
        className="inline-flex items-center justify-center border border-ivory/50 px-9 py-4 text-sm font-medium uppercase tracking-widest2 text-ivory transition-all duration-300 hover:border-ivory hover:bg-ivory/10 active:scale-[0.98]"
      >
        Commission a piece
      </Link>
    </motion.div>
  );
}
