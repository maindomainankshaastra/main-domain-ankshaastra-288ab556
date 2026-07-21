import { getUserFromAuthHeader, isAdminUser } from '../lib/auth-api.js';
import { getSupabaseAdmin } from '../lib/supabase-admin.js';

type Req = {
  method?: string;
  headers?: { authorization?: string; Authorization?: string };
  query?: {
    search?: string;
    actionType?: string;
    module?: string;
    userId?: string;
    sourceWebsite?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: string;
    pageSize?: string;
  };
};

type Res = {
  status: (n: number) => { json: (o: unknown) => void; end: () => void };
};

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

/**
 * GET /api/admin/audit-logs — Super Admin only.
 *
 * Query params:
 *   search       — matches user name, email, module, action, or record name
 *   actionType   — exact match on action_type
 *   module       — exact match on module
 *   userId       — exact match on user_id
 *   sourceWebsite— exact match on source_website
 *   dateFrom/dateTo — ISO date strings (inclusive range on created_at)
 *   page, pageSize — pagination (newest first)
 */
export default async function handler(req: Req, res: Res) {
  if (req.method !== 'GET') return res.status(405).end();

  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  const user = await getUserFromAuthHeader(authHeader);
  if (!user) {
    return res.status(401).json({ error: 'Not signed in' });
  }

  // Security gate — ONLY Super Admin may read audit logs. Everyone else,
  // including other admin tiers, gets a 403 — matching the requirement
  // that Staff/Limited Admins/Team Members must never see this data, even
  // by hitting the API directly.
  const allowed = await isAdminUser(user.id);
  if (!allowed) {
    return res.status(403).json({ error: 'Access Denied' });
  }

  const query = req.query || {};
  const page = Math.max(1, parseInt(query.page || '1', 10) || 1);
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, parseInt(query.pageSize || String(DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE),
  );
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    const supabase = getSupabaseAdmin();
    let q = supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (query.actionType) q = q.eq('action_type', query.actionType);
    if (query.module) q = q.eq('module', query.module);
    if (query.userId) q = q.eq('user_id', query.userId);
    if (query.sourceWebsite) q = q.eq('source_website', query.sourceWebsite);
    if (query.dateFrom) q = q.gte('created_at', query.dateFrom);
    if (query.dateTo) q = q.lte('created_at', query.dateTo);

    if (query.search && query.search.trim()) {
      const term = query.search.trim();
      // Matches across user name, email, module, action, and record name —
      // per requirement #6 ("Search should work on user name, email,
      // module, action and record").
      q = q.or(
        [
          `user_name.ilike.%${term}%`,
          `user_email.ilike.%${term}%`,
          `module.ilike.%${term}%`,
          `action_type.ilike.%${term}%`,
          `record_name.ilike.%${term}%`,
        ].join(','),
      );
    }

    const { data, error, count } = await q.range(from, to);

    if (error) {
      console.error('[admin-audit-logs] query failed:', error.message);
      return res.status(500).json({ error: 'Could not load audit logs' });
    }

    return res.status(200).json({
      rows: data || [],
      total: count || 0,
      page,
      pageSize,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to load audit logs';
    console.error('[admin-audit-logs]', msg, e);
    return res.status(500).json({ error: 'Could not load audit logs' });
  }
}