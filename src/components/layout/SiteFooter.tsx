import Link from 'next/link';
import { ARTIST } from '@/lib/constants';
import { NewsletterSignup } from './NewsletterSignup';

export function SiteFooter() {
  return (
    <footer className="bg-charcoal text-ivory">
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-serif text-4xl">Atelier</p>
            <p className="micro-label mt-2 !text-ivory/50">{ARTIST.name} · {ARTIST.city}</p>
            <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-ivory/70">
              Original handmade paintings, ceramics, sculpture and textiles —
              made slowly, in small numbers, in a Paris studio.
            </p>
            <div className="mt-8">
              <NewsletterSignup compact />
            </div>
          </div>

          <nav className="md:col-span-3" aria-label="Footer">
            <p className="micro-label !text-ivory/50">Explore</p>
            <ul className="mt-5 space-y-3 text-[15px]">
              {[
                ['/gallery', 'Gallery'],
                ['/about', 'About the artist'],
                ['/commissions', 'Commissions'],
                ['/journal', 'Journal'],
                ['/contact', 'Contact'],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="link-sweep text-ivory/80 hover:text-ivory">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-4">
            <p className="micro-label !text-ivory/50">Studio</p>
            <address className="mt-5 space-y-2 text-[15px] not-italic text-ivory/80">
              <p>{ARTIST.address}</p>
              <p>
                <a href={`mailto:${ARTIST.email}`} className="link-sweep hover:text-ivory">
                  {ARTIST.email}
                </a>
              </p>
              <p>{ARTIST.phone}</p>
              <p className="pt-2 text-ivory/60">Visits by appointment, Thursday – Saturday</p>
            </address>
            <div className="mt-6 flex gap-5">
              <a href={ARTIST.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-ivory/70 transition-colors hover:text-ivory">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                  <rect x="2" y="2" width="16" height="16" rx="4.5" stroke="currentColor" strokeWidth="1.3"/>
                  <circle cx="10" cy="10" r="3.6" stroke="currentColor" strokeWidth="1.3"/>
                  <circle cx="14.8" cy="5.2" r="1.1" fill="currentColor"/>
                </svg>
              </a>
              <a href={ARTIST.pinterest} target="_blank" rel="noopener noreferrer" aria-label="Pinterest" className="text-ivory/70 transition-colors hover:text-ivory">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                  <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M10 5.5c-2.5 0-4 1.8-4 3.6 0 1.2.7 2 1.6 2.3l.5-1.4c-.3-.3-.5-.7-.5-1.1 0-1.2 1-2.3 2.5-2.3 1.4 0 2.4.9 2.4 2.1 0 1.6-.7 3-1.8 3-.6 0-1-.5-.9-1.1l.5-1.9-1.6 6.3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-ivory/15 pt-8 text-xs text-ivory/50 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {ARTIST.studioName}. All work is original and handmade.</p>
          <p className="flex gap-6">
            <Link href="/contact" className="hover:text-ivory/80">Privacy</Link>
            <Link href="/contact" className="hover:text-ivory/80">Shipping & Returns</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
