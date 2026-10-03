import { NextResponse } from 'next/server';
import { contactSchema } from '@/lib/validations';
import { sendEmail, emailTemplates } from '@/lib/email';
import { insertPublicRow } from '@/lib/api-helpers';

/** POST /api/contact — validates, stores the inquiry, emails both parties. */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Please check the form.' },
      { status: 400 }
    );
  }

  const { name, email, subject, inquiryType, message, preferredDate } = parsed.data;

  try {
    await insertPublicRow('inquiries', {
      name,
      email,
      subject,
      message: preferredDate ? `${message}\n\nPreferred visit date: ${preferredDate}` : message,
      inquiry_type: inquiryType,
      status: 'new',
    });

    await sendEmail({
      to: email,
      subject: 'Your message to Atelier Voss',
      html: emailTemplates.contactReceived(name),
    });
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      await sendEmail({
        to: adminEmail,
        subject: `New enquiry: ${subject}`,
        html: emailTemplates.contactAdmin(name, email, subject),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/contact]', err);
    return NextResponse.json({ error: 'Could not send your message. Please try again.' }, { status: 500 });
  }
}
