import { NextResponse } from 'next/server';
import { commissionSchema } from '@/lib/validations';
import { sendEmail, emailTemplates } from '@/lib/email';
import { insertPublicRow } from '@/lib/api-helpers';

/** POST /api/commissions — validates, stores the enquiry, emails both parties. */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = commissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Please check the form.' },
      { status: 400 }
    );
  }

  const d = parsed.data;

  try {
    await insertPublicRow('commissions', {
      name: d.name,
      email: d.email,
      phone: d.phone || null,
      commission_type: d.commissionType,
      budget_range: d.budgetRange,
      timeline: d.timeline,
      description: d.description,
      reference_images: d.referenceImages ?? [],
      status: 'new',
    });

    await sendEmail({
      to: d.email,
      subject: 'Your commission enquiry — Atelier Voss',
      html: emailTemplates.commissionReceived(d.name),
    });
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      await sendEmail({
        to: adminEmail,
        subject: `New commission enquiry from ${d.name}`,
        html: emailTemplates.commissionAdmin(d.name, d.email, d.commissionType),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/commissions]', err);
    return NextResponse.json({ error: 'Could not send your enquiry. Please try again.' }, { status: 500 });
  }
}
