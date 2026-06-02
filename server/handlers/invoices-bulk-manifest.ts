import { getSupabaseAdmin } from '../../api/lib/supabase-admin.js';
import { getUserFromAuthHeader, isAdminUser } from '../../api/lib/auth-api.js';

type Req = {
  method?: string;
  headers?: { authorization?: string; Authorization?: string };
  query?: { year?: string; month?: string };
};

type Res = {
  status: (n: number) => { json: (o: unknown) => void; end: () => void };
};

function monthRange(year: number, month: number) {
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const end = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;
  return { start, end };
}

/** GET /api/invoices/bulk-manifest?year=2026&month=5 — fast list for client-side ZIP */
export default async function handler(req: Req, res: Res) {
  if (req.method !== 'GET') return res.status(405).end();

  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  const user = await getUserFromAuthHeader(authHeader);
  if (!user || !(await isAdminUser(user.id))) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const year = Number(req.query?.year);
  const month = Number(req.query?.month);
  if (!year || !month || month < 1 || month > 12) {
    return res.status(400).json({ error: 'Valid year and month (1–12) are required' });
  }

  const { start, end } = monthRange(year, month);
  const label = `${year}-${String(month).padStart(2, '0')}`;

  try {
    const supabase = getSupabaseAdmin();
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('id, invoice_number, customer_name, customer_email, service_title, total_amount, invoice_date, pdf_storage_path')
      .gte('invoice_date', start)
      .lt('invoice_date', end)
      .not('pdf_storage_path', 'is', null)
      .order('invoice_date', { ascending: true });

    if (error) throw error;
    if (!invoices?.length) {
      return res.status(404).json({ error: `No invoice PDFs found for ${label}` });
    }

    return res.status(200).json({
      label,
      year,
      month,
      count: invoices.length,
      invoices: invoices.map((inv) => ({
        id: inv.id,
        invoice_number: inv.invoice_number,
        customer_name: inv.customer_name,
        customer_email: inv.customer_email,
        service_title: inv.service_title,
        total_amount: inv.total_amount,
        invoice_date: inv.invoice_date,
      })),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Could not load invoice list';
    console.error('[bulk-manifest]', msg, e);
    return res.status(500).json({ error: msg });
  }
}
