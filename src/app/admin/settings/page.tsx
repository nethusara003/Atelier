import { adminListSubscribers } from '@/lib/admin-data';
import { getAdminSession } from '@/lib/admin-auth';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { isStripeConfigured } from '@/lib/stripe';
import { formatDateTime } from '@/lib/format';
import { DataTable, DemoBanner } from '@/components/admin/admin-ui';

export const metadata = { title: 'Settings' };

function CheckRow({ label, ok, hint }: { label: string; ok: boolean; hint: string }) {
  return (
    <div className="flex items-start justify-between gap-6 border-b hairline py-4">
      <div>
        <p className="font-medium">{label}</p>
        <p className="mt-1 text-sm text-stone">{hint}</p>
      </div>
      <span className={`shrink-0 px-3 py-1 text-[11px] font-medium uppercase tracking-widest2 ${ok ? 'bg-green-900/10 text-green-900' : 'bg-beige text-stone'}`}>
        {ok ? 'Connected' : 'Not set'}
      </span>
    </div>
  );
}

export default async function AdminSettingsPage() {
  const session = await getAdminSession();
  const subscribers = await adminListSubscribers();

  return (
    <div>
      <p className="micro-label">Configuration</p>
      <h1 className="mt-2 font-serif text-4xl">Settings</h1>
      {session.demo && <div className="mt-6"><DemoBanner /></div>}

      <section className="mt-8 max-w-3xl" aria-label="Integrations">
        <h2 className="font-serif text-2xl">Integrations</h2>
        <div className="mt-4 border-t hairline">
          <CheckRow label="Supabase" ok={isSupabaseConfigured} hint="Database, auth and storage. Required for live data." />
          <CheckRow label="Stripe" ok={isStripeConfigured()} hint="Payments. Webhook endpoint: /api/webhooks/stripe" />
          <CheckRow label="Resend" ok={Boolean(process.env.RESEND_API_KEY)} hint="Transactional email. Without it, emails are logged to the console." />
        </div>
      </section>

      <section className="mt-12" aria-label="Newsletter subscribers">
        <h2 className="font-serif text-2xl">Newsletter subscribers <span className="text-lg text-stone">({subscribers.length})</span></h2>
        <div className="mt-4 max-w-3xl">
          <DataTable
            rows={subscribers}
            rowKey={(s) => s.id}
            emptyTitle="No subscribers yet"
            columns={[
              { header: 'Email', render: (s) => s.email },
              { header: 'Subscribed', render: (s) => formatDateTime(s.subscribed_at) },
            ]}
          />
        </div>
      </section>

      <section className="mt-12 max-w-3xl" aria-label="Admin access">
        <h2 className="font-serif text-2xl">Admin access</h2>
        <p className="mt-4 text-sm leading-relaxed text-smoke">
          Admin pages are guarded by the <code className="bg-beige px-1.5 py-0.5 text-[13px]">role</code> column
          on <code className="bg-beige px-1.5 py-0.5 text-[13px]">profiles</code>. To promote a user, run this
          in the Supabase SQL editor:
        </p>
        <pre className="mt-4 overflow-x-auto border hairline bg-charcoal p-5 text-[13px] leading-relaxed text-ivory">
{`update public.profiles
set role = 'admin'
where email = 'you@example.com';`}
        </pre>
      </section>
    </div>
  );
}
