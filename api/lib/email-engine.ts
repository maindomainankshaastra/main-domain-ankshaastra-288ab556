import nodemailer from 'nodemailer';
import { assertSmtpConfigured, formatSmtpError } from './smtp-config.js';
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
  const smtp = assertSmtpConfigured();

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: {
      user: smtp.user,
      pass: smtp.pass,
    },
    tls: {
      rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== 'false',
    },
  });

  try {
    const info = await transporter.sendMail({
      from: smtp.from,
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
    const msg = formatSmtpError(e, smtp.host);
    await logEmailAttempt(input, 'failed', { error: msg });
    const err = new Error(msg);
    Object.assign(err, { cause: e });
    throw err;
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
