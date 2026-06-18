import { getSupabaseAdmin } from '../lib/supabase-admin.js';
import { getUserFromAuthHeader, isAdminUser } from '../lib/auth-api.js';
import { downloadInvoicePdfBuffer } from '../lib/invoice-storage.js';

type Req = {
  method?: string;
  headers?: { authorization?: string; Authorization?: string };
  query?: { invoiceId?: string };
};

type Res = {
  setHeader?: (name: string, value: string) => void;
  status: (n: number) => {
    json: (o: unknown) => void;
    end: () => void;
    send?: (body: Buffer | string) => void;
  };
};

/** GET /api/invoices/file?invoiceId= — admin-only PDF bytes (for client-side ZIP bundling) */
export default async function handler(req: Req, res: Res) {
  if (req.method !== 'GET') return res.status(405).end();

  const invoiceId = String(req.query?.invoiceId || '').trim();
  if (!invoiceId) {
    return res.status(400).json({ error: 'invoiceId is required' });
  }

  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  const user = await getUserFromAuthHeader(authHeader);
  if (!user || !(await isAdminUser(user.id))) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('id, invoice_number, pdf_storage_path')
      .eq('id', invoiceId)
      .single();

    if (error || !invoice?.pdf_storage_path) {
      return res.status(404).json({ error: 'Invoice PDF not found' });
    }

    const buffer = await downloadInvoicePdfBuffer(invoice.pdf_storage_path);
    if (!buffer) {
      return res.status(404).json({ error: 'Could not read invoice PDF' });
    }

    const safeName = String(invoice.invoice_number || invoice.id).replace(/[^\w.-]+/g, '_');

    res.setHeader?.('Content-Type', 'application/pdf');
    res.setHeader?.('Content-Disposition', `inline; filename="${safeName}.pdf"`);
    res.setHeader?.('Cache-Control', 'private, max-age=60');

    const send = res.status(200).send;
    if (send) {
      return send.call(res.status(200), buffer);
    }

    return res.status(500).json({ error: 'Binary response not supported' });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Download failed';
    console.error('[invoice-file]', msg, e);
    return res.status(500).json({ error: msg });
  }
}
