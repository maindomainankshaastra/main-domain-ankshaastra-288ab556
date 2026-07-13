import { getUserFromAuthHeader, isAdminUser } from '../lib/auth-api.js';
import { fixAllHistoricalGstData } from '../lib/gst-auto-fix.js';

type Req = {
  method?: string;
  headers?: { authorization?: string; Authorization?: string };
};

type Res = {
  status: (n: number) => { json: (o: unknown) => void; end: () => void };
};

/** POST /api/admin/gst-maintenance — fix historical GST data */
export default async function handler(req: Req, res: Res) {
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  const user = await getUserFromAuthHeader(authHeader);
  if (!user || !(await isAdminUser(user.id))) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  try {
    const { getSupabaseAdmin } = await import('../lib/supabase-admin.js');
    const summary = await fixAllHistoricalGstData(getSupabaseAdmin());
    return res.status(200).json({
      ok: true,
      summary: {
        processed: summary.processed,
        corrected: summary.corrected,
        remainingWarnings: summary.remainingWarnings,
      },
      infoCount: summary.info.length,
      sampleInfo: summary.info.slice(0, 20),
    });
  } catch (e: unknown) {
    return res.status(500).json({
      error: e instanceof Error ? e.message : 'GST maintenance failed',
    });
  }
}
