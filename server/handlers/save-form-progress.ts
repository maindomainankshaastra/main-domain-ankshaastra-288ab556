import { getSupabaseAdmin } from '../lib/supabase-admin.js';
import { normalizeSourceWebsite } from '../lib/connected-sites.js';

type Req = {
  method?: string;
  body?: Record<string, unknown>;
};
type Res = {
  status: (n: number) => { json: (o: unknown) => void; end: () => void };
};

/**
 * Auto-save while a customer is still typing into the order form — no
 * button click required. The frontend generates a client-side UUID once
 * per form session and sends it here (debounced, every few seconds) as
 * `orderId`; the SAME id is later passed back to /api/create-order as
 * `existingOrderId` so the eventual real order UPDATEs this exact row
 * instead of creating a second, duplicate one.
 *
 * amount/gst/total are unknown at this point (no service/pricing
 * confirmed yet), so they're written as 0 placeholders — create-order.ts
 * overwrites them with the real numbers once the customer actually
 * proceeds to pay.
 */
export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const body = req.body || {};
    const orderId = body.orderId ? String(body.orderId) : null;
    if (!orderId) {
      return res.status(200).json({ ok: false, skipped: 'no orderId' });
    }

    const sourceWebsite = normalizeSourceWebsite(body.sourceWebsite as string | undefined);
    const serviceTitle = String(body.serviceTitle || body.service || 'Service');
    const customerName = body.customerName ? String(body.customerName) : null;
    const customerEmail = body.customerEmail ? String(body.customerEmail) : null;
    const customerPhone = body.customerPhone ? String(body.customerPhone) : null;
    const metadata = (body.metadata as Record<string, unknown>) || {};

    const supabase = getSupabaseAdmin();

    // Upsert by client-generated id: first call inserts, later debounced
    // calls (as the customer keeps typing) just update the same row.
    const { error } = await supabase.from('orders').upsert(
      {
        id: orderId,
        service_title: serviceTitle,
        amount: 0,
        gst_amount: 0,
        total_amount: 0,
        status: 'pending',
        source_website: sourceWebsite,
        order_type: 'service',
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        metadata,
      },
      { onConflict: 'id' },
    );

    if (error) {
      // Best-effort only — never let this block the customer's form.
      console.error('[save-form-progress]', error.message);
      return res.status(200).json({ ok: false, error: error.message });
    }

    return res.status(200).json({ ok: true });
  } catch (e: unknown) {
    console.error('[save-form-progress] unexpected error:', e);
    return res.status(200).json({ ok: false, error: e instanceof Error ? e.message : 'unknown error' });
  }
}
