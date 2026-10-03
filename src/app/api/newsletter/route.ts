import { NextResponse } from 'next/server';
import { newsletterSchema } from '@/lib/validations';
import { isSupabaseConfigured } from '@/lib/supabase/client';

/** POST /api/newsletter — validates and subscribes. Idempotent on duplicates. */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = newsletterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Please enter a valid email.' },
      { status: 400 }
    );
  }

  try {
    if (!isSupabaseConfigured) {
      console.log('[api:demo] newsletter subscribe:', parsed.data.email);
      return NextResponse.json({ ok: true });
    }
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const admin = createAdminClient();
    const { error } = await admin
      .from('newsletter_subscribers')
      .insert({ email: parsed.data.email });
    if (error && !error.message.includes('duplicate')) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/newsletter]', err);
    return NextResponse.json({ error: 'Could not subscribe. Please try again.' }, { status: 500 });
  }
}
