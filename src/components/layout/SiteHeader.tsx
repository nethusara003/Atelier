'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCart } from '../cart/CartProvider';
import { ARTIST } from '@/lib/constants';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

const NAV = [
  { href: '/gallery', label: 'Gallery' },
  { href: '/about', label: 'About' },
  { href: '/commissions', label: 'Commissions' },
  { href: '/journal', label: 'Journal' },
  { href: '/contact', label: 'Contact' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { count, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Show an "Admin" shortcut for admin users. Checked client-side so the
  // marketing pages stay statically rendered; RLS lets users read only
  // their own profile row.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!isSupabaseConfigured) return;
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || cancelled) return;
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (!cancelled && profile?.role === 'admin') setIsAdmin(true);
      } catch {
        /* not signed in or profile unreadable — no admin link */
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-ivory/90 shadow-[0_1px_0_rgba(28,26,23,0.08)] backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8 md:py-5">
        <Link href="/" className="group" aria-label={`${ARTIST.studioName} — home`}>
          <span className="font-serif text-[26px] leading-none tracking-wide">
            Atelier
          </span>
          <span className="micro-label mt-0.5 block transition-colors group-hover:text-terracotta">
            {ARTIST.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={pathname === n.href ? 'page' : undefined}
              className={`link-sweep text-[13px] uppercase tracking-widest2 transition-colors ${
                pathname === n.href ? 'text-terracotta' : 'text-charcoal hover:text-terracotta'
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link
              href="/admin"
              className="link-sweep mr-1 hidden px-2 text-[13px] uppercase tracking-widest2 text-charcoal transition-colors hover:text-terracotta md:block"
            >
              Admin
            </Link>
          )}
          <button
            onClick={openCart}
            aria-label={`Open cart, ${count} items`}
            className="relative p-2.5 text-charcoal transition-colors hover:text-terracotta"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path d="M2.5 6.5h15l-1.2 8.5a1.5 1.5 0 0 1-1.5 1.3H5.2a1.5 1.5 0 0 1-1.5-1.3L2.5 6.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
              <path d="M6.5 8.5V5.8a3.5 3.5 0 0 1 7 0v2.7" stroke="currentColor" strokeWidth="1.3" />
            </svg>
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-terracotta px-1 text-[10px] font-semibold text-ivory"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          <Link
            href="/account"
            aria-label="Your account"
            className="hidden p-2.5 text-charcoal transition-colors hover:text-terracotta md:block"
          >
            <svg width="19" height="19" viewBox="0 0 19 19" fill="none" aria-hidden>
              <circle cx="9.5" cy="6.5" r="3.5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M2.5 16.5c1-3.2 3.8-4.8 7-4.8s6 1.6 7 4.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </Link>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="p-2.5 text-charcoal md:hidden"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
              {menuOpen ? (
                <path d="M2 2l18 18M20 2L2 20" stroke="currentColor" strokeWidth="1.5" />
              ) : (
                <path d="M2 6h18M2 11h18M2 16h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t hairline bg-ivory/95 backdrop-blur-md md:hidden"
            aria-label="Mobile"
          >
            <ul className="space-y-1 px-5 py-6">
              {[...NAV, { href: '/account', label: 'Account' }, ...(isAdmin ? [{ href: '/admin', label: 'Admin' }] : [])].map((n, i) => (
                <motion.li
                  key={n.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.05 }}
                >
                  <Link
                    href={n.href}
                    className={`block py-2.5 font-serif text-3xl transition-colors ${
                      pathname === n.href ? 'text-terracotta' : 'text-charcoal'
                    }`}
                  >
                    {n.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
