/** Simple email layer. Uses Resend when configured; otherwise logs to console (dev/demo). */

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

function layout(title: string, body: string): string {
  return `<!doctype html><html><body style="font-family:Georgia,serif;background:#FAF7F2;color:#1C1A17;padding:32px;">
  <div style="max-width:600px;margin:0 auto;border-top:3px solid #9C4A2F;padding-top:24px;">
  <p style="font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#8A8177;margin:0 0 8px;">Atelier &middot; Elena Voss</p>
  <h1 style="font-weight:400;font-size:28px;margin:0 0 16px;">${title}</h1>
  <div style="font-size:15px;line-height:1.7;">${body}</div>
  <p style="margin-top:32px;font-size:12px;color:#8A8177;">Atelier Voss &mdash; Marais Studio, 14 Rue des Rosiers, Paris<br/>
  <a href="mailto:studio@atelier-voss.com" style="color:#9C4A2F;">studio@atelier-voss.com</a></p>
  </div></body></html>`;
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    // Dev/demo fallback: log instead of sending.
    console.log('[email:dev]', {
      to: payload.to,
      subject: payload.subject,
      text: payload.text ?? payload.html.replace(/<[^>]+>/g, '').slice(0, 300),
    });
    return;
  }
  const { Resend } = await import('resend');
  const resend = new Resend(key);
  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? 'Atelier <studio@atelier.example.com>',
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
  });
}

export const emailTemplates = {
  orderConfirmation: (name: string, orderId: string, total: string) =>
    layout(
      'Thank you for your order',
      `<p>Dear ${name},</p><p>Your order <strong>${orderId.slice(0, 8)}</strong> totalling <strong>${total}</strong> has been received and is being prepared with care. Each piece is packed by hand in the studio before it begins its journey to you.</p><p>We will write again as soon as it ships.</p><p>With gratitude,<br/>Elena</p>`
    ),
  orderPaidAdmin: (orderId: string, email: string, total: string) =>
    layout(
      'New paid order',
      `<p>Order <strong>${orderId}</strong> from <strong>${email}</strong> for <strong>${total}</strong> has been paid. Please prepare the pieces for dispatch.</p>`
    ),
  commissionReceived: (name: string) =>
    layout(
      'Your commission enquiry',
      `<p>Dear ${name},</p><p>Thank you for entrusting the studio with your idea. Your commission enquiry has been received and will be read personally within two working days.</p><p>Warmly,<br/>Elena</p>`
    ),
  commissionAdmin: (name: string, email: string, type: string) =>
    layout(
      'New commission enquiry',
      `<p><strong>${name}</strong> (${email}) submitted a commission enquiry for <strong>${type}</strong>. Review it in the admin dashboard.</p>`
    ),
  contactReceived: (name: string) =>
    layout(
      'Message received',
      `<p>Dear ${name},</p><p>Thank you for writing to the studio. Your message has been received and will be answered within three working days.</p><p>Warmly,<br/>Elena</p>`
    ),
  contactAdmin: (name: string, email: string, subject: string) =>
    layout(
      'New contact message',
      `<p><strong>${name}</strong> (${email}) wrote about <strong>${subject}</strong>. Review it in the admin dashboard.</p>`
    ),
};
