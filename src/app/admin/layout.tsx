import Link from 'next/link';
import { requireAdminPage } from '@/lib/admin-auth';
import { SignOutButton } from '@/components/auth/SignOutButton';

export const metadata = { title: 'Admin', robots: { index: false, follow: false } };

const NAV = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/collections', label: 'Collections' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/commissions', label: 'Commissions' },
  { href: '/admin/journal', label: 'Journal' },
  { href: '/admin/enquiries', label: 'Enquiries' },
  { href: '/admin/settings', label: 'Settings' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminPage();

  return (
    <div className="min-h-screen bg-ivory pt-20">
      <div className="mx-auto flex max-w-[1400px] gap-0 px-0 md:px-6">
        <aside className="sticky top-20 hidden h-[calc(100vh-5rem)] w-60 shrink-0 overflow-y-auto border-r hairline py-8 pr-6 md:block" aria-label="Admin navigation">
          <p className="micro-label px-2">Atelier · Admin</p>
          <nav className="mt-6 space-y-1">
            {NAV.map((n) => (
              <AdminNavLink key={n.href} href={n.href} label={n.label} />
            ))}
          </nav>
          <div className="mt-10 border-t hairline px-2 pt-6">
            <p className="truncate text-xs text-stone">{session.user?.email}</p>
            {session.demo ? (
              <p className="micro-label mt-1 !text-clay">Demo mode</p>
            ) : (
              <div className="mt-2"><SignOutButton /></div>
            )}
            <Link href="/" className="link-sweep mt-4 inline-block text-xs uppercase tracking-widest2 text-stone hover:text-terracotta">
              ← View site
            </Link>
          </div>
        </aside>

        <div className="min-w-0 flex-1 px-5 py-8 md:px-10">
          {/* mobile nav */}
          <nav className="mb-8 flex gap-2 overflow-x-auto border-b hairline pb-4 md:hidden" aria-label="Admin navigation">
            {NAV.map((n) => (
              <AdminNavLink key={n.href} href={n.href} label={n.label} mobile />
            ))}
          </nav>
          {children}
        </div>
      </div>
    </div>
  );
}

function AdminNavLink({ href, label, mobile = false }: { href: string; label: string; mobile?: boolean }) {
  return (
    <Link
      href={href}
      className={`block whitespace-nowrap px-3 py-2.5 text-sm transition-colors hover:bg-beige/70 hover:text-terracotta ${
        mobile ? 'border hairline' : 'rounded-sm'
      }`}
    >
      {label}
    </Link>
  );
}
