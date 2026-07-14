import { getUserFromAuthHeader, isAdminUser } from '../lib/auth-api.js';
import { getSupabaseAdmin } from '../lib/supabase-admin.js';
import { getInvoiceAttachment } from '../lib/invoice-engine.js';
import { sendEmail } from '../lib/email-engine.js';
import { wrapEmailLayout } from '../lib/templates/email-layout.js';

type Req = {
  method?: string;
  headers?: { authorization?: string; Authorization?: string };
  body?: {
    invoiceId?: string;
    to?: string;
    subject?: string;
    message?: string;
    attachPdf?: boolean;
  };
};

type Res = {
  status: (n: number) => { json: (o: unknown) => void; end: () => void };
};

/**
 * POST /api/invoices/send-email — admin-only.
 *
 * Manually (re)sends an invoice email with an admin-edited recipient,
 * subject and message. Reuses the EXISTING email engine (sendEmail) and
 * the EXISTING PDF-attachment logic (getInvoiceAttachment, exported from
 * invoice-engine.ts) — no email or PDF logic is duplicated here.
 */
export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') return res.status(405).end();

  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  const user = await getUserFromAuthHeader(authHeader);
  if (!user || !(await isAdminUser(user.id))) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const body = req.body || {};
  const invoiceId = String(body.invoiceId || '').trim();
  const to = String(body.to || '').trim();
  const subject = String(body.subject || '').trim();
  const message = String(body.message || '').trim();
  const attachPdf = body.attachPdf !== false;

  if (!invoiceId) return res.status(400).json({ error: 'invoiceId is required' });
  if (!to) return res.status(400).json({ error: 'Recipient email is required' });
  if (!subject) return res.status(400).json({ error: 'Subject is required' });

  try {
    const supabase = getSupabaseAdmin();
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (error || !invoice) return res.status(404).json({ error: 'Invoice not found' });

    const attachments = attachPdf ? await getInvoiceAttachment(invoice) : undefined;

    const html = wrapEmailLayout(
      `<p style="margin:0 0 16px;">${(message || 'Please find your invoice attached.').replace(/\r?\n/g, '<br/>')}</p>`,
      subject,
    );

    await sendEmail({
      to,
      subject,
      html,
      attachments,
      templateSlug: 'manual_invoice_email',
      customerId: invoice.customer_id,
      orderId: invoice.order_id,
      invoiceId: invoice.id,
    });

    return res.status(200).json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to send invoice email';
    console.error('[invoices-send-email]', msg, e);
    return res.status(500).json({ error: msg });
  }
}