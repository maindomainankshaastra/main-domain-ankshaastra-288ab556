import nodemailer from 'nodemailer';
import { getSupabaseAdmin } from './supabase-admin.js';

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

async function logEmailAttempt(
  input: SendEmailInput,
  status: 'sent' | 'failed',
  details: { messageId?: string; error?: string },
) {
  try {
    const supabase = getSupabaseAdmin();
    await supabase.from('email_logs').insert({
      customer_id: input.customerId || null,
      order_id: input.orderId || null,
      invoice_id: input.invoiceId || null,
      template_slug: input.templateSlug || null,
      to_email: input.to,
      subject: input.subject,
      provider: 'smtp',
      status,
      provider_message_id: details.messageId || null,
      error_message: details.error || null,
      metadata: {
        has_attachments: Boolean(input.attachments?.length),
        attachment_count: input.attachments?.length ?? 0,
      },
      sent_at: status === 'sent' ? new Date().toISOString() : null,
    });
  } catch (e) {
    console.error('[email] Failed to write email_logs:', e);
  }
}

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

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: input.to,
      subject: input.subject,
      html: input.html,
      attachments: input.attachments,
    });

    await logEmailAttempt(input, 'sent', { messageId: info.messageId });

    return {
      ok: true,
      messageId: info.messageId,
    };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Email send failed';
    await logEmailAttempt(input, 'failed', { error: msg });
    throw e;
  }
}

export async function sendTemplatedEmail(
  templateSlug: string,
  to: string,
  vars: Record<string, string | number>,
  ctx?: {
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
    attachments: ctx?.attachments,
    templateSlug,
    customerId: ctx?.customerId,
    orderId: ctx?.orderId,
    invoiceId: ctx?.invoiceId,
  });
}
