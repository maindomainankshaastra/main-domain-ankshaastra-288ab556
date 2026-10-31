import { getUserFromAuthHeader, hasModuleAccess } from '../lib/auth-api.js';
import { getSupabaseAdmin } from '../lib/supabase-admin.js';
import { processNameCheckOrder } from '../lib/name-check-report-service.js';

type Req = {
  method?: string;
  headers?: { authorization?: string; Authorization?: string };
  body?: { reportId?: string; orderId?: string };
};
type Res = { status: (n: number) => { json: (o: unknown) => void; end: () => void } };

/**
 * POST /api/name-check-reports/retry — admin-only.
 * Re-runs the automatic Name Check flow (generate PDF + email) for an order
 * whose automatic run failed or never happened. Accepts the report row id
 * (name_check_reports.id) or the order id.
 */
export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') return res.status(405).end();

  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  const user = await getUserFromAuthHeader(authHeader);
  if (!user || !(await hasModuleAccess(user.id, 'name-check-reports'))) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    const supabase = getSupabaseAdmin();
    let orderId = String(req.body?.orderId || '').trim();
    if (!orderId) {
      const reportId = String(req.body?.reportId || '').trim();
      if (!reportId) return res.status(400).json({ error: 'reportId or orderId is required' });
      const { data } = await supabase.from('name_check_reports').select('order_id').eq('id', reportId).maybeSingle();
      orderId = data?.order_id ? String(data.order_id) : '';
      if (!orderId) return res.status(400).json({ error: 'This report is not linked to an order (manual report).' });
    }

    // Make failed / stuck rows claimable again.
    await supabase
      .from('name_check_reports')
      .update({ auto_status: 'failed', auto_started_at: null })
      .eq('order_id', orderId)
      .is('emailed_at', null);

    const result = await processNameCheckOrder(orderId);
    if (!result.ok) return res.status(500).json({ error: result.error });
    return res.status(200).json({ ok: true, status: result.status });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Retry failed';
    console.error('[name-check-reports-retry]', msg, e);
    return res.status(500).json({ error: msg });
  }
}
