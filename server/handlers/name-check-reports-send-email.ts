import { getUserFromAuthHeader, hasModuleAccess } from '../lib/auth-api.js';
import { getSupabaseAdmin } from '../lib/supabase-admin.js';
import { sendEmail } from '../lib/email-engine.js';
import { wrapEmailLayout } from '../lib/templates/email-layout.js';

type Req = {
  method?: string;
  headers?: { authorization?: string; Authorization?: string };
  body?: {
    reportId?: string;
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
 * POST /api/name-check-reports/send-email — admin-only.
 *
 * Emails a generated Name Check Report PDF to the customer, with an
 * admin-edited recipient, subject and message. Mirrors
 * invoices-send-email.ts: reuses the EXISTING email engine (sendEmail) and
 * layout template (wrapEmailLayout) — only the "fetch the PDF bytes" part
 * differs, since name_check_reports stores a public Storage URL on the row
 * (pdf_url) instead of going through invoice-engine's attachment lookup.
 */
export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') return res.status(405).end();

  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  const user = await getUserFromAuthHeader(authHeader);
  if (!user || !(await hasModuleAccess(user.id, 'name-check-reports'))) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const body = req.body || {};
  const reportId = String(body.reportId || '').trim();
  const to = String(body.to || '').trim();
  const subject = String(body.subject || '').trim();
  const message = String(body.message || '').trim();
  const attachPdf = body.attachPdf !== false;

  if (!reportId) return res.status(400).json({ error: 'reportId is required' });
  if (!to) return res.status(400).json({ error: 'Recipient email is required' });
  if (!subject) return res.status(400).json({ error: 'Subject is required' });

  try {
    const supabase = getSupabaseAdmin();
    const { data: report, error } = await supabase
      .from('name_check_reports')
      .select('id, report_id, pdf_url')
      .eq('id', reportId)
      .single();

    if (error || !report) return res.status(404).json({ error: 'Report not found' });
    if (attachPdf && !report.pdf_url) {
      return res.status(400).json({ error: 'Generate the PDF for this report before emailing it.' });
    }

    let attachments: Array<{ filename: string; content: Buffer; contentType?: string }> | undefined;
    if (attachPdf && report.pdf_url) {
      const pdfRes = await fetch(report.pdf_url);
      if (!pdfRes.ok) {
        return res.status(502).json({ error: 'Could not fetch the report PDF to attach it.' });
      }
      const arrayBuffer = await pdfRes.arrayBuffer();
      attachments = [
        {
          filename: `${report.report_id}.pdf`,
          content: Buffer.from(arrayBuffer),
          contentType: 'application/pdf',
        },
      ];
    }

    const html = wrapEmailLayout(
      `<p style="margin:0 0 16px;">${(message || 'Please find your Name Check Report attached.').replace(/\r?\n/g, '<br/>')}</p>`,
      subject,
    );

    await sendEmail({
      to,
      subject,
      html,
      attachments,
      templateSlug: 'manual_name_check_report_email',
    });

    return res.status(200).json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to send report email';
    console.error('[name-check-reports-send-email]', msg, e);
    return res.status(500).json({ error: msg });
  }
}
