import nodemailer from 'nodemailer';

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
  templateSlug?: string;
  customerId?: string;
  orderId?: string;
  invoiceId?: string;
};

export async function sendEmail(input: SendEmailInput) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: input.to,
    subject: input.subject,
    html: input.html,
    attachments: input.attachments,
  });

  return {
    ok: true,
    messageId: info.messageId,
  };
}

// Keep existing signature compatibility for other parts of the codebase.
// If template-based emails are required later, reintroduce templating helpers.
export async function sendTemplatedEmail(
  _templateSlug: string,
  to: string,
  vars: Record<string, string | number>,
  _ctx?: {
    customerId?: string;
    orderId?: string;
    invoiceId?: string;
    attachments?: SendEmailInput['attachments'];
  },
) {
  const subject = `Ankshaastra — ${String(vars?.invoice_number ?? vars?.customer_name ?? '')}`.trim();
  const html = `<p>${Object.entries(vars)
    .map(([k, v]) => `<strong>${k}:</strong> ${String(v)}`)
    .join('<br/>')}</p>`;

  return sendEmail({
    to,
    subject,
    html,
  });
}

