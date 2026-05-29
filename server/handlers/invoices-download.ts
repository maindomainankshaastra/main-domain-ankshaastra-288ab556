import { getSupabaseAdmin } from '../../api/lib/supabase-admin.js';
import { getUserFromAuthHeader, userCanAccessInvoice } from '../../api/lib/auth-api.js';
import { refreshInvoicePdfUrl } from '../../api/lib/invoice-storage.js';

type Req = {
  method?: string;
  headers?: { authorization?: string; Authorization?: string };
  query?: { invoiceId?: string };
};

type Res = {
  status: (n: number) => { json: (o: unknown) => void; end: () => void };
};

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'GET') return res.status(405).end();

  const invoiceId = String(req.query?.invoiceId || '').trim();
  if (!invoiceId) {
    return res.status(400).json({ error: 'invoiceId is required' });
  }

  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  const user = await getUserFromAuthHeader(authHeader);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data: invoice, error } = await supabase.from('invoices').select('*').eq('id', invoiceId).single();
    if (error || !invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const allowed = await userCanAccessInvoice(user, invoice);
    if (!allowed) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (!invoice.pdf_storage_path) {
      return res.status(404).json({ error: 'Invoice PDF not available yet' });
    }

    const url = (await refreshInvoicePdfUrl(invoiceId)) || invoice.pdf_url;
    if (!url) {
      return res.status(500).json({ error: 'Could not generate download link' });
    }

    return res.status(200).json({
      url,
      invoice_number: invoice.invoice_number,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Download failed';
    console.error('[invoice-download]', msg, e);
    return res.status(500).json({ error: msg });
  }
}
