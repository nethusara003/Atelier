import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { formatPrice, formatDateTime } from '@/lib/format';
import { SectionHeading, Badge, EmptyState } from '@/components/ui/primitives';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/motion/Reveal';
import { SavedArtworks } from '@/components/cart/saved-artworks';
import { SignOutButton } from '@/components/auth/SignOutButton';
import type { Order } from '@/types/database';

export const metadata = { title: 'Your account' };

const STATUS_TONE: Record<string, 'neutral' | 'clay' | 'terracotta' | 'dark' | 'success'> = {
  pending: 'neutral',
  paid: 'clay',
  preparing: 'clay',
  shipped: 'terracotta',
  delivered: 'success',
  cancelled: 'dark',
};

async function getAccount() {
  if (!isSupabaseConfigured) return { user: null, orders: [] as Order[], demo: true };
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, orders: [] as Order[], demo: false };
  const { data } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  return { user, orders: (data ?? []) as Order[], demo: false };
}

export default async function AccountPage() {
  const { user, orders, demo } = await getAccount();
  if (!demo && !user) redirect('/login?next=/account');

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-28 md:px-8 md:pt-36">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <Reveal>
          <p className="micro-label">Your account</p>
          <h1 className="mt-4 font-serif text-5xl md:text-6xl">
            Hello{user?.user_metadata?.full_name ? `, ${String(user.user_metadata.full_name).split(' ')[0]}` : ''}
          </h1>
          {demo && (
            <p className="mt-4 max-w-xl border hairline bg-parchment px-5 py-4 text-sm text-smoke">
              Demo mode — connect Supabase to enable sign-in and live order history.
              Your saved artworks below are stored in this browser.
            </p>
          )}
        </Reveal>
        {!demo && user && <SignOutButton />}
      </div>

      <section className="mt-14" aria-label="Order history">
        <Reveal>
          <SectionHeading eyebrow="Orders" title="Order history" />
        </Reveal>
        <div className="mt-8">
          {orders.length === 0 ? (
            <EmptyState
              title="No orders yet"
              body="When you purchase a piece, it will appear here with its journey from studio to doorstep."
              action={
                <Link href="/gallery">
                  <Button variant="secondary" size="sm">Browse the gallery</Button>
                </Link>
              }
            />
          ) : (
            <ul className="divide-y divide-charcoal/10 border-y hairline">
              {orders.map((o) => (
                <li key={o.id} className="py-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="font-serif text-xl">Order #{o.id.slice(0, 8)}</p>
                      <p className="micro-label mt-1">{formatDateTime(o.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-5">
                      <p className="font-medium">{formatPrice(o.total_cents, o.currency)}</p>
                      <Badge tone={STATUS_TONE[o.status] ?? 'neutral'}>{o.status}</Badge>
                    </div>
                  </div>
                  {o.items && o.items.length > 0 && (
                    <ul className="mt-4 space-y-1.5 text-sm text-smoke">
                      {o.items.map((it) => (
                        <li key={it.id} className="flex justify-between gap-4">
                          <span>{it.title} <span className="text-stone">× {it.quantity}</span></span>
                          <span>{formatPrice(it.unit_price_cents * it.quantity, o.currency)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="mt-16" aria-label="Saved artworks">
        <Reveal>
          <SectionHeading eyebrow="Wishlist" title="Saved artworks" body="Kept in this browser — sign in to sync them across devices in the future." />
        </Reveal>
        <div className="mt-8">
          <SavedArtworks />
        </div>
      </section>
    </div>
  );
}
