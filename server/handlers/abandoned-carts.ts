import { getUserFromAuthHeader, hasModuleAccess } from '../lib/auth-api.js';
import { getSupabaseAdmin } from '../lib/supabase-admin.js';

type Req = {
  method?: string;
  headers?: { authorization?: string; Authorization?: string };
  query?: { site?: string };
};
type Res = {
  status: (n: number) => { json: (o: unknown) => void; end: () => void };
};

const EMPOWER_ORDERS_URL = 'https://empower.ankshaastra.com/api/admin/orders';

/** Fixed, simple export shape — same 8 columns for every site. */
type AbandonedRow = {
  service_name: string;
  full_name: string;
  email: string;
  mobile: string;
  address: string;
  website: string;
  status: string;
  started_at: string;
};

function buildAddress(city?: unknown, pinCode?: unknown): string {
  const parts = [city, pinCode].map((v) => String(v || '').trim()).filter(Boolean);
  return parts.join(' - ');
}

/**
 * "Abandoned cart" = a customer filled the order form (so their full
 * details were saved) but never completed payment. Where that data lives
 * differs per site:
 *
 *  - empower.ankshaastra.com runs its own separate database entirely
 *    (Empower only syncs an order to the hub CRM once payment SUCCEEDS —
 *    see Empower's server/handlers/payment-webhook.js). So its abandoned
 *    carts are fetched live from Empower's own existing admin orders API,
 *    which already returns every order regardless of status.
 *  - ankshaastra.com and miraclebaby.ankshaastra.com both call THIS hub's
 *    own /api/create-order directly (server/handlers/create-order.ts),
 *    which writes the order row here with status "pending" immediately,
 *    before Razorpay checkout even opens. So their abandoned carts already
 *    live right here in the hub's own `orders` table — anything that never
 *    reached status "paid".
 *
 * Every row is normalized to a fixed, simple set of columns (Service Name,
 * Full Name, Email, Mobile, Address, Website, Status, Started At) so the
 * export is consistent and predictable regardless of which site it came
 * from. Nothing new is stored by this endpoint — it's a read-only
 * aggregation across both sources, refreshed on every call.
 */
export default async function handler(req: Req, res: Res) {
  if (req.method !== 'GET') return res.status(405).end();

  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  const user = await getUserFromAuthHeader(authHeader);
  if (!user || !(await hasModuleAccess(user.id, 'crm'))) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const rows: AbandonedRow[] = [];
  const errors: string[] = [];

  // ── ankshaastra.com + miraclebaby.ankshaastra.com — already in our own DB ──
  try {
    const supabase = getSupabaseAdmin();
    const { data: hubOrders, error } = await supabase
      .from('orders')
      .select('id, status, source_website, customer_name, customer_email, customer_phone, service_title, metadata, created_at')
      .in('source_website', ['ankshaastra.com', 'miraclebaby.ankshaastra.com'])
      .neq('status', 'paid')
      .order('created_at', { ascending: false });

    if (error) {
      errors.push(`hub orders: ${error.message}`);
    } else {
      for (const o of hubOrders || []) {
        const meta = (o.metadata as Record<string, unknown>) || {};
        rows.push({
          service_name: String(o.service_title || ''),
          full_name: String(o.customer_name || ''),
          email: String(o.customer_email || ''),
          mobile: String(o.customer_phone || ''),
          address: buildAddress(meta.city || meta.customerCity, meta.pinCode || meta.pin_code),
          website: String(o.source_website || ''),
          status: String(o.status || ''),
          started_at: String(o.created_at || ''),
        });
      }
    }
  } catch (e: unknown) {
    errors.push(`hub orders: ${e instanceof Error ? e.message : String(e)}`);
  }

  // ── empower.ankshaastra.com — separate DB, fetched live from its own API ──
  try {
    const upstream = await fetch(EMPOWER_ORDERS_URL);
    if (!upstream.ok) {
      errors.push(`Empower orders API returned ${upstream.status}`);
    } else {
      const body = (await upstream.json()) as { orders?: Array<Record<string, unknown>> };
      for (const o of body.orders || []) {
        if (String(o.order_status || '').toUpperCase() === 'SUCCESS') continue;
        rows.push({
          service_name: String(o.package_type || ''),
          full_name: String(o.name || ''),
          email: String(o.email || ''),
          mobile: String(o.mobile || ''),
          address: buildAddress(o.city, o.pin_code),
          website: 'empower.ankshaastra.com',
          status: String(o.order_status || ''),
          started_at: String(o.order_created_at || ''),
        });
      }
    }
  } catch (e: unknown) {
    errors.push(`Empower: ${e instanceof Error ? e.message : String(e)}`);
  }

  return res.status(200).json({ count: rows.length, orders: rows, errors });
}
