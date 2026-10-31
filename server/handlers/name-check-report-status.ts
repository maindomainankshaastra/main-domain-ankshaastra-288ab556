import { getSupabaseAdmin } from '../lib/supabase-admin.js';

type Req = { method?: string; query?: Record<string, string | string[] | undefined> };
type Res = { status: (n: number) => { json: (o: unknown) => void; end: () => void } };

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || '';

/**
 * GET /api/name-check-reports/status?orderId=…  (or ?paymentId=pay_…)
 *
 * Public, read-only, used by the Thank You page (Empower) to show
 * "Report delivered — check your inbox / spam" only once the automatic
 * Name Check email has really gone out. Returns no personal data.
 *   status: 'not_name_check' | 'pending' | 'processing' | 'sent' | 'failed'
 */
export default async function handler(req: Req, res: Res) {
  if (req.method !== 'GET') return res.status(405).end();
  const orderId = one(req.query?.orderId).trim();
  const paymentId = one(req.query?.paymentId).trim();
  if (!orderId && !paymentId) return res.status(400).json({ error: 'orderId or paymentId is required' });

  try {
    const supabase = getSupabaseAdmin();
    let id = orderId;
    if (!id) {
      const { data } = await supabase.from('orders').select('id').eq('razorpay_payment_id', paymentId).maybeSingle();
      id = data?.id ? String(data.id) : '';
    }
    if (!id) return res.status(200).json({ status: 'pending' });

    const { data: rows } = await supabase
      .from('name_check_reports')
      .select('auto_status, emailed_at')
      .eq('order_id', id);

    if (!rows?.length) return res.status(200).json({ status: 'pending' });
    if (rows.every((r) => r.emailed_at)) return res.status(200).json({ status: 'sent', reports: rows.length });
    if (rows.some((r) => r.auto_status === 'failed')) return res.status(200).json({ status: 'failed' });
    return res.status(200).json({ status: 'processing' });
  } catch (e) {
    console.error('[name-check-report-status]', e);
    return res.status(500).json({ error: 'Could not read report status' });
  }
}
